import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Gig from '@/models/Gig';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'client') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const gig = await Gig.findById(id);

    if (!gig) {
      return NextResponse.json({ message: 'Gig not found' }, { status: 404 });
    }

    if (gig.clientId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized to edit this gig' }, { status: 403 });
    }

    if (gig.status !== 'open') {
      return NextResponse.json({ message: 'Only open gigs can be edited' }, { status: 400 });
    }

    const allowedUpdates = ['title', 'description', 'budget', 'deadline', 'skills', 'clientAttachments'];
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        gig[key] = body[key];
      }
    }

    await gig.save();

    return NextResponse.json({ message: 'Gig updated successfully', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
