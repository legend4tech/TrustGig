import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Gig from '@/models/Gig';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'client') {
      return NextResponse.json({ message: 'Unauthorized. Only clients can release funds.' }, { status: 401 });
    }

    await dbConnect();

    const gig = await Gig.findById(id);

    if (!gig) {
      return NextResponse.json({ message: 'Gig not found' }, { status: 404 });
    }

    if (gig.clientId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Not your gig' }, { status: 403 });
    }

    if (gig.status !== 'review') {
      return NextResponse.json({ message: 'Gig is not under review' }, { status: 400 });
    }

    gig.status = 'paid';
    await gig.save();

    return NextResponse.json({ message: 'Funds released successfully', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
