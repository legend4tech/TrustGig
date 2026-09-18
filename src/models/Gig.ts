import mongoose from 'mongoose';

const GigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['open', 'pending_approval', 'in_progress', 'review', 'paid', 'completed'], default: 'open' },
  escrowContractId: { type: String, default: null },
  
  // Phase 3 detailed fields
  skills: { type: [String], default: [] },
  deadline: { type: Date, default: null },
  clientAttachments: { type: [String], default: [] }, // Array of Cloudinary URLs
  
  // Application details
  freelancerResumeUrl: { type: String, default: null },
  freelancerGithub: { type: String, default: null },
  freelancerCoverLetter: { type: String, default: null },
  
  // List of all applicants for the gig
  applicants: [{
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    freelancerResumeUrl: { type: String, default: null },
    freelancerGithub: { type: String, default: null },
    freelancerCoverLetter: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Submission details
  submissionDescription: { type: String, default: null },
  submissionFileUrl: { type: String, default: null },
  submissionLink: { type: String, default: null },
  
}, { timestamps: true });

export default mongoose.models.Gig || mongoose.model('Gig', GigSchema);
