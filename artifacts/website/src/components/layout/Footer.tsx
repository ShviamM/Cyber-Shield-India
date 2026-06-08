import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation("common");

  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-24 lg:pb-10 border-t border-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group inline-flex">
              <img
                src="/images/netraksh-logo.png"
                alt="Netraksh logo"
                className="h-10 w-10 rounded-xl object-cover"
              />
              <span className="font-bold text-2xl tracking-tight text-white">
                Netra<span className="text-accent">ksh</span>
              </span>
            </Link>
            <p className="text-accent font-semibold mb-3">{t("footer.tagline")}</p>
            <p className="text-gray-400 mb-6 max-w-sm">
              {t("footer.description")}
            </p>
            <div className="space-y-3">
              <a href="mailto:support@netraksh.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-fit">
                <span className="p-2 bg-gray-900 rounded-full">
                  <Mail className="h-4 w-4" />
                </span>
                support@netraksh.com
              </a>
              <a href="tel:1930" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-fit">
                <span className="p-2 bg-gray-900 rounded-full">
                  <Phone className="h-4 w-4" />
                </span>
                {t("footer.helpline")}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.colProduct")}</h4>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.features")}</Link></li>
              <li><Link href="/download" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.downloadApp")}</Link></li>
              <li><Link href="/family-protection" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.familyProtection")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.colResources")}</h4>
            <ul className="space-y-3">
              <li><Link href="/cyber-safety-center" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.cyberSafetyCenter")}</Link></li>
              <li><Link href="/cyber-laws" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.cyberLaws")}</Link></li>
              <li><Link href="/cyber-laws" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.sops")}</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.faq")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.colCompany")}</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.aboutUs")}</Link></li>
              <li><Link href="/founder" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.founder")}</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.contactUs")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer.colLegal")}</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.privacyPolicy")}</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.termsOfService")}</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.security")}</Link></li>
              <li><Link href="/compliance" className="text-gray-400 hover:text-white transition-colors">{t("footer.links.compliance")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} Netraksh. {t("footer.rights")}</p>
          <div className="flex gap-4">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">{t("footer.links.cookiePolicy")}</Link>
            <Link href="/data-retention-policy" className="hover:text-white transition-colors">{t("footer.links.dataRetention")}</Link>
            <Link href="/responsible-disclosure" className="hover:text-white transition-colors">{t("footer.links.responsibleDisclosure")}</Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">{t("footer.links.disclaimer")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}