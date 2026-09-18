'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { CheckCircle, X, FileText, CheckCircle2, Calendar, Clock, DollarSign, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { IGig } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

const submitWorkSchema = z.object({
  submissionDescription: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description cannot exceed 500 characters'),
  submissionLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});
type SubmitWorkFormValues = z.infer<typeof submitWorkSchema>;

export default function FreelancerApplications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [submitModalGigId, setSubmitModalGigId] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const submitWorkForm = useForm<SubmitWorkFormValues>({
    resolver: zodResolver(submitWorkSchema),
    defaultValues: { submissionDescription: '' }
  });

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls[0];
  };

  const submitWorkMutation = useMutation({
    mutationFn: async ({ gigId, desc, fileUrl, link }: { gigId: string, desc: string, fileUrl: string, link?: string }) => {
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
    onError: (_err: Error) => {
      toast.error('Failed to submit application');
    }
  });

  const onSubmitWorkSubmit = async (data: SubmitWorkFormValues) => {
    if (!submitModalGigId) return;
    let fileUrl = '';
    if (submissionFile) {
      setIsUploading(true);
      const tid = toast.loading('Uploading work file...');
      try {
        fileUrl = await uploadFile(submissionFile);
        toast.success('File uploaded!', { id: tid });
      } catch (err) {
        toast.error('Failed to upload file', { id: tid });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    submitWorkMutation.mutate({ gigId: submitModalGigId, desc: data.submissionDescription, fileUrl, link: data.submissionLink });
  };

  const myGigs = gigs.filter((g: IGig) => 
    g.freelancerId === session?.user?.id || (g.freelancerId && typeof g.freelancerId !== 'string' && g.freelancerId._id === session?.user?.id)
  );

  const stats = {
    paid: myGigs.filter((g: IGig) => g.status === 'paid').reduce((sum: number, g: IGig) => sum + Number(g.budget), 0),
    pending: myGigs.filter((g: IGig) => ['pending_approval', 'in_progress', 'review'].includes(g.status)).reduce((sum: number, g: IGig) => sum + Number(g.budget), 0),
    activeCount: myGigs.filter((g: IGig) => g.status === 'in_progress').length,
  };

  if (!session) return null;

  return (
    <div className="w-full relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">My Applications</h1>
          <p className="text-text-secondary mt-2">Track your active gigs, submit work, and manage your pipeline.</p>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24 text-green-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-text-secondary font-medium mb-1">Total Earned</h3>
            <div className="text-3xl font-black text-text-primary">{stats.paid.toFixed(2)} <span className="text-sm font-medium text-text-muted">USDC</span></div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-yellow-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-text-secondary font-medium mb-1">Pending Payouts</h3>
            <div className="text-3xl font-black text-text-primary">{stats.pending.toFixed(2)} <span className="text-sm font-medium text-text-muted">USDC</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-24 h-24 text-brand-amber" />
          </div>
          <div className="relative z-10">
            <h3 className="text-text-secondary font-medium mb-1">Active Gigs</h3>
            <div className="text-3xl font-black text-text-primary">{stats.activeCount} <span className="text-sm font-medium text-text-muted">Gigs</span></div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 rounded-3xl min-h-[400px]"
      >
        <h2 className="text-xl font-bold text-text-primary mb-6">Assigned & Applied</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div></div>
        ) : myGigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-surface rounded-full mb-6 border border-border">
              <FileText className="w-12 h-12 text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No applications yet</h3>
            <p className="text-text-secondary max-w-sm">Head over to the Gig Explorer to find opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {myGigs.map((gig: IGig) => (
              <div key={gig._id} className="group flex flex-col sm:flex-row gap-6 p-6 bg-surface border border-border hover:border-brand-amber/40 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,165,36,0.08)]">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${gig.status === 'open' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : gig.status === 'paid' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : gig.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {gig.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-text-primary mb-2 line-clamp-1">{gig.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(gig.createdAt || '').toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5 font-bold text-text-primary"><DollarSign className="w-4 h-4 text-brand-amber" /> {gig.budget} USDC</div>
                  </div>
                  <p className="text-text-muted text-sm line-clamp-2">{gig.description}</p>
                </div>
                
                <div className="sm:w-48 flex flex-col justify-center sm:border-l sm:border-border sm:pl-6">
                  {gig.status === 'pending_approval' && (
                    <div className="text-center">
                      <div className="text-yellow-500 mb-2 flex justify-center"><Clock className="w-6 h-6" /></div>
                      <span className="text-sm font-medium text-text-secondary">Waiting Client Approval</span>
                    </div>
                  )}
                  {gig.status === 'in_progress' && (
                    <button 
                      onClick={() => setSubmitModalGigId(gig._id)}
                      className="w-full py-2.5 bg-brand-amber hover:bg-brand-amber/80 text-black font-extrabold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 text-sm"
                    >
                      Submit Work
                    </button>
                  )}
                  {gig.status === 'review' && (
                    <div className="text-center">
                      <div className="text-blue-500 mb-2 flex justify-center"><CheckCircle className="w-6 h-6" /></div>
                      <span className="text-sm font-medium text-text-secondary">Client Reviewing</span>
                    </div>
                  )}
                  {gig.status === 'paid' && (
                    <div className="text-center">
                      <div className="text-purple-500 mb-2 flex justify-center"><CheckCircle2 className="w-6 h-6" /></div>
                      <span className="text-sm font-medium text-text-secondary">Funds Released</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit Work Modal */}
      {submitModalGigId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSubmitModalGigId(null)} />
          <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <button onClick={() => setSubmitModalGigId(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Submit Work</h2>
            <p className="text-text-secondary mb-6 text-sm">Upload your deliverables for client review.</p>

            <Form {...submitWorkForm}>
              <form onSubmit={submitWorkForm.handleSubmit(onSubmitWorkSubmit)} className="space-y-4">
                <FormField
                  control={submitWorkForm.control}
                  name="submissionDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel>Work Description</FormLabel>
                        <span className={`text-xs font-bold tabular-nums ${(field.value?.length || 0) > 480 ? 'text-red-500' : 'text-text-muted'}`}>
                          {field.value?.length || 0}/500
                        </span>
                      </div>
                      <FormControl>
                        <Textarea placeholder="Explain what you have completed..." maxLength={500} className="bg-background border-border min-h-[100px] max-h-[160px] overflow-y-auto" {...field} />
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
                      <FormLabel>Project Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. https://github.com/myrepo" className="bg-background border-border" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Attachment (Optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl hover:border-brand-amber/50 hover:bg-brand-amber/5 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-text-muted group-hover:text-brand-amber transition-colors" />
                      <p className="mb-2 text-sm text-text-secondary font-medium">
                        {submissionFile ? submissionFile.name : <><span className="text-brand-amber font-bold">Click to upload</span> or drag and drop</>}
                      </p>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setSubmitModalGigId(null)} className="flex-1 py-3 bg-background border border-border text-text-primary font-bold rounded-xl hover:bg-surface-hover transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitWorkMutation.isPending || isUploading} className="flex-1 py-3 bg-brand-amber hover:bg-brand-amber/80 text-black font-extrabold rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                    {submitWorkMutation.isPending || isUploading ? <><span className="animate-spin border-2 border-black/20 border-t-black rounded-full w-4 h-4" /> Submitting...</> : 'Submit Work'}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
