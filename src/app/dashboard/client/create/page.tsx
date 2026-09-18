'use client';
import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { PlusCircle, Upload, X, FileText } from 'lucide-react';
import { usePollar } from '@pollar/react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title cannot exceed 80 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  budget: z.coerce.number().min(1, 'Budget must be greater than 0'),
  deadline: z.string().min(1, 'Deadline is required'),
});

type FormValues = z.infer<typeof formSchema>;

const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isImage = file.type.startsWith('image/');

  useEffect(() => {
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
        <div className="w-14 h-14 shrink-0 bg-background flex items-center justify-center overflow-hidden border-r border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
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
      <button 
        type="button" 
        onClick={onRemove} 
        className="text-red-400 hover:text-red-300 ml-auto p-1.5 hover:bg-red-400/10 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function ClientCreateGigPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { walletBalance } = usePollar();

  const walletAddress = session?.user?.walletAddress;

  const usdcBalanceData = walletBalance?.step === 'loaded' 
    ? walletBalance.data.balances.find((b: { code: string; balance: string | null }) => b.code === 'USDC')
    : null;
  const usdcBalance = usdcBalanceData ? Number(usdcBalanceData.balance) : 0;

  const form = useForm<FormValues>({
    // @ts-expect-error Zod coercion type mismatch
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      budget: '' as unknown as number,
      deadline: '',
    }
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createGigMutation = useMutation({
    mutationFn: async (data: FormValues & { clientAttachments?: string[]; skills?: string[] }) => {
      const payload = {
        ...data,
        budget: Number(data.budget),
        skills: skillsList,
        deadline: new Date(data.deadline).toISOString(),
      };
      
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create gig');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Gig posted successfully!');
      form.reset();
      setSkillsList([]);
      setSkillInput('');
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['clientGigs'] });
      router.push('/dashboard/client/gigs');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const onGigSubmit = async (data: FormValues) => {
    if (!walletAddress) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    if (skillsList.length === 0) {
      toast.error('Missing skills', { description: 'Please add at least one required skill.' });
      return;
    }

    if (data.budget > usdcBalance) {
      form.setError('budget', { type: 'manual', message: `Budget exceeds your available balance (${usdcBalance.toFixed(2)} USDC).` });
      return;
    }

    let attachmentUrls: string[] = [];

    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const uploadToastId = toast.loading('Uploading files...');
      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('file', file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Failed to upload files');
        }

        const uploadData = await res.json();
        attachmentUrls = uploadData.urls;
        toast.success('Files uploaded successfully', { id: uploadToastId });
      } catch (error) {
        setIsUploading(false);
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        toast.error('File upload failed: ' + errMsg, { id: uploadToastId });
        return; 
      }
      setIsUploading(false);
    }

    const payload = { ...data, clientAttachments: attachmentUrls };
    createGigMutation.mutate(payload);
  };

  const handleSkillInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val) {
        setSkillsList(prev => [...prev, val]);
        setSkillInput('');
      }
    } else if (e.key === 'Backspace' && !skillInput && skillsList.length > 0) {
      setSkillsList(prev => prev.slice(0, -1));
    }
  };

  const removeSkill = (indexToRemove: number) => {
    setSkillsList(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  if (!session) return null;

  return (
    <div className="flex flex-col gap-8 pb-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">Tokenize a Gig</h1>
          <p className="text-text-secondary mt-2">Post a new project to the TrustGig platform, securely backed by a smart contract.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-10 rounded-3xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-brand-amber/10 rounded-lg border border-brand-amber/20">
            <PlusCircle className="w-5 h-5 text-brand-amber" />
          </div>
          <h2 className="text-2xl font-black text-text-primary">Gig Details</h2>
        </div>
        
        <Form {...form}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={form.handleSubmit(onGigSubmit as any)} className="flex flex-col gap-6">
              <FormField
                // @ts-expect-error React hook form type mismatch
                control={form.control}
                name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Gig Title</FormLabel>
                    <span className={`text-xs font-bold tabular-nums ${(field.value?.length || 0) > 70 ? 'text-red-500' : 'text-text-muted'}`}>
                      {field.value?.length || 0}/80
                    </span>
                  </div>
                  <FormControl>
                    <Input placeholder="e.g. Build a Web3 React App" className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-colors placeholder-text-muted h-auto" maxLength={80} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              <FormField
                // @ts-expect-error React hook form type mismatch
                control={form.control}
                name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-2">
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Description</FormLabel>
                    <span className={`text-xs font-bold tabular-nums ${(field.value?.length || 0) > 1900 ? 'text-red-500' : 'text-text-muted'}`}>
                      {field.value?.length || 0}/2000
                    </span>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Describe the scope of work in detail..." maxLength={2000} className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary min-h-[160px] focus-visible:ring-1 focus-visible:ring-brand-amber transition-colors resize-none placeholder-text-muted" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  // @ts-expect-error React hook form type mismatch
                  control={form.control}
                  name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Budget (USDC)</FormLabel>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="500" 
                          className="w-full pl-10 pr-5 py-4 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-colors placeholder-text-muted h-auto" 
                          {...field}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              field.onChange('');
                              return;
                            }
                            let val = Number(e.target.value);
                            if (val > usdcBalance) {
                              val = usdcBalance;
                            }
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                  // @ts-expect-error React hook form type mismatch
                  control={form.control}
                  name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-colors h-auto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Skills Required</FormLabel>
              <Input 
                type="text" 
                placeholder="Type a skill and press comma or enter..." 
                value={skillInput}
                onChange={handleSkillInput}
                onKeyDown={handleSkillKeyDown}
                className="w-full px-5 py-4 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-colors placeholder-text-muted h-auto" 
              />
              {skillsList.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skillsList.map((skill, i) => (
                    <div key={i} className="px-4 py-2 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-lg text-sm flex items-center gap-2 font-bold transition-all">
                      {skill}
                      <button type="button" onClick={() => removeSkill(i)} className="text-brand-amber hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Attachments (Optional)</FormLabel>
              <div className="relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="w-full px-5 py-8 bg-surface hover:bg-surface-hover border-2 border-dashed border-border rounded-xl text-text-secondary transition-colors flex flex-col items-center justify-center gap-3 pointer-events-none">
                  <div className="p-3 bg-background rounded-full">
                    <Upload className="w-6 h-6 text-brand-amber" />
                  </div>
                  <span className="font-bold">Click or drag to select files</span>
                </div>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedFiles.map((file, i) => (
                    <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <Link href="/dashboard/client" className="flex-1 py-4 text-center bg-surface hover:bg-surface-hover text-text-primary border border-border rounded-xl font-bold transition-all">
                Cancel
              </Link>
              <button type="submit" disabled={createGigMutation.isPending || isUploading} className="flex-[2] py-4 bg-brand-amber hover:bg-brand-amber/90 text-black rounded-xl font-extrabold transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)] hover:shadow-[0_0_25px_rgba(245,165,36,0.5)] hover:-translate-y-1">
                {walletAddress ? (isUploading ? 'Uploading Files...' : createGigMutation.isPending ? 'Tokenizing...' : 'Tokenize Gig') : 'Connect Wallet to Tokenize'}
              </button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
