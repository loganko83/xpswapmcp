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
                <Link href="/" className={`text-sm font-medium transition-colors ${
                  isActivePage("/") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  Swap
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
                <Link href="/xps-staking" className={`text-sm font-medium transition-colors ${
                  isActivePage("/xps-staking") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  XPS Staking
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
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    Swap
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
                <Link href="/xps-staking" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage("/xps-staking") 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}>
                    XPS Staking
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
      <footer className="mt-16 bg-muted/30 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  XpSwap
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The leading decentralized exchange on Xphere blockchain,
                providing secure and efficient token swapping.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Swap
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/pool">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Liquidity
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/farm">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Farming
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/analytics">
                    <a className="text-muted-foreground hover:text-primary transition-colors">
                      Analytics
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
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
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
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
                    href="https://eng.storydot.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Medium
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
              <h4 className="font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Telegram</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X (Twitter)</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2025 XpSwap. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/privacy-policy">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </Link>
              <Link href="/terms-of-service">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors">
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