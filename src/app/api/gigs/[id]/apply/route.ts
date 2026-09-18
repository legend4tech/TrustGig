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
      return NextResponse.json({ message: 'Unauthorized. Only freelancers can apply.' }, { status: 401 });
    }

    await dbConnect();

    const gig = await Gig.findById(id);

    if (!gig) {
      return NextResponse.json({ message: 'Gig not found' }, { status: 404 });
    }

    if (gig.status !== 'open') {
      return NextResponse.json({ message: 'Gig is no longer open for applications' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { freelancerResumeUrl, freelancerGithub, freelancerCoverLetter } = body;

    // Initialize applicants array if it doesn't exist
    if (!gig.applicants) {
      gig.applicants = [];
    }

    // Check if user has already applied
    const hasApplied = gig.applicants.some((a: any) => a.freelancerId.toString() === session.user.id);
    if (hasApplied) {
      return NextResponse.json({ message: 'You have already applied for this gig.' }, { status: 400 });
    }

    gig.applicants.push({
      freelancerId: session.user.id,
      freelancerResumeUrl: freelancerResumeUrl || null,
      freelancerGithub: freelancerGithub || null,
      freelancerCoverLetter: freelancerCoverLetter || null,
      createdAt: new Date()
    });

    await gig.save();

    return NextResponse.json({ message: 'Successfully applied to gig', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
