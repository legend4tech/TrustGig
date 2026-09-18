'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/20 backdrop-blur-3xl rounded-2xl px-6 py-4 flex items-center justify-between border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-amber flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(245,165,36,0.5)] group-hover:shadow-[0_0_25px_rgba(245,165,36,0.8)] transition-all">
              T
            </div>
            <span className="text-xl font-black font-display tracking-tight text-white">
              Trust<span className="text-brand-amber">Gig</span>
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold font-sans">
             <Link href="#features" className="text-text-secondary hover:text-white transition-colors">Features</Link>
             <Link href="#how-it-works" className="text-text-secondary hover:text-white transition-colors">How it Works</Link>
             <Link href="#stats" className="text-text-secondary hover:text-white transition-colors">Stats</Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 font-sans font-bold text-sm">
            <Link 
              href="/auth/login" 
              className="text-text-secondary hover:text-white transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-5 py-2.5 bg-brand-amber hover:bg-brand-amber/90 text-black rounded-xl border border-brand-amber/50 shadow-[0_0_15px_rgba(245,165,36,0.3)] transition-all"
            >
              Get Started
            </Link>
          </div>

        </div>
      </div>
    </motion.nav>
  );
}
