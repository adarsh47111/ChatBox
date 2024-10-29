import mongoose from "mongoose";

const schema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  room_type: {
    type: String,
    enum: ["PRIVATE_CHAT", "GROUP_CHAT"],
  },
  PrivateRoom: { type: mongoose.Schema.Types.ObjectId, ref: "private_room" },
  GroupRoom: { type: mongoose.Schema.Types.ObjectId, ref: "group_room" },
  type: {
    type: String,
    enum: ["Text", "Image", "Document", "Link", "Info"],
  },
  saveStatus: {
    type: String,
    enum: ["SUCCESSFUL", "FAILED", "PENDING"],
  },
  time: { type: String },
  text: { type: String },
  fileName: { type: String },
  fileUrl: { type: String },
  fileType: { type: String },
  
  deleted: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  starred: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  // deletedForAll: { type: Boolean, default: false },
  //   pinned: { type: Boolean, default: false },
});

const model = mongoose.model("message", schema);
export default model;
