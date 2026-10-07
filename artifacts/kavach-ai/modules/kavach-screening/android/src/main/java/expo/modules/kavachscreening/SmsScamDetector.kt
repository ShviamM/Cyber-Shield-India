package expo.modules.kavachscreening

/**
 * On-device scam check for one incoming SMS. Pure Kotlin (no Android APIs) so it
 * can be unit-tested on a plain JVM.
 *
 * It weighs who sent the message as much as what it says, because the words
 * alone mislead: every genuine bank OTP contains "OTP" and "do not share".
 *  - Registered business senders (TRAI DLT headers such as "AX-HDFCBK") are
 *    banks, telcos and shops; scams from them are rare.
 *  - Most SMS scams come from ordinary 10-digit mobile numbers, usually with a
 *    link, a shortener or an APK, plus pressure ("account blocked", "KYC",
 *    "prize", "electricity cut tonight").
 * The message text never leaves the phone; only links are checked with the
 * server (see [SmsScreeningReceiver]).
 */
object SmsScamDetector {
  enum class Level { NONE, MEDIUM, HIGH }

  enum class Reason {
    SENDER_REPORTED,
    PERSONAL_NUMBER_WITH_LINK,
    SHORTENED_LINK,
    APK_LINK,
    SUSPICIOUS_LINK,
    ASKS_FOR_OTP,
    PRESSURE_WORDS,
    UPI_COLLECT,
  }

  data class Verdict(val level: Level, val score: Int, val reasons: List<Reason>, val links: List<String>)

  enum class SenderType { BUSINESS, PERSONAL, SHORT_CODE, OTHER }

  private val DLT_HEADER = Regex("""^[A-Z]{2}-[A-Z0-9]{3,9}(-[A-Z])?$""")
  private val URL = Regex("""(?i)\b((?:https?://|www\.)[^\s<>"']+|[a-z0-9][a-z0-9-]{1,62}\.(?:xyz|top|click|link|live|online|site|info|icu|cyou|buzz|shop|ly|in|com|net|co)/[^\s<>"']*)""")
  private val SHORTENERS = setOf(
    "bit.ly", "tinyurl.com", "t.ly", "cutt.ly", "rb.gy", "is.gd", "shorturl.at",
    "tiny.cc", "rebrand.ly", "s.id", "goo.su", "ow.ly", "t.co", "bitly.ws",
  )
  private val RISKY_TLDS = setOf("xyz", "top", "click", "link", "live", "online", "site", "icu", "cyou", "buzz", "shop")
  private val IP_HOST = Regex("""^\d{1,3}(\.\d{1,3}){3}$""")

  // Asking the reader to give away a code is the scam; a bank telling you not
  // to share it is not. These phrases ask.
  private val ASKS_FOR_OTP = listOf(
    "share the otp", "share otp", "send the otp", "send otp", "tell the otp", "otp bataye", "otp batayen",
    "otp बताएं", "otp बताये", "ओटीपी बताएं", "otp भेजें", "ओटीपी भेजें",
  )

  // Pressure and bait in English and Hindi. Matched case-insensitively.
  private val PRESSURE = listOf(
    "account blocked", "account will be blocked", "account suspended", "account has been suspended",
    "update kyc", "kyc update", "kyc pending", "kyc expired", "complete your kyc", "pan card blocked",
    "electricity will be disconnected", "power will be disconnected", "electricity connection",
    "you have won", "you won", "lottery", "lucky draw", "claim your prize", "claim now", "cashback of",
    "income tax refund", "refund approved", "loan approved", "pre-approved loan", "work from home",
    "earn daily", "part time job", "parcel on hold", "customs duty", "your parcel", "fedex",
    "digital arrest", "police case", "arrest warrant", "cbi", "narcotics",
    "खाता बंद", "खाता ब्लॉक", "केवाईसी", "बिजली कट", "बिजली काट", "लॉटरी", "इनाम", "पुलिस केस", "गिरफ्तार",
  )

