'use client';

import React from 'react';
import { TrustlessWorkConfig, development } from '@trustless-work/escrow';

export function TrustlessWorkProvider({ children }: { children: React.ReactNode }) {
  return (
    <TrustlessWorkConfig baseURL={development} apiKey={process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY || ""}>
      {children}
    </TrustlessWorkConfig>
  );
}
