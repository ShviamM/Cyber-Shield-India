export const LEGAL_UPDATED: Record<"en" | "hi", string> = {
  en: "Last updated: May 2026",
  hi: "अंतिम अपडेट: मई 2026",
};

const intro = (lang: "en" | "hi", text: string) =>
  `<p class="lead">${LEGAL_UPDATED[lang]}</p><p>${text}</p>`;

export const legalContent: Record<"en" | "hi", Record<string, string>> = {
  en: {
    "privacy-policy":
      intro(
        "en",
        "Netraksh ('we', 'us', 'our') is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the rights you have under India's Digital Personal Data Protection Act, 2023 (DPDP Act).",
      ) +
      `
    <h2>Information we collect</h2>
    <ul>
      <li><strong>Account information:</strong> your phone number and basic profile details when you sign up.</li>
      <li><strong>Protection data:</strong> when you ask Netraksh to check a call, message, link or UPI ID, we process that content only to return a safety verdict.</li>
      <li><strong>Device and usage data:</strong> app version, device type and diagnostic logs used to keep the service reliable and secure.</li>
      <li><strong>Location:</strong> with your permission, your approximate device location is used to show cyber-cell contacts and scam alerts relevant to your area. Location is accessed only while the app is open (in the foreground), never in the background, and you can decline it or turn it off in your device settings at any time.</li>
    </ul>
    <h2>How we use your information</h2>
    <ul>
      <li>To detect and warn you about scams, fraud and unsafe links.</li>
      <li>To operate, maintain and improve the Netraksh service.</li>
      <li>To communicate important safety alerts and service updates.</li>
      <li>To comply with applicable Indian law and lawful requests.</li>
    </ul>
    <h2>What we do not do</h2>
    <ul>
      <li>We do not sell your personal data to anyone.</li>
      <li>We do not read your private messages in the background. Content is checked only when you submit it for a scan.</li>
    </ul>
    <h2>Data sharing</h2>
    <p>We share data only with trusted service providers who help us run Netraksh (such as cloud hosting and SMS delivery), under strict confidentiality obligations, and where required by law.</p>
    <h2>Your rights</h2>
    <p>Under the DPDP Act you may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us at <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a>.</p>
    <h2>Data retention</h2>
    <p>We keep personal data only for as long as needed to provide the service and meet legal obligations. See our Data Retention Policy for details.</p>
    <h2>Contact</h2>
    <p>For any privacy question, write to <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a>.</p>
    `,

    "terms-of-service":
      intro(
        "en",
        "These Terms of Service govern your use of the Netraksh website and app. By using Netraksh, you agree to these terms.",
      ) +
      `
    <h2>Our service</h2>
    <p>Netraksh provides cyber safety tools and educational content to help you identify potential scams and fraud. Netraksh is an aid to your own judgement, not a guarantee. Always exercise caution with money and personal information.</p>
    <h2>Acceptable use</h2>
    <ul>
      <li>Use Netraksh only for lawful, personal protection purposes.</li>
      <li>Do not misuse, copy, reverse engineer or disrupt the service.</li>
      <li>Do not use Netraksh to harass others or submit unlawful content.</li>
    </ul>
    <h2>No professional advice</h2>
    <p>Educational content on Netraksh, including the Cyber Safety Center and Cyber Laws pages, is for general awareness and is not legal advice. For legal matters, consult a qualified professional or the relevant authorities.</p>
    <h2>Limitation of liability</h2>
    <p>Netraksh is provided 'as is'. To the extent permitted by law, we are not liable for losses arising from scams, third party actions, or reliance on safety verdicts. You remain responsible for your own financial decisions.</p>
    <h2>Changes</h2>
    <p>We may update these terms from time to time. Continued use after changes means you accept the updated terms.</p>
    <h2>Contact</h2>
    <p>Questions about these terms? Email <a href="mailto:support@netraksh.com">support@netraksh.com</a>.</p>
    `,

    "cookie-policy":
      intro(
        "en",
        "This Cookie Policy explains how the Netraksh website uses cookies and similar technologies.",
      ) +
      `
    <h2>What are cookies</h2>
    <p>Cookies are small text files stored on your device that help websites work and remember your preferences.</p>
    <h2>How we use them</h2>
    <ul>
      <li><strong>Essential cookies:</strong> required for the site to function correctly.</li>
      <li><strong>Analytics cookies:</strong> help us understand which pages are useful so we can improve them. These are aggregated and do not identify you personally.</li>
    </ul>
    <h2>Managing cookies</h2>
    <p>You can control or delete cookies through your browser settings. Disabling essential cookies may affect how the site works.</p>
    <h2>Contact</h2>
    <p>For questions, email <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a>.</p>
    `,

    "responsible-disclosure":
      intro(
        "en",
        "We take the security of Netraksh seriously and welcome reports from security researchers. This policy explains how to report a vulnerability responsibly.",
      ) +
      `
    <h2>How to report</h2>
    <p>If you believe you have found a security vulnerability, email full details to <a href="mailto:security@netraksh.com">security@netraksh.com</a>. Please include steps to reproduce the issue.</p>
    <h2>Our commitment</h2>
    <ul>
      <li>We will acknowledge your report promptly and keep you updated on our progress.</li>
      <li>We will not pursue legal action against researchers who act in good faith under this policy.</li>
      <li>We will credit researchers who responsibly disclose valid issues, if they wish.</li>
    </ul>
    <h2>Please do</h2>
    <ul>
      <li>Give us reasonable time to fix an issue before disclosing it publicly.</li>
      <li>Avoid accessing or modifying other users' data.</li>
      <li>Avoid actions that could harm the service or its users, such as denial of service attacks.</li>
    </ul>
    `,

    "data-retention-policy":
      intro(
        "en",
        "This policy describes how long Netraksh keeps different types of data.",
      ) +
      `
    <h2>Retention principles</h2>
    <p>We keep data only for as long as necessary to provide the service, meet legal obligations and protect our users.</p>
    <h2>Retention periods</h2>
    <ul>
      <li><strong>Account data:</strong> retained while your account is active. Deleted on request or within a reasonable period after account closure.</li>
      <li><strong>Scan content:</strong> the calls, messages or links you submit for checking are processed to return a verdict and are not retained as identifiable personal content beyond what is needed to operate and improve detection.</li>
      <li><strong>Diagnostic logs:</strong> kept for a limited period to maintain security and reliability, then deleted or anonymised.</li>
    </ul>
    <h2>Deletion requests</h2>
    <p>To request deletion of your data, contact <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a>.</p>
    `,

    "acceptable-use":
      intro(
        "en",
        "This Acceptable Use Policy sets out how Netraksh may and may not be used.",
      ) +
      `
    <h2>You agree not to</h2>
    <ul>
      <li>Use Netraksh for any unlawful purpose or to facilitate fraud.</li>
      <li>Attempt to gain unauthorised access to our systems or other users' accounts.</li>
      <li>Interfere with, disrupt or overload the service.</li>
      <li>Submit content that is illegal, abusive or infringes others' rights.</li>
      <li>Copy, resell or commercially exploit the service without permission.</li>
    </ul>
    <h2>Enforcement</h2>
    <p>We may suspend or terminate access for violations of this policy. Serious violations may be reported to the authorities.</p>
    `,

    security:
      intro(
        "en",
        "Security is at the core of Netraksh. This page summarises how we protect your data and the platform.",
      ) +
      `
    <h2>How we protect you</h2>
    <ul>
      <li><strong>Encryption:</strong> data is encrypted in transit using industry standard protocols.</li>
      <li><strong>Access control:</strong> access to systems is restricted on a need to know basis.</li>
      <li><strong>Minimal data:</strong> we collect only what is needed to keep you safe.</li>
      <li><strong>Monitoring:</strong> our systems are monitored to detect and respond to threats.</li>
    </ul>
    <h2>Your role in security</h2>
    <ul>
      <li>Keep your phone's operating system and the Netraksh app up to date.</li>
      <li>Never share OTPs or your account access with anyone.</li>
      <li>Report anything suspicious to <a href="mailto:security@netraksh.com">security@netraksh.com</a>.</li>
    </ul>
    <h2>Report a vulnerability</h2>
    <p>Security researchers can report issues under our Responsible Disclosure Policy.</p>
    `,

    compliance:
      intro(
        "en",
        "Netraksh is built to respect Indian law and the privacy of its users.",
      ) +
      `
    <h2>Regulatory alignment</h2>
    <ul>
      <li><strong>DPDP Act, 2023:</strong> we handle personal data in line with India's Digital Personal Data Protection Act, giving you rights over your data.</li>
      <li><strong>IT Act, 2000:</strong> we operate in accordance with the Information Technology Act and applicable rules.</li>
      <li><strong>Lawful cooperation:</strong> we cooperate with law enforcement on valid, lawful requests.</li>
    </ul>
    <h2>Data principal rights</h2>
    <p>You can access, correct or delete your personal data. See our Privacy Policy for how to exercise these rights.</p>
    <h2>Contact</h2>
    <p>For compliance enquiries, email <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a>.</p>
    `,
  },

  hi: {
    "privacy-policy":
      intro(
        "hi",
        "Netraksh ('हम', 'हमारा') आपकी निजता की रक्षा के लिए प्रतिबद्ध है। यह नीति बताती है कि हम कौन-सी जानकारी इकट्ठा करते हैं, उसका उपयोग कैसे करते हैं, और भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 (DPDP Act) के तहत आपको कौन-से अधिकार मिलते हैं।",
      ) +
      `
    <h2>हम कौन-सी जानकारी इकट्ठा करते हैं</h2>
    <ul>
      <li><strong>खाता जानकारी:</strong> साइन अप करते समय आपका फ़ोन नंबर और बुनियादी प्रोफ़ाइल विवरण।</li>
      <li><strong>सुरक्षा डेटा:</strong> जब आप Netraksh से किसी कॉल, मैसेज, लिंक या UPI ID को जाँचने के लिए कहते हैं, तो हम उस सामग्री को केवल सुरक्षा परिणाम देने के लिए प्रोसेस करते हैं।</li>
      <li><strong>डिवाइस और उपयोग डेटा:</strong> ऐप वर्शन, डिवाइस का प्रकार और डायग्नोस्टिक लॉग, जो सेवा को भरोसेमंद और सुरक्षित बनाए रखने में मदद करते हैं।</li>
      <li><strong>स्थान (लोकेशन):</strong> आपकी अनुमति से, आपके क्षेत्र से जुड़े साइबर सेल संपर्क और स्कैम अलर्ट दिखाने के लिए आपके डिवाइस का अनुमानित स्थान उपयोग किया जाता है। स्थान केवल तभी एक्सेस किया जाता है जब ऐप खुला हो (फ़ोरग्राउंड), पृष्ठभूमि में कभी नहीं, और आप इसे कभी भी अस्वीकार कर सकते हैं या अपनी डिवाइस सेटिंग्स में बंद कर सकते हैं।</li>
    </ul>
    <h2>हम आपकी जानकारी का उपयोग कैसे करते हैं</h2>
    <ul>
      <li>स्कैम, धोखाधड़ी और असुरक्षित लिंक का पता लगाने और आपको सचेत करने के लिए।</li>
      <li>Netraksh सेवा को चलाने, बनाए रखने और बेहतर बनाने के लिए।</li>
      <li>ज़रूरी सुरक्षा अलर्ट और सेवा अपडेट भेजने के लिए।</li>
      <li>लागू भारतीय कानून और वैध अनुरोधों का पालन करने के लिए।</li>
    </ul>
    <h2>हम क्या नहीं करते</h2>
    <ul>
      <li>हम आपका निजी डेटा किसी को नहीं बेचते।</li>
      <li>हम पृष्ठभूमि में आपके निजी मैसेज नहीं पढ़ते। सामग्री केवल तभी जाँची जाती है जब आप उसे स्कैन के लिए सबमिट करते हैं।</li>
    </ul>
    <h2>डेटा साझा करना</h2>
    <p>हम डेटा केवल उन भरोसेमंद सेवा प्रदाताओं के साथ साझा करते हैं जो Netraksh को चलाने में मदद करते हैं (जैसे क्लाउड होस्टिंग और SMS डिलीवरी), सख्त गोपनीयता शर्तों के तहत, और जहाँ कानूनन ज़रूरी हो।</p>
    <h2>आपके अधिकार</h2>
    <p>DPDP Act के तहत आप अपने निजी डेटा तक पहुँच, उसमें सुधार या उसे हटाने का अनुरोध कर सकते हैं। इन अधिकारों का उपयोग करने के लिए हमसे <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a> पर संपर्क करें।</p>
    <h2>डेटा संग्रहण</h2>
    <p>हम निजी डेटा केवल उतने समय तक रखते हैं जितना सेवा देने और कानूनी दायित्वों को पूरा करने के लिए ज़रूरी हो। विवरण के लिए हमारी डेटा रिटेंशन पॉलिसी देखें।</p>
    <h2>संपर्क</h2>
    <p>निजता से जुड़े किसी भी सवाल के लिए <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a> पर लिखें।</p>
    `,

    "terms-of-service":
      intro(
        "hi",
        "ये सेवा की शर्तें Netraksh की वेबसाइट और ऐप के आपके उपयोग को नियंत्रित करती हैं। Netraksh का उपयोग करके, आप इन शर्तों से सहमत होते हैं।",
      ) +
      `
    <h2>हमारी सेवा</h2>
    <p>Netraksh साइबर सुरक्षा के उपकरण और शैक्षिक सामग्री देता है ताकि आप संभावित स्कैम और धोखाधड़ी को पहचान सकें। Netraksh आपके अपने विवेक में मदद करता है, यह कोई गारंटी नहीं है। पैसे और निजी जानकारी के मामले में हमेशा सावधानी बरतें।</p>
    <h2>स्वीकार्य उपयोग</h2>
    <ul>
      <li>Netraksh का उपयोग केवल वैध, व्यक्तिगत सुरक्षा उद्देश्यों के लिए करें।</li>
      <li>सेवा का दुरुपयोग, नकल, रिवर्स इंजीनियरिंग या उसे बाधित न करें।</li>
      <li>दूसरों को परेशान करने या गैरकानूनी सामग्री सबमिट करने के लिए Netraksh का उपयोग न करें।</li>
    </ul>
    <h2>कोई पेशेवर सलाह नहीं</h2>
    <p>Netraksh पर मौजूद शैक्षिक सामग्री, जिसमें साइबर सेफ्टी सेंटर और साइबर कानून पेज शामिल हैं, सामान्य जागरूकता के लिए है और यह कानूनी सलाह नहीं है। कानूनी मामलों के लिए किसी योग्य पेशेवर या संबंधित अधिकारियों से सलाह लें।</p>
    <h2>दायित्व की सीमा</h2>
    <p>Netraksh 'जैसा है' के आधार पर दिया जाता है। कानून द्वारा अनुमत सीमा तक, हम स्कैम, तीसरे पक्ष की कार्रवाइयों, या सुरक्षा परिणामों पर भरोसे से होने वाले नुकसान के लिए ज़िम्मेदार नहीं हैं। अपने वित्तीय फैसलों के लिए आप स्वयं ज़िम्मेदार रहते हैं।</p>
    <h2>बदलाव</h2>
    <p>हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। बदलाव के बाद उपयोग जारी रखने का मतलब है कि आप अपडेट की गई शर्तों को स्वीकार करते हैं।</p>
    <h2>संपर्क</h2>
    <p>इन शर्तों के बारे में सवाल? <a href="mailto:support@netraksh.com">support@netraksh.com</a> पर ईमेल करें।</p>
    `,

    "cookie-policy":
      intro(
        "hi",
        "यह कुकी नीति बताती है कि Netraksh वेबसाइट कुकीज़ और इससे मिलती-जुलती तकनीकों का उपयोग कैसे करती है।",
      ) +
      `
    <h2>कुकीज़ क्या हैं</h2>
    <p>कुकीज़ आपके डिवाइस पर सहेजी गई छोटी टेक्स्ट फ़ाइलें होती हैं, जो वेबसाइटों को चलाने और आपकी पसंद याद रखने में मदद करती हैं।</p>
    <h2>हम इनका उपयोग कैसे करते हैं</h2>
    <ul>
      <li><strong>ज़रूरी कुकीज़:</strong> साइट को सही ढंग से चलाने के लिए आवश्यक।</li>
      <li><strong>एनालिटिक्स कुकीज़:</strong> हमें समझने में मदद करती हैं कि कौन-से पेज उपयोगी हैं ताकि हम उन्हें बेहतर बना सकें। ये समग्र रूप में होती हैं और आपकी व्यक्तिगत पहचान नहीं करतीं।</li>
    </ul>
    <h2>कुकीज़ प्रबंधित करना</h2>
    <p>आप अपने ब्राउज़र की सेटिंग्स से कुकीज़ को नियंत्रित या हटा सकते हैं। ज़रूरी कुकीज़ बंद करने से साइट के काम करने के तरीके पर असर पड़ सकता है।</p>
    <h2>संपर्क</h2>
    <p>सवालों के लिए <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a> पर ईमेल करें।</p>
    `,

    "responsible-disclosure":
      intro(
        "hi",
        "हम Netraksh की सुरक्षा को गंभीरता से लेते हैं और सुरक्षा शोधकर्ताओं की रिपोर्ट का स्वागत करते हैं। यह नीति बताती है कि किसी कमज़ोरी की ज़िम्मेदारी के साथ रिपोर्ट कैसे करें।",
      ) +
      `
    <h2>रिपोर्ट कैसे करें</h2>
    <p>अगर आपको लगता है कि आपने कोई सुरक्षा कमज़ोरी पाई है, तो पूरी जानकारी <a href="mailto:security@netraksh.com">security@netraksh.com</a> पर ईमेल करें। कृपया समस्या को दोहराने के चरण भी शामिल करें।</p>
    <h2>हमारा वादा</h2>
    <ul>
      <li>हम आपकी रिपोर्ट को शीघ्र स्वीकार करेंगे और प्रगति की जानकारी देते रहेंगे।</li>
      <li>इस नीति के तहत सद्भावना से काम करने वाले शोधकर्ताओं के खिलाफ हम कोई कानूनी कार्रवाई नहीं करेंगे।</li>
      <li>जो शोधकर्ता वैध समस्याओं की ज़िम्मेदारी के साथ जानकारी देते हैं, उन्हें चाहने पर हम श्रेय देंगे।</li>
    </ul>
    <h2>कृपया ऐसा करें</h2>
    <ul>
      <li>किसी समस्या को सार्वजनिक करने से पहले उसे ठीक करने के लिए हमें उचित समय दें।</li>
      <li>दूसरे उपयोगकर्ताओं के डेटा तक पहुँचने या उसे बदलने से बचें।</li>
      <li>ऐसी कार्रवाइयों से बचें जो सेवा या उसके उपयोगकर्ताओं को नुकसान पहुँचा सकती हैं, जैसे डिनायल ऑफ़ सर्विस अटैक।</li>
    </ul>
    `,

    "data-retention-policy":
      intro(
        "hi",
        "यह नीति बताती है कि Netraksh विभिन्न प्रकार के डेटा को कितने समय तक रखता है।",
      ) +
      `
    <h2>संग्रहण के सिद्धांत</h2>
    <p>हम डेटा केवल उतने समय तक रखते हैं जितना सेवा देने, कानूनी दायित्व पूरे करने और अपने उपयोगकर्ताओं की रक्षा के लिए ज़रूरी हो।</p>
    <h2>संग्रहण अवधि</h2>
    <ul>
      <li><strong>खाता डेटा:</strong> जब तक आपका खाता सक्रिय है तब तक रखा जाता है। अनुरोध पर या खाता बंद होने के बाद उचित अवधि में हटा दिया जाता है।</li>
      <li><strong>स्कैन सामग्री:</strong> जाँच के लिए आप जो कॉल, मैसेज या लिंक सबमिट करते हैं, उन्हें परिणाम देने के लिए प्रोसेस किया जाता है और पहचान योग्य निजी सामग्री के रूप में उतना ही रखा जाता है जितना सेवा चलाने और पहचान को बेहतर बनाने के लिए ज़रूरी हो।</li>
      <li><strong>डायग्नोस्टिक लॉग:</strong> सुरक्षा और भरोसेमंदी बनाए रखने के लिए सीमित अवधि तक रखे जाते हैं, फिर हटा दिए जाते हैं या गुमनाम कर दिए जाते हैं।</li>
    </ul>
    <h2>हटाने के अनुरोध</h2>
    <p>अपना डेटा हटाने का अनुरोध करने के लिए <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a> पर संपर्क करें।</p>
    `,

    "acceptable-use":
      intro(
        "hi",
        "यह स्वीकार्य उपयोग नीति बताती है कि Netraksh का उपयोग किस तरह किया जा सकता है और किस तरह नहीं।",
      ) +
      `
    <h2>आप सहमत हैं कि आप ऐसा नहीं करेंगे</h2>
    <ul>
      <li>Netraksh का उपयोग किसी गैरकानूनी उद्देश्य के लिए या धोखाधड़ी में मदद के लिए करना।</li>
      <li>हमारे सिस्टम या दूसरे उपयोगकर्ताओं के खातों तक अनधिकृत पहुँच की कोशिश करना।</li>
      <li>सेवा में दखल देना, उसे बाधित करना या ओवरलोड करना।</li>
      <li>ऐसी सामग्री सबमिट करना जो गैरकानूनी, अपमानजनक हो या दूसरों के अधिकारों का उल्लंघन करती हो।</li>
      <li>बिना अनुमति सेवा की नकल, पुनर्विक्रय या व्यावसायिक उपयोग करना।</li>
    </ul>
    <h2>प्रवर्तन</h2>
    <p>इस नीति के उल्लंघन पर हम पहुँच को निलंबित या समाप्त कर सकते हैं। गंभीर उल्लंघनों की सूचना अधिकारियों को दी जा सकती है।</p>
    `,

    security:
      intro(
        "hi",
        "सुरक्षा Netraksh के केंद्र में है। यह पेज संक्षेप में बताता है कि हम आपके डेटा और प्लेटफ़ॉर्म की रक्षा कैसे करते हैं।",
      ) +
      `
    <h2>हम आपकी रक्षा कैसे करते हैं</h2>
    <ul>
      <li><strong>एन्क्रिप्शन:</strong> डेटा को ट्रांज़िट के दौरान इंडस्ट्री स्टैंडर्ड प्रोटोकॉल से एन्क्रिप्ट किया जाता है।</li>
      <li><strong>एक्सेस कंट्रोल:</strong> सिस्टम तक पहुँच ज़रूरत के आधार पर ही दी जाती है।</li>
      <li><strong>न्यूनतम डेटा:</strong> हम केवल वही इकट्ठा करते हैं जो आपको सुरक्षित रखने के लिए ज़रूरी है।</li>
      <li><strong>निगरानी:</strong> खतरों का पता लगाने और जवाब देने के लिए हमारे सिस्टम की निगरानी की जाती है।</li>
    </ul>
    <h2>सुरक्षा में आपकी भूमिका</h2>
    <ul>
      <li>अपने फ़ोन के ऑपरेटिंग सिस्टम और Netraksh ऐप को अपडेट रखें।</li>
      <li>अपना OTP या खाते की पहुँच कभी किसी के साथ साझा न करें।</li>
      <li>किसी भी संदिग्ध बात की सूचना <a href="mailto:security@netraksh.com">security@netraksh.com</a> पर दें।</li>
    </ul>
    <h2>कमज़ोरी की रिपोर्ट करें</h2>
    <p>सुरक्षा शोधकर्ता हमारी रिस्पॉन्सिबल डिस्क्लोज़र पॉलिसी के तहत समस्याओं की रिपोर्ट कर सकते हैं।</p>
    `,

    compliance:
      intro(
        "hi",
        "Netraksh को भारतीय कानून और अपने उपयोगकर्ताओं की निजता का सम्मान करने के लिए बनाया गया है।",
      ) +
      `
    <h2>नियामक अनुपालन</h2>
    <ul>
      <li><strong>DPDP Act, 2023:</strong> हम निजी डेटा को भारत के डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट के अनुरूप संभालते हैं, जो आपको अपने डेटा पर अधिकार देता है।</li>
      <li><strong>IT Act, 2000:</strong> हम सूचना प्रौद्योगिकी अधिनियम और लागू नियमों के अनुसार काम करते हैं।</li>
      <li><strong>वैध सहयोग:</strong> हम वैध और कानूनी अनुरोधों पर कानून प्रवर्तन एजेंसियों के साथ सहयोग करते हैं।</li>
    </ul>
    <h2>डेटा प्रिंसिपल के अधिकार</h2>
    <p>आप अपने निजी डेटा तक पहुँच सकते हैं, उसमें सुधार कर सकते हैं या उसे हटा सकते हैं। इन अधिकारों का उपयोग कैसे करें, यह जानने के लिए हमारी प्राइवेसी पॉलिसी देखें।</p>
    <h2>संपर्क</h2>
    <p>अनुपालन से जुड़े सवालों के लिए <a href="mailto:privacy@netraksh.com">privacy@netraksh.com</a> पर ईमेल करें।</p>
    `,
  },
};
