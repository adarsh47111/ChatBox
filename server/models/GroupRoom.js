import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: "string" },
  avatar: {
    type: "string",
    default:
      "https://images.unsplash.com/photo-1574169208507-84376144848b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D",
  },
  isGroup: { type: Boolean, default: true, immutable: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  admin: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],

  participants: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    default: [],
  },

  // participantAddTime: {
  //   type: [
  //     {
  //       participant: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  //       time: { type: String },
  //     },
  //   ],
  //   default: [],
  // },

  removedParticipants: {
    type: [
      {
        participant: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        time: { type: String },
      },
    ],
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

const model = mongoose.model("group_room", schema);
export default model;
