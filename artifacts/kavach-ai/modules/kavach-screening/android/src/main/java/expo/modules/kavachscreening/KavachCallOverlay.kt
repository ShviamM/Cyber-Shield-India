package expo.modules.kavachscreening

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import java.net.URLEncoder

/**
 * Native Truecaller-style incoming-call overlay.
 *
 * Drawn directly by [KavachCallScreeningService] using a WindowManager
 * `TYPE_APPLICATION_OVERLAY` window, so it appears instantly over the dialer /
 * lock screen WITHOUT cold-starting React Native (the previous deep-link
 * approach launched the whole app, which was slow and unreliable in the
 * background). The only permission this needs is `SYSTEM_ALERT_WINDOW`
 * ("Display over other apps"), which is Play-safe and the app already requests.
 *
 * Flow: [show] adds a neutral "checking…" card immediately, kicks off
 * [KavachReputation] off-thread, then [applyRep] recolors the card (red for a
 * risky caller, green for a clean one, amber when we couldn't verify). The user
 * stays in control — buttons Answer / Block / Report / Dismiss; the overlay
 * never auto-answers or blocks.
 *
 * All UI is built programmatically (no XML) so the module needs no Android
 * resource wiring. Every WindowManager touch happens on the main thread and is
 * wrapped defensively so a failure can never crash the call-screening service.
 */
object KavachCallOverlay {
  private const val AUTO_DISMISS_MS = 60_000L

  private val main = Handler(Looper.getMainLooper())

  // Single active overlay. All access is on the main thread.
  private var windowManager: WindowManager? = null
  private var root: View? = null
  private var card: LinearLayout? = null
  private var statusView: TextView? = null
  private var subView: TextView? = null
  private var currentNumber: String = ""
  private var dismissRunnable: Runnable? = null

  /** Whether the OS will let us draw over other apps right now. */
  fun canDraw(ctx: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(ctx)

  /**
   * Show the overlay for [number]. Returns true only when the overlay window was
   * actually attached, so the caller can fall back to its notification path if it
   * wasn't. On the main thread (the CallScreeningService path) the result is
   * exact; called off the main thread it posts the work and optimistically
   * returns true (best-effort) — failures there are then handled by the overlay's
   * own teardown, not a duplicate notification.
   */
  fun show(ctx: Context, number: String): Boolean {
    val app = ctx.applicationContext
    if (Looper.myLooper() == Looper.getMainLooper()) {
      return tryShow(app, number)
    }
    main.post { tryShow(app, number) }
    return true
  }

  /** Attempt the overlay, cleaning up any partial state on failure. */
  private fun tryShow(ctx: Context, number: String): Boolean {
    return try {
      showInternal(ctx, number)
    } catch (_: Throwable) {
      // Never let an overlay failure crash the screening service; clear any
      // half-built state so the next call starts clean. The caller's
      // notification fallback covers the user.
      dismissInternal()
      false
    }
  }

  /** Tear the overlay down. Safe to call from any thread / when nothing is shown. */
  fun dismiss() {
    main.post { dismissInternal() }
  }

  private fun showInternal(ctx: Context, number: String): Boolean {
    if (!canDraw(ctx)) return false
    dismissInternal()

    currentNumber = number
    val lang = ScreeningStore.getLanguage(ctx)
    val wm = ctx.getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return false

    val view = buildView(ctx, number, lang)
    val params = buildParams(ctx)
    wm.addView(view, params)

    windowManager = wm
    root = view

    scheduleAutoDismiss()

    KavachReputation.fetch(ctx) { rep -> applyRep(ctx, number, rep, lang) }
    return true
  }

  private fun dismissInternal() {
    dismissRunnable?.let { main.removeCallbacks(it) }
    dismissRunnable = null
    val wm = windowManager
    val view = root
    if (wm != null && view != null) {
      try {
        if (view.isAttachedToWindow) wm.removeView(view)
      } catch (_: Throwable) {
        // already removed / not attached
      }
    }
    windowManager = null
    root = null
    card = null
    statusView = null
    subView = null
  }

  private fun scheduleAutoDismiss() {
    val r = Runnable { dismissInternal() }
    dismissRunnable = r
    main.postDelayed(r, AUTO_DISMISS_MS)
  }

  // --- reputation → UI ---------------------------------------------------

  private fun applyRep(ctx: Context, number: String, rep: KavachReputation.Rep?, lang: String) {
    // Guard against a late callback after the overlay was dismissed or replaced.
    if (root == null || currentNumber != number) return
    val theme = themeFor(rep)
    card?.background = cardBackground(theme.bg, theme.accent)
    statusView?.text = headline(rep, lang)
    statusView?.setTextColor(theme.accent)
    subView?.text = subline(rep, lang)

    // Surface a post-call prompt for a risky caller even if the user neither
    // answered nor blocked through us, so we can still offer "report this scam"
    // afterwards. Clean callers are not recorded (no nagging).
    if (rep != null && rep.risky) {
      ScreeningStore.recordPendingCall(ctx, number, rep.riskLevel, false)
    }
  }

  private data class Theme(val bg: Int, val accent: Int)

  private fun themeFor(rep: KavachReputation.Rep?): Theme = when {
    rep == null -> Theme(Color.parseColor("#1f2937"), Color.parseColor("#f59e0b")) // amber: unverified
    rep.risky -> Theme(Color.parseColor("#1a0000"), Color.parseColor("#dc2626")) // red: risky
    else -> Theme(Color.parseColor("#04122b"), Color.parseColor("#16a34a")) // navy/green: clean
  }

  // --- view construction -------------------------------------------------

  private fun buildView(ctx: Context, number: String, lang: String): View {
    val scrim = LinearLayout(ctx).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(Color.parseColor("#CC000000"))
      gravity = Gravity.TOP
      setPadding(dp(ctx, 16), dp(ctx, 48), dp(ctx, 16), dp(ctx, 16))
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT,
      )
    }

