import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ message: 'Wallet address required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.walletAddress = walletAddress;
    await user.save();

    return NextResponse.json({ message: 'Wallet linked successfully', walletAddress });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMsg }, { status: 500 });
  }
}
