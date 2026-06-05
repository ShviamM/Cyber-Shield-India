import { Link } from "wouter";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300 pt-20 pb-10 border-t border-gray-900">
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
            <p className="text-accent font-semibold mb-3">Thag se 2 kadam aage</p>
            <p className="text-gray-400 mb-6 max-w-sm">
              India's Digital Bodyguard. Protecting every Indian from scam calls, fraud messages, fake links, and digital crime.
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
                Cyber Crime Helpline: 1930
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/download" className="text-gray-400 hover:text-white transition-colors">Download App</Link></li>
              <li><Link href="/family-protection" className="text-gray-400 hover:text-white transition-colors">Family Protection</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/cyber-safety-center" className="text-gray-400 hover:text-white transition-colors">Cyber Safety Center</Link></li>
              <li><Link href="/cyber-laws" className="text-gray-400 hover:text-white transition-colors">Cyber Laws</Link></li>
              <li><Link href="/cyber-laws" className="text-gray-400 hover:text-white transition-colors">SOPs</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/founder" className="text-gray-400 hover:text-white transition-colors">Founder</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal & Trust</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white transition-colors">Security</Link></li>
              <li><Link href="/compliance" className="text-gray-400 hover:text-white transition-colors">Compliance</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} Netraksh. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link href="/data-retention-policy" className="hover:text-white transition-colors">Data Retention</Link>
            <Link href="/responsible-disclosure" className="hover:text-white transition-colors">Responsible Disclosure</Link>
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}