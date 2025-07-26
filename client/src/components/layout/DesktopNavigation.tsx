import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { ArrowRightLeft, BarChart3, Target, Zap, Droplets, ArrowUpDown, Coins, TrendingUp, ShoppingCart, Award, Shield, Vote, Flame, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";

export function DesktopNavigation() {
  const [location, navigate] = useLocation();

  const isActivePage = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
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
          <DropdownMenuItem onClick={() => navigate("/swap")} className="flex items-center gap-2 w-full cursor-pointer">
            <ArrowRightLeft className="w-4 h-4" />
            Simple Swap
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/trading")} className="flex items-center gap-2 w-full cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Advanced Trading
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Options and Futures</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate("/options")} className="flex items-center gap-2 w-full cursor-pointer">
            <Target className="w-4 h-4" />
            Options Trading
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/futures")} className="flex items-center gap-2 w-full cursor-pointer">
            <Zap className="w-4 h-4" />
            Perpetual Futures
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/flashloans")} className="flex items-center gap-2 w-full cursor-pointer">
            <Flame className="w-4 h-4" />
            Flash Loans
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Cross-Chain</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate("/bridge")} className="flex items-center gap-2 w-full cursor-pointer">
            <ArrowUpDown className="w-4 h-4" />
            Bridge Assets
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/atomic-swap")} className="flex items-center gap-2 w-full cursor-pointer">
            <ArrowRightLeft className="w-4 h-4" />
            Atomic Swap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DeFi Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              DeFi
              <ChevronDown className="w-3 h-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => navigate("/pool")} className="flex items-center gap-2 w-full cursor-pointer">
            <Droplets className="w-4 h-4" />
            Liquidity Pools
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/farm")} className="flex items-center gap-2 w-full cursor-pointer">
            <TrendingUp className="w-4 h-4" />
            Yield Farming
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* XPS Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              XPS
              <ChevronDown className="w-3 h-3" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => navigate("/xps-purchase")} className="flex items-center gap-2 w-full cursor-pointer">
            <ShoppingCart className="w-4 h-4" />
            Buy XPS Token
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/xps-staking")} className="flex items-center gap-2 w-full cursor-pointer">
            <Award className="w-4 h-4" />
            XPS Staking
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/governance")} className="flex items-center gap-2 w-full cursor-pointer">
            <Vote className="w-4 h-4" />
            Governance
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
          <DropdownMenuItem onClick={() => navigate("/minting")} className="flex items-center gap-2 w-full cursor-pointer">
            <Coins className="w-4 h-4" />
            XIP-20 Mint
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/memecoin")} className="flex items-center gap-2 w-full cursor-pointer">
            <Flame className="w-4 h-4" />
            MemeCoin
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
          <DropdownMenuItem onClick={() => navigate("/analytics")} className="flex items-center gap-2 w-full cursor-pointer">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/multichain-portfolio")} className="flex items-center gap-2 w-full cursor-pointer">
            <TrendingUp className="w-4 h-4" />
            Portfolio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Security */}
      <Link href="/security">
        <Button variant="ghost" className={`text-sm font-medium p-0 h-auto ${
          isActivePage("/security") ? "text-primary" : "text-muted-foreground hover:text-primary"
        }`}>
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Security
          </div>
        </Button>
      </Link>
    </nav>
  );
}
