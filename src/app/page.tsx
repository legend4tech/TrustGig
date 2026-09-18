'use client';

import { motion } from 'framer-motion';
import { Rocket, Zap, ArrowRight, Lock, Globe, Code, Activity, CheckCircle2, Landmark } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="mesh-gradient-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>
      
      <main className="flex-1 flex flex-col items-center pt-32 text-center min-h-[90vh] pb-32 font-display relative z-10 overflow-hidden">
        
        {/* Animated Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-6xl w-full px-6 relative"
        >
          {/* Floating Elements (Decorative) */}
          <motion.div 
            animate={{ y: [0, -20, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-10 -left-10 md:left-10 hidden md:flex items-center gap-3 glass-card px-5 py-4 rounded-3xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)] z-20"
          >
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-text-muted font-sans uppercase tracking-widest font-bold">Payment Settled</span>
              <span className="text-sm font-black font-mono text-green-400">+500 USDC</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute top-20 -right-10 md:right-10 hidden md:flex items-center gap-3 glass-card px-5 py-4 rounded-3xl border border-brand-amber/30 shadow-[0_0_30px_rgba(245,165,36,0.15)] z-20"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-amber/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-amber" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-xs text-text-muted font-sans uppercase tracking-widest font-bold">Escrow Locked</span>
              <span className="text-sm font-black font-mono text-brand-amber">Smart Contract</span>
            </div>
          </motion.div>


          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.05]">
            TrustGig <br className="hidden md:block"/>
            <span className="neon-text">Freelance Economy</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-text-secondary mb-14 max-w-3xl mx-auto leading-relaxed font-sans font-medium">
            The decentralized gig platform powered by Stellar. Lock USDC in Soroban smart contracts. 
            Get paid instantly upon approval. <span className="text-white font-bold">Zero middlemen. Zero platform fees.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center font-sans relative z-30">
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-amber hover:bg-brand-amber/90 text-black rounded-2xl font-black text-lg transition-all duration-300 shadow-[0_0_30px_rgba(245,165,36,0.5)] hover:shadow-[0_0_40px_rgba(245,165,36,0.7)] hover:-translate-y-1 w-full sm:w-auto"
            >
              Start Hiring
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard/freelancer"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 glass-card hover:bg-surface-hover text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              Find Gigs
            </Link>
          </div>
        </motion.div>

        {/* Live Stats Section */}
        <motion.div 
          id="stats"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl mt-24 px-6 relative z-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
             <div className="glass-card p-6 rounded-[2rem] text-center border-t border-t-white/10">
               <h4 className="text-5xl font-black text-white mb-2 tracking-tighter">0%</h4>
               <p className="text-text-secondary text-xs font-sans uppercase tracking-widest font-bold">Platform Fees</p>
             </div>
             <div className="glass-card p-6 rounded-[2rem] text-center border-t border-t-white/10">
               <h4 className="text-5xl font-black text-white mb-2 tracking-tighter">&lt;5s</h4>
               <p className="text-text-secondary text-xs font-sans uppercase tracking-widest font-bold">Settlement Time</p>
             </div>
             <div className="glass-card p-6 rounded-[2rem] text-center border-t border-t-brand-amber/40 shadow-[0_-10px_30px_rgba(245,165,36,0.05)]">
               <h4 className="text-5xl font-black text-brand-amber mb-2 tracking-tighter">100%</h4>
               <p className="text-text-secondary text-xs font-sans uppercase tracking-widest font-bold">On-Chain Escrow</p>
             </div>
             <div className="glass-card p-6 rounded-[2rem] text-center border-t border-t-white/10">
               <h4 className="text-5xl font-black text-white mb-2 tracking-tighter">24/7</h4>
               <p className="text-text-secondary text-xs font-sans uppercase tracking-widest font-bold">Global Access</p>
             </div>
          </div>
        </motion.div>

        {/* Powered By Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full border-y border-white/5 bg-surface/20 py-16 mt-32 mb-20 backdrop-blur-xl relative z-10"
        >
          <p className="text-center text-sm font-bold text-text-muted uppercase tracking-widest mb-10 font-sans">Powered By</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-32">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Image src="/stellar-logo.png" alt="Stellar" fill className="object-contain p-2" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white">Stellar</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Image src="/pollar-logo.png" alt="Pollar" fill className="object-contain p-2" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white">Pollar</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <Image src="/trustless-work-logo.png" alt="Trustless Work" fill className="object-contain p-2" />
              </div>
              <span className="text-4xl font-black tracking-tighter text-white">Trustless Work</span>
            </div>
          </div>
        </motion.div>

        {/* Bento Box Features */}
        <motion.div 
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-10 max-w-6xl w-full px-6 relative z-10"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-16 tracking-tighter">The Future of Work is <br/><span className="neon-text">Trustless</span>.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px] text-left">
            
            {/* Bento Item 1 - Large */}
            <div className="md:col-span-2 md:row-span-1 glass-card rounded-[2.5rem] p-10 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-amber/10 rounded-full filter blur-[100px] group-hover:bg-brand-amber/20 transition-colors duration-700"></div>
              <div className="mb-6 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md relative z-10">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-4xl font-bold mb-4 text-white tracking-tight relative z-10">Zero-Trust Escrow</h3>
              <p className="text-text-secondary text-lg font-sans max-w-md relative z-10">Clients lock USDC in Soroban smart contracts. Funds are verifiable on-chain, eliminating non-payment anxiety for freelancers forever.</p>
            </div>

            {/* Bento Item 2 - Tall */}
            <div className="md:col-span-1 md:row-span-2 glass-card rounded-[2.5rem] p-10 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-brand-amber/10 to-transparent"></div>
              <div className="mb-6 w-14 h-14 rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center backdrop-blur-md text-brand-amber shadow-[0_0_20px_rgba(245,165,36,0.3)] relative z-10">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-4xl font-bold mb-4 text-white tracking-tight relative z-10">Instant Settlement</h3>
              <p className="text-text-secondary text-lg font-sans relative z-10">No more waiting 14 days for clearance. As soon as the client hits approve, the smart contract settles payment in under 5 seconds.</p>
            </div>

            {/* Bento Item 3 - Square */}
            <div className="md:col-span-1 md:row-span-1 glass-card rounded-[2.5rem] p-10 flex flex-col justify-end group">
              <div className="mb-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Developer Native</h3>
              <p className="text-text-secondary font-sans">Submit your GitHub repos directly as cryptographically secured proof of work.</p>
            </div>

            {/* Bento Item 4 - Square */}
            <div className="md:col-span-1 md:row-span-1 glass-card rounded-[2.5rem] p-10 flex flex-col justify-end group">
               <div className="mb-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Fiat Ramps</h3>
              <p className="text-text-secondary font-sans">Seamlessly on-ramp to fund escrows and off-ramp earnings to your bank via Pollar.</p>
            </div>
          </div>
        </motion.div>

        {/* The Problem / Solution (Split View) */}
        <motion.div 
          id="how-it-works"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 max-w-6xl w-full px-6 relative z-10 text-left"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-12 md:p-16 rounded-[3rem] border-t border-t-red-500/20 group hover:border-red-500/40 transition-colors">
              <div className="w-16 h-16 rounded-[2rem] bg-red-500/10 flex items-center justify-center mb-10 border border-red-500/20">
                <Activity className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-4xl font-black mb-6 text-white tracking-tight">The Old Way</h3>
              <ul className="space-y-6 font-sans text-lg text-text-secondary">
                <li className="flex items-center gap-4"><span className="text-red-400 font-black">✗</span> Up to 20% platform fees stolen from you</li>
                <li className="flex items-center gap-4"><span className="text-red-400 font-black">✗</span> 14-day hold on cleared funds</li>
                <li className="flex items-center gap-4"><span className="text-red-400 font-black">✗</span> Centralized arbitrary account bans</li>
                <li className="flex items-center gap-4"><span className="text-red-400 font-black">✗</span> High risk of client ghosting & non-payment</li>
              </ul>
            </div>
            
            <div className="glass-card p-12 md:p-16 rounded-[3rem] border-t neon-border bg-gradient-to-br from-brand-amber/5 to-transparent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-amber/10 rounded-full filter blur-[80px] -z-10"></div>
              <div className="w-16 h-16 rounded-[2rem] bg-brand-amber/10 flex items-center justify-center mb-10 border border-brand-amber/20 shadow-[0_0_20px_rgba(245,165,36,0.3)]">
                <Rocket className="w-8 h-8 text-brand-amber" />
              </div>
              <h3 className="text-4xl font-black mb-6 text-white tracking-tight">The TrustGig Way</h3>
              <ul className="space-y-6 font-sans text-lg text-white font-medium">
                <li className="flex items-center gap-4"><span className="text-brand-amber font-black text-xl">✓</span> 0% platform fees</li>
                <li className="flex items-center gap-4"><span className="text-brand-amber font-black text-xl">✓</span> Instant <span className="font-mono text-sm bg-white/10 px-2 py-1 rounded-md mx-1 border border-white/10">&lt;5s</span> settlement on-chain</li>
                <li className="flex items-center gap-4"><span className="text-brand-amber font-black text-xl">✓</span> Censorship resistant structure</li>
                <li className="flex items-center gap-4"><span className="text-brand-amber font-black text-xl">✓</span> Cryptographically secured escrows</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* How It Works (End-to-End Flow) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-32 max-w-6xl w-full px-6 relative z-10 text-left"
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">How TrustGig <span className="neon-text">Works</span></h2>
            <p className="text-xl text-text-secondary font-sans max-w-2xl mx-auto">From posting a gig to fiat withdrawal in 5 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/10 via-brand-amber/40 to-green-500/10 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass-card border border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Globe className="w-10 h-10 text-blue-400" />
              </div>
              <div className="bg-blue-500/10 text-blue-400 text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 1</div>
              <h3 className="text-lg font-bold text-white mb-2">Post & Apply</h3>
              <p className="text-text-secondary font-sans text-sm">The client posts a gig to the global marketplace, and verified freelancers submit their applications.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass-card border border-brand-amber/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,165,36,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Lock className="w-10 h-10 text-brand-amber" />
              </div>
              <div className="bg-brand-amber/10 text-brand-amber text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 2</div>
              <h3 className="text-lg font-bold text-white mb-2">Assign & Tokenize</h3>
              <p className="text-text-secondary font-sans text-sm">The client selects a freelancer and securely locks the USDC budget into a Trustless Work smart contract.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass-card border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Code className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="bg-indigo-500/10 text-indigo-400 text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 3</div>
              <h3 className="text-lg font-bold text-white mb-2">Freelancer Delivers</h3>
              <p className="text-text-secondary font-sans text-sm">The freelancer completes the job and securely submits their final work and code for review.</p>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass-card border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
              <div className="bg-purple-500/10 text-purple-400 text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 4</div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Settlement</h3>
              <p className="text-text-secondary font-sans text-sm">Upon client approval, the smart contract instantly releases the locked USDC to the freelancer.</p>
            </div>

            {/* Step 5 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass-card border border-green-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] group-hover:scale-110 transition-transform duration-500">
                <Landmark className="w-10 h-10 text-green-400" />
              </div>
              <div className="bg-green-500/10 text-green-400 text-xs font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Step 5</div>
              <h3 className="text-lg font-bold text-white mb-2">Withdraw to Fiat</h3>
              <p className="text-text-secondary font-sans text-sm">The freelancer off-ramps their earned USDC directly into their local bank account via Pollar.</p>
            </div>
          </div>
        </motion.div>

        {/* Massive CTA Footer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-40 max-w-6xl w-full px-6 relative z-10"
        >
          <div className="glass-card rounded-[3rem] p-16 md:p-32 text-center relative overflow-hidden border border-brand-amber/30">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] max-w-4xl bg-brand-amber/20 rounded-full filter blur-[120px] -z-10 animate-pulse"></div>
             
             <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-white leading-[1.1]">Ready to join the <br/>future of work?</h2>
             <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-sans font-medium">
               Join the fastest growing decentralized gig economy. Lock funds securely. Get paid instantly. Build the future of work.
             </p>
             <div className="flex flex-col sm:flex-row gap-6 justify-center items-center font-sans">
                <Link
                  href="/auth/signup"
                  className="px-12 py-6 bg-brand-amber hover:bg-brand-amber/90 text-black rounded-2xl font-black text-xl transition-all duration-300 shadow-[0_0_40px_rgba(245,165,36,0.6)] hover:shadow-[0_0_60px_rgba(245,165,36,0.8)] hover:-translate-y-2 w-full sm:w-auto"
                >
                  Create an Account
                </Link>
             </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
