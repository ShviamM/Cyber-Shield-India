import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { MobileCTABar } from "./MobileCTABar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <MobileCTABar />
    </div>
  );
}
