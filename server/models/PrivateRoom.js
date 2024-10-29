import mongoose from "mongoose";

const schema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false, immutable: true },
  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  latest_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "message",
    default: null,
  },

  message_list: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
    default: [],
  },

  pinned: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  archived: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  unRead: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          default: null,
        },
        count: { type: Number, default: 0 },
      },
    ],
    default: [],
  },

  clearedHistory: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          default: null,
        },
        time: { type: String },
      },
    ],
  },

  deleted: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },
});

// pre hook to fill unread feild with participants and their initial unread count
schema.pre("save", function (next) {
  // 'this' refers to the document about to be saved
  if (this.isNew) {
    this.unRead = this.participants.map((participant) => ({
      user: participant,
      count: 0,
    }));
  }

  next();
});

const model = mongoose.model("private_room", schema);
export default model;
