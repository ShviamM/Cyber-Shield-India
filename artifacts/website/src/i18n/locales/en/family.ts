export default {
  seo: {
    title: "Family Guardian | Protect Your Loved Ones",
    description:
      "Netraksh Family Guardian lets you monitor and block cyber threats targeting your parents, seniors, and children — with real-time alerts the moment a scam is stopped.",
  },
  hero: {
    badge: "Family Guardian",
    titleStart: "Protect the people who ",
    titleAccent: "raised you",
    titleEnd: ".",
    subtitle:
      "Scammers prey on trust — and they target our parents and grandparents most of all. Netraksh stands guard on their phone and alerts you the moment a threat is stopped.",
    protectBtn: "Protect My Family",
    downloadBtn: "Download the App",
  },
  stats: {
    items: [
      { value: "₹11,000 Cr+", label: "lost to cyber fraud in India in a single year" },
      { value: "Every 10 min", label: "a senior citizen is targeted by an online scam" },
      { value: "1 app", label: "to protect up to 5 of your loved ones" },
    ],
  },
  clippingsSection: {
    badge: "Torn from the headlines",
    title: "Headlines that didn’t have to happen",
    subtitle:
      "These are the stories that fill our newspapers every week. Hover or tap each clipping to see how Netraksh stops the scam behind it.",
  },
  riskSection: {
    badge: "Who needs protecting?",
    title: "Every family member faces a different threat",
    subtitle:
      "Tap a person to see the scam they’re most likely to face — and exactly how Netraksh shields them.",
  },
  alertSection: {
    badge: "Real-time peace of mind",
    title: "You’ll know the moment a threat is stopped",
    subtitle:
      "When Netraksh blocks a scam on your loved one’s phone, you get notified instantly — no more finding out too late.",
  },
  cta: {
    title: "Give your family the digital bodyguard they deserve",
    subtitle:
      "One subscription protects up to 5 loved ones. Start a 7-day free trial — no card needed.",
    startBtn: "Start Free Trial",
    seeAllBtn: "See All Features",
  },
  clippings: {
    stamp: "Blocked by Netraksh",
    aria: "{{headline}}. Activate to see how Netraksh blocks this scam.",
    note:
      "Hover or tap a clipping. Headlines depict common scam patterns reported across India — the kind Netraksh is built to stop.",
    items: [
      {
        masthead: "The Metro Sentinel",
        dateline: "NEW DELHI · TUESDAY",
        kicker: "CYBER CRIME",
        headline: "‘Digital Arrest’ Fear Drains Retired Teacher of ₹12 Lakh",
        standfirst:
          "Fraudsters posing as police kept a 68-year-old on a video call for two days, warning him not to speak to family.",
      },
      {
        masthead: "City Herald",
        dateline: "PUNE · MORNING EDITION",
        kicker: "BANK FRAUD",
        headline: "KYC ‘Update’ Call Empties Grandmother’s Pension Account",
        standfirst:
          "A single SMS link and one OTP shared in panic wiped out a lifetime of savings in under ten minutes.",
      },
      {
        masthead: "Daily Chronicle",
        dateline: "MUMBAI · CITY DESK",
        kicker: "WHATSAPP SCAM",
        headline: "‘Mummy, I Lost My Phone’ — Hijack Targets Anxious Parents",
        standfirst:
          "Scammers impersonate children from new numbers, then demand urgent money transfers ‘before it’s too late’.",
      },
      {
        masthead: "The Evening Post",
        dateline: "JAIPUR · STATE NEWS",
        kicker: "PHISHING",
        headline: "Fake Electricity Bill SMS Cuts Through a Family’s Savings",
        standfirst:
          "‘Your connection will be disconnected tonight’ — a threat that pushed a household to install a remote-access app.",
      },
      {
        masthead: "Tribune Today",
        dateline: "LUCKNOW · REPORT",
        kicker: "SENIOR CITIZENS",
        headline: "‘Bank Officer’ on Video Call Cons Senior Out of Life Savings",
        standfirst:
          "Posing as a verification team, callers walked an 72-year-old through every step of his own robbery.",
      },
      {
        masthead: "The Morning Ledger",
        dateline: "HYDERABAD · METRO",
        kicker: "LOTTERY FRAUD",
        headline: "Lottery Win That Never Was: Pensioner Pays ₹3 Lakh in ‘Taxes’",
        standfirst:
          "Each ‘processing fee’ was followed by another, draining accounts in pursuit of a prize that did not exist.",
      },
    ],
  },
  risk: {
    mostCommon: "Most common threat · {{age}}",
    howProtects: "How Netraksh protects them",
    showThreats: "Show threats for {{label}}",
    members: [
      {
        id: "parents",
        label: "Parents",
        age: "45–60 yrs",
        topThreat: "Fake KYC & bank update calls",
        scenario:
          "A caller claims their account will be frozen tonight unless they ‘re-verify’ over the phone.",
        protections: [
          "Real-time scam-call warning before they pick up",
          "Suspicious link & APK blocking inside SMS and WhatsApp",
          "Instant alert sent to you when a threat is stopped",
        ],
      },
      {
        id: "seniors",
        label: "Grandparents",
        age: "60+ yrs",
        topThreat: "‘Digital arrest’ & impersonation",
        scenario:
          "Fraudsters posing as police or bank officers keep them on a video call, isolating them from family.",
        protections: [
          "Flags impersonation and pressure-tactic scripts",
          "One-tap ‘Ask Family’ button to break the isolation",
          "You can review what was blocked from your own phone",
        ],
      },
      {
        id: "children",
        label: "Children",
        age: "Students",
        topThreat: "Gaming, OTP & job-offer traps",
        scenario:
          "A ‘free reward’ or part-time job link asks them to share an OTP or download an app.",
        protections: [
          "Blocks malicious links shared in games and chats",
          "Warns before installing risky apps",
          "Safe-by-default settings tuned for young users",
        ],
      },
      {
        id: "you",
        label: "You",
        age: "Working adult",
        topThreat: "UPI, QR & payment fraud",
        scenario:
          "A ‘refund’ asks you to scan a QR code or approve a collect request that actually pays them.",
        protections: [
          "Checks UPI IDs and QR codes before you pay",
          "Detects fake refund and delivery scams",
          "Manage protection for your whole family in one place",
        ],
      },
    ],
  },
  story: {
    step1Title: "1. Parent Receives Threat",
    step1Desc:
      "A suspicious SMS claims their bank account is blocked, urging an immediate click.",
    step1Sms: '"Dear Customer, your A/c is blocked. Update Pan card link..."',
    step2Title: "2. Netraksh Intervenes",
    step2Desc:
      "AI instantly scans the sender and link, recognizing it as a known phishing vector. Access is blocked.",
    step3Title: "3. You Are Notified",
    step3Desc:
      "As the trusted family contact, you receive an instant alert that a threat was blocked on their device.",
    familyProtected: "Family Protected",
  },
};
