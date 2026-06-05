const LAST_UPDATED = "June 5, 2026";
const CONTACT_EMAIL = "support@netraksh.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[#0B3D91]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="bg-[#0B3D91] text-white">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-3xl font-bold">
            Netra<span className="text-[#FF7722]">ksh</span>
          </h1>
          <p className="mt-1 text-sm text-blue-100">
            India&apos;s Digital Bodyguard — Privacy Policy
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>

        <p className="mt-6 text-[15px] leading-relaxed text-gray-700">
          Netraksh (&quot;Netraksh&quot;, &quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) helps people in India identify and avoid fraud,
          scam calls, scam messages, and suspicious payment requests. This
          Privacy Policy explains what information the Netraksh mobile
          application (the &quot;App&quot;) collects, how we use it, who we
          share it with, and the choices you have. By using the App you agree
          to this policy.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect the following categories of information:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Account information.</strong> Your mobile phone number
              (verified by a one-time password) and the name you provide when
              you register.
            </li>
            <li>
              <strong>Location.</strong> With your permission, your approximate
              or precise location, used only to show scams reported in your
              city and nearby areas.
            </li>
            <li>
              <strong>Call and message information (Android only).</strong> To
              warn you about known scam numbers, the App may read your phone
              state, incoming call numbers, and incoming SMS sender details on
              your device. This information is processed to check a number or
              message against our fraud database. We do not read the contents
              of your personal conversations for advertising, and we do not
              upload your full call log or message history.
            </li>
            <li>
              <strong>Reports you submit.</strong> Phone numbers, message text,
              QR codes, URLs, or other details you choose to report or check
              for fraud.
            </li>
            <li>
              <strong>Payment information.</strong> If you purchase a
              subscription, payments are processed by our payment provider
              (Razorpay). We receive confirmation of payment but do not store
              your full card or bank details.
            </li>
            <li>
              <strong>Device and usage information.</strong> Basic technical
              data such as device type, app version, and push-notification
              token, used to operate and improve the App.
            </li>
          </ul>
        </Section>

        <Section title="2. Device Permissions and Why We Use Them">
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Phone &amp; Call Log (READ_PHONE_STATE, READ_CALL_LOG).</strong>{" "}
              To detect an incoming call from a known scam number and warn you
              in real time.
            </li>
            <li>
              <strong>SMS (RECEIVE_SMS).</strong> To detect scam or phishing
              text messages as they arrive and alert you.
            </li>
            <li>
              <strong>Camera.</strong> To scan QR codes so we can check them
              for payment scams.
            </li>
            <li>
              <strong>Location.</strong> To show fraud reported in your area.
            </li>
            <li>
              <strong>Notifications.</strong> To send scam alerts and important
              safety updates.
            </li>
          </ul>
          <p>
            You can grant or revoke any permission at any time in your device
            settings. Some protection features will not work without the
            related permission.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc space-y-2 pl-6">
            <li>To create and secure your account.</li>
            <li>
              To identify scam numbers, messages, links, and payment requests,
              and to alert you about them.
            </li>
            <li>To show fraud trends and reports relevant to your area.</li>
            <li>To process subscriptions and provide customer support.</li>
            <li>
              To detect, prevent, and investigate fraud, abuse, and security
              issues, and to improve our detection models.
            </li>
            <li>To comply with applicable laws.</li>
          </ul>
        </Section>

        <Section title="4. How We Share Information">
          <p>
            We do not sell your personal information. We share information only
            with:
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Service providers</strong> who help us operate the App —
              for example, OTP/SMS verification (MSG91), payment processing
              (Razorpay), cloud hosting (DigitalOcean), and fraud-analysis
              services — under obligations to protect your data.
            </li>
            <li>
              <strong>Other users, in aggregated or anonymized form</strong> —
              for example, showing that a number has been reported as a scam,
              without revealing who reported it.
            </li>
            <li>
              <strong>Authorities</strong> when required by law or to protect
              the rights, safety, and property of users or the public.
            </li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We keep your information for as long as your account is active or as
            needed to provide the service, comply with legal obligations,
            resolve disputes, and enforce our agreements. You can ask us to
            delete your account and associated personal data at any time.
          </p>
        </Section>

        <Section title="6. Security">
          <p>
            We use reasonable technical and organizational measures to protect
            your information, including encryption in transit. No method of
            transmission or storage is completely secure, so we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Your Rights and Choices">
          <ul className="list-disc space-y-2 pl-6">
            <li>Access, correct, or update your account information.</li>
            <li>Revoke device permissions in your settings.</li>
            <li>Request deletion of your account and personal data.</li>
            <li>Opt out of non-essential notifications.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a className="text-[#0B3D91] underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            The App is not intended for children under 13, and we do not
            knowingly collect personal information from them. If you believe a
            child has provided us information, please contact us so we can
            remove it.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will post
            the updated version here with a new &quot;Last updated&quot; date,
            and significant changes may also be communicated in the App.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy or your data,
            contact us at{" "}
            <a className="text-[#0B3D91] underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <footer className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} Netraksh. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