  private val UPI_COLLECT = listOf("upi pin", "enter pin to receive", "approve the request", "collect request")

  fun senderType(sender: String): SenderType {
    val s = sender.trim().uppercase()
    if (DLT_HEADER.matches(s)) return SenderType.BUSINESS
    val digits = s.filter { it.isDigit() }
    if (digits.length >= 10 && s.all { it.isDigit() || it == '+' || it == ' ' || it == '-' }) return SenderType.PERSONAL
    if (digits.isNotEmpty() && digits.length <= 6 && digits.length == s.length) return SenderType.SHORT_CODE
    return SenderType.OTHER
  }

  fun extractLinks(body: String): List<String> =
    URL.findAll(body).map { it.value.trimEnd('.', ',', ')', ']', '!', '?') }.distinct().take(5).toList()

  private fun hostOf(link: String): String {
    val noScheme = link.replace(Regex("(?i)^https?://"), "")
    return noScheme.substringBefore('/').substringBefore('?').substringBefore(':').lowercase().removePrefix("www.")
  }

  /**
   * [riskyNumbers] are the synced reported numbers (last 10 digits are compared);
   * [extraKeywords] are server-synced phrases that add to the pressure score.
   */
  fun analyze(
    sender: String,
    body: String,
    riskyNumbers: Set<String> = emptySet(),
    extraKeywords: Collection<String> = emptyList(),
  ): Verdict {
    val text = body.lowercase()
    val type = senderType(sender)
    val links = extractLinks(body)
    val reasons = mutableListOf<Reason>()
    var score = 0

    val tail = sender.filter { it.isDigit() }.takeLast(10)
    if (tail.length == 10 && riskyNumbers.any { it.filter { c -> c.isDigit() }.takeLast(10) == tail }) {
      score += 70; reasons += Reason.SENDER_REPORTED
    }

    if (links.isNotEmpty()) {
      val hosts = links.map { hostOf(it) }
      if (type == SenderType.PERSONAL) { score += 30; reasons += Reason.PERSONAL_NUMBER_WITH_LINK }
      if (hosts.any { it in SHORTENERS }) { score += 20; reasons += Reason.SHORTENED_LINK }
      if (links.any { it.lowercase().substringBefore('?').endsWith(".apk") }) { score += 45; reasons += Reason.APK_LINK }
      if (hosts.any { IP_HOST.matches(it) || it.substringAfterLast('.') in RISKY_TLDS }) {
        score += 20; reasons += Reason.SUSPICIOUS_LINK
      }
    }

    if (ASKS_FOR_OTP.any { it in text }) { score += 40; reasons += Reason.ASKS_FOR_OTP }

    val strongHits = PRESSURE.count { it.lowercase() in text }
    val pressureHits = (PRESSURE + extraKeywords.filter { it.length >= 5 && it != "one time password" })
      .map { it.lowercase() }
      .distinct()
      .count { it in text }
    if (pressureHits > 0) { score += minOf(15 * pressureHits, 30); reasons += Reason.PRESSURE_WORDS }
    // Banks, power companies and courier firms don't text "account blocked" or
    // "electricity cut tonight" from a personal mobile number.
    if (type == SenderType.PERSONAL && strongHits > 0) score += 25

    if (UPI_COLLECT.any { it in text }) { score += 25; reasons += Reason.UPI_COLLECT }

    // Registered business senders are rarely the scam; pressure words from them
    // ("KYC due", "bill unpaid") are routine. Only links that are themselves bad
    // keep a business message flagged.
    if (type == SenderType.BUSINESS && Reason.SENDER_REPORTED !in reasons) {
      val badLink = Reason.APK_LINK in reasons || Reason.SUSPICIOUS_LINK in reasons || Reason.SHORTENED_LINK in reasons
      score = if (badLink) score / 2 else 0
    }

    val level = when {
      score >= 70 -> Level.HIGH
      score >= 40 -> Level.MEDIUM
      else -> Level.NONE
    }
    return Verdict(level, score, if (level == Level.NONE) emptyList() else reasons, links)
  }
}
