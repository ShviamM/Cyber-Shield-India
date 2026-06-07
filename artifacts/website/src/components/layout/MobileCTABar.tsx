import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function MobileCTABar() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location === "/download" || location === "/login") {
    return null;
  }

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button
          asChild
          className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-semibold h-12 text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Link href="/download">
            <ShieldCheck className="h-5 w-5" />
            Download Netraksh — Free
          </Link>
        </Button>
      </div>
    </div>
  );
}
