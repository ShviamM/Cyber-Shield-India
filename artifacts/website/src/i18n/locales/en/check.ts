export default {
  seo: {
    title: "Free Scam Check — Number, Link & UPI | Netraksh",
    description:
      "Check any phone number, link or UPI ID for fraud risk in real time. Free, instant scam detection powered by Netraksh's fraud engine.",
  },
  heading: "Check a Number, Link or UPI",
  subheading:
    "Paste a suspicious phone number, website link, UPI ID or message. We'll run a real-time fraud check and show you the risk.",
  inputLabel: "What do you want to check?",
  placeholder: "e.g. 9876543210, bit.ly/xyz or name@okbank",
  analyzeCta: "Check Now",
  checking: "Running fraud check…",
  checkAnother: "Check another",
  disclaimer:
    "This is an automated risk estimate, not a verdict. Always stay cautious and never share OTPs or passwords.",
  scoreLabel: "Risk score",
  reasonsLabel: "Why we flagged this",
  noReasons: "No specific risk factors were found for this input.",
  checkedLabel: "Checked",
  type: {
    phone: "Phone number",
    url: "Website link",
    upi: "UPI ID",
    message: "Message",
  },
  verdict: {
    high: {
      title: "High Risk",
      desc: "This is very likely a scam. Do not respond, pay or share any details.",
    },
    medium: {
      title: "Suspicious",
      desc: "We found warning signs. Treat this with caution and verify before trusting it.",
    },
    low: {
      title: "Looks Safe",
      desc: "We didn't find strong risk signals — but stay alert if anything feels off.",
    },
    unknown: {
      title: "Not Enough Information",
      desc: "We couldn't gather enough signals to judge this. Stay cautious.",
    },
  },
  error: {
    rateLimited:
      "Too many checks in a short time. Please wait a minute and try again.",
    limitReached:
      "You've reached today's free check limit. Download Netraksh for unlimited protection.",
    generic:
      "We couldn't complete the check right now. Please try again in a moment.",
    empty: "Enter a number, link or UPI ID to check.",
  },
  download: {
    title: "Protected on every call, link and text",
    desc: "Netraksh blocks scam calls, scans links and warns your family in real time.",
    cta: "Download Netraksh",
  },
  report: {
    prompt: {
      phone: "Has this number been scamming people?",
      url: "Has this link been used to scam people?",
      upi: "Has this UPI ID been used to scam people?",
    },
    cta: "Report as scam",
    title: {
      phone: "Report this number",
      url: "Report this link",
      upi: "Report this UPI ID",
    },
    desc: "Add it to Netraksh's community database so others get warned when they check it.",
    categoryLabel: "Scam type (optional)",
    categoryPlaceholder: "Select a category",
    submit: "Submit report",
    submitting: "Submitting…",
    cancel: "Cancel",
    success: {
      title: "Thanks for reporting",
      phone_one: "This number now has {{count}} community report. You're helping protect others.",
      phone_other: "This number now has {{count}} community reports. You're helping protect others.",
      url_one: "This link now has {{count}} community report. You're helping protect others.",
      url_other: "This link now has {{count}} community reports. You're helping protect others.",
      upi_one: "This UPI ID now has {{count}} community report. You're helping protect others.",
      upi_other: "This UPI ID now has {{count}} community reports. You're helping protect others.",
    },
    error: {
      duplicate: "You've already reported this recently.",
      rateLimited: "Too many reports in a short time. Please try again later.",
      verification: "We couldn't verify you're human. Please try again.",
      invalidTarget: "Only valid numbers, links or UPI IDs can be reported.",
      generic: "We couldn't submit your report right now. Please try again.",
    },
  },
} as const;
