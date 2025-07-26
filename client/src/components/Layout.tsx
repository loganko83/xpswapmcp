import React, { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useLocation } from "wouter";
import { CryptoTicker } from "@/components/CryptoTicker";
import { Header } from "@/components/layout/Header";
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Footer } from "@/components/layout/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWeb3Context();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const handleWalletClick = () => {
    setIsWalletModalOpen(true);
  };

  const isActivePage = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      {/* Crypto Ticker - Top Position */}
      <CryptoTicker />
      
      {/* Header */}
      <Header 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onWalletClick={handleWalletClick}
      />
      
      {/* Desktop Navigation */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14">
            <DesktopNavigation />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isActivePage={isActivePage}
      />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Wallet Connect Modal */}
      <WalletConnect 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallet={wallet}
        isConnecting={isConnecting}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
    </div>
  );
}
