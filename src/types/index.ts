export interface IUser {
  _id: string;
  name?: string;
  email: string;
  role: 'client' | 'freelancer';
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGig {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  status: 'open' | 'pending_approval' | 'in_progress' | 'review' | 'completed' | 'paid' | 'cancelled';
  skills: string[];
  clientAttachments?: string[];
  clientId: string | IUser;
  freelancerId?: string | IUser;
  escrowContractId?: string;
  contractId?: string;
  contractAddress?: string;
  freelancerGithub?: string;
  freelancerResumeUrl?: string;
  submissionDescription?: string;
  submissionFileUrl?: string;
  submissionLink?: string;
  freelancerCoverLetter?: string;
  applicants?: {
    freelancerId: string | IUser;
    freelancerResumeUrl?: string;
    freelancerGithub?: string;
    freelancerCoverLetter?: string;
    createdAt?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}
