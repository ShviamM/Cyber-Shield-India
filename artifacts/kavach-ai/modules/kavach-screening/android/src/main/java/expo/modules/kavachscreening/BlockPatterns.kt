package expo.modules.kavachscreening

/**
 * User-defined number patterns for blocking whole series of calls, e.g.
 * "140*" (India's promotional telemarketing series) or "+92*" (a country code).
 *
 * Idea adapted from SpamBlocker's number rules (MIT License,
 * Copyright (c) 2024 aj3423, https://github.com/aj3423/SpamBlocker), simplified
 * to a wildcard syntax that non-technical users can type: digits, an optional
 * leading "+", and "*" for "any digits". Kept free of Android APIs so it can be
 * unit-tested on a plain JVM.
 */
object BlockPatterns {
  private const val INDIA_CC = "91"
  private val ALLOWED = Regex("""^\+?[0-9*]+$""")

  /**
   * Clean up what the user typed into a canonical pattern, or null if it isn't
   * valid. Spaces, dashes and brackets are dropped. A national pattern needs at
   * least 3 digits and a "+" pattern at least 1 (a country code), so a typo like
   * "*" or "9*" can't block every call; "+9*" and "+91*" are refused because
   * they would block every Indian number.
   */
  fun normalizePattern(raw: String): String? {
    // Collapse repeated wildcards ("**" -> "*").
    val p = raw.trim().filter { it.isDigit() || it == '*' || it == '+' }.replace(Regex("""\*+"""), "*")
    if (!ALLOWED.matches(p)) return null
    val digits = p.count { it.isDigit() }
    if (p.startsWith("+")) {
      if (digits < 1) return null
      val body = p.removePrefix("+")
      if (body.endsWith("*") && INDIA_CC.startsWith(body.removeSuffix("*"))) return null
    } else if (digits < 3) {
      return null
    }
    return p
  }

  /**
   * True when [rawNumber] matches [pattern]. A pattern starting with "+" is
   * compared against the international form (country code + number, no "+");
   * otherwise it's compared against the national form (for Indian numbers, the
   * last 10 digits) and also the raw digits, so "140*" catches "140xxxxxxx"
   * however the network formats it.
   */
  fun matches(pattern: String, rawNumber: String): Boolean {
    val p = normalizePattern(pattern) ?: return false
    val forms = numberForms(rawNumber)
    if (forms.isEmpty()) return false
    val international = p.startsWith("+")
    val regex = toRegex(p.removePrefix("+"))
    return if (international) {
      forms.international?.let { regex.matches(it) } ?: false
    } else {
      regex.matches(forms.national) || regex.matches(forms.digits)
    }
  }

  fun matchesAny(patterns: Collection<String>, rawNumber: String): Boolean =
    patterns.any { matches(it, rawNumber) }

  private fun toRegex(p: String): Regex =
    Regex(p.split("*").joinToString("[0-9]*") { Regex.escape(it) })

  private data class Forms(val digits: String, val national: String, val international: String?) {
    fun isEmpty() = digits.isEmpty()
  }

  private fun numberForms(raw: String): Forms {
    val trimmed = raw.trim()
    val digits = trimmed.filter { it.isDigit() }
    if (digits.isEmpty()) return Forms("", "", null)
    return when {
      // +CC… or 00CC… : already international.
      trimmed.startsWith("+") -> Forms(digits, nationalOf(digits), digits)
      digits.startsWith("00") -> digits.drop(2).let { Forms(digits, nationalOf(it), it) }
      // 0XXXXXXXXXX (11 digits): Indian trunk prefix.
      digits.length == 11 && digits.startsWith("0") ->
        digits.drop(1).let { Forms(digits, it, INDIA_CC + it) }
      // 91XXXXXXXXXX (12 digits) without "+".
      digits.length == 12 && digits.startsWith(INDIA_CC) ->
        Forms(digits, digits.takeLast(10), digits)
      // Plain 10-digit Indian number.
      digits.length == 10 -> Forms(digits, digits, INDIA_CC + digits)
      // Short codes and anything else: no reliable international form.
      else -> Forms(digits, digits, null)
    }
  }

  private fun nationalOf(international: String): String =
    if (international.startsWith(INDIA_CC) && international.length == 12) international.takeLast(10) else international
}
