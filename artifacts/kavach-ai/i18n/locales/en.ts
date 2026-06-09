/**
 * Canonical English copy for Netraksh. This is the source of truth for all
 * localizable UI chrome and static educational content. Every other locale
 * mirrors these keys exactly; missing keys fall back to English at runtime.
 *
 * Interpolation uses {{placeholder}} tokens. Plurals are handled in-component
 * (a base key + a *One variant) rather than via the i18next plural engine, to
 * avoid relying on Intl.PluralRules in the Hermes runtime.
 *
 * Out of scope (stays in source language, lives in constants/data.ts):
 * the live threat feed, scam-of-the-day, city hotspots, and golden rules.
 */
const en = {
  common: {
    appName: "Netraksh",
    back: "Back",
    cancel: "Cancel",
    retry: "Try Again",
    continue: "Continue",
    submit: "Submit",
    loading: "Loading…",
    somethingWrong: "Something went wrong",
    checkConnection: "Please check your connection and try again.",
    optional: "Optional",
    required: "Required",
    timeAgo: {
      justNow: "just now",
      minutes: "{{n}} min ago",
      hours: "{{n}} hr ago",
      days: "{{n}}d ago",
      thisWeek: "this week",
    },
    trend: {
      critical: "CRITICAL",
      high: "HIGH",
      medium: "MEDIUM",
    },
  },

  tabs: {
    home: "Home",
    verify: "Verify",
    threats: "Threats",
    family: "Family",
    profile: "Profile",
  },

  notifications: {
    title: "Notifications",
    emptyTitle: "No alerts yet",
    emptySub: "Scam alerts and safety updates from Netraksh will appear here.",
    errorTitle: "Couldn't load alerts",
    errorSub: "Please check your connection and try again.",
  },

  auth: {
    tagline: "Thag se 2 kadam aage",
    welcomeTitle: "Welcome to Netraksh",
    welcomeSub: "India's prevention-first shield against cyber crime & scam calls.",
    phoneLabel: "Mobile Number",
    phonePlaceholder: "98765 43210",
    phoneHint: "We'll send a one-time code to verify it's you.",
    sendOtp: "Send OTP",
    invalidPhone: "Enter a valid 10-digit Indian mobile number.",
    detailsTitle: "Create your account",
    detailsSub: "Tell us a little about you to finish signing up.",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Rahul Sharma",
    locationLabel: "City / Location",
    locationPlaceholder: "e.g. Mumbai, Maharashtra",
    nameRequired: "Please enter your name.",
    otpTitle: "Enter the code",
    otpSubPrefix: "We sent a 4-digit code to ",
    otpPlaceholder: "4-digit code",
    verify: "Verify & Continue",
    invalidOtp: "Enter the 4-digit code.",
    resend: "Resend code",
    resendIn: "Resend code in {{seconds}}s",
    devOtpPrefix: "Dev code: ",
    changeNumber: "Change number",
    otpSent: "Code sent",
    requestFailed: "Could not send the code. Please try again.",
    verifyFailed: "Could not verify the code. Please try again.",
    otpUnavailable:
      "Phone verification isn't available in this preview. Please use the installed app.",
    devTestLogin: "Dev test login (skip OTP)",
    devLoginHint: "Development only — disabled in the published app.",
  },

  profile: {
    signOut: "Sign Out",
    signOutConfirmTitle: "Sign Out",
    signOutConfirmMsg: "You'll need to verify your number again to sign back in.",
    deleteAccount: "Delete Account",
    deleteAccountConfirmTitle: "Delete your account?",
    deleteAccountConfirmMsg:
      "This permanently erases your account, check history, family list and subscription records. This can't be undone.",
    deleteAccountConfirmCta: "Delete",
    deleteAccountFinalTitle: "Are you absolutely sure?",
    deleteAccountFinalMsg: "Your account and all your data will be deleted right away.",
    deleteAccountErrorTitle: "Couldn't delete account",
    deleteAccountErrorMsg:
      "Something went wrong. Please check your connection and try again.",
    member: "Netraksh member",
    protected: "Protected",
    paused: "Paused",
    sectionProtection: "PROTECTION",
    sectionLanguage: "LANGUAGE",
    sectionServices: "QUICK SERVICES",
    sectionLearn: "LEARN & REPORT",
    sectionAbout: "ABOUT",
    guardianMode: "Guardian Mode",
    guardianModeSub: "Real-time scam call warnings",
    notifications: "Threat Notifications",
    notificationsSub: "Alerts for new scams in your city",
    screening: "On-Device Screening",
    screeningSub: "Screen calls & SMS for scams (Android)",
    displayLanguage: "Display Language",
    helplineCardTitle: "Cyber Crime Helpline",
    helplineCardSub: "Call immediately if you've been scammed",
    aboutTitle: "About Netraksh",
    aboutSub: "Prevention-first cyber safety for India",
    privacyTitle: "Privacy Policy",
    privacySub: "How we protect your data",
    rateTitle: "Rate Netraksh",
    rateSub: "Help us protect more Indians",
    version: "Netraksh v2.0.0 · Made for India",
  },

  services: {
    reportFraud: "Report a Fraud Number",
    reportFraudSub: "Warn the community",
    scamCategories: "Scam Categories",
    scamCategoriesSub: "Know the tricks",
    safetyTips: "Cyber Safety Tips",
    safetyTipsSub: "Stay protected",
    helpline: "Emergency & Helpline",
    helplineSub: "1930 · Report cyber crime",
  },

  book: {
    sectionLabel: "FROM THE FOUNDER",
    eyebrow: "The book that will save 100 million Indians from cyber fraud",
    title: "Digital Dhokha",
    author: "by Shivam Malaviya",
    tagline: "Unmasking the scams, frauds and lies stealing India's future.",
    cta: "Buy on Amazon",
  },

  home: {
    logoSub: "CYBER CRIME PREVENTION · INDIA",
    sosHelpline: "Cyber Helpline",
    guardianActive: "Guardian Active",
    guardianPaused: "Guardian Paused",
    statChecked: "Checked",
    statThreats: "Threats",
    statProtected: "Protected",
    verifyTitle: "Verify Before You Act",
    verifySub: "Check anything suspicious instantly",
    activeScamsToday: "Active Scams Today",
    allCount: "All {{n}} →",
    nearbyTitle: "Active Scams in {{city}}",
    nearbyTitleGeneric: "Active Scams Near You",
    nearbyDetecting: "Detecting your city…",
    nearbyCases: "{{n}} cases reported this month",
    nearbyDenied: "Turn on location to see scams reported near you.",
    nearbyEnable: "Enable location",
    nearbyUnavailable: "Couldn't detect your location.",
    nearbyRetry: "Try again",
    nearbyEmpty: "No city-specific reports right now. Stay alert and verify every unknown caller.",
    activeEmpty: "No active scams reported right now. Check back soon.",
    activeError: "Couldn't load live scams.",
    hotspotsEmpty: "No hotspot data yet.",
    hotspotsError: "Couldn't load hotspots.",
    tipCritical: "Real couriers never ask for payment over the phone.",
    tipDefault: "Hang up immediately and verify through official channels.",
    familyShield: "Family Shield",
    seeAll: "See All",
    goldenRules: "Golden Rules of Safety",
    hotspots: "Hotspots This Week",
    casesReported: "{{n}} cases reported",
    protectCircleTitle: "Protect Your Circle",
    protectCircleSub: "Warn family & friends. Share scam alerts directly.",
    demoTitle: "Demo: Incoming Scam Call",
    demoSub: "See how Netraksh warns you in real-time",
    cyberCellTitle: "{{state}} Cyber Police",
    cyberCellSub: "Report cyber fraud to your state cyber cell",
    cyberCellCall: "Call cyber cell",
    cyberCellEmail: "Email cyber cell",
    cyberCellVerified: "Official source · Verified {{date}}",
    quickTools: {
      numberLabel: "Check Number",
      numberSub: "Spam / Safe?",
      linkLabel: "Check Link",
      linkSub: "Phishing URL?",
      upiLabel: "Check UPI ID",
      upiSub: "Legit account?",
      qrLabel: "Check QR Code",
      qrSub: "Safe to scan?",
    },
    primaryActions: {
      title: "What do you want to check?",
      numberLabel: "Check Number",
      numberSub: "Is this caller safe?",
      linkLabel: "Check Link",
      linkSub: "Is this link safe?",
      messageLabel: "Check Message",
      messageSub: "SMS or WhatsApp",
      reportLabel: "Report Fraud",
      reportSub: "Warn others",
    },
    scanBeforePay: "Scan Before You Pay",
  },

  onboarding: {
    languageTitle: "Choose your language",
    languageSub: "You can change this any time in Settings.",
    hindi: "हिन्दी",
    english: "English",
    continue: "Continue",
    guardianTitle: "Meet your Digital Bodyguard",
    guardianBody:
      "Netraksh watches for scam calls and fraud messages to help keep you safe.",
    guardianPoint1: "Scam call screening",
    guardianPoint2: "Scam SMS screening",
    guardianPoint3: "Fraud alert monitoring",
    getStarted: "Get Started",
  },

  verify: {
    title: "Verify Before You Act",
    sub: "Check anything suspicious instantly",
    checkBeforeAnswering: "Check a number before answering",
    checkBeforeAnsweringSub: "See community reports before you pick up",
    checkNow: "Check Now",
    checking: "Checking…",
    enterValue: "Enter a value to check",
    reportThisNumber: "Report this number",
    reportCount: "{{n}} community reports",
    reportCountOne: "1 community report",
    noReports: "No community reports yet",
    relatedCategories: "Reported for",
    checkFailed: "Couldn't check this number. Please try again.",
    checkFailedGeneric: "Couldn't complete the check",
    checkFailedDetail:
      "You may be offline, or the service is busy. Check your connection and try again.",
    tryAgain: "Try again",
    recentChecks: "RECENT CHECKS",
    freeChecksLeft: "{{n}} free checks left today",
    freeChecksLeftNumber: "{{n}} free number checks left today",
    noChecksLeft: "Daily free limit reached",
    upgradeCta: "Upgrade",
    verdict: {
      whyTitle: "Why this verdict",
      high: {
        headline: "HIGH RISK — Likely Scam",
        detail:
          "Strong scam signals detected. Do NOT share OTP/PIN, click links, or pay. Verify through official channels.",
      },
      medium: {
        headline: "Caution — Be Careful",
        detail:
          "Some suspicious signals were found. Slow down and verify independently before acting.",
      },
      low: {
        headline: "Likely Safe",
        detail:
          "No strong scam signals found. Stay alert — never share OTP or money on an unverified request.",
      },
      unknown: {
        headline: "Not Enough Signals",
        detail:
          "We couldn't find clear signals either way. Stay cautious and verify through official channels.",
      },
    },
    risk: {
      high: {
        headline: "HIGH RISK — Likely Fraud",
        detail:
          "This number has multiple community reports. Do NOT share OTP, PIN, or make any payment. Hang up and verify through official channels.",
      },
      medium: {
        headline: "Suspicious — Be Careful",
        detail:
          "This number has been reported. Proceed with caution and never share personal details, OTP, or money.",
      },
      low: {
        headline: "Low Risk",
        detail:
          "Only a few or no recent reports. Still, always verify the caller's identity before sharing anything.",
      },
      unknown: {
        headline: "No Reports Found",
        detail:
          "No community fraud reports for this number yet. Stay alert and never share OTP or money on an unverified call.",
      },
    },
    verifiedScam: "Verified scam by Netraksh moderators",
    officialCheck: {
      title: "Cross-check on the official portal",
      body: "Before you act, verify this on the Government of India National Cybercrime suspect repository.",
      button: "Search on cybercrime.gov.in",
    },
    types: {
      numberLabel: "Check Number",
      numberHint: "+91 98765 43210",
      messageLabel: "Check Message",
      messageHint: "Paste a suspicious SMS or WhatsApp message…",
      linkLabel: "Check Link",
      linkHint: "https://example.com",
      upiLabel: "Check UPI ID",
      upiHint: "name@paytm",
      qrLabel: "Check QR Code",
      qrHint: "Paste QR content here",
    },
    scan: {
      button: "Scan with camera",
      title: "Scan a QR Code",
      hint: "Point your camera at a QR code to check it for scams.",
      cancel: "Cancel",
      permissionTitle: "Camera access needed",
      permissionBody:
        "Allow camera access to scan QR codes. You can still paste QR content manually below.",
      grantPermission: "Allow camera",
      openSettings: "Open Settings",
      unavailable: "Camera scanning isn't available here. Paste the QR content below instead.",
    },
    status: {
      safe: "Safe",
      warning: "Warning",
      danger: "Danger",
      invalid: "Invalid",
    },
    local: {
      linkInvalidHeadline: "Enter a valid URL",
      linkInvalidDetail: "Must start with http:// or https://",
      linkDangerHeadline: "PHISHING LINK DETECTED",
      linkDangerDetail:
        "This URL matches known phishing patterns. Do NOT click or enter any personal details on this page.",
      linkHttpHeadline: "Unsafe Connection (HTTP)",
      linkHttpDetail:
        "No encryption. Avoid entering passwords, card numbers, or OTP on this page.",
      linkWarnHeadline: "Suspicious URL",
      linkWarnDetail:
        "URL contains patterns common in scam offers. Verify the domain carefully before proceeding.",
      linkSafeHeadline: "No Threats Detected",
      linkSafeDetail:
        "This URL appears safe. Always double-check the domain name spelling before entering personal info.",
      upiInvalidHeadline: "Invalid UPI ID format",
      upiInvalidDetail: "Valid examples: name@upi, 9876543210@paytm, user@oksbi",
      upiDangerHeadline: "SUSPICIOUS UPI ID",
      upiDangerDetail:
        "Legitimate banks and companies never use these keywords in their UPI IDs. This is likely a fraud account.",
      upiSafeHeadline: "Valid UPI Format",
      upiSafeDetail:
        "Format is valid. Always confirm the recipient's identity through a separate channel before sending money.",
      qrDangerHeadline: "QR PAYMENT SCAM",
      qrDangerDetail:
        "This QR is disguised as a 'receive money' code but actually requests a payment FROM you.",
      qrWarnHeadline: "Payment QR Detected",
      qrWarnDetail:
        "This QR initiates a UPI payment. Confirm the recipient's identity before scanning on your phone.",
      qrSafeHeadline: "No Threats in QR",
      qrSafeDetail:
        "No payment requests detected in this QR data. Verify the destination URL or content before acting.",
      unknownHeadline: "Unknown error",
    },
  },

  report: {
    title: "Report a Fraud Number",
    intro: "Your report helps warn millions of Indians. It takes less than a minute.",
    phoneLabel: "Fraud Number",
    phonePlaceholder: "98765 43210",
    invalidPhone: "Enter a valid 10-digit Indian mobile number.",
    alreadyReported:
      "This number already has {{n}} reports. Adding yours strengthens the warning.",
    alreadyReportedOne:
      "This number already has 1 report. Adding yours strengthens the warning.",
    verifiedScamWarning: "This number is already flagged as a verified scam.",
    categoryLabel: "Type of Scam",
    categoryRequired: "Please choose a scam type.",
    categoryLoadError: "Couldn't load scam types. Pull to retry.",
    descriptionLabel: "What happened?",
    descriptionPlaceholder:
      "Describe the call or message — what they claimed, what they asked for…",
    descriptionRequired: "Please add a short description.",
    descriptionTooShort: "Please add a little more detail (at least 10 characters).",
    incidentDateLabel: "When did it happen?",
    incidentDateHint: "Optional — helps moderators verify",
    datePlaceholder: "YYYY-MM-DD",
    today: "Today",
    submit: "Submit Report",
    submitting: "Submitting…",
    successTitle: "Report submitted",
    successMsg: "Thank you for helping protect the community.",
    submitFailed: "Couldn't submit your report. Please try again.",
    done: "Done",
    disclaimer:
      "Reports are reviewed by moderators. False reports may be removed. For financial loss, also call 1930.",
  },

  categories: {
    title: "Scam Categories",
    intro: "Learn how the most common scams in India work so you can spot them early.",
    empty: "No categories available yet.",
    loadError: "Couldn't load scam categories.",
    reportCta: "Report a number in this category",
  },

  safety: {
    title: "Cyber Safety",
    intro: "Quick, practical guidance to keep you and your family safe online.",
    tipsHeading: "What to do",
    topics: [
      {
        id: "phishing",
        title: "Phishing Links & Fake Websites",
        summary:
          "Fraudsters send links that look official (banks, KYC, refunds) to steal your login or card details.",
        tips: [
          "Never click links in unexpected SMS, WhatsApp, or email.",
          "Type bank and government website addresses yourself.",
          "Check for spelling tricks in the domain (e.g. sbi-kyc-update.com).",
          "Use the Verify tab to check a link before opening it.",
        ],
      },
      {
        id: "otp",
        title: "OTP & PIN Theft",
        summary:
          "No genuine bank, company, or government office will EVER ask for your OTP, PIN, or CVV.",
        tips: [
          "Never share an OTP — not even with 'bank staff' or 'police'.",
          "An OTP for a refund is actually authorising a payment FROM you.",
          "Don't read codes aloud on a call.",
          "Enable transaction alerts on your bank account.",
        ],
      },
      {
        id: "upi",
        title: "UPI & Payment Scams",
        summary:
          "You never enter a UPI PIN to RECEIVE money. Requests to 'approve to receive' are scams.",
        tips: [
          "Entering your UPI PIN always means money LEAVES your account.",
          "Verify the receiver's name before sending money.",
          "Be wary of 'wrong transfer, please return' tricks.",
          "Scan only QR codes you trust — a QR can request a payment.",
        ],
      },
      {
        id: "loan_apps",
        title: "Fake Loan & Credit Apps",
        summary:
          "Instant-loan apps lure you with quick money, then harass and blackmail using your contacts and photos.",
        tips: [
          "Only borrow from RBI-registered banks or NBFCs.",
          "Don't grant apps access to contacts, gallery, or messages.",
          "Avoid apps demanding fees before disbursing a loan.",
          "Check reviews and the developer before installing.",
        ],
      },
      {
        id: "impersonation",
        title: "Police, Bank & Govt Impersonation",
        summary:
          "Scammers pose as police ('digital arrest'), bank officers, or officials to frighten you into paying.",
        tips: [
          "Real police never arrest or 'fine' you over a video call.",
          "Hang up and call the official number from the bank's website.",
          "Urgency + threats + secrecy = scam. Pause and verify.",
          "Talk to family before acting on any scary call.",
        ],
      },
    ],
  },

  helpline: {
    title: "Emergency & Helpline",
    sosTitle: "Cyber Crime Helpline 1930",
    sosSub: "Call now if you've lost money or shared sensitive details.",
    callNow: "Call 1930",
    portalTitle: "National Cyber Crime Portal",
    portalSub: "File a detailed complaint online",
    portalCta: "Open cybercrime.gov.in",
    stepsTitle: "If you've been scammed",
    disclaimerTitle: "Stay safe while reporting",
    disclaimer:
      "Netraksh never asks for your OTP, PIN, or passwords. Always verify official helpline numbers and websites yourself — scammers often pose as 'support agents'. Only 1930 and cybercrime.gov.in are official Government of India channels.",
    steps: [
      "Call 1930 immediately — the sooner you report, the better the chance of freezing the money.",
      "File a complaint at cybercrime.gov.in with all details and screenshots.",
      "Inform your bank to block the card/account and stop further transactions.",
      "Save evidence: numbers, messages, transaction IDs, and screenshots.",
      "Report the number in Netraksh to warn others.",
    ],
  },

  threats: {
    headerTitle: "Threat Feed",
    headerSub: "Real-time cyber crime intelligence",
    live: "LIVE",
    reports: "{{n}} reports",
    activeScamsNow: "Active Scams Right Now",
    communityReports: "{{city}} · {{n}} community reports",
    cityHotspots: "City Hotspots",
    cases: "{{n}} cases",
    goldenRules: "Golden Rules of Safety",
    trendingEmpty: "No active scams reported right now. Check back soon.",
    trendingError: "Couldn't load the threat feed.",
    hotspotsEmpty: "No hotspot data yet.",
    hotspotsError: "Couldn't load hotspots.",
    scamOfDayError: "Couldn't load today's top scam.",
    scamOfDayEmpty: "No trending scam right now. Check back soon.",
  },

  family: {
    headerTitle: "Family Shield",
    membersProtected: "{{n}} members protected",
    membersProtectedOne: "1 member protected",
    addMember: "Add Family Member",
    namePlaceholder: "Name (e.g. Mummy)",
    phonePlaceholder: "+91 98765 43210",
    addToShield: "Add to Shield",
    emptyTitle: "No members yet",
    emptyDesc:
      "Add family members to monitor their protection status and get alerts when they may be at risk.",
    addFirst: "Add First Member",
    suspiciousCallNow: "Receiving a suspicious call right now!",
    statusAlert: "Alert — Possible Scam Call",
    statusSafe: "Protected & Safe",
    statusShortAlert: "Alert",
    statusShortSafe: "Safe",
    markSafe: "Mark safe",
    lastActivity: "Last activity: {{value}}",
    justAdded: "Just added",
    justNow: "Just now",
    oneHourAgo: "1 hr ago",
    removeTitle: "Remove Member",
    removeMessage: "Remove {{name}} from Family Shield?",
    remove: "Remove",
    upgradeTitle: "Family plan required",
    upgradeMessage:
      "Protecting family members is part of the Family plan. Upgrade to add and monitor your loved ones.",
    upgradeCta: "See plans",
    limitTitle: "Member limit reached",
    limitMessage: "Your plan allows up to {{n}} family members.",
    addFailedTitle: "Couldn't add member",
    addFailedMessage: "Something went wrong. Please try again.",
    removeFailedTitle: "Couldn't remove member",
    removeFailedMessage: "Something went wrong. Please try again.",
    relations: {
      mother: "Mother",
      father: "Father",
      spouse: "Spouse",
      child: "Child",
      sibling: "Sibling",
      other: "Other",
    },
  },

  callAlert: {
    incoming: "INCOMING CALL",
    unknownCaller: "Unknown Caller · No Contact Match",
    scamReports: "Scam Reports",
    victimsReported: "Victims Reported",
    topCity: "Top City",
    scamType: "FAKE FEDEX / COURIER SCAM",
    block: "Block",
    report: "Report",
    answer: "Answer",
    highRisk: "High Risk",
    warnings: [
      "STOP! This could be a scammer",
      "Do NOT share OTP or send money!",
      "Verify first, then talk",
    ],
    reportSheetTitle: "Report this number",
    reportSheetSubtitle: "Pick the scam type — we report it instantly.",
    reporting: "Reporting…",
    reportSuccessTitle: "Reported. Thank you!",
    reportSuccessMsg: "You've helped protect others from this number.",
    reportDuplicateTitle: "Already reported",
    reportDuplicateMsg: "You've already reported this number recently.",
    reportErrorTitle: "Couldn't report",
    reportErrorMsg: "Something went wrong. Please try again.",
    reportRateLimitedTitle: "Too many reports",
    reportRateLimitedMsg: "You've submitted several reports recently. Please try again later.",
    reportInvalidNumber: "This number can't be reported.",
    reportAutoDescription:
      "Reported from an incoming call flagged as high-risk by Netraksh.",
    reportRetry: "Try again",
    reportDone: "Done",
  },

  screening: {
    title: "On-Device Screening",
    subtitle: "Real-time scam call & SMS protection",
    intro:
      "Let Netraksh watch for scam calls and messages right on your phone and warn you the moment one arrives. Checks happen on your device.",
    unavailableTitle: "Available on Android app builds",
    unavailableBuild:
      "On-device screening needs the installed Android app. It can't run in this preview or Expo Go. You can still review the settings and privacy model here.",
    unavailableIos:
      "Apple doesn't allow apps to screen calls or read SMS, so this protection is Android-only.",
    sectionProtections: "PROTECTIONS",
    callTitle: "Scam Call Screening",
    callSub: "Warns you when a high-risk number calls",
    smsTitle: "Scam SMS Screening",
    smsSub: "Flags likely scam texts as they arrive",
    smsShareTitle: "Check any SMS instantly",
    smsShareSub:
      "Share a suspicious text to Netraksh from your Messages app to scan it — no SMS permission needed.",
    statusCallRole: "Netraksh is your call screening app",
    statusSmsPerm: "SMS access granted",
    statusNotif: "Alert notifications allowed",
    statusBlocklist: "{{n}} high-risk numbers synced on-device",
    sectionPrivacy: "YOUR PRIVACY",
    privacy: {
      onDevice: "All screening runs on your phone — nothing is uploaded automatically.",
      noContent: "Message contents are never sent off your device without your tap.",
      userControl: "Turn each protection on or off any time.",
      neverBlocks: "Netraksh warns you — it never silently blocks or answers calls.",
    },
    sectionHow: "HOW IT WORKS",
    how: {
      step1: "Netraksh keeps a private list of high-risk numbers from your checks and reports.",
      step2: "Incoming calls and texts are matched against it instantly, on-device.",
      step3: "If something looks risky, you get a clear warning — tap to verify it safely.",
    },
    previewWarning: "Preview a scam-call warning",
    roleDeniedTitle: "Call screening not enabled",
    roleDeniedMsg:
      "To screen calls, allow Netraksh to be your call screening app in the system dialog.",
    smsDeniedTitle: "SMS permission needed",
    smsDeniedMsg:
      "Netraksh needs SMS access to screen messages on your device. You can grant it in Settings.",
  },

  language: {
    title: "Display Language",
    intro: "Choose the language for the app. Live scam-feed content stays in its original language.",
  },

  launch: {
    bookCaption: "India's Cyber-Crime Prevention Book",
  },

  about: {
    title: "About Netraksh",
    tagline: "Thag se 2 kadam aage",
    taglineEn: "Two steps ahead of fraudsters",
    intro:
      "Netraksh is a prevention-first cyber-safety app built for India. It helps everyday people spot and stop digital fraud — fake calls, phishing links, UPI tricks, and scam QR codes — before a single rupee is lost.",
    whyTitle: "WHY NETRAKSH IS USEFUL",
    why: [
      "India faces record cyber-fraud — UPI scams, 'digital arrest' threats, fake KYC, loan and job frauds hit lakhs of families every year.",
      "Most scams succeed in the first 30 seconds, before victims can verify. Netraksh gives you that check instantly.",
      "It turns scattered fraud reports and official data into clear, local, real-time warnings you can act on.",
      "Everything is bilingual and beginner-friendly, so it works for first-time smartphone users and elders too.",
    ],
    featuresTitle: "WHAT YOU CAN DO",
    features: [
      {
        title: "Check before you trust",
        body: "Instantly verify a phone number, link, UPI ID, or QR code against known scam patterns.",
      },
      {
        title: "Live scam radar",
        body: "See the scams trending today in your city, powered by community reports and official data.",
      },
      {
        title: "One-tap helpline",
        body: "Reach the national cyber-crime helpline 1930 and report fraud in minutes.",
      },
      {
        title: "Guardian & Family Shield",
        body: "Real-time scam-call warnings and protection you can extend to your family.",
      },
      {
        title: "Learn the tricks",
        body: "Bilingual safety tips and the Golden Rules that stop the most common frauds.",
      },
    ],
    missionTitle: "OUR MISSION",
    mission:
      "To put cyber-safety in every Indian's pocket — simple, trustworthy, and two steps ahead of fraudsters.",
    helplineNote:
      "Already lost money? Call 1930 or report at cybercrime.gov.in right away. Speed matters.",
  },

  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: 2 June 2026",
    intro:
      "Netraksh (\"we\", \"us\") is committed to protecting your privacy. This policy explains what personal data we collect, why we collect it, and your rights under India's Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 and the rules made under it.",
    sections: [
      {
        heading: "1. Who we are",
        body: "Netraksh is a cyber-safety application built for users in India. For the purposes of the DPDP Act, 2023, Netraksh acts as the Data Fiduciary for the personal data you provide through the app.",
      },
      {
        heading: "2. Data we collect",
        body: "• Account data: your mobile number (used for OTP sign-in) and the name you provide.\n• Location data: the approximate city detected from your device, used to show local scam trends. You can deny location permission and still use the app.\n• Reports you submit: phone numbers, descriptions, and details of frauds you choose to report.\n• Usage and device data: basic technical information needed to keep the app secure and working.",
      },
      {
        heading: "3. How we use your data",
        body: "• To sign you in securely and run your account.\n• To show scam trends relevant to your city.\n• To process and act on the fraud reports you submit, and to improve community warnings.\n• To keep the service safe, prevent abuse, and comply with applicable law.",
      },
      {
        heading: "4. Consent and legal basis",
        body: "We process your personal data based on the consent you give when you use the app, and for the legitimate uses permitted under the DPDP Act, 2023. You may withdraw your consent at any time; doing so may limit features that rely on that data.",
      },
      {
        heading: "5. How we share data",
        body: "We do not sell your personal data. We may share data:\n• With law-enforcement agencies, CERT-In, or as otherwise required by Indian law.\n• With service providers (such as SMS and hosting partners) who process data on our behalf under appropriate safeguards.\nFraud reports may be aggregated and anonymised to produce public scam statistics. These aggregates do not identify you.",
      },
      {
        heading: "6. Data security",
        body: "We follow reasonable security practices and procedures as required under the IT Act and its rules to protect your data against unauthorised access, loss, or misuse. No system is perfectly secure, but we work to limit and contain any risk.",
      },
      {
        heading: "7. Data retention",
        body: "We keep personal data only as long as needed for the purposes described above or as required by law. When it is no longer needed, we delete or anonymise it.",
      },
      {
        heading: "8. Your rights",
        body: "Under the DPDP Act, 2023 you have the right to:\n• Access a summary of your personal data and how it is processed.\n• Correct, complete, or update your data.\n• Request erasure of your data.\n• Nominate another person to exercise your rights in case of death or incapacity.\n• Raise a grievance and seek redressal (see below).",
      },
      {
        heading: "9. Children's data",
        body: "Netraksh is intended for adults. We do not knowingly process the personal data of children under 18 without verifiable parental consent, in line with the DPDP Act.",
      },
      {
        heading: "10. Grievance redressal",
        body: "If you have any concern about your data, you may contact our Grievance Officer:\nGrievance Officer, Netraksh\nEmail: grievance@netraksh.app\nWe will acknowledge and respond within the timelines required by Indian law. You may also raise a complaint with the Data Protection Board of India.",
      },
      {
        heading: "11. Changes to this policy",
        body: "We may update this policy from time to time. Material changes will be notified within the app. Your continued use after an update means you accept the revised policy.",
      },
    ],
  },
  subscription: {
    title: "Premium",
    entryTitle: "Netraksh Premium",
    entrySub: "Unlock advanced protection for you and your family",
    choosePlan: "Choose your plan",
    mostPopular: "Most popular",
    free: "Free",
    perMonth: "/month",
    perYear: "/year",
    billingMonthly: "Monthly",
    billingAnnual: "Annual",
    monthlyEquivalent: "Just {{price}}/month, billed yearly",
    saveTwoMonths: "Save 2 months",
    freeTrial: "{{count}}-day free trial",
    freeTrialGeneric: "Free trial included",
    startFreeTrial: "Start 7-day free trial",
    startFreeTrialNote: "No card required. Cancel anytime.",
    trialStartedTitle: "Free trial started!",
    trialStartedMsg: "You have 7 days of Premium. Enjoy full protection.",
    trialFailedMsg: "Couldn't start your free trial. Please try again.",
    switchToAnnual: "Switch to annual",
    switchToMonthly: "Switch to monthly",
    annualComingSoon: "Annual coming soon",
    currentPlan: "Current plan",
    currentPlanSub: "Thank you for supporting Netraksh",
    freePlanSub: "Basic protection, always free",
    statusActive: "Active",
    statusEnding: "Ending soon",
    statusFree: "Free",
    renewsOn: "Renews on {{date}}",
    accessUntil: "Access until {{date}}",
    cancelRenewal: "Cancel renewal",
    upgradeTo: "Upgrade to {{plan}}",
    switchTo: "Switch to {{plan}}",
    history: "Payment history",
    loadError: "Couldn't load subscription details.",
    secureNote:
      "Payments are processed securely by Razorpay. Netraksh never stores your card details.",
    successTitle: "You're all set!",
    successMsg: "Your {{plan}} plan is now active.",
    failedTitle: "Payment failed",
    failedMsg:
      "Your payment could not be completed. If money was deducted, it will be refunded.",
    cancelFailedMsg: "Could not cancel your subscription. Please try again.",
    cancelConfirmTitle: "Cancel renewal?",
    cancelConfirmMsg:
      "Your plan stays active until the end of the current billing period, then switches to Free.",
    cancelConfirm: "Cancel renewal",
    checkoutUnavailableTitle: "Checkout unavailable",
    checkoutUnavailableMsg:
      "In-app purchases need the full Netraksh app. Please install or update it from the Play Store.",
    playSecureNote:
      "Subscriptions are billed securely through Google Play. Netraksh never sees your card details.",
    manageOnStore: "Manage subscription",
    restorePurchases: "Restore purchases",
    restoring: "Restoring…",
    restoredTitle: "Purchases restored",
    restoredMsg: "Your subscription has been restored on this device.",
    nothingToRestoreTitle: "Nothing to restore",
    nothingToRestoreMsg:
      "We couldn't find an active subscription for this account.",
    testPurchaseTitle: "Confirm test purchase",
    testPurchaseMsg:
      "You're in test mode — no real money will be charged. Simulate subscribing to the {{plan}} plan?",
    testPurchaseConfirm: "Confirm",
    linkAccountFailedMsg:
      "We couldn't link this purchase to your account. Please try again.",
    payStatus: {
      created: "Pending",
      paid: "Paid",
      failed: "Failed",
    },
    plans: {
      free: {
        name: "Free",
        tagline: "Essential protection to get started",
        features: [
          "Scam & fraud number lookup",
          "Daily scam alerts for your city",
          "Community fraud reports",
          "Cyber safety knowledge centre",
        ],
      },
      premium: {
        name: "Premium",
        tagline: "Full real-time protection for you",
        features: [
          "Everything in Free",
          "Real-time call & SMS scam screening",
          "AI fraud analysis for messages & links",
          "Priority scam alerts",
          "Unlimited number checks",
        ],
      },
      family: {
        name: "Family",
        tagline: "Protect your whole family",
        features: [
          "Everything in Premium",
          "Cover up to 5 family members",
          "Shared family safety dashboard",
          "Alerts for elderly & children",
        ],
      },
    },
  },
};

export default en;
export type Resources = typeof en;
