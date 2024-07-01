import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiry: { type: Date, required: true }
});

export default mongoose.model("Token", tokenSchema);
