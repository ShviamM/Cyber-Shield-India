export const LEGAL_UPDATED = "Last updated: May 2026";

const intro = (text: string) =>
  `<p class="lead">${LEGAL_UPDATED}</p><p>${text}</p>`;

export const legalContent: Record<string, string> = {
  "privacy-policy":
    intro(
      "Netraksh ('we', 'us', 'our') is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the rights you have under India's Digital Personal Data Protection Act, 2023 (DPDP Act).",
    ) +
    `
    <h2>Information we collect</h2>
    <ul>
      <li><strong>Account information:</strong> your phone number and basic profile details when you sign up.</li>
      <li><strong>Protection data:</strong> when you ask Netraksh to check a call, message, link or UPI ID, we process that content only to return a safety verdict.</li>
      <li><strong>Device and usage data:</strong> app version, device type and diagnostic logs used to keep the service reliable and secure.</li>
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
};
