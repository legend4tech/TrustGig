'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Lock } from 'lucide-react';
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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      toast.error('Invalid credentials');
      setLoading(false);
    } else {
      toast.success('Login successful!');
      router.push('/dashboard');
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
            <Lock className="w-6 h-6 text-brand-amber" />
          </div>
        </div>
        
        <h2 className="text-3xl font-black mb-2 text-center text-text-primary tracking-tight">Welcome Back</h2>
        <p className="text-text-secondary text-center mb-8 text-sm">Enter your details to access your dashboard</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
            
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3.5 bg-brand-amber hover:bg-brand-amber/80 disabled:bg-brand-amber/50 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(245,165,36,0.3)] flex justify-center items-center gap-2"
            >
              {loading ? <span className="animate-pulse">Authenticating...</span> : 'Sign In'}
            </button>
          </form>
        </Form>
        
        <p className="mt-8 text-center text-text-secondary text-sm">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-brand-amber hover:text-brand-amber font-bold transition-colors">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
