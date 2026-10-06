import { Link, useLocation } from "wouter";
import { Menu, X, UserCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";

// Solid navy navbar on every page, matching the dark page heroes below it.
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation("common");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: t("nav.features"), href: "/features" },
    { name: t("nav.familyProtection"), href: "/family-protection" },
    { name: t("nav.cyberSafety"), href: "/cyber-safety-center" },
    { name: t("nav.laws"), href: "/cyber-laws" },
    { name: t("nav.checkScam"), href: "/check" },
    { name: t("nav.pricing"), href: "/pricing" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.founder"), href: "/founder" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-white/10 bg-[#0A0F24]/90 backdrop-blur-md" : "border-white/5 bg-[#0A0F24]"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/images/netraksh-logo.png"
              alt="Netraksh logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-cover"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Netra<span className="text-accent">ksh</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={location === link.href ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-3 text-[15px] font-medium transition-colors hover:bg-white/5 hover:text-white ${
                  location === link.href ? "text-white" : "text-[#B4BBD0]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex shrink-0 items-center gap-3">
            <LanguageSwitcher />
            {user ? (
              <Link
                href="/account"
                className="inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap text-[15px] font-medium text-[#B4BBD0] hover:text-white"
              >
                <UserCircle className="h-5 w-5" />
                {t("auth.account")}
              </Link>
            ) : (
              <Link href="/login" className="inline-flex min-h-[44px] items-center whitespace-nowrap text-[15px] font-medium text-[#B4BBD0] hover:text-white">
                {t("auth.login")}
              </Link>
            )}
            <Link
              href="/check"
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl bg-[#F6F7FB] px-5 text-[15px] font-semibold text-[#121731] shadow-[0_6px_20px_-6px_rgba(247,147,30,0.45)] hover:bg-white"
            >
              <Search className="h-4 w-4" />
              {t("cta.checkNumber")}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="xl:hidden absolute top-20 left-0 right-0 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-white/10 bg-[#0A0F24] px-4 py-6 flex flex-col gap-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg p-3 text-lg font-medium ${
                location === link.href ? "bg-white/10 text-white" : "text-[#E2E6F0]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="my-3 h-px bg-white/10" />
          <div className="flex items-center justify-between px-3">
            <span className="text-sm font-medium text-[#B4BBD0]">{t("language.label")}</span>
            <LanguageSwitcher />
          </div>
          <Link href={user ? "/account" : "/login"} className="p-3 text-lg font-medium text-[#E2E6F0]">
            {user ? t("auth.myAccount") : t("auth.login")}
          </Link>
          <Link
            href="/check"
            className="mt-2 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#F6F7FB] text-lg font-semibold text-[#121731]"
          >
            <Search className="h-5 w-5" />
            {t("cta.checkNumber")}
          </Link>
        </div>
      )}
    </header>
  );
}
