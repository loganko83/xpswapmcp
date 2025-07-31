import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Wallet, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useWallet } from "@/contexts/WalletContext";
import { Link } from "wouter";

interface HeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onWalletClick: () => void;
}

export function Header({ isMobileMenuOpen, setIsMobileMenuOpen, onWalletClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { wallet, isConnecting } = useWallet();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className="p-1 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                  <img 
                    src="https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2" 
                    alt="XPS" 
                    className="w-7 h-7 rounded-lg"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-primary group-hover:to-purple-500 transition-all duration-300">
                  XpSwap
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Network Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Xphere</span>
            </div>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted/80 transition-all duration-300 hover:scale-105"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Wallet Connect Button */}
            <Button 
              onClick={onWalletClick} 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary transition-all duration-300 rounded-full px-4 py-2 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105"
              disabled={isConnecting}
            >
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isConnecting 
                    ? "연결 중..." 
                    : wallet.isConnected
                      ? formatAddress(wallet.address!)
                      : "지갑 연결"}
                </span>
                
                {/* Loading Dots */}
                {isConnecting && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            </Button>

            {/* Mobile Menu */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full hover:bg-muted/80 transition-all duration-300 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
