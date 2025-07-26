import React from "react";
import { Twitter, Send, Github, Users } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-1 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <img 
                  src="https://rebel-orangutan-6f0.notion.site/image/attachment%3Aea1e41e5-28b3-486e-bc20-978f86c7e213%3Alogo_xps3.png?table=block&id=22fa68fd-c4b9-80a2-93a5-edbcfa276af7&spaceId=5cba68fd-c4b9-81bc-873e-0003fe11fd03&width=860&userId=&cache=v2" 
                  alt="XPS" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">XpSwap</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Next-generation DeFi platform on Xphere Network
            </p>
            
            {/* Status Indicators */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 dark:text-green-400">Live on Xphere</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-600 dark:text-blue-400">Security Audited</span>
              </div>
            </div>
          </div>

          {/* Trading */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Trading</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/swap"><a className="hover:text-purple-600">🔄 Simple Swap</a></Link></li>
              <li><Link href="/trading"><a className="hover:text-purple-600">📊 Advanced Trading</a></Link></li>
              <li><Link href="/bridge"><a className="hover:text-purple-600">🌉 Bridge Assets</a></Link></li>
              <li><Link href="/atomic-swap"><a className="hover:text-purple-600">⚡ Atomic Swap</a></Link></li>
            </ul>
          </div>

          {/* DeFi & Tools */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">DeFi & Tools</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/pool"><a className="hover:text-purple-600">💧 Liquidity Pools</a></Link></li>
              <li><Link href="/farm"><a className="hover:text-purple-600">🌱 Yield Farming</a></Link></li>
              <li><Link href="/xps-staking"><a className="hover:text-purple-600">💎 XPS Staking</a></Link></li>
              <li><Link href="/xps-purchase"><a className="hover:text-purple-600">🛒 Buy XPS Token</a></Link></li>
              <li><Link href="/governance"><a className="hover:text-purple-600">🗳️ Governance</a></Link></li>
              <li><Link href="/minting"><a className="hover:text-purple-600">🪙 Token Minting</a></Link></li>
              <li><Link href="/memecoin"><a className="hover:text-purple-600">🔥 MemeCoin</a></Link></li>
              <li><Link href="/analytics"><a className="hover:text-purple-600">📈 Analytics</a></Link></li>
              <li><Link href="/multichain-portfolio"><a className="hover:text-purple-600">💼 Portfolio</a></Link></li>
              <li><Link href="/security"><a className="hover:text-purple-600">🛡️ Security</a></Link></li>
            </ul>
          </div>

          {/* Advanced Trading */}
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Advanced Trading</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/options"><a className="hover:text-purple-600">🎯 Options</a></Link></li>
              <li><Link href="/futures"><a className="hover:text-purple-600">⚡ Futures</a></Link></li>
              <li><Link href="/flashloans"><a className="hover:text-purple-600">💸 Flash Loans</a></Link></li>
            </ul>
            
            {/* Community */}
            <h3 className="font-semibold mb-4 mt-6 text-gray-900 dark:text-white">Community</h3>
            <div className="flex gap-3">
              <a 
                href="https://x.com/xpsproject" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-4 h-4 text-blue-500" />
              </a>
              <a 
                href="https://t.me/xpscommunity" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gradient-to-r from-blue-400/10 to-cyan-500/10 hover:from-blue-400/20 hover:to-cyan-500/20 transition-all duration-300 hover:scale-110"
              >
                <Send className="w-4 h-4 text-blue-400" />
              </a>
              <a 
                href="https://github.com/xpswap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gradient-to-r from-gray-600/10 to-gray-700/10 hover:from-gray-600/20 hover:to-gray-700/20 transition-all duration-300 hover:scale-110"
              >
                <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </a>
              <a 
                href="https://trendy.storydot.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300 hover:scale-110"
              >
                <Users className="w-4 h-4 text-purple-500" />
              </a>
            </div>
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
            <Link href="/bug-bounty"><a className="hover:text-purple-600">Bug Bounty</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
