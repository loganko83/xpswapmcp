import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Moon, Sun, Menu, Wallet, Activity, X, ChevronDown, TrendingUp, BarChart3, Coins, Droplets, ArrowRightLeft, ArrowUpDown, Target, Award, ShoppingCart, Shield, Vote, Flame, Users, Twitter, MessageSquare, Send, Github, Hexagon, Zap, BookOpen, LifeBuoy, ChevronRight } from "lucide-react";
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
    setIsWalletModalOpen(true);
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

              <nav className="hidden md:flex items-center space-x-6">
                {/* Swap Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                      <div className="flex items-center gap-1">
                        <ArrowRightLeft className="w-4 h-4" />
                        Swap
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Basic Trading</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/swap" className="flex items-center gap-2 w-full">
                        <ArrowRightLeft className="w-4 h-4" />
                        Simple Swap
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/trading" className="flex items-center gap-2 w-full">
                        <BarChart3 className="w-4 h-4" />
                        Advanced Trading
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Options and Futures</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/options" className="flex items-center gap-2 w-full">
                        <Target className="w-4 h-4" />
                        Options Trading
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/futures" className="flex items-center gap-2 w-full">
                        <BarChart3 className="w-4 h-4" />
                        Perpetual Futures
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Cross-Chain</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/bridge" className="flex items-center gap-2 w-full">
                        <ArrowRightLeft className="w-4 h-4" />
                        Bridge Assets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/atomic-swap" className="flex items-center gap-2 w-full">
                        <ArrowUpDown className="w-4 h-4" />
                        Atomic Swap
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* DeFi Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        DeFi
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/pool" className="flex items-center gap-2 w-full">
                        <Droplets className="w-4 h-4" />
                        Liquidity Pools
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/farm" className="flex items-center gap-2 w-full">
                        <TrendingUp className="w-4 h-4" />
                        Yield Farming
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/flashloans" className="flex items-center gap-2 w-full">
                        <Activity className="w-4 h-4" />
                        Flash Loans
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* XPS Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        XPS
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/xps-purchase" className="flex items-center gap-2 w-full">
                        <ShoppingCart className="w-4 h-4" />
                        Buy XPS Token
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/xps-staking" className="flex items-center gap-2 w-full">
                        <Target className="w-4 h-4" />
                        Stake XPS
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/governance" className="flex items-center gap-2 w-full">
                        <Vote className="w-4 h-4" />
                        Governance
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Minting Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        Minting
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/minting" className="flex items-center gap-2 w-full">
                        <Coins className="w-4 h-4" />
                        XIP-20 Mint
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/memecoin" className="flex items-center gap-2 w-full">
                        <Flame className="w-4 h-4" />
                        MemeCoin
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Analytics Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/analytics" className="flex items-center gap-2 w-full">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/multichain-portfolio" className="flex items-center gap-2 w-full">
                        <Wallet className="w-4 h-4" />
                        Portfolio
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Security */}
                <Link href="/security" className={`text-sm font-medium transition-colors ${
                  isActivePage("/security") 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                }`}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security
                  </div>
                </Link>
              </nav>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-3">
              {/* Network Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full backdrop-blur-sm">
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
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Wallet Connection */}
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                disabled={isConnecting}
                className={`relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${
                  wallet.isConnected 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40' 
                    : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
                }`}
              >
                {/* Status Indicator */}
                {wallet.isConnected && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-background shadow-sm" />
                )}
                
                <div className="flex items-center gap-2">
                  <Wallet className={`w-4 h-4 transition-transform duration-300 ${isConnecting ? 'animate-spin' : ''}`} />
                  
                  <span>
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

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50">
            <div className="px-4 py-6 space-y-6">
              {/* Network Indicator - Mobile */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Xphere Network</span>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">
                {/* Swap Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Swap</h3>
                  <div className="space-y-1">
                    <Link href="/swap" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/swap") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Simple Swap
                      </div>
                    </Link>
                    <Link href="/trading" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/trading") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Advanced Trading
                      </div>
                    </Link>
                    <Link href="/bridge" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/bridge") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Bridge Assets
                      </div>
                    </Link>
                    <Link href="/atomic-swap" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/atomic-swap") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Atomic Swap
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Options and Futures Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Options and Futures</h3>
                  <div className="space-y-1">
                    <Link href="/options" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/options") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Options Trading
                      </div>
                    </Link>
                    <Link href="/futures" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/futures") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Perpetual Futures
                      </div>
                    </Link>
                  </div>
                </div>

                {/* DeFi Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">DeFi</h3>
                  <div className="space-y-1">
                    <Link href="/pool" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/pool") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Liquidity Pools
                      </div>
                    </Link>
                    <Link href="/farm" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/farm") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Yield Farming
                      </div>
                    </Link>
                    <Link href="/flashloans" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/flashloans") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Flash Loans
                      </div>
                    </Link>
                  </div>
                </div>

                {/* XPS Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">XPS</h3>
                  <div className="space-y-1">
                    <Link href="/xps-purchase" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/xps-purchase") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Buy XPS Token
                      </div>
                    </Link>
                    <Link href="/xps-staking" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/xps-staking") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Stake XPS
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
                  </div>
                </div>

                {/* Minting Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Minting</h3>
                  <div className="space-y-1">
                    <Link href="/minting" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/minting") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        XIP-20 Mint
                      </div>
                    </Link>
                    <Link href="/memecoin" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/memecoin") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        MemeCoin
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Analytics Section */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Analytics</h3>
                  <div className="space-y-1">
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
                  </div>
                </div>

                {/* Security */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Security</h3>
                  <div className="space-y-1">
                    <Link href="/security" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActivePage("/security") 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-primary hover:bg-muted"
                      }`}>
                        Security
                      </div>
                    </Link>
                  </div>
                </div>
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
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Hexagon className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-semibold">XpSwap</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Production-ready DEX with XPS token ecosystem, advanced AMM, cross-chain bridge, and comprehensive DeFi features.
              </p>
            </div>

            {/* Products */}
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/swap"><a className="hover:text-purple-600">Swap</a></Link></li>
                <li><Link href="/trading"><a className="hover:text-purple-600">Trading</a></Link></li>
                <li><Link href="/pool"><a className="hover:text-purple-600">Pool</a></Link></li>
                <li><Link href="/farm"><a className="hover:text-purple-600">Farm</a></Link></li>
                <li><Link href="/bridge"><a className="hover:text-purple-600">Bridge</a></Link></li>
                <li><Link href="/minting"><a className="hover:text-purple-600">Minting</a></Link></li>
                <li><Link href="/xps-staking"><a className="hover:text-purple-600">XPS Staking</a></Link></li>
                <li><Link href="/xps-purchase"><a className="hover:text-purple-600">Buy XPS</a></Link></li>
              </ul>
            </div>

            {/* Advanced Trading */}
            <div>
              <h3 className="font-semibold mb-4">Advanced Trading</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link href="/options"><a className="hover:text-purple-600">Options</a></Link></li>
                <li><Link href="/futures"><a className="hover:text-purple-600">Futures</a></Link></li>
                <li><Link href="/flashloans"><a className="hover:text-purple-600">Flash Loans</a></Link></li>
                <li><Link href="/multichain-portfolio"><a className="hover:text-purple-600">Portfolio</a></Link></li>
                <li><Link href="/analytics"><a className="hover:text-purple-600">Analytics</a></Link></li>
                <li><Link href="/security"><a className="hover:text-purple-600">Security</a></Link></li>
                <li><Link href="/governance"><a className="hover:text-purple-600">Governance</a></Link></li>
              </ul>
            </div>

            {/* Resources & Support */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <li><a href="/DEVELOPERS_GUIDE.md" className="hover:text-purple-600">Documentation</a></li>
                <li><a href="/API_REFERENCE.md" className="hover:text-purple-600">API Reference</a></li>
                <li><a href="https://github.com/xpswap" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">GitHub</a></li>
              </ul>

              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="https://trendy.storydot.kr" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">Help Center</a></li>
                <li><a href="mailto:myid998877@gmail.com" className="hover:text-purple-600">Contact</a></li>
                <li><Link href="/bug-bounty"><a className="hover:text-purple-600">Bug Bounty</a></Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="https://x.com/xpsproject" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">X (Twitter)</a></li>
                <li><a href="https://t.me/xpscommunity" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">Telegram</a></li>
                <li><a href="https://xpsproject.blogspot.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">Blog</a></li>
                <li><a href="https://trendy.storydot.kr" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600">News</a></li>
                <li><Link href="/memecoin"><a className="hover:text-purple-600">MemeCoin</a></Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 XpSwap. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy-policy"><a className="hover:text-purple-600">Privacy Policy</a></Link>
              <Link href="/terms-of-service"><a className="hover:text-purple-600">Terms of Service</a></Link>
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