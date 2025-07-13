import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Wallet, Activity, X } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { useTheme } from "@/components/ThemeProvider";
import { useWeb3 } from "@/hooks/useWeb3";
import { Link, useLocation } from "wouter";
import { CryptoTicker } from "@/components/CryptoTicker";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleWalletClick = () => {
    if (wallet.isConnected) {
      disconnectWallet();
    } else {
      setIsWalletModalOpen(true);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <img 
                    src="https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png" 
                    alt="Xphere" 
                    className="w-8 h-8 rounded-lg"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    XpSwap
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex space-x-6">
                <Link href="/swap" className={`text-sm font-medium transition-colors ${
                  isActivePage("/swap") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Swap
                </Link>
                <Link href="/trading" className={`text-sm font-medium transition-colors ${
                  isActivePage("/trading") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Trading
                </Link>
                <Link href="/pool" className={`text-sm font-medium transition-colors ${
                  isActivePage("/pool") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Pool
                </Link>
                <Link href="/farm" className={`text-sm font-medium transition-colors ${
                  isActivePage("/farm") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Farm
                </Link>
                <Link href="/bridge" className={`text-sm font-medium transition-colors ${
                  isActivePage("/bridge") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Bridge
                </Link>
                <Link href="/governance" className={`text-sm font-medium transition-colors ${
                  isActivePage("/governance") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Governance
                </Link>
                <Link href="/analytics" className={`text-sm font-medium transition-colors ${
                  isActivePage("/analytics") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Analytics
                </Link>
                <Link href="/multichain-portfolio" className={`text-sm font-medium transition-colors ${
                  isActivePage("/multichain-portfolio") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Portfolio
                </Link>
                <Link href="/minting" className={`text-sm font-medium transition-colors ${
                  isActivePage("/minting") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Minting
                </Link>
                <Link href="/xps-staking" className={`text-sm font-medium transition-colors ${
                  isActivePage("/xps-staking") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  XPS Staking
                </Link>
                <Link href="/xps-purchase" className={`text-sm font-medium transition-colors ${
                  isActivePage("/xps-purchase") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Buy XPS
                </Link>
              </nav>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-4">
              {/* Network Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Xphere</span>
              </div>

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Wallet Connection */}
              <Button
                onClick={handleWalletClick}
                disabled={isConnecting}
                className={`bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed ${
                  isConnecting ? 'animate-wallet-pulse' : wallet.isConnected ? 'animate-wallet-connect' : ''
                }`}
              >
                <Wallet className={`w-4 h-4 mr-2 transition-transform duration-300 ${isConnecting ? 'animate-spin' : ''}`} />
                {isConnecting 
                  ? "연결 중..." 
                  : wallet.isConnected
                    ? formatAddress(wallet.address!)
                    : "지갑 연결"}
              </Button>

              {/* Mobile Menu */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <div className="px-4 py-4 space-y-4">
              {/* Network Indicator - Mobile */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Xphere Network</span>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link href="/swap" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/swap") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Swap
                  </div>
                </Link>
                <Link href="/trading" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/trading") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Trading
                  </div>
                </Link>
                <Link href="/pool" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/pool") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Pool
                  </div>
                </Link>
                <Link href="/farm" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/farm") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Farm
                  </div>
                </Link>
                <Link href="/bridge" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/bridge") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Bridge
                  </div>
                </Link>
                <Link href="/governance" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/governance") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Governance
                  </div>
                </Link>
                <Link href="/analytics" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/analytics") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Analytics
                  </div>
                </Link>
                <Link href="/multichain-portfolio" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/multichain-portfolio") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Portfolio
                  </div>
                </Link>
                <Link href="/minting" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/minting") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Minting
                  </div>
                </Link>
                <Link href="/xps-staking" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/xps-staking") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    XPS Staking
                  </div>
                </Link>
                <Link href="/xps-purchase" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/xps-purchase") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Buy XPS
                  </div>
                </Link>
              </nav>

              {/* Mobile Actions */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-6 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Activity className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  XpSwap
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Production-ready DEX with XPS token ecosystem, advanced AMM, 
                cross-chain bridge, and comprehensive DeFi features.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-xs">Products</h4>
              <ul className="space-y-0 text-xs">
                <li>
                  <Link href="/swap">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Swap
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/trading">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Trading
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/pool">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Pool
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/farm">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Farm
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/bridge">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Bridge
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/minting">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Minting
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/xps-staking">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Staking
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/xps-purchase">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      XPS
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-xs">Developers</h4>
              <ul className="space-y-0 text-xs">
                <li>
                  <Link href="/documentation">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Documentation
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/documentation">
                    <a 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => {
                        setTimeout(() => {
                          if (window.location.pathname === '/documentation') {
                            const event = new CustomEvent('navigate-to-api');
                            window.dispatchEvent(event);
                          }
                        }, 100);
                      }}
                    >
                      API
                    </a>
                  </Link>
                </li>
              </ul>
              <h4 className="font-semibold mb-1 text-xs mt-2">Support</h4>
              <ul className="space-y-0 text-xs">
                <li>
                  <a
                    href="https://trendy.storydot.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:myid998877@gmail.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/bug-bounty" className="text-muted-foreground hover:text-primary transition-colors">
                    Bug Bounty
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-1 text-xs">Social</h4>
              <ul className="space-y-0 text-xs">
                <li>
                  <a
                    href="https://medium.com/@teamxpsproject"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Medium
                  </a>
                </li>
                <li>
                  <a
                    href="https://t.me/xpscommunity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/xpsproject"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    X (Twitter)
                  </a>
                </li>
                <li>
                  <a
                    href="https://eng.storydot.kr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    News
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-3 pt-2 flex flex-col md:flex-row items-center justify-between">
            <p className="text-xs text-muted-foreground">
              © 2025 XpSwap. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <Link href="/privacy-policy">
                <a className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </Link>
              <Link href="/terms-of-service">
                <a className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Connection Modal */}
      <WalletConnect
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}