export type ArticleBlock =
  | { type: "text"; body: string }
  | { type: "heading"; body: string }
  | { type: "list"; items: string[] }
  | { type: "signs"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "callout"; tone: "danger" | "safe" | "info"; title: string; body: string };

export interface ScamArticle {
  slug: string;
  title: string;
  category: "Alert" | "Guide" | "Family" | "Recovery";
  excerpt: string;
  readTime: string;
  updated: string;
  icon:
    | "alert"
    | "upi"
    | "qr"
    | "whatsapp"
    | "loan"
    | "invest"
    | "job"
    | "otp"
    | "kyc";
  blocks: ArticleBlock[];
}

export const scamArticles: ScamArticle[] = [
  {
    slug: "digital-arrest-scam",
    title: "Digital Arrest Scam: How Fake Police Trap You on Video Calls",
    category: "Alert",
    excerpt:
      "Fraudsters posing as CBI, police or customs keep you on a video call for hours and threaten arrest until you transfer money. Here is how it works and how to stay safe.",
    readTime: "6 min read",
    updated: "May 2026",
    icon: "alert",
    blocks: [
      {
        type: "text",
        body: "The 'digital arrest' scam is one of the fastest growing frauds in India. Victims have lost their entire life savings, with national losses running into thousands of crores. The scam works by frightening you so badly that you stop thinking clearly and simply obey the caller.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "Remember this one fact",
        body: "There is no such thing as a 'digital arrest' in Indian law. No real police officer, CBI, customs or court will ever arrest you over a video call or ask you to transfer money to 'clear your name'.",
      },
      { type: "heading", body: "How the scam works" },
      {
        type: "steps",
        items: [
          "You get a call or recorded message claiming a parcel in your name contains drugs, or that your Aadhaar/SIM is linked to a crime.",
          "The call is transferred to a fake 'police officer' or 'CBI officer' in uniform on a video call, often with a fake police station in the background.",
          "They show you fake ID cards, arrest warrants and FIR documents with your name on them.",
          "They keep you on the call for hours, telling you not to disconnect or tell anyone, claiming you are under 'digital arrest'.",
          "Finally they ask you to transfer money for 'verification' or as a 'security deposit', promising a refund after your name is cleared.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "A caller claims to be from CBI, ED, customs, police, TRAI or courier company and mentions a crime in your name.",
          "You are told to stay on a video call and not disconnect or speak to family.",
          "Threats of immediate arrest unless you pay money 'right now'.",
          "Pressure, fear and urgency, never giving you time to think or verify.",
          "A request to move money to a 'safe account' for verification.",
        ],
      },
      { type: "heading", body: "How to protect yourself" },
      {
        type: "list",
        items: [
          "Cut the call immediately. A genuine investigation never happens over a video call.",
          "Never share OTPs, bank details or transfer money to 'prove your innocence'.",
          "Talk to a family member before taking any action. Scammers rely on isolating you.",
          "Government agencies send notices in writing, not through WhatsApp or video calls.",
          "Save suspicious numbers and verify the caller through official helplines, never numbers the caller gives you.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "If you are targeted",
        body: "Disconnect, take a screenshot if you can, and report on the National Cyber Crime helpline 1930 or at cybercrime.gov.in. The faster you report, the higher the chance of freezing the money.",
      },
    ],
  },
  {
    slug: "upi-fraud",
    title: "UPI Fraud: How to Spot Fake Payment Requests and 'Refund' Tricks",
    category: "Guide",
    excerpt:
      "UPI is fast and safe, but scammers trick people into approving 'collect requests' or sharing PINs. Learn the simple rule that stops most UPI fraud.",
    readTime: "5 min read",
    updated: "May 2026",
    icon: "upi",
    blocks: [
      {
        type: "text",
        body: "UPI made payments easy for everyone, from shopkeepers to senior citizens. Scammers take advantage of confusion about how UPI works. The good news is that one simple rule protects you from almost every UPI scam.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "The golden rule",
        body: "You never need to enter your UPI PIN to RECEIVE money. The PIN is only for SENDING money. If someone asks you to enter your PIN to 'get a refund' or 'receive a prize', it is a scam.",
      },
      { type: "heading", body: "Common UPI tricks" },
      {
        type: "list",
        items: [
          "Fake 'collect request': The scammer sends a payment request that looks like you are receiving money, but approving it actually sends money from your account.",
          "Refund scam: You are told to scan a QR or approve a request to get a refund. Refunds never need your PIN.",
          "Wrong transfer scam: A stranger calls saying they sent money to you by mistake and asks you to return it, after sending a fake confirmation message.",
          "Fake customer care: You search online for a helpline, reach a scammer, and they ask you to install a screen sharing app.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "Anyone asking you to enter your UPI PIN to receive money.",
          "A 'collect request' notification when you were expecting to be paid.",
          "Requests to install AnyDesk, TeamViewer or any screen sharing app.",
          "Customer care numbers found through random Google searches or social media.",
        ],
      },
      { type: "heading", body: "How to stay safe" },
      {
        type: "list",
        items: [
          "Read every UPI notification carefully. Check whether it says 'paying' or 'receiving'.",
          "Never install screen sharing apps on the instructions of a stranger.",
          "Only use customer care numbers from the official app or the back of your debit card.",
          "Set a daily UPI limit you are comfortable with.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "If money is debited wrongly",
        body: "Report immediately to your bank and call 1930. Note the transaction ID and UPI reference number, they help in tracing and freezing the fraud account.",
      },
    ],
  },
  {
    slug: "qr-code-fraud",
    title: "QR Code Fraud: Why Scanning a Code Can Empty Your Account",
    category: "Guide",
    excerpt:
      "A QR code is for paying, not receiving. Scammers send QR codes claiming you will 'receive' money. Here is how to avoid the trap.",
    readTime: "4 min read",
    updated: "May 2026",
    icon: "qr",
    blocks: [
      {
        type: "text",
        body: "QR codes are everywhere in India, from tea stalls to big shops. They are safe when used correctly, but scammers exploit a simple misunderstanding: many people think scanning a QR code lets them receive money. It does not.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "Key point",
        body: "Scanning a QR code is always to SEND money, never to receive it. If a buyer or stranger sends you a QR code 'to pay you', do not scan it.",
      },
      { type: "heading", body: "How QR scams happen" },
      {
        type: "steps",
        items: [
          "You list an item for sale on OLX, Facebook Marketplace or similar.",
          "A 'buyer' agrees quickly, often claiming to be an army officer being transferred.",
          "They send you a QR code and ask you to scan it 'to receive the advance payment'.",
          "When you scan and enter your PIN, money leaves your account instead of arriving.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "A buyer or stranger sends you a QR code and asks you to scan it to 'receive' money.",
          "Stories about being an army or CRPF officer in a hurry.",
          "Pressure to complete the deal quickly without meeting.",
          "Any QR scan that asks you to enter your UPI PIN to get money.",
        ],
      },
      { type: "heading", body: "How to stay safe" },
      {
        type: "list",
        items: [
          "Never scan a QR code to receive money. Ask the buyer to use your phone number or UPI ID instead.",
          "Be extra cautious with second hand selling platforms.",
          "Meet local buyers in person and accept cash or a direct transfer to your number.",
          "Check your own app: receiving money shows your balance going up, with no PIN needed.",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-scam",
    title: "WhatsApp Scams: Fake Family Emergencies, Job Offers and OTP Theft",
    category: "Alert",
    excerpt:
      "From 'Hi Mum' messages to part time job offers, WhatsApp is a favourite tool for scammers. Learn the patterns and protect your account.",
    readTime: "6 min read",
    updated: "May 2026",
    icon: "whatsapp",
    blocks: [
      {
        type: "text",
        body: "WhatsApp is the most used messaging app in India, which makes it a top target for fraudsters. Scams range from someone pretending to be your relative in trouble, to fake jobs, to taking over your account entirely.",
      },
      { type: "heading", body: "Common WhatsApp scams" },
      {
        type: "list",
        items: [
          "Family emergency: A message from an unknown number claims to be your son, daughter or relative who 'lost their phone' and urgently needs money.",
          "Part time job offer: You are offered easy money for liking videos or rating hotels, then asked to deposit money for 'bigger tasks'.",
          "International number calls: Missed calls and messages from +92, +84, +62 and similar codes leading to scams.",
          "Account takeover: A scammer asks you to share a 6 digit code 'sent by mistake', which is actually your WhatsApp verification code.",
          "Investment groups: You are added to groups promising guaranteed stock market returns.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "A new number claiming to be a family member who changed their phone, asking for money.",
          "Job offers that ask you to pay a deposit or 'registration fee' first.",
          "Anyone asking you to forward or share a verification code.",
          "Messages and calls from unknown international numbers.",
          "Promises of guaranteed daily profits.",
        ],
      },
      { type: "heading", body: "How to protect yourself" },
      {
        type: "list",
        items: [
          "Always call the person on their known number before sending money for any 'emergency'.",
          "Turn on two step verification in WhatsApp settings to stop account takeovers.",
          "Never share any OTP or verification code with anyone, for any reason.",
          "Block and report suspicious numbers directly inside WhatsApp.",
          "Remember: real jobs do not ask you to pay money to start working.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "Lock your account",
        body: "Go to Settings > Account > Two step verification and set a PIN. This is the single best protection against your WhatsApp being stolen.",
      },
    ],
  },
  {
    slug: "fake-loan-apps",
    title: "Fake Loan Apps: Instant Loans That Lead to Harassment",
    category: "Alert",
    excerpt:
      "Illegal instant loan apps offer quick cash, then steal your contacts and photos and harass you to repay huge amounts. Learn how to spot and avoid them.",
    readTime: "6 min read",
    updated: "May 2026",
    icon: "loan",
    blocks: [
      {
        type: "text",
        body: "Fake or illegal loan apps promise instant money with no paperwork. Once installed, they harvest your contacts, photos and personal data, then use blackmail and abuse to extract far more than you borrowed. Many tragedies have been linked to these apps.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "Why they are dangerous",
        body: "These apps demand access to your contacts and gallery. If you delay repayment, they threaten to message your family and friends, and may morph your photos to shame you.",
      },
      { type: "heading", body: "How to identify a fake loan app" },
      {
        type: "signs",
        items: [
          "It approves a loan in minutes with no proper verification.",
          "It demands access to your contacts, photos, messages and call logs.",
          "The lender is not a RBI registered bank or NBFC.",
          "Very high processing fees are cut before the money reaches you.",
          "No clear company address, support email or physical office.",
        ],
      },
      { type: "heading", body: "How to stay safe" },
      {
        type: "list",
        items: [
          "Only borrow from RBI registered banks and NBFCs. Check the lender's name on the RBI website.",
          "Read app permissions. A loan app does not need your photos or full contact list.",
          "Download apps only from official stores and check reviews carefully.",
          "Never pay any 'advance fee' to receive a loan.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "If you are being harassed",
        body: "Do not panic and do not keep paying. Save the evidence and report on 1930 and cybercrime.gov.in. Harassment and blackmail are crimes, even if you took the loan.",
      },
    ],
  },
  {
    slug: "investment-scam",
    title: "Investment and Trading Scams: The 'Guaranteed Returns' Trap",
    category: "Alert",
    excerpt:
      "Fake stock tips, crypto schemes and WhatsApp 'expert groups' promise huge guaranteed profits. Here is how the trap is built and how to avoid losing your savings.",
    readTime: "6 min read",
    updated: "May 2026",
    icon: "invest",
    blocks: [
      {
        type: "text",
        body: "Investment scams are designed to look professional. Victims are shown fake profits on a slick dashboard and encouraged to invest more and more, until they try to withdraw and discover the money is gone.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "The biggest red flag",
        body: "No genuine investment offers 'guaranteed' or 'fixed daily' returns. All real market investments carry risk. A promise of guaranteed high profit is always a scam.",
      },
      { type: "heading", body: "How the scam unfolds" },
      {
        type: "steps",
        items: [
          "You are added to a WhatsApp or Telegram group run by a fake 'expert' or 'professor'.",
          "Members (actually scammers) post screenshots of huge profits to build trust.",
          "You are asked to install an app or website to invest, starting with a small amount.",
          "The dashboard shows your money growing quickly, so you invest larger sums.",
          "When you try to withdraw, you are asked to pay 'tax' or 'fees', and then contact is cut off.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "Guaranteed or fixed high returns with 'no risk'.",
          "Pressure to invest quickly before an 'offer closes'.",
          "Unknown apps or links instead of SEBI registered platforms.",
          "Being asked to pay fees or taxes to withdraw your own money.",
          "Celebrity photos or fake news articles used to promote the scheme.",
        ],
      },
      { type: "heading", body: "How to protect yourself" },
      {
        type: "list",
        items: [
          "Invest only through SEBI registered brokers and well known platforms.",
          "Verify any advisor's SEBI registration number on the SEBI website.",
          "Be suspicious of any group that adds you without permission.",
          "Never pay extra fees to 'unlock' or 'withdraw' your profits.",
        ],
      },
    ],
  },
  {
    slug: "job-scam",
    title: "Job and Task Scams: Fake Offers That Cost You Money",
    category: "Guide",
    excerpt:
      "Work from home, data entry and 'like and earn' offers are used to trap job seekers. Real jobs never ask you to pay first.",
    readTime: "5 min read",
    updated: "May 2026",
    icon: "job",
    blocks: [
      {
        type: "text",
        body: "Job scams target students, homemakers and anyone looking for extra income. They start with a small payout to win your trust, then trick you into depositing your own money for 'bigger earnings' that never come.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "The simple test",
        body: "A real employer pays you. If a 'job' asks you to pay a registration fee, security deposit, or to invest money to earn more, it is a scam.",
      },
      { type: "heading", body: "Common job scams" },
      {
        type: "list",
        items: [
          "Task scams: You earn small amounts for liking videos or rating products, then are asked to deposit money for 'premium tasks'.",
          "Registration fee scams: You are offered a job but must pay for 'training', 'ID card' or 'materials' first.",
          "Fake recruiter scams: Someone claims to be from a famous company and asks for documents and a fee.",
          "Data entry scams: You are charged a fee, then accused of 'errors' to avoid paying you.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "Any request to pay money before you start earning.",
          "Job offers from random WhatsApp or Telegram messages.",
          "Salaries that sound too high for very little work.",
          "Recruiters using personal Gmail addresses instead of company emails.",
          "Pressure to deposit money quickly to 'unlock' your earnings.",
        ],
      },
      { type: "heading", body: "How to stay safe" },
      {
        type: "list",
        items: [
          "Never pay to get a job. Genuine companies do not charge candidates.",
          "Verify the company through its official website and contact details.",
          "Be cautious of offers received on messaging apps you did not apply through.",
          "If unsure, ask for the offer in writing on official company letterhead.",
        ],
      },
    ],
  },
  {
    slug: "otp-fraud",
    title: "OTP Fraud: Why You Must Never Share That 6 Digit Code",
    category: "Guide",
    excerpt:
      "An OTP is the key to your account. Scammers use clever stories to make you read it out. Learn the tricks so you never fall for them.",
    readTime: "4 min read",
    updated: "May 2026",
    icon: "otp",
    blocks: [
      {
        type: "text",
        body: "OTP (One Time Password) fraud is one of the most common ways money is stolen in India. The scam is simple: the fraudster has your card or account number, but needs the OTP to complete a transaction, so they trick you into sharing it.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "Never break this rule",
        body: "No bank, no company, no government office will ever ask for your OTP. Anyone asking for an OTP is a scammer, without exception.",
      },
      { type: "heading", body: "Common OTP tricks" },
      {
        type: "list",
        items: [
          "Fake bank call: 'Your card will be blocked, share the OTP to keep it active.'",
          "KYC update: 'Your account needs KYC, share the code we just sent.'",
          "Reward or refund: 'You have won a prize, confirm with the OTP.'",
          "Delivery scam: 'To confirm your parcel, read out the code.'",
          "Marketplace scam: 'I am buying your item, share the OTP to confirm.'",
        ],
      },
      { type: "heading", body: "How to stay safe" },
      {
        type: "list",
        items: [
          "Treat your OTP like your house key. Never read it out to anyone on a call.",
          "Read the full OTP message. It usually says 'do not share this code with anyone'.",
          "Hang up on any caller asking for an OTP, even if they know your details.",
          "Enable transaction alerts so you notice any unauthorised activity immediately.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "If you shared an OTP by mistake",
        body: "Call your bank at once to block the card or account, then report on 1930. Acting within the first few minutes gives the best chance of stopping the loss.",
      },
    ],
  },
  {
    slug: "kyc-fraud",
    title: "KYC Update Scam: Fake 'Account Will Be Blocked' Messages",
    category: "Family",
    excerpt:
      "Messages warning that your bank, wallet or SIM KYC has 'expired' are a common trap. Learn how real KYC works so you are never fooled.",
    readTime: "5 min read",
    updated: "May 2026",
    icon: "kyc",
    blocks: [
      {
        type: "text",
        body: "KYC (Know Your Customer) scams use fear of losing access to your account. You get an SMS or call saying your KYC has expired and your account, wallet or SIM will be blocked today unless you act immediately.",
      },
      {
        type: "callout",
        tone: "danger",
        title: "Stay calm",
        body: "Banks give plenty of notice for genuine KYC and never ask you to complete it through a link in an SMS, a phone call, or by installing an app a stranger sends you.",
      },
      { type: "heading", body: "How the scam works" },
      {
        type: "steps",
        items: [
          "You receive an urgent SMS or call: 'Your KYC has expired, account will be blocked today.'",
          "A link is provided, or you are asked to install a 'verification' app.",
          "The link opens a fake page that steals your login, card or Aadhaar details.",
          "Or the app gives the scammer remote access and OTPs, letting them drain your account.",
        ],
      },
      { type: "heading", body: "Warning signs" },
      {
        type: "signs",
        items: [
          "Urgent threats that your account or SIM will be blocked 'today' or 'within hours'.",
          "Links in SMS asking you to update KYC.",
          "Requests to install apps like AnyDesk, QuickSupport or TeamViewer.",
          "Calls asking for OTP, card number, PIN or Aadhaar to 'complete KYC'.",
        ],
      },
      { type: "heading", body: "How to protect your family" },
      {
        type: "list",
        items: [
          "Never click KYC links in SMS or WhatsApp. Visit the branch or official app instead.",
          "Tell elderly family members that KYC is never done over a phone call.",
          "Never install remote access apps on anyone's instruction.",
          "When in doubt, call the bank using the number on your passbook or card.",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "Help the vulnerable",
        body: "Senior citizens are the biggest targets of KYC scams. Take a few minutes to explain this to your parents and grandparents, it can save their savings.",
      },
    ],
  },
];

export function getArticle(slug: string): ScamArticle | undefined {
  return scamArticles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, count = 3): ScamArticle[] {
  const current = getArticle(slug);
  if (!current) return scamArticles.slice(0, count);
  const sameCategory = scamArticles.filter(
    (a) => a.slug !== slug && a.category === current.category,
  );
  const others = scamArticles.filter(
    (a) => a.slug !== slug && a.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
