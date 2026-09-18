'use client';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { usePollar } from '@pollar/react';
import { Wallet, LogOut, LayoutDashboard, Briefcase, PlusCircle, Copy, Menu } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const { wallet: activeWallet, openLoginModal, configStatus, walletBalance, refreshWalletBalance, setTrustline } = usePollar();
  const isPollarLoading = configStatus === 'loading';
  const queryClient = useQueryClient();
  const [linking, setLinking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const pathname = usePathname();
  const walletAddress = session?.user?.walletAddress;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  const getDisplayBalance = () => {
    if (walletBalance?.step === 'loaded') {
      const usdcBalance = walletBalance.data.balances.find(b => b.code === 'USDC');
      const nativeBalance = walletBalance.data.balances.find(b => b.type === 'native' || b.code === 'XLM');
      const usdcStr = usdcBalance ? `${Number(usdcBalance.balance).toFixed(2)} USDC` : '0.00 USDC';
      const xlmStr = nativeBalance ? `${Number(nativeBalance.balance).toFixed(2)} XLM` : '0.00 XLM';
      return `${xlmStr} | ${usdcStr}`;
    }
    return '...';
  };

  useEffect(() => {
    if (activeWallet && walletBalance?.step === 'idle') {
      refreshWalletBalance();
    }
  }, [activeWallet, walletBalance?.step, refreshWalletBalance]);

  useEffect(() => {
    const linkWallet = async () => {
      if (activeWallet && session?.user && !walletAddress && !linking) {
        setLinking(true);
        try {
          const res = await fetch('/api/users/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: activeWallet.address }),
          });

          if (!res.ok) throw new Error('Failed to link wallet');
          
          await update({ walletAddress: activeWallet.address });
          toast.success('Wallet connected successfully!');
          queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          toast.error(errMsg);
        } finally {
          setLinking(false);
        }
      }
    };
    linkWallet();
  }, [activeWallet, session, walletAddress, update, linking, queryClient]);

  const navLinks = [
    { name: 'Overview', href: '/dashboard/client', icon: LayoutDashboard },
    { name: 'All Gigs', href: '/dashboard/client/gigs', icon: Briefcase },
    { name: 'Create Gig', href: '/dashboard/client/create', icon: PlusCircle },
  ];

  if (!session) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 bg-surface border-r border-border w-64 flex flex-col">
          <SheetHeader className="p-6 border-b border-border h-20 text-left shrink-0">
            <SheetTitle>
              <Link href="/" className="text-2xl font-black neon-text font-display" onClick={() => setIsSidebarOpen(false)}>TrustGig</Link>
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                    isActive 
                    ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20 shadow-[0_0_10px_rgba(245,165,36,0.1)]' 
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-border shrink-0">
            <AlertDialog>
              <AlertDialogTrigger render={
                <button className="flex items-center justify-center w-full gap-2 px-4 py-3.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl font-bold transition-all hover:text-red-400 hover:border-red-500/30">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              } />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to sign back in to access your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-500 hover:bg-red-600 text-white">
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex-col shrink-0">
        <div className="p-6 flex items-center justify-between border-b border-border h-20 shrink-0">
          <Link href="/" className="text-2xl font-black neon-text font-display">TrustGig</Link>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                  isActive 
                  ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20 shadow-[0_0_10px_rgba(245,165,36,0.1)]' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-border shrink-0">
          <AlertDialog>
            <AlertDialogTrigger render={
              <button className="flex items-center justify-center w-full gap-2 px-4 py-3.5 bg-surface hover:bg-surface-hover border border-border text-text-primary rounded-xl font-bold transition-all hover:text-red-400 hover:border-red-500/30">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            } />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will need to sign back in to access your dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => signOut({ callbackUrl: '/' })} className="bg-red-500 hover:bg-red-600 text-white border-0">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Powered By Banner */}
        <div className="w-full bg-surface/50 border-b border-border py-1.5 flex items-center justify-center gap-4 text-xs shrink-0">
          <span className="text-text-muted font-bold tracking-widest text-[10px] uppercase">Powered By</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="relative w-4 h-4 rounded-full bg-white flex items-center justify-center overflow-hidden"><Image src="/stellar-logo.png" alt="Stellar" fill className="object-contain p-0.5" /></div>
              <span className="font-bold text-white text-[10px]">Stellar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative w-4 h-4 rounded-full bg-white flex items-center justify-center overflow-hidden"><Image src="/pollar-logo.png" alt="Pollar" fill className="object-contain p-0.5" /></div>
              <span className="font-bold text-white text-[10px]">Pollar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="relative w-4 h-4 rounded-full bg-white flex items-center justify-center overflow-hidden"><Image src="/trustless-work-logo.png" alt="Trustless Work" fill className="object-contain p-0.5" /></div>
              <span className="font-bold text-white text-[10px]">Trustless Work</span>
            </div>
          </div>
        </div>
        {/* Top Navbar */}
        <header className="min-h-16 py-3 md:py-0 md:h-20 border-b border-border bg-background/90 backdrop-blur flex flex-wrap items-center justify-between px-4 md:px-6 gap-2 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-2 shrink-0">
            <button className="md:hidden text-text-primary p-2 -ml-2 rounded-lg hover:bg-surface" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-text-primary hidden md:block">Client Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {walletAddress ? (
              <div className="flex flex-wrap justify-end items-center gap-2 max-w-[calc(100vw-80px)] md:max-w-none">
                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2.5 bg-surface border border-border rounded-xl shadow-sm shrink-0">
                  <Wallet className="w-3 h-3 md:w-4 md:h-4 text-brand-amber shrink-0" /> 
                  <span className="text-[10px] md:text-sm font-mono text-text-primary font-bold">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  <button onClick={copyAddress} className="text-text-muted hover:text-text-primary transition-colors ml-1 shrink-0" title="Copy Address">
                    <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
                {walletBalance?.step === 'loaded' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2.5 bg-brand-amber/10 border border-brand-amber/20 rounded-xl shadow-[0_0_10px_rgba(245,165,36,0.1)] shrink-0">
                    <span className="text-[10px] md:text-sm font-black text-brand-amber">{getDisplayBalance()}</span>
                  </div>
                )}
                <button 
                  onClick={async () => {
                    try {
                      toast.loading('Setting up USDC Trustline...', { id: 'trustline' });
                      await setTrustline({
                        code: 'USDC',
                        issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
                      });
                      toast.success('Trustline setup! Go to https://faucet.circle.com to mint Testnet USDC.', { id: 'trustline', duration: 10000 });
                      window.open('https://faucet.circle.com', '_blank');
                    } catch (e) {
                      toast.error((e as Error).message || 'Failed to setup trustline', { id: 'trustline' });
                    }
                  }}
                  className="flex items-center text-[10px] md:text-xs font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 md:px-4 md:py-2.5 rounded-xl transition-colors border border-blue-500/20 shrink-0"
                >
                  <PlusCircle className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 shrink-0" />
                  Setup USDC
                </button>
              </div>
            ) : (
              <button
                onClick={() => openLoginModal()}
                disabled={linking || isPollarLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-amber hover:bg-brand-amber/80 disabled:bg-brand-amber/50 text-black rounded-xl font-extrabold transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)]"
              >
                {(linking || isPollarLoading) ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
