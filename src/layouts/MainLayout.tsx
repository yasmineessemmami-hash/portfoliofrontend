import type { ReactNode } from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { useCommonContext } from "@/context/CommonContext";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper used by all pages.
 * Provides consistent header, main, and footer structure.
 * Uses common site data (name, social links) from backend.
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  const { common } = useCommonContext();

  const fullName = common?.full_name ?? "";
  const socialLinks = common?.social_links ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header>
        <Navbar name={fullName} />
      </header>

      {/* Main Content - leave space for fixed navbar */}
      <main className="pt-20">{children}</main>

      {/* Footer */}
      <Footer name={fullName} socialLinks={socialLinks} />
    </div>
  );
};

export default MainLayout;


