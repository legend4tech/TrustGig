import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Gig from '@/models/Gig';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'freelancer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { gigId } = await req.json();

    if (!gigId) {
      return NextResponse.json({ message: 'Gig ID required' }, { status: 400 });
    }

    await dbConnect();

    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== 'open') {
      return NextResponse.json({ message: 'Gig not available' }, { status: 400 });
    }

    gig.freelancerId = session.user.id as string;
    gig.status = 'in_progress';
    await gig.save();

    return NextResponse.json({ message: 'Applied successfully', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
