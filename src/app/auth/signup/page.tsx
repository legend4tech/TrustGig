'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'freelancer']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'client',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData.message || 'Signup failed');
      }

      // Auto-login after signup
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInRes?.error) {
        toast.error('Auto-login failed. Please login manually.');
      } else {
        toast.success('Account created successfully!');
        router.push('/dashboard');
      }
    } catch (err: Error | unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[90vh] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-3xl w-full max-w-md bg-surface shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-amber to-brand-amber"></div>
        
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20">
            <UserPlus className="w-6 h-6 text-brand-amber" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black mb-2 text-text-primary text-center">Create your account</h2>
        <p className="text-text-secondary text-center mb-8 text-sm">Join the TrustGig freelance revolution</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Satoshi Nakamoto"
                      className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-all placeholder-text-muted h-auto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-all placeholder-text-muted h-auto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-text-primary focus-visible:ring-1 focus-visible:ring-brand-amber transition-all pr-12 placeholder-text-muted h-auto"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-text-secondary uppercase tracking-wider block">I want to...</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <label className="flex-1 cursor-pointer">
                        <input 
                          type="radio" 
                          className="peer hidden" 
                          {...field}
                          value="client" 
                          checked={field.value === 'client'}
                        />
                        <div className="text-center px-4 py-3.5 rounded-xl border border-border bg-background peer-checked:bg-brand-amber/10 peer-checked:border-brand-amber transition-all text-text-secondary peer-checked:text-brand-amber font-bold">
                          Hire Freelancers
                        </div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input 
                          type="radio" 
                          className="peer hidden" 
                          {...field}
                          value="freelancer"
                          checked={field.value === 'freelancer'}
                        />
                        <div className="text-center px-4 py-3.5 rounded-xl border border-border bg-background peer-checked:bg-brand-amber/10 peer-checked:border-brand-amber transition-all text-text-secondary peer-checked:text-brand-amber font-bold">
                          Work on Gigs
                        </div>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5 bg-brand-amber hover:bg-brand-amber/80 text-black disabled:bg-brand-amber/50 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)] flex justify-center items-center gap-2"
            >
              {loading ? <span className="animate-pulse">Creating Account...</span> : 'Create Account'}
            </button>
          </form>
        </Form>
        
        <p className="mt-8 text-center text-text-secondary text-sm">
          Already have an account? <Link href="/auth/login" className="text-brand-amber hover:text-brand-amber font-bold transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
