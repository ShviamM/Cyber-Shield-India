export default {
  seo: {
    title: "Cyber Laws & SOPs | Know Your Rights — Netraksh",
    description:
      "A citizen's guide to India's cyber laws (IT Act 2000, BNS 2023, DPDP Act 2023) and the official step-by-step SOPs to report cyber fraud via 1930 and cybercrime.gov.in.",
  },
  hero: {
    badge: "Know your rights · Act with confidence",
    titleStart: "Cyber Laws & ",
    titleHighlight: "SOPs",
    subtitle:
      "Exactly what to do if you've been scammed — and the laws of India that protect every digital citizen.",
  },
  emergency: {
    badge: "Been scammed?",
    title: "The Golden Hour matters.",
    desc: "Report within the first hour — banks can often freeze the money before it disappears.",
    call: "Call 1930",
    fileComplaint: "File Complaint",
  },
  sop: {
    heading: "If You've Been Scammed",
    subtitle:
      "Follow this official sequence — step by step, in order — to give yourself the best chance of recovery.",
    stepLabel: "Step {{number}}",
    steps: [
      {
        time: "Within minutes",
        title: "Call 1930 immediately",
        desc: "The National Cyber Crime Helpline (24×7, toll-free) can alert your bank to freeze the fraudulent transaction. Speed is everything — the first hour is your best chance to recover money.",
      },
      {
        time: "Same day",
        title: "File a complaint on cybercrime.gov.in",
        desc: "Go to the National Cyber Crime Reporting Portal, choose “Report Financial Fraud”, log in with your mobile OTP, and describe exactly what happened, when, and how much you lost.",
      },
      {
        time: "Before you forget",
        title: "Preserve all evidence",
        desc: "Save screenshots, transaction IDs, UPI handles, caller numbers, SMS, emails and chat history. Do not delete anything — more evidence means a faster investigation.",
      },
      {
        time: "Right away",
        title: "Alert your bank & block access",
        desc: "Inform your bank, block compromised cards and UPI IDs, and change passwords for accounts that may be exposed. Ask for a written acknowledgement of your report.",
      },
      {
        time: "Keep it safe",
        title: "Save your Complaint ID",
        desc: "After submitting, you receive a Complaint Reference Number. Note it down — you'll need it to track your case and during any follow-up with police or your bank.",
      },
      {
        time: "Follow up",
        title: "Track your case & file an FIR if needed",
        desc: "Track status at cybercrime.gov.in. If the case stalls, file an FIR — any cyber police station should register a Zero FIR regardless of where the fraud happened. Some states are also rolling out e-Zero FIRs to fast-track high-value cases.",
      },
    ],
  },
  scenarios: {
    heading: "Quick SOPs By Situation",
    subtitle: "Different scams need different first moves. Find yours and act.",
    items: [
      {
        title: "Money stolen (UPI / bank / card)",
        steps: [
          "Call 1930 in the golden hour",
          "Report Financial Fraud on cybercrime.gov.in",
          "Freeze cards & UPI with your bank",
          "Keep all transaction evidence",
        ],
      },
      {
        title: "Social media / account hacked",
        steps: [
          "Try account recovery & enable 2FA",
          "Warn contacts not to respond to it",
          "Report on cybercrime.gov.in",
          "Report the profile to the platform",
        ],
      },
      {
        title: "Sextortion / blackmail",
        steps: [
          "Do not pay — it never stops the threat",
          "Stop contact, but don't delete proof",
          "Report (anonymous option available)",
          "Call 1930 / file on the portal",
        ],
      },
      {
        title: "Suspicious call/SMS (no loss yet)",
        steps: [
          "Don't click links or share OTP",
          "Report on Sanchar Saathi (Chakshu)",
          "Block the number",
          "Verify it instantly on Netraksh",
        ],
      },
    ],
  },
  rights: {
    badge: "The law is on your side",
    heading: "Know Your Rights",
    subtitle:
      "The key laws that make cyber fraud a serious, punishable crime in India.",
    itAct: {
      title: "IT Act, 2000",
      subtitle: "India's primary law for cyber offences",
    },
    bns: {
      title: "Bharatiya Nyaya Sanhita (BNS), 2023",
      subtitle: "Replaced the IPC from 1 July 2024",
    },
    dpdp: {
      title: "Digital Personal Data Protection Act, 2023",
      subtitle: "Your rights over your personal data",
    },
  },
  itActLaws: [
    {
      code: "Section 66",
      title: "Hacking & computer-related offences",
      desc: "Unauthorised access, data theft, virus attacks or system damage done with dishonest or fraudulent intent.",
      penalty: "Up to 3 years imprisonment and/or fine up to ₹5 lakh",
    },
    {
      code: "Section 66C",
      title: "Identity theft",
      desc: "Dishonestly using someone else's password, electronic signature or other unique identification feature.",
      penalty: "Up to 3 years imprisonment and fine up to ₹1 lakh",
    },
    {
      code: "Section 66D",
      title: "Cheating by personation",
      desc: "Cheating someone by pretending to be another person using a phone, app or computer — covers fake bank calls and impersonation scams.",
      penalty: "Up to 3 years imprisonment and fine up to ₹1 lakh",
    },
    {
      code: "Section 66E",
      title: "Violation of privacy",
      desc: "Capturing, publishing or transmitting private images of a person without their consent.",
      penalty: "Up to 3 years imprisonment and/or fine up to ₹2 lakh",
    },
    {
      code: "Section 67 / 67A / 67B",
      title: "Obscene & exploitative content",
      desc: "Publishing or transmitting obscene material, sexually explicit content, or child sexual abuse material in electronic form.",
      penalty: "Up to 5–7 years and heavy fines, higher on repeat offence",
    },
  ],
  bnsLaws: [
    {
      code: "Section 318",
      title: "Cheating",
      desc: "Deceiving a person to dishonestly part with property or money. Replaces the old IPC Sections 415, 417, 418 and 420.",
      penalty: "Up to 3 years (general) and up to 7 years when property is delivered",
    },
    {
      code: "Section 319",
      title: "Cheating by personation",
      desc: "Cheating while pretending to be another person — the offline counterpart often charged alongside IT Act Section 66D.",
      penalty: "Up to 5 years imprisonment and fine",
    },
    {
      code: "Section 336",
      title: "Forgery",
      desc: "Making a false document or electronic record with intent to cause damage, defraud, or support a claim.",
      penalty: "Up to 2 years for forgery; up to 7 years for forging valuable documents or to cheat",
    },
  ],
  dpdpRights: [
    "Right to access information about your personal data",
    "Right to correction and erasure of your data",
    "Right to grievance redressal from the data handler",
    "Right to nominate someone to act on your behalf",
    "Your data may only be used with informed consent, for a clear purpose",
  ],
  penaltyLabel: "Penalty",
  guidelines: {
    heading: "Safety Guidelines",
    subtitle: "Simple habits that stop most scams before they start.",
    alwaysDo: "Always Do",
    neverDo: "Never Do",
    dos: [
      "Verify before you trust — call back on official numbers only",
      "Keep two-factor authentication on for every important account",
      "Report scams even when you lost nothing — it protects others",
      "Save evidence: screenshots, IDs, numbers and timestamps",
    ],
    donts: [
      "Never share OTP, CVV, PIN or passwords — no bank ever asks",
      "Don't click links in unexpected SMS, email or WhatsApp",
      "Don't install screen-sharing or “support” apps on a stranger's request",
      "Don't pay blackmailers — report instead",
    ],
  },
  resources: {
    heading: "Official Resources",
    subtitle:
      "Government helplines and portals — bookmark these now, before you need them.",
    items: [
      {
        name: "Helpline 1930",
        desc: "National Cyber Crime Helpline — 24×7, toll-free, for financial fraud.",
        action: "Call 1930",
      },
      {
        name: "cybercrime.gov.in",
        desc: "National Cyber Crime Reporting Portal (NCRP) to file & track complaints.",
        action: "Open Portal",
      },
      {
        name: "Sanchar Saathi · Chakshu",
        desc: "Report suspected fraud calls/SMS (no loss yet) and block a lost phone.",
        action: "Open Sanchar Saathi",
      },
      {
        name: "Cyber Police / Zero FIR",
        desc: "Any police station must register a Zero FIR, regardless of jurisdiction.",
        action: "Find your station",
      },
    ],
    disclaimer:
      "This page is for general awareness and is not legal advice. Laws, sections and procedures are summarised and may change — always rely on official sources like cybercrime.gov.in and consult a qualified lawyer for your specific situation.",
  },
  finalCta: {
    title: "Report it. Protect the next person.",
    subtitle:
      "Every scam you flag on Netraksh warns thousands of other Indians in real time.",
    getApp: "Get Netraksh",
    safetyCenter: "Cyber Safety Center",
  },
};