    val theme = themeFor(null)
    val cardView = LinearLayout(ctx).apply {
      orientation = LinearLayout.VERTICAL
      background = cardBackground(theme.bg, theme.accent)
      setPadding(dp(ctx, 20), dp(ctx, 20), dp(ctx, 20), dp(ctx, 20))
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      )
    }

    val brand = TextView(ctx).apply {
      text = str(lang, "brand")
      setTextColor(Color.parseColor("#94a3b8"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
      letterSpacing = 0.08f
      typeface = Typeface.DEFAULT_BOLD
    }

    val numberView = TextView(ctx).apply {
      text = number
      setTextColor(Color.WHITE)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 26f)
      typeface = Typeface.DEFAULT_BOLD
      setPadding(0, dp(ctx, 6), 0, dp(ctx, 10))
    }

    val status = TextView(ctx).apply {
      text = str(lang, "checking")
      setTextColor(theme.accent)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
      typeface = Typeface.DEFAULT_BOLD
    }

    val sub = TextView(ctx).apply {
      text = str(lang, "checkingSub")
      setTextColor(Color.parseColor("#cbd5e1"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      setPadding(0, dp(ctx, 4), 0, dp(ctx, 16))
    }

    val buttons = LinearLayout(ctx).apply {
      orientation = LinearLayout.HORIZONTAL
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      )
    }
    buttons.addView(
      pillButton(ctx, str(lang, "block"), Color.parseColor("#dc2626")) {
        KavachTelecom.end(ctx)
        ScreeningStore.addToBlocklist(ctx, number)
        dismissInternal()
      },
      btnParams(ctx),
    )
    buttons.addView(
      pillButton(ctx, str(lang, "report"), Color.parseColor("#475569")) {
        openReport(ctx, number)
        dismissInternal()
      },
      btnParams(ctx),
    )
    buttons.addView(
      pillButton(ctx, str(lang, "answer"), Color.parseColor("#16a34a")) {
        val ok = KavachTelecom.answer(ctx)
        if (ok) ScreeningStore.recordPendingCall(ctx, number, "answered", true)
        dismissInternal()
      },
      btnParams(ctx),
    )

    val close = TextView(ctx).apply {
      text = str(lang, "dismiss")
      setTextColor(Color.parseColor("#94a3b8"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      gravity = Gravity.CENTER
      setPadding(0, dp(ctx, 14), 0, 0)
      setOnClickListener { dismissInternal() }
    }

    cardView.addView(brand)
    cardView.addView(numberView)
    cardView.addView(status)
    cardView.addView(sub)
    cardView.addView(buttons)
    cardView.addView(close)
    scrim.addView(cardView)

    card = cardView
    statusView = status
    subView = sub
    return scrim
  }

  private fun cardBackground(bg: Int, accent: Int): GradientDrawable = GradientDrawable().apply {
    setColor(bg)
    cornerRadius = 28f
    setStroke(3, accent)
  }

  private fun pillButton(
    ctx: Context,
    label: String,
    color: Int,
    onClick: () -> Unit,
  ): TextView = TextView(ctx).apply {
    text = label
    setTextColor(Color.WHITE)
    setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
    typeface = Typeface.DEFAULT_BOLD
    gravity = Gravity.CENTER
    setPadding(dp(ctx, 8), dp(ctx, 14), dp(ctx, 8), dp(ctx, 14))
    background = GradientDrawable().apply {
      setColor(color)
      cornerRadius = 18f
    }
    isClickable = true
    setOnClickListener { onClick() }
  }

  private fun btnParams(ctx: Context): LinearLayout.LayoutParams =
    LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
      marginStart = dp(ctx, 5)
      marginEnd = dp(ctx, 5)
    }

  private fun buildParams(ctx: Context): WindowManager.LayoutParams {
    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }
    @Suppress("DEPRECATION")
    val flags = WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
      WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
    return WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      flags,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.TOP
    }
  }

  private fun openReport(ctx: Context, number: String) {
    try {
      val digits = number.filter { it.isDigit() }
      val encoded = URLEncoder.encode(digits, "UTF-8")
      val intent = Intent(
        Intent.ACTION_VIEW,
        Uri.parse("kavach-ai://report?phone=$encoded"),
      ).apply {
        setPackage(ctx.packageName)
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      ctx.startActivity(intent)
    } catch (_: Throwable) {
      // ignore — worst case the report screen doesn't open
    }
  }

  private fun dp(ctx: Context, value: Int): Int =
    (value * ctx.resources.displayMetrics.density).toInt()

  // --- copy (en/hi; everything else falls back to en) --------------------

  private fun headline(rep: KavachReputation.Rep?, lang: String): String = when {
    rep == null -> str(lang, "unknownTitle")
    rep.verifiedScam -> str(lang, "scamTitle")
    rep.riskLevel == "high" -> str(lang, "highTitle")
    rep.riskLevel == "medium" -> str(lang, "mediumTitle")
    else -> str(lang, "cleanTitle")
  }

  private fun subline(rep: KavachReputation.Rep?, lang: String): String {
    if (rep == null) return str(lang, "unknownSub")
    if (!rep.risky && rep.reportCount == 0) return str(lang, "cleanSub")
    val reports = str(lang, "reports").replace("%d", rep.reportCount.toString())
    val cat = rep.topCategory
    return if (!cat.isNullOrEmpty()) "$reports · $cat" else reports
  }

  private fun str(lang: String, key: String): String {
    val table = if (lang.startsWith("hi")) HI else EN
    return table[key] ?: EN[key] ?: key
  }

  private val EN: Map<String, String> = mapOf(
    "brand" to "INCOMING CALL · NETRAKSH",
    "checking" to "Checking this number…",
    "checkingSub" to "Looking up scam reports",
    "scamTitle" to "⚠ Confirmed scam caller",
    "highTitle" to "⚠ High scam risk",
    "mediumTitle" to "Possible scam — be careful",
    "cleanTitle" to "No scam reports yet",
    "cleanSub" to "Not reported by the community",
    "unknownTitle" to "Couldn't verify this caller",
    "unknownSub" to "Stay cautious — verify before sharing anything",
    "reports" to "%d scam reports",
    "block" to "Block",
    "report" to "Report",
    "answer" to "Answer",
    "dismiss" to "Dismiss",
  )

  private val HI: Map<String, String> = mapOf(
    "brand" to "इनकमिंग कॉल · नेत्रक्ष",
    "checking" to "यह नंबर जाँचा जा रहा है…",
    "checkingSub" to "स्कैम रिपोर्ट देखी जा रही हैं",
    "scamTitle" to "⚠ पुष्ट स्कैम कॉलर",
    "highTitle" to "⚠ उच्च स्कैम जोखिम",
    "mediumTitle" to "संभावित स्कैम — सावधान रहें",
    "cleanTitle" to "अभी तक कोई स्कैम रिपोर्ट नहीं",
    "cleanSub" to "समुदाय द्वारा रिपोर्ट नहीं किया गया",
    "unknownTitle" to "इस कॉलर को सत्यापित नहीं कर सके",
    "unknownSub" to "सावधान रहें — कुछ भी साझा करने से पहले जाँचें",
    "reports" to "%d स्कैम रिपोर्ट",
    "block" to "ब्लॉक",
    "report" to "रिपोर्ट",
    "answer" to "उत्तर दें",
    "dismiss" to "बंद करें",
  )
}
