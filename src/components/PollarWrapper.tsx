'use client';

import { PollarProvider } from '@pollar/react';
import { stellarWalletsKitAdapters } from '@pollar/stellar-wallets-kit-adapter';
import { Networks } from '@creit.tech/stellar-wallets-kit';

// By defining this outside the component, it acts as a singleton configuration,
// preventing the "Another PollarClient is already active" error on re-renders.
const pollarConfig = {
  apiKey: process.env.NEXT_PUBLIC_POLLAR_API_KEY || '',
  walletAdapters: stellarWalletsKitAdapters({ network: Networks.TESTNET }),
};

export default function PollarWrapper({ children }: { children: React.ReactNode }) {
  return <PollarProvider client={pollarConfig}>{children}</PollarProvider>;
}
