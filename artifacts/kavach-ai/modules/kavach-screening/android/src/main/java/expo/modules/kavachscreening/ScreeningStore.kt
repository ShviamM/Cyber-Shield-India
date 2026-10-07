package expo.modules.kavachscreening

import android.content.Context

/**
 * On-device persistence for the screening feature. Holds the user's toggle
 * state plus the engine-derived blocklist and scam keywords so the
 * [KavachCallScreeningService] (a separate Android component that may run with
 * no JS bridge alive) can read them directly. Nothing here ever leaves the
 * device.
 */
object ScreeningStore {
  private const val PREFS = "kavach_screening"
  private const val KEY_CALL_ENABLED = "call_enabled"
  private const val KEY_SMS_ENABLED = "sms_enabled"
  private const val KEY_BLOCKLIST = "blocklist"
  private const val KEY_USER_BLOCKLIST = "user_blocklist"
  private const val KEY_KEYWORDS = "keywords"
  private const val KEY_BLOCK_PATTERNS = "block_patterns"
  private const val KEY_LANGUAGE = "language"
  private const val KEY_API_BASE = "api_base"
  private const val KEY_AUTH_TOKEN = "auth_token"
  private const val KEY_FAMILY_ALERTS = "family_alerts"

  private fun prefs(ctx: Context) =
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  /** Language code (e.g. "en"/"hi") for the native call overlay strings. */
  fun getLanguage(ctx: Context): String =
    prefs(ctx).getString(KEY_LANGUAGE, "en") ?: "en"

  fun setLanguage(ctx: Context, code: String) {
    prefs(ctx).edit().putString(KEY_LANGUAGE, code).apply()
  }

  /**
   * Base URL of the Netraksh API (e.g. "https://netraksh.com"), synced from JS.
   * The call-screening service uses it to look up an incoming number's scam
   * reputation. Empty string means "not configured yet" (no live lookup).
   */
  fun getApiBaseUrl(ctx: Context): String =
    prefs(ctx).getString(KEY_API_BASE, "") ?: ""

  /**
   * The signed-in user's session token, synced from JS. Sent as a bearer token
   * on the reputation lookup so a premium user gets unlimited checks (free users
   * are otherwise rate-limited). Empty string means "no token" (anonymous call).
   */
  fun getAuthToken(ctx: Context): String =
    prefs(ctx).getString(KEY_AUTH_TOKEN, "") ?: ""

  fun setApiConfig(ctx: Context, baseUrl: String, token: String) {
    prefs(ctx).edit()
      .putString(KEY_API_BASE, baseUrl.trimEnd('/'))
      .putString(KEY_AUTH_TOKEN, token)
      .apply()
  }

  /** True once the user accepted a Family Guardian invite (synced from JS). */
  fun isFamilyAlertsEnabled(ctx: Context): Boolean =
    prefs(ctx).getBoolean(KEY_FAMILY_ALERTS, false)

  fun setFamilyAlertsEnabled(ctx: Context, enabled: Boolean) {
    prefs(ctx).edit().putBoolean(KEY_FAMILY_ALERTS, enabled).apply()
  }

  fun isCallEnabled(ctx: Context): Boolean =
    prefs(ctx).getBoolean(KEY_CALL_ENABLED, false)

  fun setCallEnabled(ctx: Context, enabled: Boolean) {
    prefs(ctx).edit().putBoolean(KEY_CALL_ENABLED, enabled).apply()
  }

  fun isSmsEnabled(ctx: Context): Boolean =
    prefs(ctx).getBoolean(KEY_SMS_ENABLED, false)

  fun setSmsEnabled(ctx: Context, enabled: Boolean) {
    prefs(ctx).edit().putBoolean(KEY_SMS_ENABLED, enabled).apply()
  }

  fun setBlocklist(ctx: Context, numbers: List<String>) {
    val normalized = numbers
      .map { normalize(it) }
      .filter { it.length >= 6 }
      .toSet()
    prefs(ctx).edit().putStringSet(KEY_BLOCKLIST, normalized).apply()
  }

