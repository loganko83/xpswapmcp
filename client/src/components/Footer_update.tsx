      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/95 dark:to-black/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-75 animate-pulse" />
                  <Hexagon className="relative w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                  XpSwap
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
                Next-generation DeFi platform on Xphere Chain. Trade, earn, and build the future of decentralized finance.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {[
                  { icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-500', href: 'https://x.com/xpsproject' },
                  { icon: MessageSquare, label: 'Discord', color: 'hover:bg-indigo-500', href: '#' },
                  { icon: Send, label: 'Telegram', color: 'hover:bg-sky-500', href: 'https://t.me/xpscommunity' },
                  { icon: Github, label: 'GitHub', color: 'hover:bg-gray-700', href: '#' }
                ].map(({ icon: Icon, label, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center transition-all duration-300 ${color} hover:text-white`}
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Stay Updated</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Get the latest updates on XpSwap features and DeFi insights</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Products
              </h3>
              <ul className="space-y-3">
                {[
                  { name: 'Instant Swap', badge: 'Popular', href: '/swap' },
                  { name: 'Liquidity Pools', badge: null, href: '/pool' },
                  { name: 'Yield Farming', badge: 'High APY', href: '/farm' },
                  { name: 'XPS Staking', badge: 'New', href: '/xps-staking' },
                  { name: 'Cross-Chain Bridge', badge: null, href: '/bridge' },
                  { name: 'Analytics Dashboard', badge: null, href: '/analytics' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        {item.name}
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                Resources
              </h3>
              <ul className="space-y-3">
                {[
                  'Documentation',
                  'API Reference',
                  'Smart Contracts',
                  'Audit Reports',
                  'Bug Bounty',
                  'Brand Kit'
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-purple-500" />
                Support
              </h3>
              <ul className="space-y-3">
                {[
                  'Help Center',
                  'FAQ',
                  'Contact Us',
                  'Community',
                  'Status Page',
                  'Feedback'
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats Section */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl blur-xl" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              {[
                { value: '$2.5B+', label: 'Total Volume', icon: BarChart3 },
                { value: '500K+', label: 'Active Users', icon: Users },
                { value: '$450M', label: 'Total TVL', icon: TrendingUp },
                { value: '99.9%', label: 'Uptime', icon: Zap }
              ].map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <stat.icon className="w-5 h-5 mx-auto text-purple-500 dark:text-purple-400 opacity-50" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2025 XpSwap Protocol. All rights reserved.
                </p>
                
                {/* Network Status */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Xphere Network • Block 12,345,678
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <Link href="/privacy">
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Privacy
                  </a>
                </Link>
                <Link href="/terms">
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Terms
                  </a>
                </Link>
                <Link href="/cookies">
                  <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    Cookies
                  </a>
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Audited by CertiK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>