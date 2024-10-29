import mongoose from "mongoose";

const schema = new mongoose.Schema({
  otp: { type: String, required: true },
  reciever: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Expires after 10 minutes
});

const model = mongoose.model("OTP", schema);
export default model;
