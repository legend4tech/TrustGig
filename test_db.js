import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const gigs = await mongoose.connection.collection('gigs').find({}).toArray();
  console.log("Gigs count:", gigs.length);
  gigs.forEach(g => {
    if (g.submissionLink) {
      console.log(`Gig ${g._id} submissionLink: ${g.submissionLink}`);
    }
  });
  process.exit(0);
});
