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
      return NextResponse.json({ message: 'Unauthorized. Only clients can approve applicants.' }, { status: 401 });
    }

    await dbConnect();

    const gig = await Gig.findById(id);

    if (!gig) {
      return NextResponse.json({ message: 'Gig not found' }, { status: 404 });
    }

    if (gig.clientId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized. You do not own this gig.' }, { status: 403 });
    }

    if (gig.status !== 'open') {
      return NextResponse.json({ message: 'Gig is not open for approvals.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { freelancerId } = body;

    if (!freelancerId) {
      return NextResponse.json({ message: 'Freelancer ID is required.' }, { status: 400 });
    }

    // Find the applicant in the array
    const applicant = gig.applicants.find((a: any) => a.freelancerId.toString() === freelancerId);

    if (!applicant) {
      return NextResponse.json({ message: 'Applicant not found for this gig.' }, { status: 404 });
    }

    // Assign the freelancer and copy their details to the main gig
    gig.freelancerId = applicant.freelancerId;
    gig.freelancerResumeUrl = applicant.freelancerResumeUrl;
    gig.freelancerGithub = applicant.freelancerGithub;
    gig.freelancerCoverLetter = applicant.freelancerCoverLetter;
    
    // Change status to pending_approval
    gig.status = 'pending_approval';

    await gig.save();

    return NextResponse.json({ message: 'Applicant approved successfully', gig }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
