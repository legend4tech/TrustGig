'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PollarWrapper with SSR completely disabled.
// This prevents Next.js from rendering PollarClient on the server,
// which fixes the API_KEY_TYPE_NOT_ALLOWED error (since Publishable Keys are blocked from server IPs)
// and prevents the Hydration Mismatch crashes.
const PollarWrapper = dynamic(() => import('./PollarWrapper'), { ssr: false });

import { TrustlessWorkProvider } from './TrustlessWorkProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PollarWrapper>
            <TrustlessWorkProvider>
              {children}
            </TrustlessWorkProvider>
          </PollarWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
