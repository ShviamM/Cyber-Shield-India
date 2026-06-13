import { Link, useLocation } from "wouter";
import { Menu, X, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/use-auth";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/images/netraksh-logo.png"
              alt="Netraksh logo"
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
            />
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Netra<span className="text-accent">ksh</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary" : "text-gray-600"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                {t("auth.account")}
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                {t("auth.login")}
              </Link>
            )}
            <Link href="/download">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-6">
                {t("cta.downloadApp")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-lg px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-lg font-medium p-2 rounded-lg ${
                location === link.href ? "bg-gray-50 text-primary" : "text-gray-900"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-2" />
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-gray-500">
              {t("language.label")}
            </span>
            <LanguageSwitcher />
          </div>
          <Link
            href={user ? "/account" : "/login"}
            className="text-lg font-medium p-2 text-gray-900"
          >
            {user ? t("auth.myAccount") : t("auth.login")}
          </Link>
          <Link href="/download" className="mt-2">
            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white py-6 text-lg">
              {t("cta.downloadApp")}
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}