import React from "react";
import { Link } from "wouter";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  isActivePage: (path: string) => boolean;
}

export function MobileNavigation({ isOpen, onClose, isActivePage }: MobileNavigationProps) {
  if (!isOpen) return null;

  return (
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
              <Link href="/swap" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/swap") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Simple Swap
                </div>
              </Link>
              <Link href="/trading" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/trading") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Advanced Trading
                </div>
              </Link>
              <Link href="/bridge" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/bridge") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Bridge Assets
                </div>
              </Link>
              <Link href="/atomic-swap" onClick={onClose}>
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
              <Link href="/options" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/options") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Options Trading
                </div>
              </Link>
              <Link href="/futures" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/futures") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Perpetual Futures
                </div>
              </Link>
              <Link href="/flashloans" onClick={onClose}>
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

          {/* DeFi Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">DeFi</h3>
            <div className="space-y-1">
              <Link href="/pool" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/pool") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Liquidity Pools
                </div>
              </Link>
              <Link href="/farm" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/farm") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Yield Farming
                </div>
              </Link>
            </div>
          </div>
          {/* XPS Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">XPS</h3>
            <div className="space-y-1">
              <Link href="/xps-purchase" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/xps-purchase") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Buy XPS Token
                </div>
              </Link>
              <Link href="/xps-staking" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/xps-staking") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  XPS Staking
                </div>
              </Link>
              <Link href="/governance" onClick={onClose}>
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

          {/* Create Token Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Create Token</h3>
            <div className="space-y-1">
              <Link href="/minting" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/minting") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  XIP-20 Mint
                </div>
              </Link>
              <Link href="/memecoin" onClick={onClose}>
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
              <Link href="/analytics" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/analytics") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Analytics
                </div>
              </Link>
              <Link href="/multichain-portfolio" onClick={onClose}>
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

          {/* Security Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Security</h3>
            <div className="space-y-1">
              <Link href="/security" onClick={onClose}>
                <div className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePage("/security") 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}>
                  Security Dashboard
                </div>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
