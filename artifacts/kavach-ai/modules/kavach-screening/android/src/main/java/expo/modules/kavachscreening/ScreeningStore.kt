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
  private const val KEY_KEYWORDS = "keywords"
  private const val KEY_LANGUAGE = "language"
  private const val KEY_API_BASE = "api_base"
  private const val KEY_AUTH_TOKEN = "auth_token"

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

  /** Add a single number to the on-device blocklist (used by the overlay's Block button). */
  fun addToBlocklist(ctx: Context, rawNumber: String) {
    val n = normalize(rawNumber)
    if (n.length < 6) return
    val updated = getBlocklist(ctx).toMutableSet().apply { add(n) }
    prefs(ctx).edit().putStringSet(KEY_BLOCKLIST, updated).apply()
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
    val n = normalize(rawNumber)
    if (n.length < 6) return false
    val tail = n.takeLast(10)
    return getBlocklist(ctx).any { it.takeLast(10) == tail }
  }

  private fun normalize(number: String): String = number.filter { it.isDigit() }
}
