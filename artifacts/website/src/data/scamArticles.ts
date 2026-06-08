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

export const scamArticlesHi: ScamArticle[] = [
  {
    slug: "digital-arrest-scam",
    title: "डिजिटल अरेस्ट स्कैम: नकली पुलिस वीडियो कॉल पर आपको कैसे फँसाती है",
    category: "Alert",
    excerpt:
      "CBI, पुलिस या कस्टम अधिकारी बनकर ठग आपको घंटों वीडियो कॉल पर रोके रखते हैं और पैसे ट्रांसफर करने तक गिरफ्तारी की धमकी देते हैं। जानिए यह कैसे होता है और कैसे सुरक्षित रहें।",
    readTime: "6 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "alert",
    blocks: [
      {
        type: "text",
        body: "'डिजिटल अरेस्ट' स्कैम भारत में सबसे तेज़ी से बढ़ते फ्रॉड में से एक है। पीड़ितों ने अपनी ज़िंदगी भर की जमा-पूँजी गँवा दी है, और देशभर में नुकसान हज़ारों करोड़ रुपये तक पहुँच गया है। यह स्कैम आपको इतना डरा देता है कि आप साफ़ सोचना बंद कर देते हैं और बस कॉल करने वाले की हर बात मान लेते हैं।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "यह एक बात हमेशा याद रखें",
        body: "भारतीय कानून में 'डिजिटल अरेस्ट' जैसी कोई चीज़ है ही नहीं। कोई भी असली पुलिस अधिकारी, CBI, कस्टम या अदालत कभी वीडियो कॉल पर आपको गिरफ्तार नहीं करती और न ही 'अपना नाम साफ़ करवाने' के लिए पैसे ट्रांसफर करने को कहती है।",
      },
      { type: "heading", body: "यह स्कैम कैसे काम करता है" },
      {
        type: "steps",
        items: [
          "आपको कॉल या रिकॉर्डेड संदेश आता है कि आपके नाम से आए पार्सल में ड्रग्स हैं, या आपका आधार/सिम किसी अपराध से जुड़ा है।",
          "कॉल को वीडियो पर वर्दी पहने नकली 'पुलिस अधिकारी' या 'CBI अधिकारी' को ट्रांसफर कर दिया जाता है, अक्सर पीछे नकली थाने का सेट होता है।",
          "वे आपको नकली पहचान पत्र, गिरफ्तारी वारंट और आपके नाम के FIR दस्तावेज़ दिखाते हैं।",
          "वे आपको घंटों कॉल पर रोके रखते हैं और कहते हैं कि कॉल मत काटिए और किसी को मत बताइए, क्योंकि आप 'डिजिटल अरेस्ट' में हैं।",
          "अंत में वे 'वेरिफिकेशन' या 'सिक्योरिटी डिपॉज़िट' के नाम पर पैसे ट्रांसफर करने को कहते हैं और नाम साफ़ होने पर रिफंड का वादा करते हैं।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "कॉल करने वाला खुद को CBI, ED, कस्टम, पुलिस, TRAI या कूरियर कंपनी से बताता है और आपके नाम से जुड़े किसी अपराध का ज़िक्र करता है।",
          "आपसे कहा जाता है कि वीडियो कॉल पर बने रहें, कॉल न काटें और परिवार से बात न करें।",
          "'अभी' पैसे न देने पर तुरंत गिरफ्तारी की धमकी।",
          "दबाव, डर और जल्दबाज़ी, ताकि आपको सोचने या जाँचने का मौका न मिले।",
          "वेरिफिकेशन के लिए पैसे किसी 'सुरक्षित खाते' में भेजने को कहना।",
        ],
      },
      { type: "heading", body: "खुद को कैसे बचाएँ" },
      {
        type: "list",
        items: [
          "तुरंत कॉल काट दें। असली जाँच कभी वीडियो कॉल पर नहीं होती।",
          "'अपनी बेगुनाही साबित करने' के लिए कभी OTP, बैंक डिटेल साझा न करें या पैसे ट्रांसफर न करें।",
          "कोई भी कदम उठाने से पहले परिवार के किसी सदस्य से बात करें। ठग आपको अकेला करने पर ही टिके रहते हैं।",
          "सरकारी एजेंसियाँ नोटिस लिखित में भेजती हैं, WhatsApp या वीडियो कॉल पर नहीं।",
          "संदिग्ध नंबर सेव करें और कॉल करने वाले के दिए नंबर पर नहीं, बल्कि आधिकारिक हेल्पलाइन से जाँच करें।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "अगर आपको निशाना बनाया जाए",
        body: "कॉल काट दें, हो सके तो स्क्रीनशॉट लें, और नेशनल साइबर क्राइम हेल्पलाइन 1930 पर या cybercrime.gov.in पर शिकायत करें। जितनी जल्दी शिकायत करेंगे, पैसे फ्रीज़ होने की संभावना उतनी ज़्यादा होगी।",
      },
    ],
  },
  {
    slug: "upi-fraud",
    title: "UPI फ्रॉड: नकली पेमेंट रिक्वेस्ट और 'रिफंड' की चालें कैसे पहचानें",
    category: "Guide",
    excerpt:
      "UPI तेज़ और सुरक्षित है, लेकिन ठग लोगों को 'कलेक्ट रिक्वेस्ट' मंज़ूर करने या PIN साझा करने के लिए बहका लेते हैं। वह आसान नियम सीखिए जो ज़्यादातर UPI फ्रॉड रोक देता है।",
    readTime: "5 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "upi",
    blocks: [
      {
        type: "text",
        body: "UPI ने दुकानदार से लेकर बुज़ुर्गों तक, सबके लिए पेमेंट आसान बना दिया। ठग इसी बात का फ़ायदा उठाते हैं कि लोग UPI के काम करने के तरीके को लेकर उलझन में रहते हैं। अच्छी बात यह है कि एक आसान नियम आपको लगभग हर UPI स्कैम से बचा लेता है।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "सुनहरा नियम",
        body: "पैसे पाने (RECEIVE) के लिए आपको कभी अपना UPI PIN डालने की ज़रूरत नहीं होती। PIN सिर्फ़ पैसे भेजने (SEND) के लिए होता है। अगर कोई 'रिफंड पाने' या 'इनाम पाने' के लिए PIN डालने को कहे, तो यह स्कैम है।",
      },
      { type: "heading", body: "आम UPI चालें" },
      {
        type: "list",
        items: [
          "नकली 'कलेक्ट रिक्वेस्ट': ठग एक पेमेंट रिक्वेस्ट भेजता है जो ऐसी दिखती है मानो आपको पैसे मिल रहे हों, लेकिन उसे मंज़ूर करते ही आपके खाते से पैसे चले जाते हैं।",
          "रिफंड स्कैम: आपसे कहा जाता है कि रिफंड पाने के लिए QR स्कैन करें या रिक्वेस्ट मंज़ूर करें। रिफंड में कभी आपके PIN की ज़रूरत नहीं होती।",
          "गलत ट्रांसफर स्कैम: कोई अजनबी फ़ोन कर कहता है कि उसने गलती से आपको पैसे भेज दिए, और नकली कन्फर्मेशन मैसेज भेजकर वापस माँगता है।",
          "नकली कस्टमर केयर: आप ऑनलाइन हेल्पलाइन खोजते हैं, ठग तक पहुँच जाते हैं, और वह आपसे स्क्रीन शेयरिंग ऐप इंस्टॉल करवाता है।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "कोई भी जो पैसे पाने के लिए आपसे UPI PIN डालने को कहे।",
          "जब आप पैसे मिलने की उम्मीद कर रहे हों, तब 'कलेक्ट रिक्वेस्ट' का नोटिफिकेशन आना।",
          "AnyDesk, TeamViewer या किसी स्क्रीन शेयरिंग ऐप को इंस्टॉल करने की माँग।",
          "रैंडम गूगल सर्च या सोशल मीडिया से मिले कस्टमर केयर नंबर।",
        ],
      },
      { type: "heading", body: "सुरक्षित कैसे रहें" },
      {
        type: "list",
        items: [
          "हर UPI नोटिफिकेशन ध्यान से पढ़ें। देखें कि उसमें 'paying' लिखा है या 'receiving'।",
          "किसी अजनबी के कहने पर कभी स्क्रीन शेयरिंग ऐप इंस्टॉल न करें।",
          "कस्टमर केयर नंबर सिर्फ़ आधिकारिक ऐप या अपने डेबिट कार्ड के पीछे से ही लें।",
          "अपनी सुविधा के हिसाब से एक दैनिक UPI लिमिट सेट करें।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "अगर गलती से पैसे कट जाएँ",
        body: "तुरंत अपने बैंक को बताएँ और 1930 पर कॉल करें। ट्रांज़ैक्शन ID और UPI रेफरेंस नंबर नोट कर लें, ये फ्रॉड खाते को ट्रेस करने और फ्रीज़ करने में मदद करते हैं।",
      },
    ],
  },
  {
    slug: "qr-code-fraud",
    title: "QR कोड फ्रॉड: एक कोड स्कैन करना आपका खाता कैसे खाली कर सकता है",
    category: "Guide",
    excerpt:
      "QR कोड पैसे भेजने के लिए होता है, पाने के लिए नहीं। ठग QR कोड भेजकर कहते हैं कि आपको पैसे 'मिलेंगे'। जानिए इस जाल से कैसे बचें।",
    readTime: "4 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "qr",
    blocks: [
      {
        type: "text",
        body: "चाय की दुकान से लेकर बड़े शोरूम तक, भारत में QR कोड हर जगह हैं। सही तरीके से इस्तेमाल हों तो ये सुरक्षित हैं, लेकिन ठग एक आसान-सी गलतफ़हमी का फ़ायदा उठाते हैं: बहुत-से लोग समझते हैं कि QR कोड स्कैन करने से उन्हें पैसे मिलेंगे। ऐसा नहीं होता।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "मुख्य बात",
        body: "QR कोड स्कैन करना हमेशा पैसे भेजने के लिए होता है, पाने के लिए कभी नहीं। अगर कोई खरीदार या अजनबी आपको 'पैसे देने के लिए' QR कोड भेजे, तो उसे स्कैन न करें।",
      },
      { type: "heading", body: "QR स्कैम कैसे होते हैं" },
      {
        type: "steps",
        items: [
          "आप OLX, फेसबुक मार्केटप्लेस या इसी तरह कहीं कोई सामान बिक्री के लिए डालते हैं।",
          "एक 'खरीदार' झट से तैयार हो जाता है, अक्सर खुद को ट्रांसफर हो रहा फ़ौजी अधिकारी बताता है।",
          "वह आपको QR कोड भेजकर कहता है कि 'एडवांस पेमेंट पाने के लिए' इसे स्कैन करें।",
          "जब आप स्कैन कर PIN डालते हैं, तो पैसे आने के बजाय आपके खाते से चले जाते हैं।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "कोई खरीदार या अजनबी आपको QR कोड भेजकर 'पैसे पाने' के लिए स्कैन करने को कहे।",
          "जल्दी में होने वाले फ़ौजी या CRPF अधिकारी होने की कहानियाँ।",
          "बिना मिले जल्दी से सौदा पूरा करने का दबाव।",
          "कोई भी QR स्कैन जो पैसे पाने के लिए आपका UPI PIN माँगे।",
        ],
      },
      { type: "heading", body: "सुरक्षित कैसे रहें" },
      {
        type: "list",
        items: [
          "पैसे पाने के लिए कभी QR कोड स्कैन न करें। खरीदार से कहें कि वह आपके फ़ोन नंबर या UPI ID का इस्तेमाल करे।",
          "सेकंड-हैंड बिक्री वाले प्लेटफ़ॉर्म पर और भी सावधान रहें।",
          "स्थानीय खरीदारों से रूबरू मिलें और नकद या सीधे अपने नंबर पर ट्रांसफर लें।",
          "अपना ऐप देखें: पैसे मिलने पर आपका बैलेंस बढ़ता है, इसके लिए किसी PIN की ज़रूरत नहीं होती।",
        ],
      },
    ],
  },
  {
    slug: "whatsapp-scam",
    title: "WhatsApp स्कैम: नकली पारिवारिक इमरजेंसी, जॉब ऑफ़र और OTP चोरी",
    category: "Alert",
    excerpt:
      "'Hi Mum' मैसेज से लेकर पार्ट-टाइम जॉब ऑफ़र तक, WhatsApp ठगों का पसंदीदा हथियार है। पैटर्न पहचानिए और अपना अकाउंट सुरक्षित रखिए।",
    readTime: "6 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "whatsapp",
    blocks: [
      {
        type: "text",
        body: "WhatsApp भारत में सबसे ज़्यादा इस्तेमाल होने वाला मैसेजिंग ऐप है, इसी वजह से यह ठगों का बड़ा निशाना है। स्कैम कई तरह के होते हैं, मुसीबत में फँसे रिश्तेदार बनकर ठगी से लेकर नकली नौकरियाँ और पूरा अकाउंट हड़प लेने तक।",
      },
      { type: "heading", body: "आम WhatsApp स्कैम" },
      {
        type: "list",
        items: [
          "पारिवारिक इमरजेंसी: किसी अनजान नंबर से मैसेज आता है कि वह आपका बेटा, बेटी या रिश्तेदार है जिसका 'फ़ोन खो गया' और उसे तुरंत पैसों की ज़रूरत है।",
          "पार्ट-टाइम जॉब ऑफ़र: वीडियो लाइक करने या होटल रेटिंग देने पर आसान कमाई का लालच, फिर 'बड़े टास्क' के लिए पैसे जमा करने को कहना।",
          "इंटरनेशनल नंबर से कॉल: +92, +84, +62 जैसे कोड वाले मिस्ड कॉल और मैसेज, जो स्कैम की ओर ले जाते हैं।",
          "अकाउंट हड़पना: ठग आपसे 'गलती से भेजा गया' 6 अंकों का कोड माँगता है, जो असल में आपका WhatsApp वेरिफिकेशन कोड होता है।",
          "इन्वेस्टमेंट ग्रुप: शेयर बाज़ार में गारंटीड रिटर्न का वादा करने वाले ग्रुप में आपको जोड़ दिया जाता है।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "कोई नया नंबर जो फ़ोन बदलने वाला परिवार का सदस्य बनकर पैसे माँगे।",
          "ऐसे जॉब ऑफ़र जिनमें पहले डिपॉज़िट या 'रजिस्ट्रेशन फ़ीस' माँगी जाए।",
          "कोई भी जो आपसे वेरिफिकेशन कोड फॉरवर्ड करने या साझा करने को कहे।",
          "अनजान इंटरनेशनल नंबरों से मैसेज और कॉल।",
          "रोज़ाना गारंटीड मुनाफ़े के वादे।",
        ],
      },
      { type: "heading", body: "खुद को कैसे बचाएँ" },
      {
        type: "list",
        items: [
          "किसी भी 'इमरजेंसी' में पैसे भेजने से पहले उस व्यक्ति को उसके जाने-पहचाने नंबर पर ज़रूर कॉल करें।",
          "अकाउंट हड़पने से बचने के लिए WhatsApp सेटिंग्स में टू-स्टेप वेरिफिकेशन चालू करें।",
          "किसी भी कारण से, किसी के साथ भी कोई OTP या वेरिफिकेशन कोड साझा न करें।",
          "संदिग्ध नंबरों को सीधे WhatsApp के अंदर ब्लॉक और रिपोर्ट करें।",
          "याद रखें: असली नौकरियाँ काम शुरू करने के लिए आपसे पैसे नहीं माँगतीं।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "अपना अकाउंट लॉक करें",
        body: "Settings > Account > Two step verification में जाएँ और एक PIN सेट करें। आपके WhatsApp को चोरी होने से बचाने का यह सबसे बढ़िया तरीका है।",
      },
    ],
  },
  {
    slug: "fake-loan-apps",
    title: "नकली लोन ऐप: इंस्टेंट लोन जो उत्पीड़न तक पहुँचाते हैं",
    category: "Alert",
    excerpt:
      "गैरकानूनी इंस्टेंट लोन ऐप झटपट पैसे देते हैं, फिर आपके कॉन्टैक्ट और फ़ोटो चुराकर भारी रकम वसूलने के लिए परेशान करते हैं। जानिए इन्हें कैसे पहचानें और बचें।",
    readTime: "6 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "loan",
    blocks: [
      {
        type: "text",
        body: "नकली या गैरकानूनी लोन ऐप बिना कागज़ी कार्रवाई के झटपट पैसे का वादा करते हैं। इंस्टॉल होते ही ये आपके कॉन्टैक्ट, फ़ोटो और निजी डेटा हड़प लेते हैं, फिर ब्लैकमेल और गाली-गलौज से उधार से कहीं ज़्यादा रकम वसूलते हैं। कई दुखद घटनाएँ इन ऐप से जुड़ी रही हैं।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "ये खतरनाक क्यों हैं",
        body: "ये ऐप आपके कॉन्टैक्ट और गैलरी तक पहुँच माँगते हैं। अगर आप चुकाने में देर करते हैं, तो ये आपके परिवार और दोस्तों को मैसेज करने की धमकी देते हैं और आपको बदनाम करने के लिए आपकी फ़ोटो तक एडिट कर सकते हैं।",
      },
      { type: "heading", body: "नकली लोन ऐप कैसे पहचानें" },
      {
        type: "signs",
        items: [
          "बिना ठीक से जाँच किए मिनटों में लोन मंज़ूर कर देना।",
          "आपके कॉन्टैक्ट, फ़ोटो, मैसेज और कॉल लॉग तक पहुँच माँगना।",
          "लोन देने वाला RBI में रजिस्टर्ड बैंक या NBFC न हो।",
          "पैसे आपके पास पहुँचने से पहले ही बहुत ज़्यादा प्रोसेसिंग फ़ीस काट लेना।",
          "कंपनी का कोई साफ़ पता, सपोर्ट ईमेल या दफ़्तर न होना।",
        ],
      },
      { type: "heading", body: "सुरक्षित कैसे रहें" },
      {
        type: "list",
        items: [
          "सिर्फ़ RBI में रजिस्टर्ड बैंक और NBFC से ही उधार लें। RBI की वेबसाइट पर लोन देने वाले का नाम जाँचें।",
          "ऐप की परमिशन पढ़ें। किसी लोन ऐप को आपकी फ़ोटो या पूरी कॉन्टैक्ट लिस्ट की ज़रूरत नहीं होती।",
          "ऐप सिर्फ़ आधिकारिक स्टोर से डाउनलोड करें और रिव्यू ध्यान से पढ़ें।",
          "लोन पाने के लिए कभी कोई 'एडवांस फ़ीस' न दें।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "अगर आपको परेशान किया जा रहा हो",
        body: "घबराएँ नहीं और पैसे देना बंद कर दें। सबूत सुरक्षित रखें और 1930 तथा cybercrime.gov.in पर शिकायत करें। उत्पीड़न और ब्लैकमेल अपराध हैं, चाहे आपने लोन लिया ही क्यों न हो।",
      },
    ],
  },
  {
    slug: "investment-scam",
    title: "इन्वेस्टमेंट और ट्रेडिंग स्कैम: 'गारंटीड रिटर्न' का जाल",
    category: "Alert",
    excerpt:
      "नकली स्टॉक टिप्स, क्रिप्टो स्कीमें और WhatsApp 'एक्सपर्ट ग्रुप' भारी गारंटीड मुनाफ़े का वादा करते हैं। जानिए यह जाल कैसे बुना जाता है और अपनी जमा-पूँजी गँवाने से कैसे बचें।",
    readTime: "6 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "invest",
    blocks: [
      {
        type: "text",
        body: "इन्वेस्टमेंट स्कैम को बेहद पेशेवर दिखने के लिए बनाया जाता है। पीड़ितों को एक चमकदार डैशबोर्ड पर नकली मुनाफ़ा दिखाया जाता है और और-और निवेश करने के लिए उकसाया जाता है, जब तक वे पैसे निकालने की कोशिश नहीं करते और पता चलता है कि पैसे गायब हैं।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "सबसे बड़ा खतरे का संकेत",
        body: "कोई भी असली निवेश 'गारंटीड' या 'फिक्स्ड डेली' रिटर्न नहीं देता। बाज़ार के सभी असली निवेशों में जोखिम होता है। गारंटीड ऊँचे मुनाफ़े का वादा हमेशा स्कैम होता है।",
      },
      { type: "heading", body: "स्कैम कैसे आगे बढ़ता है" },
      {
        type: "steps",
        items: [
          "आपको किसी नकली 'एक्सपर्ट' या 'प्रोफ़ेसर' द्वारा चलाए जा रहे WhatsApp या Telegram ग्रुप में जोड़ा जाता है।",
          "मेंबर (असल में ठग) भारी मुनाफ़े के स्क्रीनशॉट पोस्ट कर भरोसा जमाते हैं।",
          "आपसे निवेश के लिए एक ऐप या वेबसाइट इंस्टॉल करने को कहा जाता है, शुरुआत छोटी रकम से होती है।",
          "डैशबोर्ड पर आपके पैसे तेज़ी से बढ़ते दिखते हैं, इसलिए आप बड़ी रकम लगाते हैं।",
          "जब आप पैसे निकालने की कोशिश करते हैं, तो आपसे 'टैक्स' या 'फ़ीस' माँगी जाती है, और फिर संपर्क ही तोड़ दिया जाता है।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "'कोई जोखिम नहीं' के साथ गारंटीड या फिक्स्ड ऊँचा रिटर्न।",
          "'ऑफ़र बंद होने' से पहले जल्दी निवेश करने का दबाव।",
          "SEBI में रजिस्टर्ड प्लेटफ़ॉर्म के बजाय अनजान ऐप या लिंक।",
          "अपने ही पैसे निकालने के लिए फ़ीस या टैक्स माँगा जाना।",
          "स्कीम को बढ़ावा देने के लिए सेलेब्रिटी की फ़ोटो या नकली खबरें इस्तेमाल करना।",
        ],
      },
      { type: "heading", body: "खुद को कैसे बचाएँ" },
      {
        type: "list",
        items: [
          "सिर्फ़ SEBI में रजिस्टर्ड ब्रोकर और जाने-माने प्लेटफ़ॉर्म से ही निवेश करें।",
          "किसी भी सलाहकार का SEBI रजिस्ट्रेशन नंबर SEBI की वेबसाइट पर जाँचें।",
          "ऐसे किसी भी ग्रुप पर शक करें जो आपको बिना अनुमति जोड़ ले।",
          "अपना मुनाफ़ा 'अनलॉक' या 'विदड्रॉ' करने के लिए कभी अतिरिक्त फ़ीस न दें।",
        ],
      },
    ],
  },
  {
    slug: "job-scam",
    title: "जॉब और टास्क स्कैम: नकली ऑफ़र जो आपको पैसे का नुकसान कराते हैं",
    category: "Guide",
    excerpt:
      "वर्क फ्रॉम होम, डेटा एंट्री और 'लाइक करो और कमाओ' ऑफ़र नौकरी ढूँढने वालों को फँसाने के लिए इस्तेमाल होते हैं। असली नौकरियाँ कभी पहले पैसे नहीं माँगतीं।",
    readTime: "5 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "job",
    blocks: [
      {
        type: "text",
        body: "जॉब स्कैम छात्रों, गृहिणियों और अतिरिक्त आमदनी चाहने वाले हर किसी को निशाना बनाते हैं। ये भरोसा जीतने के लिए छोटी-सी रकम देकर शुरू होते हैं, फिर 'ज़्यादा कमाई' के नाम पर आपके अपने पैसे जमा करवा लेते हैं, जो कभी वापस नहीं आती।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "आसान परख",
        body: "असली नियोक्ता आपको पैसे देता है। अगर कोई 'नौकरी' आपसे रजिस्ट्रेशन फ़ीस, सिक्योरिटी डिपॉज़िट, या ज़्यादा कमाने के लिए पैसे लगाने को कहे, तो यह स्कैम है।",
      },
      { type: "heading", body: "आम जॉब स्कैम" },
      {
        type: "list",
        items: [
          "टास्क स्कैम: वीडियो लाइक करने या प्रोडक्ट रेटिंग देने पर छोटी रकम मिलती है, फिर 'प्रीमियम टास्क' के लिए पैसे जमा करने को कहा जाता है।",
          "रजिस्ट्रेशन फ़ीस स्कैम: नौकरी का ऑफ़र मिलता है लेकिन पहले 'ट्रेनिंग', 'ID कार्ड' या 'सामग्री' के लिए पैसे देने पड़ते हैं।",
          "नकली भर्तीकर्ता स्कैम: कोई खुद को किसी मशहूर कंपनी से बताकर दस्तावेज़ और फ़ीस माँगता है।",
          "डेटा एंट्री स्कैम: आपसे फ़ीस ली जाती है, फिर भुगतान से बचने के लिए 'गलतियाँ' निकाली जाती हैं।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "कमाई शुरू होने से पहले पैसे देने की कोई भी माँग।",
          "रैंडम WhatsApp या Telegram मैसेज से आए जॉब ऑफ़र।",
          "बहुत कम काम के बदले हद से ज़्यादा सैलरी।",
          "कंपनी ईमेल के बजाय निजी Gmail पते इस्तेमाल करने वाले भर्तीकर्ता।",
          "अपनी कमाई 'अनलॉक' करने के लिए जल्दी पैसे जमा करने का दबाव।",
        ],
      },
      { type: "heading", body: "सुरक्षित कैसे रहें" },
      {
        type: "list",
        items: [
          "नौकरी पाने के लिए कभी पैसे न दें। असली कंपनियाँ उम्मीदवारों से शुल्क नहीं लेतीं।",
          "कंपनी को उसकी आधिकारिक वेबसाइट और संपर्क जानकारी से जाँचें।",
          "जिन मैसेजिंग ऐप के ज़रिए आपने आवेदन नहीं किया, वहाँ मिले ऑफ़र से सावधान रहें।",
          "शक हो तो ऑफ़र कंपनी के आधिकारिक लेटरहेड पर लिखित में माँगें।",
        ],
      },
    ],
  },
  {
    slug: "otp-fraud",
    title: "OTP फ्रॉड: वह 6 अंकों का कोड कभी किसी से साझा क्यों न करें",
    category: "Guide",
    excerpt:
      "OTP आपके खाते की चाबी है। ठग चालाक कहानियाँ गढ़कर आपसे इसे बुलवा लेते हैं। ये चालें सीखिए ताकि आप कभी न फँसें।",
    readTime: "4 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "otp",
    blocks: [
      {
        type: "text",
        body: "OTP (वन टाइम पासवर्ड) फ्रॉड भारत में पैसे चुराने के सबसे आम तरीकों में से एक है। स्कैम आसान है: ठग के पास आपका कार्ड या खाता नंबर तो होता है, लेकिन लेन-देन पूरा करने के लिए OTP चाहिए, इसलिए वह आपको बहलाकर वह साझा करवा लेता है।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "यह नियम कभी न तोड़ें",
        body: "कोई बैंक, कोई कंपनी, कोई सरकारी दफ़्तर कभी आपका OTP नहीं माँगता। जो भी OTP माँगे, वह बिना किसी अपवाद के ठग है।",
      },
      { type: "heading", body: "आम OTP चालें" },
      {
        type: "list",
        items: [
          "नकली बैंक कॉल: 'आपका कार्ड ब्लॉक हो जाएगा, चालू रखने के लिए OTP बताइए।'",
          "KYC अपडेट: 'आपके खाते का KYC ज़रूरी है, अभी भेजा गया कोड बताइए।'",
          "इनाम या रिफंड: 'आपने इनाम जीता है, OTP से पुष्टि करें।'",
          "डिलीवरी स्कैम: 'अपना पार्सल कन्फर्म करने के लिए कोड बता दीजिए।'",
          "मार्केटप्लेस स्कैम: 'मैं आपका सामान खरीद रहा हूँ, कन्फर्म करने के लिए OTP बताइए।'",
        ],
      },
      { type: "heading", body: "सुरक्षित कैसे रहें" },
      {
        type: "list",
        items: [
          "अपने OTP को घर की चाबी की तरह समझें। कॉल पर किसी को कभी न बताएँ।",
          "पूरा OTP मैसेज पढ़ें। उसमें आमतौर पर लिखा होता है 'यह कोड किसी के साथ साझा न करें'।",
          "OTP माँगने वाले किसी भी कॉल को काट दें, भले ही उसे आपकी डिटेल पता हो।",
          "ट्रांज़ैक्शन अलर्ट चालू रखें ताकि किसी भी गड़बड़ी का तुरंत पता चले।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "अगर गलती से OTP साझा कर दिया",
        body: "तुरंत अपने बैंक को कॉल कर कार्ड या खाता ब्लॉक करवाएँ, फिर 1930 पर शिकायत करें। पहले कुछ मिनटों में कदम उठाने से नुकसान रोकने की सबसे अच्छी संभावना होती है।",
      },
    ],
  },
  {
    slug: "kyc-fraud",
    title: "KYC अपडेट स्कैम: नकली 'अकाउंट ब्लॉक हो जाएगा' मैसेज",
    category: "Family",
    excerpt:
      "आपके बैंक, वॉलेट या सिम का KYC 'खत्म' होने की चेतावनी देने वाले मैसेज एक आम जाल हैं। जानिए असली KYC कैसे होता है ताकि आप कभी न फँसें।",
    readTime: "5 मिनट पढ़ें",
    updated: "मई 2026",
    icon: "kyc",
    blocks: [
      {
        type: "text",
        body: "KYC (नो योर कस्टमर) स्कैम आपके खाते तक पहुँच खोने के डर का फ़ायदा उठाते हैं। आपको SMS या कॉल आता है कि आपका KYC खत्म हो गया है और आज ही तुरंत कुछ न करने पर आपका खाता, वॉलेट या सिम ब्लॉक हो जाएगा।",
      },
      {
        type: "callout",
        tone: "danger",
        title: "शांत रहें",
        body: "बैंक असली KYC के लिए काफ़ी पहले से सूचना देते हैं और कभी SMS के लिंक, फ़ोन कॉल, या किसी अजनबी के भेजे ऐप से KYC पूरा करने को नहीं कहते।",
      },
      { type: "heading", body: "स्कैम कैसे काम करता है" },
      {
        type: "steps",
        items: [
          "आपको तुरंत एक्शन वाला SMS या कॉल आता है: 'आपका KYC खत्म हो गया है, आज खाता ब्लॉक हो जाएगा।'",
          "एक लिंक दिया जाता है, या आपसे एक 'वेरिफिकेशन' ऐप इंस्टॉल करने को कहा जाता है।",
          "लिंक एक नकली पेज खोलता है जो आपका लॉगिन, कार्ड या आधार डिटेल चुरा लेता है।",
          "या वह ऐप ठग को रिमोट एक्सेस और OTP दे देता है, जिससे वह आपका खाता खाली कर देता है।",
        ],
      },
      { type: "heading", body: "चेतावनी के संकेत" },
      {
        type: "signs",
        items: [
          "खाता या सिम 'आज' या 'कुछ घंटों में' ब्लॉक होने की तुरंत धमकियाँ।",
          "KYC अपडेट करने को कहने वाले SMS में लिंक।",
          "AnyDesk, QuickSupport या TeamViewer जैसे ऐप इंस्टॉल करने की माँग।",
          "'KYC पूरा करने' के लिए OTP, कार्ड नंबर, PIN या आधार माँगने वाली कॉल।",
        ],
      },
      { type: "heading", body: "अपने परिवार को कैसे बचाएँ" },
      {
        type: "list",
        items: [
          "SMS या WhatsApp में आए KYC लिंक पर कभी क्लिक न करें। इसके बजाय शाखा या आधिकारिक ऐप पर जाएँ।",
          "बुज़ुर्ग परिवारजनों को बताएँ कि KYC कभी फ़ोन कॉल पर नहीं होता।",
          "किसी के कहने पर कभी रिमोट एक्सेस ऐप इंस्टॉल न करें।",
          "शक हो तो अपनी पासबुक या कार्ड पर दिए नंबर से बैंक को कॉल करें।",
        ],
      },
      {
        type: "callout",
        tone: "safe",
        title: "कमज़ोर लोगों की मदद करें",
        body: "बुज़ुर्ग नागरिक KYC स्कैम का सबसे बड़ा निशाना होते हैं। कुछ मिनट निकालकर अपने माता-पिता और दादा-दादी को यह समझाएँ, यह उनकी जमा-पूँजी बचा सकता है।",
      },
    ],
  },
];

export type ArticleLang = "en" | "hi";

export function getArticles(lang: ArticleLang = "en"): ScamArticle[] {
  return lang === "hi" ? scamArticlesHi : scamArticles;
}

export function getArticle(
  slug: string,
  lang: ArticleLang = "en",
): ScamArticle | undefined {
  return getArticles(lang).find((a) => a.slug === slug);
}

export function getRelatedArticles(
  slug: string,
  lang: ArticleLang = "en",
  count = 3,
): ScamArticle[] {
  const list = getArticles(lang);
  const current = list.find((a) => a.slug === slug);
  if (!current) return list.slice(0, count);
  const sameCategory = list.filter(
    (a) => a.slug !== slug && a.category === current.category,
  );
  const others = list.filter(
    (a) => a.slug !== slug && a.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
