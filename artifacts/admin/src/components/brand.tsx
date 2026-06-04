import logoUrl from "@/assets/netraksh-logo.png";
import { cn } from "@/lib/utils";

export function BrandLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("overflow-hidden shrink-0", className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
    >
      <img src={logoUrl} alt="Netraksh" className="h-full w-full object-cover" />
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-extrabold tracking-tight", className)}>
      Netra<span className="text-[#FF6713]">ksh</span>
    </span>
  );
}

export function Tricolor({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-[3px] w-16 overflow-hidden rounded-full", className)}>
      <div className="flex-1" style={{ backgroundColor: "#FF6713" }} />
      <div className="flex-1 bg-white" />
      <div className="flex-1" style={{ backgroundColor: "#138808" }} />
    </div>
  );
}