  fun getBlocklist(ctx: Context): Set<String> =
    prefs(ctx).getStringSet(KEY_BLOCKLIST, emptySet()) ?: emptySet()

  /**
   * Numbers the user blocked manually (e.g. the call popup's Block button). Kept
   * in a SEPARATE store from the engine-derived [getBlocklist] so a re-sync of
   * the engine list ([setBlocklist], which replaces the whole set) can never wipe
   * a user's own block. This is the list shown/edited by the in-app
   * "Blocked numbers" screen.
   */
  fun getUserBlocklist(ctx: Context): Set<String> =
    prefs(ctx).getStringSet(KEY_USER_BLOCKLIST, emptySet()) ?: emptySet()

  /** Add a single number to the user's manual blocklist (the overlay's Block button). */
  fun addToBlocklist(ctx: Context, rawNumber: String) {
    val n = normalize(rawNumber)
    if (n.length < 6) return
    val updated = getUserBlocklist(ctx).toMutableSet().apply { add(n) }
    prefs(ctx).edit().putStringSet(KEY_USER_BLOCKLIST, updated).apply()
  }

  /** Remove a number from the user's manual blocklist (last-10 match) — the in-app Unblock action. */
  fun removeFromUserBlock(ctx: Context, rawNumber: String) {
    val tail = normalize(rawNumber).takeLast(10)
    if (tail.length < 6) return
    val updated = getUserBlocklist(ctx).filterNot { it.takeLast(10) == tail }.toSet()
    prefs(ctx).edit().putStringSet(KEY_USER_BLOCKLIST, updated).apply()
  }

  /** The user's block patterns (e.g. "140*", "+92*"), see [BlockPatterns]. */
  fun getBlockPatterns(ctx: Context): Set<String> =
    prefs(ctx).getStringSet(KEY_BLOCK_PATTERNS, emptySet()) ?: emptySet()

  /** Add a pattern; returns the cleaned-up pattern, or null if it isn't valid. */
  fun addBlockPattern(ctx: Context, raw: String): String? {
    val p = BlockPatterns.normalizePattern(raw) ?: return null
    val updated = getBlockPatterns(ctx).toMutableSet().apply { add(p) }
    prefs(ctx).edit().putStringSet(KEY_BLOCK_PATTERNS, updated).apply()
    return p
  }

  fun removeBlockPattern(ctx: Context, pattern: String) {
    val updated = getBlockPatterns(ctx).filterNot { it == pattern }.toSet()
    prefs(ctx).edit().putStringSet(KEY_BLOCK_PATTERNS, updated).apply()
  }

  fun setKeywords(ctx: Context, keywords: List<String>) {
    prefs(ctx).edit().putStringSet(KEY_KEYWORDS, keywords.toSet()).apply()
  }

  fun getKeywords(ctx: Context): Set<String> =
    prefs(ctx).getStringSet(KEY_KEYWORDS, emptySet()) ?: emptySet()

  /**
   * Matches on the last 10 digits so +91 / leading-0 / spacing variants of the
   * same Indian number all resolve to the same entry.
   */
  fun isBlocked(ctx: Context, rawNumber: String): Boolean {
    // Pattern rules first: they can target short codes that are under 6 digits.
    if (BlockPatterns.matchesAny(getBlockPatterns(ctx), rawNumber)) return true
    val n = normalize(rawNumber)
    if (n.length < 6) return false
    val tail = n.takeLast(10)
    // Only numbers the user blocked themselves are rejected. The synced risk list
    // (community reports, the user's own risky checks) must never silently drop
    // a call: those calls ring and get the warning card instead, so a false
    // report can't hide a real call from the bank, a courier or family.
    return getUserBlocklist(ctx).any { it.takeLast(10) == tail }
  }

  private fun normalize(number: String): String = number.filter { it.isDigit() }
}
