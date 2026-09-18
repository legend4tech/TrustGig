import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    walletAddress?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      walletAddress?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    walletAddress?: string;
  }
}
