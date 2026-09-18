'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePollar } from '@pollar/react';
import { useInitializeEscrow, useSendTransaction, useReleaseFunds, useApproveMilestone, useFundEscrow } from '@trustless-work/escrow/hooks';
import { InitializeSingleReleaseEscrowPayload, SingleReleaseReleaseFundsPayload, ApproveMilestonePayload, FundEscrowPayload } from '@trustless-work/escrow/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronRight, User, Clock, CheckCircle, CheckCircle2, Edit2, X, Upload, FileText, Calendar, Code, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { ExpandableText } from '@/components/ui/expandable-text';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { IGig, IUser } from '@/types';

const parseErrorMsg = (error: unknown): string => {
  if (error && typeof error === 'object') {
    if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
      const data = (error.response as { data: unknown }).data;
      if (typeof data === 'object' && data !== null && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
        return (data as { message: string }).message;
      }
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string') {
            return parsed.message;
          }
        } catch {}
        return data;
      }
    }
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string') {
          return parsed.message;
        }
      } catch {}
      return error.message;
    }
  }
  if (typeof error === 'string') return error;
  return 'Unknown error';
};

const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith('image/');

  React.useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-surface flex items-center gap-3 pr-3 h-14 transition-colors hover:border-brand-amber/50">
      {isImage && previewUrl ? (
        <div className="w-14 h-14 shrink-0 bg-background relative flex items-center justify-center overflow-hidden border-r border-border">
          <Image src={previewUrl} alt={file.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 bg-background flex items-center justify-center border-r border-border">
          <FileText className="w-5 h-5 text-text-muted" />
        </div>
      )}
      <div className="flex flex-col overflow-hidden py-1">
        <span className="truncate max-w-[120px] sm:max-w-[180px] text-xs font-bold text-text-primary">{file.name}</span>
        <span className="text-[10px] text-text-muted font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
      <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-300 ml-auto p-1.5 hover:bg-red-400/10 rounded-md transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};


