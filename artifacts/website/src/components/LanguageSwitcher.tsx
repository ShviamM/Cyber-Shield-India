import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n/languages";
import { setAppLanguage } from "@/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("hi") ? "hi" : "en";

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-xs font-bold ${className}`}
    >
      {LANGUAGES.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setAppLanguage(l.code)}
            aria-pressed={active}
            aria-label={l.label}
            className={`rounded-full px-2.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              active
                ? "bg-primary text-white"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            {l.short}
          </button>
        );
      })}
    </div>
  );
}
