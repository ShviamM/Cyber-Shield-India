import { Link, useLocation } from "wouter";
import { LogOut, ShieldCheck, BarChart3, MapPin, Megaphone, AlertTriangle, Crown, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BrandLogo, Wordmark, BrandTaglines } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Moderation", icon: ShieldCheck },
  { href: "/business", label: "Business Metrics", icon: BarChart3 },
  { href: "/users", label: "User Management", icon: Users },
  { href: "/fraud-map", label: "India Fraud Map", icon: MapPin },
  { href: "/broadcasts", label: "Broadcast Center", icon: Megaphone },
  { href: "/super", label: "Super Admin", icon: Crown, superAdminOnly: true },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const doLogout = useLogout();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await doLogout.mutateAsync();
    } finally {
      logout();
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center p-8">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            This console is restricted to Netraksh administrators. Your account does not have the required permissions.
          </p>
          <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-20">
        <header className="bg-sidebar text-sidebar-foreground">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size={36} className="ring-1 ring-white/15" />
              <div className="leading-tight">
                <Wordmark className="text-lg text-white block" />
                <BrandTaglines className="text-[10px]" hindiClassName="hidden sm:block" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium text-white">{user.fullName}</p>
                <p className="text-white/60 text-xs">Moderator</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <nav className="container mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              {NAV_ITEMS.filter(
                (item) => !item.superAdminOnly || user.isSuperAdmin,
              ).map((item) => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                      active
                        ? "border-[#FF6713] text-white"
                        : "border-transparent text-white/60 hover:text-white hover:border-white/30",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>
        <div className="flex h-[3px] w-full">
          <div className="flex-1" style={{ backgroundColor: "#FF6713" }} />
          <div className="flex-1 bg-white" />
          <div className="flex-1" style={{ backgroundColor: "#138808" }} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
