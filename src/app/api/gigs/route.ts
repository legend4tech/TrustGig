import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Gig from '@/models/Gig';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const role = session.user.role;
    
    let gigs;
    if (role === 'client') {
      gigs = await Gig.find({ clientId: session.user.id })
        .sort({ createdAt: -1 })
        .populate('freelancerId', 'name walletAddress');
    } else {
      // Freelancer sees open gigs, paid/completed gigs (as proof of activity), or gigs assigned to them
      gigs = await Gig.find({
        $or: [
          { status: 'open' },
          { status: 'paid' },
          { status: 'completed' },
          { freelancerId: session.user.id }
        ]
      }).sort({ createdAt: -1 }).populate('clientId', 'name');
    }

    return NextResponse.json({ gigs }, { status: 200 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'client') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, budget, skills, deadline, clientAttachments } = await req.json();

    if (!title || !description || !budget) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    await dbConnect();

    const gig = await Gig.create({
      title,
      description,
      budget,
      skills: skills || [],
      deadline: deadline || null,
      clientAttachments: clientAttachments || [],
      clientId: session.user.id,
    });

    return NextResponse.json({ message: 'Gig created', gig }, { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
