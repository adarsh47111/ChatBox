import mongoose from "mongoose";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema({
  username: { type: "string" },
  avatar: {
    type: "string",
    default:
      "https://images.unsplash.com/photo-1712229307272-5cbb18c96f94?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNXx8fGVufDB8fHx8fA%3D%3D",
  },
  about: { type: "string", default: "Hi there, I am using ChatBox." },
  email: { type: "string" },
  password: { type: "string" },
  friends: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  socket_id: { type: "string" },
  status: {
    type: String,
    enum: ["Online", "Offline"],
  },
});

// Pre-save hook to hash the password
schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-update hook to hash the password on update operations
schema.pre(["findByIdAndUpdate", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Method to compare a candidate password with the stored password
schema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const model = mongoose.model("user", schema);
export default model;