export default function ClientGigsPage() {
  const { data: session } = useSession();
  const { wallet: activeWallet, signTx } = usePollar();
  const { deployEscrow } = useInitializeEscrow();
  const { sendTransaction } = useSendTransaction();
  const { releaseFunds } = useReleaseFunds();
  const { approveMilestone } = useApproveMilestone();
  const { fundEscrow } = useFundEscrow();
  const queryClient = useQueryClient();

  const walletAddress = session?.user?.walletAddress;

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

  const [editingGig, setEditingGig] = useState<IGig | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', budget: '', deadline: '' });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editSkillInput, setEditSkillInput] = useState('');
  const [editSkillsList, setEditSkillsList] = useState<string[]>([]);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
  const [editExistingFiles, setEditExistingFiles] = useState<string[]>([]);

  const handleEditClick = (gig: IGig) => {
    setEditingGig(gig);
    setEditForm({
      title: gig.title,
      description: gig.description,
      budget: gig.budget.toString(),
      deadline: gig.deadline ? new Date(gig.deadline).toISOString().split('T')[0] : ''
    });
    setEditSkillsList(gig.skills || []);
    setEditExistingFiles(gig.clientAttachments || []);
    setEditSelectedFiles([]);
    setEditSkillInput('');
  };

  const handleEditSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = editSkillInput.trim();
      if (val) {
        setEditSkillsList(prev => [...prev, val]);
        setEditSkillInput('');
      }
    } else if (e.key === 'Backspace' && !editSkillInput && editSkillsList.length > 0) {
      setEditSkillsList(prev => prev.slice(0, -1));
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEditSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeEditExistingFile = (index: number) => {
    setEditExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeEditFile = (index: number) => {
    setEditSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGig) return;
    setIsSubmittingEdit(true);
    const toastId = toast.loading('Updating gig...');

    let attachmentUrls = [...editExistingFiles];
    if (editSelectedFiles.length > 0) {
      toast.loading('Uploading files...', { id: toastId });
      try {
        const formData = new FormData();
        editSelectedFiles.forEach((file) => formData.append('file', file));
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Failed to upload files');
        const uploadData = await res.json();
        attachmentUrls = [...attachmentUrls, ...uploadData.urls];
      } catch (err: unknown) {
        toast.error('File upload failed', { id: toastId, description: err instanceof Error ? err.message : 'Unknown error' });
        setIsSubmittingEdit(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/gigs/${editingGig._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          budget: Number(editForm.budget),
          deadline: editForm.deadline,
          skills: editSkillsList,
          clientAttachments: attachmentUrls
        })
      });
      if (!res.ok) throw new Error('Failed to update gig');
      toast.success('Gig updated successfully', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
      setEditingGig(null);
    } catch (err: unknown) {
      toast.error('Update failed', { id: toastId, description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleApproveApplicant = async (gigId: string, freelancerId: string) => {
    const toastId = toast.loading('Approving applicant...');
    try {
      const res = await fetch(`/api/gigs/${gigId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to approve applicant');
      }
      toast.success('Applicant approved! You can now deploy the escrow.', { id: toastId });
      queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
    } catch (err: unknown) {
      toast.error('Failed to approve', { id: toastId, description: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const handleFundEscrow = async (gig: IGig) => {
    if (!walletAddress || !activeWallet) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    const toastId = toast.loading('Building Escrow Smart Contract...', {
      description: 'Contacting Trustless Work Indexer...'
    });

    try {
      const payload: InitializeSingleReleaseEscrowPayload = {
        signer: walletAddress,
        engagementId: `gig-${gig._id}`,
        title: gig.title,
        description: gig.description,
        amount: Number((Number(gig.budget) / 0.997).toFixed(7)), // Add 0.3% protocol fee so freelancer gets exact amount
        platformFee: 0,
        roles: {
          approver: walletAddress,
          serviceProvider: typeof gig.freelancerId === 'object' && gig.freelancerId?.walletAddress ? gig.freelancerId.walletAddress : '', 
          platformAddress: walletAddress,
          releaseSigner: walletAddress,
          disputeResolver: walletAddress,
          receiver: typeof gig.freelancerId === 'object' && gig.freelancerId?.walletAddress ? gig.freelancerId.walletAddress : ''
        },
        trustline: {
          symbol: "USDC",
          address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
        },
        milestones: [
          { description: gig.description }
        ]
      };

      const { unsignedTransaction } = await deployEscrow(payload, "single-release");

      if (!unsignedTransaction) throw new Error("Failed to build unsigned transaction");

      toast.loading('Please sign the transaction in your wallet...', { id: toastId });

      const signRes = await signTx(unsignedTransaction);

      if (signRes.status !== 'signed') throw new Error("Transaction signing failed or was cancelled.");

      toast.loading('Submitting to Stellar Network...', { id: toastId });

      const data = await sendTransaction(signRes.signedXdr);

      if (data.status === "SUCCESS") {
        const escrowContractId = (data as { contractId: string }).contractId;
        
        toast.loading('Escrow Created! Now Funding Escrow...', { id: toastId });
        
        await new Promise(resolve => setTimeout(resolve, 8000));

        const fundPayload: FundEscrowPayload = {
           amount: Number((Number(gig.budget) / 0.997).toFixed(7)),
           contractId: escrowContractId,
           signer: walletAddress
        };

        const { unsignedTransaction: fundTx } = await fundEscrow(fundPayload, "single-release");
        if (!fundTx) throw new Error("Failed to build funding transaction");

        toast.loading('Please sign the Funding transaction in your wallet...', { id: toastId });
        const signFundRes = await signTx(fundTx);
        if (signFundRes.status !== 'signed') throw new Error("Funding transaction signing failed or was cancelled.");

        toast.loading('Submitting Funding transaction to Stellar Network...', { id: toastId });
        const fundData = await sendTransaction(signFundRes.signedXdr);

        if (fundData.status !== "SUCCESS") {
           throw new Error(fundData.message || "Failed to submit funding transaction");
        }

        const res = await fetch(`/api/gigs/${gig._id}/fund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ escrowContractId }),
        });

        if (res.ok) {
          toast.success('Gig Escrow Funded Successfully!', { 
            id: toastId,
            description: 'The funds are now locked in the smart contract.'
          });
          queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
        } else {
          throw new Error('Database update failed');
        }
      } else {
        throw new Error(data.message || "Failed to submit transaction to the network");
      }
    } catch (error: unknown) {
      console.error(error);
      const errMsg = parseErrorMsg(error);
      toast.error('Escrow Funding Failed', { 
        id: toastId,
        description: errMsg || 'Something went wrong while deploying the contract. Note: An API Key is required for the backend.' 
      });
    }
  };

  const handleReleaseFunds = async (gig: IGig) => {
    if (!walletAddress || !activeWallet) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    const toastId = toast.loading('Approving Work...', {
      description: 'Contacting Trustless Work Indexer...'
    });

    try {
      const approvePayload: ApproveMilestonePayload = {
        contractId: gig.escrowContractId!,
        milestoneIndex: "0",
        approver: walletAddress
      };

      try {
        const { unsignedTransaction: approveTx } = await approveMilestone(approvePayload, "single-release");
        if (!approveTx) throw new Error("Failed to build approve transaction");

        toast.loading('Please sign the Approve transaction in your wallet...', { id: toastId });
        const signApproveRes = await signTx(approveTx);
        if (signApproveRes.status !== 'signed') throw new Error("Approve transaction signing failed or was cancelled.");

        toast.loading('Submitting Approve transaction to Stellar Network...', { id: toastId });
        const approveData = await sendTransaction(signApproveRes.signedXdr);
        
        if (approveData.status !== "SUCCESS") {
           throw new Error(approveData.message || "Failed to submit approve transaction");
        }

        toast.loading('Work Approved! Waiting for indexer to sync...', { id: toastId });
        await new Promise(resolve => setTimeout(resolve, 8000));
      } catch (approveErr: unknown) {
        const errorMsg = parseErrorMsg(approveErr);
        if (errorMsg.includes("already been approved") || errorMsg.includes("already approved")) {
          console.log("Milestone already approved, skipping approval step.");
        } else {
          throw approveErr;
        }
      }

      toast.loading('Now Releasing Funds...', { id: toastId });

      const releasePayload: SingleReleaseReleaseFundsPayload = {
        contractId: gig.escrowContractId!,
        releaseSigner: walletAddress
      };

      const { unsignedTransaction: releaseTx } = await releaseFunds(releasePayload, "single-release");

      if (!releaseTx) throw new Error("Failed to build release transaction");

      toast.loading('Please sign the Release transaction in your wallet...', { id: toastId });

      const signReleaseRes = await signTx(releaseTx);

      if (signReleaseRes.status !== 'signed') throw new Error("Release transaction signing failed or was cancelled.");

      toast.loading('Submitting Release to Stellar Network...', { id: toastId });

      const data = await sendTransaction(signReleaseRes.signedXdr);

      if (data.status === "SUCCESS") {
        const res = await fetch(`/api/gigs/${gig._id}/release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          toast.success('Funds Released Successfully!', { 
            id: toastId,
            description: 'The USDC has been transferred to the freelancer.'
          });
          queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
        } else {
          throw new Error('Database update failed');
        }
      } else {
        throw new Error(data.message || "Failed to submit transaction to the network");
      }
    } catch (error: unknown) {
      console.error(error);
      const errMsg = parseErrorMsg(error);
      toast.error('Transaction Failed', { 
        id: toastId,
        description: errMsg || 'Something went wrong.' 
      });
    }
  };

  if (!session) return null;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">All Gigs</h1>
          <p className="text-text-secondary mt-2">Manage your active contracts, review submissions, and release funds.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-8 rounded-3xl min-h-[500px]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand-amber/10 rounded-lg border border-brand-amber/20">
            <Briefcase className="w-5 h-5 text-brand-amber" />
          </div>
          <h2 className="text-2xl font-black text-text-primary">Projects</h2>
        </div>

        {isLoadingGigs ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div></div>
        ) : gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-surface rounded-full mb-6 border border-border">
              <Briefcase className="w-12 h-12 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No active gigs</h3>
            <p className="text-text-secondary max-w-sm mb-6">You haven&apos;t created any gigs yet.</p>
            <Link 
              href="/dashboard/client/create"
              className="px-6 py-2.5 bg-brand-amber hover:bg-brand-amber/80 text-black rounded-xl font-bold transition-all"
            >
              Post a Gig
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {gigs.map((gig: IGig) => {
              const statusColors: Record<string, string> = {
                open: 'text-green-500 bg-green-500/10 border-green-500/20',
                completed: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                paid: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                review: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
                pending_approval: 'text-brand-amber bg-brand-amber/10 border-brand-amber/20',
                in_progress: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
              };
              
              const currentStatusColor = statusColors[gig.status] || 'text-text-secondary bg-surface border-border';
              const isAssigned = typeof gig.freelancerId === 'object' && gig.freelancerId;
              const freelancer = isAssigned ? (gig.freelancerId as IUser) : null;

              return (
                <div key={gig._id} className="group relative p-6 sm:p-8 bg-surface/50 backdrop-blur-md border border-border hover:border-brand-amber/30 rounded-3xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(245,165,36,0.08)] overflow-hidden flex flex-col gap-6">
                  
                  {/* Top Bar: Title & Budget */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${currentStatusColor}`}>
                          {gig.status.replace('_', ' ')}
                        </span>
                        {gig.deadline && (
                          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Due {new Date(gig.deadline).toLocaleDateString()}
                          </span>
                        )}
                        {gig.createdAt && (
                          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(gig.createdAt).toLocaleDateString()}
                          </span>
                        )}
                        {gig.escrowContractId && (
                          <a
                            href={`https://stellar.expert/explorer/testnet/contract/${gig.escrowContractId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 text-xs font-bold text-brand-amber bg-brand-amber/10 border border-brand-amber/20 rounded-lg flex items-center gap-1.5 hover:bg-brand-amber/20 transition-colors ml-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Verify on Stellar Explorer
                          </a>
                        )}
                      </div>
                      <h3 className="font-black text-2xl sm:text-3xl text-text-primary group-hover:text-brand-amber transition-colors">{gig.title}</h3>
                    </div>
                    
                    <div className="flex flex-col items-start sm:items-end bg-background/50 border border-border/50 px-5 py-3 rounded-2xl">
                      <span className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Budget</span>
                      <span className="text-2xl sm:text-3xl font-black text-text-primary leading-none">
                        {gig.budget} <span className="text-base font-bold text-text-muted">USDC</span>
                      </span>
                    </div>
                  </div>

                  {/* Description & Skills */}
                  <div>
                    <ExpandableText text={gig.description} maxLength={250} plain={true} className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-4xl" />
                    {gig.skills && gig.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {gig.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-background border border-border/50 rounded-xl text-xs font-bold text-text-secondary shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {gig.clientAttachments && gig.clientAttachments.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Attachments</h4>
                        <div className="flex flex-wrap gap-3">
                          {gig.clientAttachments.map((url: string, i: number) => {
                            const isImage = url.match(/\.(jpeg|jpg|gif|png)$/) != null;
                            const fileName = url.split('/').pop() || `Attachment ${i + 1}`;
                            return (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 pr-3 bg-background border border-border rounded-xl hover:border-brand-amber/50 transition-colors group overflow-hidden h-12"
                              >
                                {isImage ? (
                                  <div className="w-12 h-12 shrink-0 bg-surface relative flex items-center justify-center overflow-hidden border-r border-border">
                                    <Image src={url} alt={fileName} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 shrink-0 bg-surface flex items-center justify-center border-r border-border">
                                    <FileText className="w-4 h-4 text-text-muted group-hover:text-brand-amber transition-colors" />
                                  </div>
                                )}
                                <span className="text-xs font-bold text-text-primary group-hover:text-brand-amber transition-colors truncate max-w-[150px]">
                                  {fileName}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Freelancer Info & Actions */}
                  <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-4 mt-2">
                    
                    <div className="flex-1 flex flex-col gap-3">
                      {gig.status === 'open' && gig.applicants && gig.applicants.length > 0 && (
                        <div className="flex flex-col gap-4 w-full xl:max-w-2xl mb-4">
                          <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Applicants</h4>
                          {gig.applicants.map((applicant: any, i: number) => {
                            const appUser = applicant.freelancerId;
                            if (!appUser || typeof appUser === 'string') return null;
                            return (
                              <div key={i} className="flex flex-col gap-3 p-4 bg-background border border-border rounded-2xl">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 shrink-0">
                                      <User className="w-5 h-5 text-brand-amber" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Applicant</span>
                                      <span className="text-sm font-bold text-text-primary">{appUser.name}</span>
                                      <span className="text-xs text-text-muted font-mono truncate max-w-[150px] sm:max-w-xs">{appUser.walletAddress}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {applicant.freelancerGithub && (
                                      <a href={applicant.freelancerGithub} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-text-primary transition-colors whitespace-nowrap flex items-center gap-2">
                                        <Code className="w-3.5 h-3.5" /> GitHub
                                      </a>
                                    )}
                                    {applicant.freelancerResumeUrl && (
                                      <a href={applicant.freelancerResumeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-brand-amber transition-colors whitespace-nowrap flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Resume
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleApproveApplicant(gig._id, appUser._id)}
                                      className="px-4 py-1.5 bg-brand-amber hover:bg-brand-amber/80 text-black text-xs font-extrabold rounded-xl transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)] hover:-translate-y-0.5 whitespace-nowrap ml-2"
                                    >
                                      Select Applicant
                                    </button>
                                  </div>
                                </div>
                                {applicant.freelancerCoverLetter && (
                                  <div className="flex items-start gap-3 p-3 bg-brand-amber/5 border border-brand-amber/20 rounded-xl mt-1">
                                    <FileText className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-brand-amber uppercase tracking-wider mb-1">Cover Letter</span>
                                      <ExpandableText text={applicant.freelancerCoverLetter} maxLength={150} />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {freelancer && gig.status !== 'open' && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background border border-border rounded-2xl w-full xl:max-w-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 shrink-0">
                              <User className="w-5 h-5 text-brand-amber" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                                {gig.status === 'pending_approval' ? 'Selected Applicant' : 'Assigned Freelancer'}
                              </span>
                              <span className="text-sm font-bold text-text-primary">{freelancer.name}</span>
                              <span className="text-xs text-text-muted font-mono truncate max-w-[150px] sm:max-w-xs">{freelancer.walletAddress}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {gig.freelancerGithub && (
                              <a href={gig.freelancerGithub} target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-text-primary transition-colors whitespace-nowrap flex items-center gap-2">
                                <Code className="w-3.5 h-3.5" /> GitHub
                              </a>
                            )}
                            {gig.freelancerResumeUrl && (
                              <a href={gig.freelancerResumeUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-brand-amber transition-colors whitespace-nowrap flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Resume
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      {freelancer && gig.status !== 'open' && gig.freelancerCoverLetter && (
                        <div className="flex items-start gap-3 p-4 bg-brand-amber/5 border border-brand-amber/20 rounded-2xl w-full xl:max-w-2xl">
                          <div className="w-8 h-8 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-brand-amber" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-brand-amber uppercase tracking-wider mb-1">Cover Letter</span>
                            <ExpandableText text={gig.freelancerCoverLetter} maxLength={150} />
                          </div>
                        </div>
                      )}

                      {['review', 'completed', 'paid'].includes(gig.status) && gig.submissionDescription && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl w-full xl:max-w-2xl">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0 mt-0.5">
                              <CheckCircle className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1">Submission Description From Freelancer</span>
                              <ExpandableText text={gig.submissionDescription} maxLength={120} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          {gig.submissionFileUrl && (
                            <a href={gig.submissionFileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl text-xs font-bold text-yellow-500 transition-colors whitespace-nowrap">
                              View File
                            </a>
                          )}
                          {gig.submissionLink && (
                            <a href={gig.submissionLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-xl text-xs font-bold text-yellow-500 transition-colors whitespace-nowrap">
                              View Link
                            </a>
                          )}
                        </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      {gig.status === 'open' && (
                        <button onClick={() => handleEditClick(gig)} className="flex items-center justify-center gap-2 px-8 py-4 bg-surface hover:bg-surface-hover border border-border text-text-primary text-sm font-bold rounded-2xl transition-all shadow-sm w-full xl:w-auto hover:-translate-y-0.5">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      )}
                      {gig.status === 'pending_approval' && (
                        <button onClick={() => handleFundEscrow(gig)} className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber hover:bg-brand-amber/80 text-black text-sm font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(245,165,36,0.3)] hover:shadow-[0_0_25px_rgba(245,165,36,0.5)] w-full xl:w-auto hover:-translate-y-0.5">
                          Deploy & Fund Escrow <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {gig.status === 'in_progress' && (
                        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-bold rounded-2xl w-full xl:w-auto">
                          <Clock className="w-4 h-4" /> Awaiting Submission
                        </div>
                      )}
                      {gig.status === 'review' && (
                        <AlertDialog>
                          <AlertDialogTrigger className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-400 text-white text-sm font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] w-full xl:w-auto hover:-translate-y-0.5">
                            Approve & Pay <ChevronRight className="w-4 h-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-surface border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-text-primary text-2xl font-bold">Release Funds to Freelancer?</AlertDialogTitle>
                              <AlertDialogDescription className="text-text-secondary text-base">
                                This action <strong className="text-brand-amber">cannot be undone</strong>. This will approve the work and permanently release the locked USDC funds to the freelancer&apos;s wallet via the smart contract.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4">
                              <AlertDialogCancel className="bg-transparent border border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleReleaseFunds(gig)} className="bg-green-500 hover:bg-green-400 text-white font-bold">Yes, Release Funds</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {(gig.status === 'completed' || gig.status === 'paid') && (
                        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 px-8 py-4 rounded-2xl border border-green-500/20 w-full xl:w-auto justify-center">
                          <CheckCircle2 className="w-5 h-5"/> Paid
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {editingGig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface border border-border rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setEditingGig(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-background transition-colors text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-black text-text-primary mb-6">Edit Gig</h2>
              
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Title</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand-amber transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Description</label>
                  <textarea
                    required
                    maxLength={100}
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand-amber transition-colors resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Budget (USDC)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editForm.budget}
                      onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                      className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand-amber transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Deadline</label>
                    <input
                      type="date"
                      required
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                      className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-brand-amber transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Skills Required</label>
                  <div className="w-full px-5 py-4 bg-background border border-border rounded-xl focus-within:ring-1 focus-within:ring-brand-amber transition-colors flex flex-wrap gap-2 items-center min-h-[56px]">
                    {editSkillsList.map((skill, index) => (
                      <span key={index} className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-lg text-xs font-bold text-text-primary">
                        {skill}
                        <button type="button" onClick={() => setEditSkillsList(prev => prev.filter((_, i) => i !== index))} className="text-text-muted hover:text-red-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="e.g. React, Solidity (Press Enter)"
                      value={editSkillInput}
                      onChange={(e) => setEditSkillInput(e.target.value)}
                      onKeyDown={handleEditSkillKeyDown}
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-primary placeholder-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Attachments (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleEditFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-5 py-8 bg-background border border-dashed border-border hover:border-brand-amber/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                        <Upload className="w-5 h-5 text-brand-amber" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary">Click or drag files to upload</p>
                        <p className="text-xs text-text-muted mt-1">SVG, PNG, JPG, PDF or ZIP (max. 10MB)</p>
                      </div>
                    </div>
                  </div>

                  {editExistingFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {editExistingFiles.map((url, i) => {
                        const filename = url.split('/').pop() || `File ${i + 1}`;
                        return (
                          <div key={`existing-${i}`} className="relative group rounded-xl overflow-hidden border border-border bg-surface flex items-center gap-3 pr-3 h-14 transition-colors hover:border-brand-amber/50">
                            <div className="w-14 h-14 shrink-0 bg-background flex items-center justify-center border-r border-border">
                              <FileText className="w-5 h-5 text-text-muted" />
                            </div>
                            <div className="flex flex-col overflow-hidden py-1">
                              <span className="truncate max-w-[120px] text-xs font-bold text-text-primary">{filename}</span>
                              <span className="text-[10px] text-text-muted font-mono">Existing File</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeEditExistingFile(i)} 
                              className="text-red-400 hover:text-red-300 ml-auto p-1.5 hover:bg-red-400/10 rounded-md transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {editSelectedFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {editSelectedFiles.map((file, i) => (
                        <FilePreview key={i} file={file} onRemove={() => removeEditFile(i)} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingGig(null)}
                    className="px-6 py-3 rounded-xl font-bold text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="px-8 py-3 bg-brand-amber hover:bg-brand-amber/90 text-black font-extrabold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
