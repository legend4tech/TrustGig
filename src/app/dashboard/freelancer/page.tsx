'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, DollarSign, Clock, CheckCircle2, ArrowRight, Calendar, Activity, Search, FileText, Landmark, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { IGig } from '@/types';

export default function FreelancerOverview() {
  const { data: session } = useSession();

  const { data: gigs = [], isLoading } = useQuery({
    queryKey: ['freelancerGigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      if (!res.ok) throw new Error('Failed to fetch gigs');
      const data = await res.json();
      return data.gigs || [];
    },
    enabled: !!session,
  });

  const myGigs = gigs.filter((g: IGig) => 
    g.freelancerId === session?.user?.id || (g.freelancerId && typeof g.freelancerId !== 'string' && g.freelancerId._id === session?.user?.id)
  );

  const stats = {
    earned: myGigs.filter((g: IGig) => g.status === 'paid').reduce((sum: number, g: IGig) => sum + Number(g.budget), 0),
    pending: myGigs.filter((g: IGig) => ['pending_approval', 'in_progress', 'review'].includes(g.status)).reduce((sum: number, g: IGig) => sum + Number(g.budget), 0),
    completedCount: myGigs.filter((g: IGig) => g.status === 'paid').length,
    activeCount: myGigs.filter((g: IGig) => g.status === 'in_progress').length,
  };

  const recentActivity = myGigs.slice(0, 3); // Since the API sorts by createdAt: -1

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Overview</h1>
          <p className="text-text-secondary mt-2">Welcome back, {session.user?.name?.split(' ')[0] || 'Freelancer'}! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {session?.user?.walletAddress && (
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${session.user.walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <ExternalLink className="w-4 h-4" /> View on Stellar Explorer
            </a>
          )}
          <button 
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface text-text-primary border border-border rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Landmark className="w-4 h-4 text-green-400" /> Withdraw to Bank
          </button>
          <Link href="/dashboard/freelancer/gigs" className="flex items-center gap-2 px-5 py-2.5 bg-brand-amber text-black rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            Find New Gigs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl border border-border/50 hover:border-brand-amber/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-2xl">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-text-secondary font-medium mb-1">Total Earned</h3>
          <div className="text-2xl font-black text-text-primary">{stats.earned.toFixed(2)} <span className="text-sm text-text-muted font-medium">USDC</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl border border-border/50 hover:border-brand-amber/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-text-secondary font-medium mb-1">Pending Escrow</h3>
          <div className="text-2xl font-black text-text-primary">{stats.pending.toFixed(2)} <span className="text-sm text-text-muted font-medium">USDC</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl border border-border/50 hover:border-brand-amber/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-text-secondary font-medium mb-1">Active Gigs</h3>
          <div className="text-2xl font-black text-text-primary">{stats.activeCount} <span className="text-sm text-text-muted font-medium">Gigs</span></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-3xl border border-border/50 hover:border-brand-amber/30 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-text-secondary font-medium mb-1">Completed</h3>
          <div className="text-2xl font-black text-text-primary">{stats.completedCount} <span className="text-sm text-text-muted font-medium">Gigs</span></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-8 rounded-3xl min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
            <Link href="/dashboard/freelancer/applications" className="text-sm font-medium text-brand-amber hover:text-brand-amber/80 transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div></div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 bg-surface rounded-full mb-6 border border-border">
                <LayoutDashboard className="w-12 h-12 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No recent activity</h3>
              <p className="text-text-secondary max-w-sm">You haven&apos;t applied for any gigs yet.</p>
              <Link href="/dashboard/freelancer/gigs" className="mt-6 px-6 py-3 bg-surface hover:bg-surface-hover border border-border rounded-xl font-bold transition-all text-text-primary">
                Explore Gigs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((gig: IGig) => (
                <div key={gig._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface border border-border rounded-2xl hover:border-brand-amber/30 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-primary mb-1 line-clamp-1">{gig.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(gig.createdAt || '').toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 font-bold text-text-primary"><DollarSign className="w-3.5 h-3.5 text-brand-amber" /> {gig.budget} USDC</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${gig.status === 'open' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : gig.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : gig.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {gig.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 rounded-3xl h-fit"
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/freelancer/gigs" className="flex items-center justify-between p-4 bg-surface hover:bg-surface-hover border border-border rounded-2xl transition-all group">
              <span className="font-bold text-text-primary group-hover:text-brand-amber transition-colors">Find Gigs</span>
              <div className="p-2 bg-background rounded-full group-hover:bg-brand-amber/10 transition-colors"><Search className="w-4 h-4 text-text-secondary group-hover:text-brand-amber" /></div>
            </Link>
            <Link href="/dashboard/freelancer/applications" className="flex items-center justify-between p-4 bg-surface hover:bg-surface-hover border border-border rounded-2xl transition-all group">
              <span className="font-bold text-text-primary group-hover:text-brand-amber transition-colors">My Applications</span>
              <div className="p-2 bg-background rounded-full group-hover:bg-brand-amber/10 transition-colors"><FileText className="w-4 h-4 text-text-secondary group-hover:text-brand-amber" /></div>
            </Link>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isWithdrawModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsWithdrawModalOpen(false)} 
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <Landmark className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-black mb-4 text-text-primary">Withdraw to Bank</h2>
                <p className="text-text-secondary leading-relaxed mb-8">
                  This project is currently on <strong className="text-brand-amber">testnet</strong>, that&apos;s why it&apos;s not working right now. But on <strong className="text-green-400">mainnet</strong>, you will be able to move your earnings directly to fiat with the power of Pollar!
                </p>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-full py-4 bg-surface hover:bg-surface-hover border border-border text-text-primary font-extrabold rounded-xl transition-all"
                >
                  Got it!
                </button>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Powered by</span>
                  <div className="flex items-center gap-1.5 text-text-primary font-black">
                    <div className="relative w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <Image src="/pollar-logo.png" alt="Pollar" fill className="object-contain p-0.5" />
                    </div>
                    Pollar
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
