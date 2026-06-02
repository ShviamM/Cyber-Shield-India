import { ThemeToggle } from "@/components/ThemeToggle";
import { Hero } from "@/components/sections/Hero";
import { Essence } from "@/components/sections/Essence";
import { LogoSystem } from "@/components/sections/LogoSystem";
import { ClearSpace } from "@/components/sections/ClearSpace";
import { DoDont } from "@/components/sections/DoDont";
import { ColorPalette } from "@/components/sections/ColorPalette";
import { Typography } from "@/components/sections/Typography";
import { Splash } from "@/components/sections/Splash";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white pb-20">
      <ThemeToggle />
      <Hero />
      <Essence />
      <LogoSystem />
      <ClearSpace />
      <DoDont />
      <ColorPalette />
      <Typography />
      <Splash />
      <Footer />
    </div>
  );
}
