'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#features', label: 'Features' },
    {
      href: '#tools',
      label: 'Tools',
      dropdown: [
        { href: '#upload', label: 'Data Analysis' },
        { href: '/ml-analysis', label: 'Machine Learning Analysis' },
      ],
    },
    { href: '#examples', label: 'Examples' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-purple-700/20 shadow-2xl shadow-purple-500/10'
          : 'bg-gray-900/80 backdrop-blur-md border-b border-gray-800/50'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-purple-600/5 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                <div className="relative w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 12h2v5H7v-5zm4-6h2v11h-2V6zm4 3h2v8h-2V9z" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-500">
                  AnalyticsHub
                </span>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </Link>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {item.dropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setIsToolsDropdownOpen(true)}
                    onMouseLeave={() => setIsToolsDropdownOpen(false)}
                  >
                    <span className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg group-hover:bg-gray-800/50 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <span className="relative z-10 font-medium">{item.label}</span>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3/4 transition-all duration-500 rounded-full" />
                    </span>
                    <AnimatePresence>
                      {isToolsDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-lg shadow-lg border border-purple-700/20 py-2"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 rounded-lg group-hover:bg-gray-800/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <span className="relative z-10 font-medium">{item.label}</span>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-3/4 transition-all duration-500 rounded-full" />
                  </Link>
                )}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="ml-8"
            >
              <Link
                href="#upload"
                className="group relative inline-flex items-center px-6 py-3 overflow-hidden text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 scale-75 group-hover:scale-100" />
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Start Analysis</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          </div>

          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 transform transition duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 mt-1 transform transition duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 mt-1 transform transition duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-gray-900/98 backdrop-blur-xl border-t border-purple-500/20 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {item.dropdown ? (
                    <div>
                      <span className="block px-4 py-3 text-gray-300 font-medium">{item.label}</span>
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-8 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group block px-4 py-3 text-gray-300 hover:text-white font-medium rounded-lg hover:bg-gray-800/50 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="pt-4"
              >
                <Link
                  href="#upload"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group relative inline-flex items-center justify-center w-full px-6 py-4 overflow-hidden text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center space-x-2">
                    <span>Start Analysis</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;