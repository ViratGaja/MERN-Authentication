import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Fixed "require" to "required"
  email: { type: String, required: true, unique: true }, // Fixed "ture" to "true"
  password: { type: String, required: true },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: '' },
  resetOtpExpireAt: { type: Number, default: 0 },
});

// Prevents re-registering the model in case of hot-reloading
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
