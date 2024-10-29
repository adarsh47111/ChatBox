import mongoose from "mongoose";

const schema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const model = mongoose.model("friend-request", schema);
export default model;
