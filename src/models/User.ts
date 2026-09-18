import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['client', 'freelancer'], required: true },
  walletAddress: { type: String, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
