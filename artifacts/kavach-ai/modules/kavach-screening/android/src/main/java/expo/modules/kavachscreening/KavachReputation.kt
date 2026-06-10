package expo.modules.kavachscreening

import android.content.Context
import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Native scam-reputation lookup for the incoming-call overlay.
 *
 * The [KavachCallScreeningService] / [KavachCallOverlay] run as system-bound
 * components that may have NO React Native JS bridge alive (app killed), so they
 * can't reach the JS API client. This object makes its own lightweight HTTP call
 * to the same public endpoint the app uses (`GET /numbers/{phone}/check`), which
 * works anonymously (a Bearer token is sent only when the user is signed in, to
 * lift the free-tier rate limit). Nothing here reads the call log or any
 * restricted data — it only sends the single incoming number that Android
 * already handed us via the call-screening role.
 */
object KavachReputation {
  data class Rep(
    val riskLevel: String,
    val reportCount: Int,
    val verifiedScam: Boolean,
    val topCategory: String?,
  ) {
    /** Whether this caller should be shown with the high-alert (red) treatment. */
    val risky: Boolean
      get() = verifiedScam || riskLevel == "high" || riskLevel == "medium"
  }

  /**
   * Look up [number]'s reputation off the main thread and deliver the result
   * (or null on failure / not-configured / non-Indian number) back on the main
   * thread so the caller can safely touch UI.
   */
  fun fetch(ctx: Context, number: String, onResult: (Rep?) -> Unit) {
    val base = ScreeningStore.getApiBaseUrl(ctx)
    val token = ScreeningStore.getAuthToken(ctx)
    val phone = toLookupPhone(number)
    if (base.isEmpty() || phone == null) {
      deliver(null, onResult)
      return
    }

    Thread {
      var rep: Rep? = null
      var conn: HttpURLConnection? = null
      try {
        val url = URL("$base/numbers/$phone/check")
        conn = (url.openConnection() as HttpURLConnection).apply {
          requestMethod = "GET"
          connectTimeout = 6000
          readTimeout = 6000
          setRequestProperty("Accept", "application/json")
          if (token.isNotEmpty()) setRequestProperty("Authorization", "Bearer $token")
        }
        val code = conn.responseCode
        if (code in 200..299) {
          val body = conn.inputStream.bufferedReader().use { it.readText() }
          rep = parse(body)
        }
        // Any non-2xx (rate limit, paywall, 4xx/5xx) falls through as null →
        // the overlay shows an honest "couldn't verify" state, never a fake
        // "clean" result.
      } catch (_: Throwable) {
        rep = null
      } finally {
        try {
          conn?.disconnect()
        } catch (_: Throwable) {
          // ignore
        }
      }
      deliver(rep, onResult)
    }.start()
  }

  private fun parse(body: String): Rep? {
    return try {
      val json = JSONObject(body)
      val cats = json.optJSONArray("categories")
      val topCategory =
        if (cats != null && cats.length() > 0) {
          val first = cats.optJSONObject(0)
          first?.optString("key", "")?.takeIf { it.isNotEmpty() }
        } else {
          null
        }
      Rep(
        riskLevel = json.optString("riskLevel", "unknown").ifEmpty { "unknown" },
        reportCount = json.optInt("reportCount", 0),
        verifiedScam = json.optBoolean("verifiedScam", false),
        topCategory = topCategory,
      )
    } catch (_: Throwable) {
      null
    }
  }

  /**
   * Reduce a raw incoming number ("+919682824432", "919682824432", "98xxxx…")
   * to the 10-digit Indian form the API route expects. Returns null for numbers
   * that clearly aren't 10-digit Indian mobiles (short codes, etc.) so we don't
   * fire a doomed request.
   */
  private fun toLookupPhone(number: String): String? {
    val digits = number.filter { it.isDigit() }
    val ten = if (digits.length > 10) digits.takeLast(10) else digits
    return if (ten.length == 10) ten else null
  }

  private fun deliver(rep: Rep?, onResult: (Rep?) -> Unit) {
    Handler(Looper.getMainLooper()).post { onResult(rep) }
  }
}
