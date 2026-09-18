'use client';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlusCircle, Briefcase, Activity, CheckCircle2, ChevronRight, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IGig } from '@/types';

export default function ClientOverview() {
  const { data: session } = useSession();
  const router = useRouter();

  // React Query for Gigs
  const { data: gigs = [], isLoading: isLoadingGigs } = useQuery<IGig[]>({
    queryKey: ['clientGigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      if (!res.ok) throw new Error('Failed to fetch gigs');
      const data = await res.json();
      return data.gigs || [];
    },
    enabled: !!session,
  });

  // Calculate Stats
  const totalGigs = gigs.length;
  const activeGigs = gigs.filter((g: IGig) => ['open', 'pending_approval', 'in_progress', 'review'].includes(g.status)).length;
  
  const totalLocked = gigs
    .filter((g: IGig) => ['in_progress', 'review', 'pending_approval'].includes(g.status))
    .reduce((acc: number, g: IGig) => acc + Number(g.budget), 0);

  const totalSpent = gigs
    .filter((g: IGig) => ['completed', 'paid'].includes(g.status))
    .reduce((acc: number, g: IGig) => acc + Number(g.budget), 0);

  const recentGigs = gigs.slice(0, 3); // top 3 most recent

  if (!session) return null;

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Overview</h1>
          <p className="text-text-secondary mt-2">Welcome back, manage your escrow contracts and monitor progress.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {session?.user?.walletAddress && (
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${session.user.walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-xl font-bold transition-all hover:bg-brand-amber/20"
            >
              <ExternalLink className="w-5 h-5" /> View on Stellar Explorer
            </a>
          )}
          <Link 
            href="/dashboard/client/create"
            className="flex items-center gap-2 px-6 py-3 bg-brand-amber hover:bg-brand-amber/90 text-black rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)] hover:shadow-[0_0_20px_rgba(245,165,36,0.5)] hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" /> Tokenize a Gig
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-amber/10 rounded-xl border border-brand-amber/20">
              <Briefcase className="w-5 h-5 text-brand-amber" />
            </div>
            <span className="font-bold text-text-secondary">Total Projects</span>
          </div>
          <h3 className="text-3xl font-black text-text-primary">{totalGigs}</h3>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <span className="font-bold text-text-secondary">Active Contracts</span>
          </div>
          <h3 className="text-3xl font-black text-text-primary">{activeGigs}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="font-bold text-text-secondary">USDC Locked</span>
          </div>
          <h3 className="text-3xl font-black text-text-primary">{totalLocked.toFixed(2)} <span className="text-base font-medium text-text-muted">USDC</span></h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <span className="font-bold text-text-secondary">Total Spent</span>
          </div>
          <h3 className="text-3xl font-black text-text-primary">{totalSpent.toFixed(2)} <span className="text-base font-medium text-text-muted">USDC</span></h3>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-8 rounded-3xl mt-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-amber/10 rounded-lg border border-brand-amber/20">
              <Briefcase className="w-5 h-5 text-brand-amber" />
            </div>
            <h2 className="text-2xl font-black text-text-primary">Recent Projects</h2>
          </div>
          <Link href="/dashboard/client/gigs" className="text-sm font-bold text-brand-amber hover:text-brand-amber/80 flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingGigs ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div></div>
        ) : recentGigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface border border-border rounded-2xl">
            <Briefcase className="w-12 h-12 text-text-muted mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary max-w-sm mb-6">Create your first gig to start building with the best freelancers.</p>
            <Link 
              href="/dashboard/client/create"
              className="px-6 py-2.5 bg-brand-amber hover:bg-brand-amber/80 text-black rounded-xl font-bold transition-all"
            >
              Post a Gig
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recentGigs.map((gig: IGig) => {
              const statusColors: Record<string, string> = {
                open: 'text-green-500 bg-green-500/10 border-green-500/20',
                completed: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                paid: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                review: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                pending_approval: 'text-brand-amber bg-brand-amber/10 border-brand-amber/20',
                in_progress: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
              };
              const currentStatusColor = statusColors[gig.status] || 'text-text-secondary bg-surface border-border';

              return (
                <div key={gig._id} onClick={() => router.push('/dashboard/client/gigs')} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-surface/50 backdrop-blur-md border border-border hover:border-brand-amber/30 rounded-2xl transition-all duration-300 cursor-pointer hover:shadow-[0_8px_30px_rgba(245,165,36,0.06)] overflow-hidden">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${currentStatusColor}`}>
                        {gig.status.replace('_', ' ')}
                      </span>
                      {gig.deadline && (
                        <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Due {new Date(gig.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-text-primary group-hover:text-brand-amber transition-colors mb-1 line-clamp-1">{gig.title}</h3>
                    <p className="text-text-secondary text-sm line-clamp-1">{gig.description}</p>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-2 min-w-[160px]">
                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end bg-background/50 sm:bg-transparent border border-border/50 sm:border-transparent px-4 py-2 sm:p-0 rounded-xl">
                      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-0.5 sm:hidden">Budget</span>
                      <span className="text-xl sm:text-2xl font-black text-text-primary leading-none">
                        {gig.budget} <span className="text-xs font-bold text-text-muted">USDC</span>
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface border border-border group-hover:border-brand-amber/30 flex items-center justify-center transition-all">
                      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-amber transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
