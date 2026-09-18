'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Search, Rocket, Upload, X, Code, FileText, CheckCircle2, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { ExpandableText } from '@/components/ui/expandable-text';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { IGig, IUser } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const applySchema = z.object({
  coverLetter: z.string().min(10, 'At least 10 characters').max(500, 'Max 500 characters'),
  githubUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});
type ApplyFormValues = z.infer<typeof applySchema>;

const submitWorkSchema = z.object({
  submissionDescription: z.string().min(10, 'Description must be at least 10 characters'),
  submissionLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});
type SubmitWorkFormValues = z.infer<typeof submitWorkSchema>;

export default function FreelancerGigsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Modals state
  const [applyModalGigId, setApplyModalGigId] = useState<string | null>(null);
  const [submitModalGigId, setSubmitModalGigId] = useState<string | null>(null);

  // File Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const walletAddress = session?.user?.walletAddress;

  const { data: gigs = [], isLoading: isLoadingGigs } = useQuery({
    queryKey: ['freelancerGigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      if (!res.ok) throw new Error('Failed to fetch gigs');
      const data = await res.json();
      return data.gigs || [];
    },
    enabled: !!session,
  });

  const applyForm = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { coverLetter: '', githubUrl: '' }
  });

  const submitWorkForm = useForm<SubmitWorkFormValues>({
    resolver: zodResolver(submitWorkSchema),
    defaultValues: { submissionDescription: '', submissionLink: '' }
  });

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls[0];
  };

  const applyMutation = useMutation({
    mutationFn: async ({ gigId, resume, github, coverLetter }: { gigId: string, resume: string, github: string, coverLetter: string }) => {
      const res = await fetch(`/api/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerResumeUrl: resume, freelancerGithub: github, freelancerCoverLetter: coverLetter })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to apply');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Successfully applied to gig!');
      setApplyModalGigId(null);
      setResumeFile(null);
      applyForm.reset();
      queryClient.invalidateQueries({ queryKey: ['freelancerGigs'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const submitWorkMutation = useMutation({
    mutationFn: async ({ gigId, desc, fileUrl, link }: { gigId: string, desc: string, fileUrl: string, link: string }) => {
      const res = await fetch(`/api/gigs/${gigId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionDescription: desc, submissionFileUrl: fileUrl, submissionLink: link })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit work');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Work submitted for review!');
      setSubmitModalGigId(null);
      submitWorkForm.reset();
      setSubmissionFile(null);
      queryClient.invalidateQueries({ queryKey: ['freelancerGigs'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const onApplySubmit = async (data: ApplyFormValues) => {
    if (!applyModalGigId) return;

    let resumeUrl = '';
    if (resumeFile) {
      setIsUploading(true);
      const tid = toast.loading('Uploading resume...');
      try {
        resumeUrl = await uploadFile(resumeFile);
        toast.success('Resume uploaded!', { id: tid });
      } catch (_err) {
        toast.error('Failed to upload resume', { id: tid });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    applyMutation.mutate({ gigId: applyModalGigId, resume: resumeUrl, github: data.githubUrl || '', coverLetter: data.coverLetter });
  };

  const onSubmitWorkSubmit = async (data: SubmitWorkFormValues) => {
    if (!submitModalGigId) return;

    let fileUrl = '';
    if (submissionFile) {
      setIsUploading(true);
      const tid = toast.loading('Uploading work file...');
      try {
        fileUrl = await uploadFile(submissionFile);
        toast.success('File uploaded!', { id: tid });
      } catch (_err) {
        toast.error('Failed to upload file', { id: tid });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    submitWorkMutation.mutate({ gigId: submitModalGigId, desc: data.submissionDescription, fileUrl, link: data.submissionLink || '' });
  };



  if (!session) return null;

  return (
    <div className="w-full relative">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">Gig Explorer</h1>
          <p className="text-text-secondary mt-2">Find your next opportunity and earn USDC.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 sm:p-8 rounded-3xl min-h-[500px]"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand-amber/10 rounded-lg border border-brand-amber/20">
            <Search className="w-5 h-5 text-brand-amber" />
          </div>
          <h2 className="text-2xl font-black text-text-primary">Open Opportunities</h2>
        </div>

        {isLoadingGigs ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div></div>
        ) : gigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-surface rounded-full mb-6 border border-border">
              <Search className="w-12 h-12 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No open gigs</h3>
            <p className="text-text-secondary max-w-sm">Check back later when clients post new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {gigs.map((gig: IGig) => {
              const isAssigned = gig.freelancerId && (typeof gig.freelancerId !== 'string' && gig.freelancerId._id === session.user?.id || gig.freelancerId === session.user?.id);
              const hasAppliedInArray = gig.applicants?.some((a: any) => typeof a.freelancerId === 'string' ? a.freelancerId === session.user?.id : a.freelancerId?._id === session.user?.id);
              const isApplied = isAssigned || hasAppliedInArray;

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
                <div key={gig._id} className="group relative p-6 sm:p-8 bg-surface/50 backdrop-blur-md border border-border hover:border-brand-amber/30 rounded-3xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(245,165,36,0.08)] overflow-hidden flex flex-col gap-6">

                  {/* Top Bar: Title & Budget */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${currentStatusColor}`}>
                          {gig.status.replace(/_/g, ' ')}
                        </span>
                        {gig.deadline && (
                          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Due {new Date(gig.deadline).toLocaleDateString()}
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
                        {gig.createdAt && (
                          <span className="text-xs font-medium text-text-muted flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(gig.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-2xl sm:text-3xl text-text-primary group-hover:text-brand-amber transition-colors">{gig.title}</h3>
                    </div>

                    <div className="flex flex-col items-start sm:items-end bg-background/50 border border-border/50 px-5 py-3 rounded-2xl shrink-0">
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
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Client Attachments</h4>
                        <div className="flex flex-wrap gap-3">
                          {gig.clientAttachments.map((url: string, i: number) => {
                            const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
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
                                    <Image src={url} alt={fileName} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-110 transition-transform duration-500" />
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

                  {/* Bottom: Client info & Action */}
                  <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-end gap-4 mt-2">
                    <div className="flex-1">
                      {gig.clientId && typeof gig.clientId !== 'string' && gig.clientId.name && (
                        <div className="inline-flex items-center gap-3 p-4 bg-background border border-border rounded-2xl">
                          <div className="w-9 h-9 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 shrink-0">
                            <span className="text-brand-amber font-black text-sm">{(gig.clientId as IUser).name?.[0]}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Posted by</span>
                            <span className="text-sm font-bold text-text-primary">{(gig.clientId as IUser).name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      {gig.status === 'open' && !isApplied && (
                        <button
                          onClick={() => {
                            if (!walletAddress) { toast.error('Connect wallet first'); return; }
                            setApplyModalGigId(gig._id);
                          }}
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber hover:bg-brand-amber/80 text-black text-sm font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(245,165,36,0.3)] hover:shadow-[0_0_25px_rgba(245,165,36,0.5)] w-full xl:w-auto hover:-translate-y-0.5"
                        >
                          <Rocket className="w-4 h-4" /> Apply Now
                        </button>
                      )}
                      {isApplied && gig.status === 'open' && (
                        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber/10 border border-brand-amber/20 text-brand-amber text-sm font-bold rounded-2xl w-full xl:w-auto">
                          <CheckCircle className="w-4 h-4" /> Application Submitted
                        </div>
                      )}
                      {isAssigned && gig.status === 'in_progress' && (
                        <button
                          onClick={() => setSubmitModalGigId(gig._id)}
                          className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber hover:bg-brand-amber/80 text-black text-sm font-extrabold rounded-2xl transition-all shadow-[0_0_20px_rgba(245,165,36,0.3)] hover:shadow-[0_0_25px_rgba(245,165,36,0.5)] w-full xl:w-auto hover:-translate-y-0.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Submit Work
                        </button>
                      )}
                      {isAssigned && gig.status === 'pending_approval' && (
                        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-amber/10 border border-brand-amber/20 text-brand-amber text-sm font-bold rounded-2xl w-full xl:w-auto">
                          <CheckCircle className="w-4 h-4" /> Waiting Client Approval
                        </div>
                      )}
                      {isApplied && !isAssigned && gig.status !== 'open' && (
                         <div className="px-8 py-4 bg-background text-red-400 text-sm font-bold rounded-2xl border border-red-400/20 w-full xl:w-auto text-center">
                           Not Selected
                         </div>
                      )}
                      {isAssigned && gig.status === 'review' && (
                        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold rounded-2xl w-full xl:w-auto">
                          <Search className="w-4 h-4" /> Under Review
                        </div>
                      )}
                      {isAssigned && (gig.status === 'paid' || gig.status === 'completed') && (
                        <div className="flex items-center justify-center gap-2 px-8 py-4 bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold rounded-2xl w-full xl:w-auto">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </div>
                      )}
                      {!isApplied && gig.status !== 'open' && (
                        <div className="px-8 py-4 bg-background text-text-muted text-sm font-bold rounded-2xl border border-border w-full xl:w-auto text-center">
                          Unavailable
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

      {/* Apply Modal */}
      <AnimatePresence>
        {applyModalGigId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setApplyModalGigId(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-black mb-2 text-text-primary">Apply for Gig</h2>
              <p className="text-text-secondary text-sm mb-6">Provide your details to stand out to the client.</p>

              <Form {...applyForm}>
                <form onSubmit={applyForm.handleSubmit(onApplySubmit)} className="space-y-4">
                  <FormField
                    control={applyForm.control}
                    name="coverLetter"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider">Cover Letter</FormLabel>
                          <span className={`text-xs font-bold tabular-nums ${(field.value?.length || 0) > 90 ? 'text-red-500' : 'text-text-muted'}`}>
                            {field.value?.length || 0}/500
                          </span>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly explain why you're the best fit for this gig..."
                            maxLength={500}
                            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={applyForm.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">GitHub Profile (Optional)</FormLabel>
                        <div className="relative">
                          <Code className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                          <FormControl>
                            <Input placeholder="https://github.com/username" className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber h-auto" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Resume / Portfolio (Optional)</FormLabel>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full px-4 py-3 bg-background hover:bg-surface-hover border border-dashed border-border rounded-xl text-text-secondary transition-colors flex items-center justify-center gap-2 pointer-events-none">
                        {resumeFile ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> {resumeFile.name}</> : <><Upload className="w-4 h-4" /> Upload PDF</>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={applyMutation.isPending || isUploading}
                    className="w-full mt-4 py-3.5 bg-brand-amber hover:bg-brand-amber/80 text-black font-extrabold rounded-xl"
                  >
                    {isUploading ? 'Uploading Resume...' : applyMutation.isPending ? 'Applying...' : 'Send Application'}
                  </button>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Work Modal */}
      <AnimatePresence>
        {submitModalGigId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={() => setSubmitModalGigId(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-black mb-2 text-text-primary">Submit Final Work</h2>
              <p className="text-text-secondary text-sm mb-6">Send your work to the client for approval to release your funds.</p>

              <Form {...submitWorkForm}>
                <form onSubmit={submitWorkForm.handleSubmit(onSubmitWorkSubmit)} className="space-y-4">
                  <FormField
                    control={submitWorkForm.control}
                    name="submissionDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">What did you complete?</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the work delivered..." className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary h-24 focus-visible:ring-1 focus-visible:ring-brand-amber resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={submitWorkForm.control}
                    name="submissionLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Link to Work (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://... (e.g. Vercel, GitHub, Figma)" className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Upload Delivery File (Optional)</FormLabel>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSubmissionFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="w-full px-4 py-3 bg-background hover:bg-surface-hover border border-dashed border-border rounded-xl text-text-secondary transition-colors flex items-center justify-center gap-2 pointer-events-none">
                        {submissionFile ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> {submissionFile.name}</> : <><FileText className="w-4 h-4" /> Attach File (.zip, etc)</>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitWorkMutation.isPending || isUploading}
                    className="w-full mt-4 py-3.5 bg-brand-amber hover:bg-brand-amber/80 disabled:opacity-50 text-white font-extrabold rounded-xl"
                  >
                    {isUploading ? 'Uploading...' : submitWorkMutation.isPending ? 'Submitting...' : 'Submit Work for Payment'}
                  </button>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
