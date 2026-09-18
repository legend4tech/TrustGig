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
    if (!session || !session.user || session.user.role !== 'freelancer') {
      return NextResponse.json({ message: 'Unauthorized. Only freelancers can submit work.' }, { status: 401 });
    }

    await dbConnect();

    const gig = await Gig.findById(id);

    if (!gig) {
      return NextResponse.json({ message: 'Gig not found' }, { status: 404 });
    }

    if (gig.freelancerId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Not assigned to this gig' }, { status: 403 });
    }

    if (gig.status !== 'in_progress') {
      return NextResponse.json({ message: 'Gig is not in progress' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { submissionDescription, submissionFileUrl, submissionLink } = body;

    gig.submissionDescription = submissionDescription || null;
    gig.submissionFileUrl = submissionFileUrl || null;
    gig.submissionLink = submissionLink || null;
    gig.status = 'review';
    await gig.save();

    return NextResponse.json({ message: 'Work submitted successfully', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
