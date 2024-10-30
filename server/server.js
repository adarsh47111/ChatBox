import express from "express";
import http from "http";
import router from "./routes/index.js";
import connectDB from "./utils/db.js";
import { Server } from "socket.io";
import {
  FriendRequestModel,
  GroupRoomModel,
  MessageModel,
  PrivateRoomModel,
  UserModel,
} from "./models/index.js";
import cors from "cors";
import { deleteFile } from "./services/FireBase.js";
import { errorHandler } from "./errorHandler.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   const { method, url, headers, body } = req;
//   logger.info(`Method: ${method}`);
//   logger.info(`URL: ${url}`);
//   logger.info(`Headers:`, headers);
//   logger.info(`Body:`, body);
//   logger.info(
//     "----------------------------------------------------------------------------"
//   ); // Separator for clarity
//   next(); // Pass control to the next middleware/route handler
// });
app.use(router);

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  const user_id = socket.handshake.query["user_id"];
  socket.user_id = user_id;
  // console.log(`User connected ${socket.id} `, user_id);

  if (user_id != null && Boolean(user_id)) {
    try {
      await UserModel.findByIdAndUpdate(user_id, {
        socket_id: socket.id,
        status: "Online",
      });

      io.emit("user_status", { user_id, isOnline: true });
    } catch (e) {
      console.error(e);
    }
  }

  // TODO: typing indicator
  // socket.on("typing", async (room_id) => {
  //   const room = await PrivateRoomModel.findById(room_id).populate(
  //     "participants",
  //     "socket_id"
  //   );

  //   room.participants.forEach((ele) =>
  //     socket.to(ele.socket_id).emit("typing", room_id)
  //   );
  // });
  // socket.on("stop_typing", async (room_id) => {
  //   const room = await PrivateRoomModel.findById(room_id).populate(
  //     "participants",
  //     "socket_id"
  //   );

  //   room?.participants.forEach((ele) =>
  //     socket.to(ele.socket_id).emit("stop_typing", room_id)
  //   );
  // });

  socket.on("friend_request", async (data) => {
    // data => {sender, recipient}

    const sender = await UserModel.findOne(
      { _id: data.sender },
      { socket_id: 1 }
    );
    const recipient = await UserModel.findOne(
      { _id: data.recipient },
      { socket_id: 1 }
    );

    // check if there is already a request
    let request = await FriendRequestModel.findOne({
      sender,
      recipient,
    });

    if (request) return;

    // create a request
    request = await FriendRequestModel.create({
      sender,
      recipient,
    });

    request = await FriendRequestModel.populate(request, [
      { path: "sender", select: "_id username email avatar" },
      { path: "recipient", select: "_id username email avatar" },
    ]);

    // emit to recipient
    io.to(recipient.socket_id).emit("new_friend_request", {
      request,
      message: "New friend request received",
    });
    // confirm request sent
    io.to(sender.socket_id).emit("friend_request_delivery_confirmation", {
      request,
      message: "Request sent successfully",
    });
  });

  socket.on("cancel_friend_request", async ({ request_id }) => {
    // check if there is a request with request_id
    const request_doc = await FriendRequestModel.findById(request_id)
      .populate("sender", "socket_id")
      .populate("recipient", "socket_id");

    if (!request_doc) return;
    await FriendRequestModel.findByIdAndDelete(request_id);

    io.to(request_doc.sender.socket_id).emit(
      "friend_request_cancel_confirmation",
      {
        request: request_doc,
        message: "Friend Request cancelled",
      }
    );

    io.to(request_doc.recipient.socket_id).emit(
      "friend_request_cancel_confirmation",
      {
        request: request_doc,
        message: "Friend Request cancelled",
      }
    );
  });

  socket.on("accept_request", async ({ request_id }) => {
    const request_doc = await FriendRequestModel.findById(request_id)
      .populate("sender", "_id username email avatar socket_id")
      .populate("recipient", "_id username email avatar socket_id");

    if (!request_doc) return;

    // get sender and recipient document
    const sender = await UserModel.findById(request_doc.sender._id);
    const recipient = await UserModel.findById(request_doc.recipient._id);

    //add sender and recipient to each others friend list
    sender.friends.push(request_doc.recipient._id);
    recipient.friends.push(request_doc.sender._id);

    // save update and delete friend request from model
    await sender.save({ new: true, validateModifiedOnly: true });
    await recipient.save({ new: true, validateModifiedOnly: true });
    await FriendRequestModel.findByIdAndDelete(request_doc._id);

    io.to(sender.socket_id).emit("request_accepted", {
      request: request_doc,
      message: `${recipient.username} accepted your friend request`,
    });
    io.to(recipient.socket_id).emit("request_accepted", {
      request: request_doc,
      message: `${sender.username} accepted your friend request`,
    });
  });

  socket.on("decline_request", async ({ request_id }) => {
    // check if there is a request with request_id
    const request_doc = await FriendRequestModel.findById(request_id)
      .populate("sender", "username socket_id")
      .populate("recipient", "username socket_id");

    if (!request_doc) return;
    await FriendRequestModel.findByIdAndDelete(request_id);

    io.to(request_doc.sender.socket_id).emit("request_declined", {
      request: request_doc,
      message: `${request_doc.recipient.username} declined your friend request`,
    });

    io.to(request_doc.recipient.socket_id).emit("request_declined", {
      request: request_doc,
      message: `${request_doc.sender.username} declined your friend request`,
    });
  });

  socket.on("reset_unread_count", async ({ room_id, room_type, user_id }) => {
    // reset the unread count
    const roomModel =
      room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;
    const room = await roomModel.findById(room_id);

    const updatedRoom = await roomModel.findOneAndUpdate(
      { _id: room_id, "unRead.user": user_id },
      { $set: { "unRead.$.count": 0 } },
      { new: true }
    );
  });

  socket.on(
    "text_message",
    async ({ sender, room_id, chat_type, fileType, message, time }) => {
      // it is called when user send a text message
      // create message document

      let msg_doc = {
        sender,
        room_type: chat_type,
        type: fileType,
        text: message,
        time,
        saveStatus: "SUCCESSFUL",
      };

      // add room_id according to chat_type
      if (chat_type === "PRIVATE_CHAT") {
        msg_doc.PrivateRoom = room_id;
      } else {
        msg_doc.GroupRoom = room_id;
      }

      msg_doc = await MessageModel.create(msg_doc);
      msg_doc = await MessageModel.findById(msg_doc._id)
        .lean()
        .populate("sender", "_id username avatar");

      // set deleted and starred properties
      msg_doc.deleted = msg_doc.deleted.some(
        (el) => el.toString() === user_id.toString()
      );

      msg_doc.starred = msg_doc.starred.some(
        (el) => el.toString() === user_id.toString()
      );

      // get room and add msg_doc.id to message list
      let room;
      if (chat_type === "PRIVATE_CHAT")
        room = await PrivateRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );
      else if (chat_type === "GROUP_CHAT")
        room = await GroupRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );

      // empty the deletd array
      // if a user has sent and some user had deleted the room, still he should recieve the message
      room.deleted = [];

      // update the unread count for every participants
      // for sender it is 0
      room.unRead = room.unRead.map((ele) => {
        if (ele.user === sender) return ele;
        else return { user: ele.user, count: ele.count + 1 };
      });

      room.message_list.push(msg_doc._id);
      room.latest_message = msg_doc;

      // save to db
      await room.save({ new: true, validateModifiedOnly: true });

      // emit incoming_message -> to user
      room.participants.map((user) => {
        io.to(user?.socket_id).emit("new_message", msg_doc);
      });
    }
  );

  socket.on(
    "file_message",
    async (
      {
        sender,
        room_id,
        chat_type,
        image,
        // fileUrl,
        fileName,
        fileType,
        time,
      },
      callback
    ) => {
      let msg_doc = {
        sender,
        room_type: chat_type,
        type: image ? "Image" : "Document",
        fileName,
        // fileUrl,
        fileType,
        time,
        saveStatus: "PENDING",
      };

      if (chat_type) {
        msg_doc.PrivateRoom = room_id;
      } else {
        msg_doc.GroupRoom = room_id;
      }

      msg_doc = await MessageModel.create(msg_doc);
      msg_doc = await msg_doc.populate("sender", "_id username avatar");

      // this cb sends msg_id to client, so that after upload is done url can be saved in db using this id
      callback({ msg_id: msg_doc._id });

      //set deleted and starred false before sending
      msg_doc = msg_doc.toObject();
      msg_doc.deleted = false;
      msg_doc.starred = false;

      // get room and add msg_doc.id to message list
      let room;
      if (chat_type === "PRIVATE_CHAT")
        room = await PrivateRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );
      else if (chat_type === "GROUP_CHAT")
        room = await GroupRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );

      // update the unread count for every participants
      // for sender it is 0
      room.unRead = room.unRead.map((ele) => {
        if (ele.user === sender) return ele;
        else return { user: ele.user, count: ele.count + 1 };
      });

      room.message_list.push(msg_doc._id);
      room.latest_message = msg_doc;

      // save to db
      await room.save({ new: true, validateModifiedOnly: true });

      // emit incoming_message -> to user
      room.participants.map((user) => {
        io.to(user?.socket_id).emit("new_message", msg_doc);
      });
    }
  );

  socket.on("fileSave_successful", async (msg_id, url, chat_type, room_id) => {
    try {
      const msg = await MessageModel.findById(msg_id);
      msg.fileUrl = url;
      msg.saveStatus = "SUCCESSFUL";
      await msg.save();

      // get room to send event to all members
      let room;
      if (chat_type === "PRIVATE_CHAT")
        room = await PrivateRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );
      else if (chat_type === "GROUP_CHAT")
        room = await GroupRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );

      room.participants.map((user) => {
        io.to(user?.socket_id).emit("update_FileMessage", {
          msg_id,
          url,
          saveStatus: msg.saveStatus,
        });
      });
    } catch (error) {
      console.error(error);
    }
  });
  socket.on("fileSave_unsuccessful", async (msg_id, chat_type, room_id) => {
    try {
      const msg = MessageModel.findById(msg_id);
      msg.saveStatus = "FAILED";
      msg.save();

      // get room to send event to all members
      let room;
      if (chat_type === "PRIVATE_CHAT")
        room = await PrivateRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );
      else if (chat_type === "GROUP_CHAT")
        room = await GroupRoomModel.findById(room_id).populate(
          "participants",
          "socket_id"
        );

      room.participants.map((user) => {
        io.to(user?.socket_id).emit("update_FileMessage", {
          msg_id,
          saveStatus: msg.saveStatus,
        });
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on(
    "delete_message",
    async ({ room_type, room_id, msg_type, message_id, all }) => {
      const roomModel =
        room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;

      const room = await roomModel
        .findById(room_id)
        .populate("participants", "_id socket_id");
      const message = await MessageModel.findById(message_id);

      if (all === true) {
        //delete message from firebase if it is "image" or "document"
        if (msg_type === "Image" || msg_type === "Document") {
          await deleteFile({
            fileName: message.time + "$" + message.fileName,
          });
        }
        message.deleted = room.participants.map((ele) => ele._id);
      } else message.deleted = [...message.deleted, user_id];

      await message.save();

      if (all === true) {
        room.participants.forEach((participant) =>
          io.to(participant.socket_id).emit("message_deleted", { message_id })
        );
      } else {
        io.to(socket.id).emit("message_deleted", {
          message_id,
        });
      }
    }
  );

  socket.on("addMemberToGroup", async (userId, roomId, addedBy_name) => {
    try {
      //add user to group's participants list
      let room = await GroupRoomModel.findOne({ _id: roomId });
      room.removedParticipants = room.removedParticipants.filter(
        ({ participant }) => {
          return participant.toString() !== userId;
        }
      );
      room.participants.push(userId);
      // room.participantAddTime.push({
      //   participant: userId,
      //   time: new Date().getTime(),
      // });
      await room.save();

      const user = await UserModel.findById(userId).select(
        "_id username avatar email status"
      );

      // ------------------------------------------------------------------
      // TODO: add this info as message in db to make it available in chat history to show this info on chat screen
      let msg_doc = {
        room_type: "GROUP_CHAT",
        type: "Info",
        text: `${user.username} added by ${addedBy_name}`,
        time: new Date().getTime(),
        GroupRoom: roomId,
      };

      const msg = await MessageModel.create(msg_doc);
      room.message_list.push(msg);
      await room.save();

      // ------------------------------------------------------------------

      // participants's socket id
      const socketIds = await Promise.all(
        room.participants.map(async (p) => {
          const user = await UserModel.findById(p).select("socket_id");
          return user.socket_id;
        })
      );

      // notify all users in the group
      socketIds.forEach((sid) => {
        io.to(sid).emit("new_participantAddedToGroup", {
          user,
          room_id: roomId,
          msg,
        });
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("removeMemberFromGroup", async (userId, roomId, removedBy_name) => {
    try {
      //add user to group's participants list
      let room = await GroupRoomModel.findOne({ _id: roomId });
      room.participants = room.participants.filter((participant) => {
        return participant.toString() !== userId;
      });
      // room.participantAddTime = room.participantAddTime.filter(
      //   ({ participant }) => {
      //     return participant.toString() !== userId;
      //   }
      // );

      const user = await UserModel.findById(userId).select("username");
      // ------------------------------------------------------------------
      // TODO: add this info as message in db to make it available in chat history to show this info on chat screen
      let msg_doc = {
        room_type: "GROUP_CHAT",
        type: "Info",
        text: `${user.username} removed by ${removedBy_name}`,
        time: new Date().getTime(),
        GroupRoom: roomId,
      };

      const msg = await MessageModel.create(msg_doc);
      room.message_list.push(msg);
      await room.save();

      // ------------------------------------------------------------------

      room.removedParticipants.push({
        participant: userId,
        time: new Date().getTime(),
      });
      await room.save();

      // participants's socket id
      const socketIds = await Promise.all(
        [...room.participants, userId].map(async (p) => {
          const user = await UserModel.findById(p).select("socket_id");
          return user.socket_id;
        })
      );

      // notify all users remaining in the group
      socketIds.forEach((sid) => {
        io.to(sid).emit("participantRemovedFromGroup", {
          user_id: userId,
          room_id: roomId,
          msg,
        });
      });

      // also notify removed user
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("addToAdminOfGroup", async (userId, roomId, madeBy_name) => {
    try {
      //add user to group's admin list
      let room = await GroupRoomModel.findOne({ _id: roomId });
      room.admin.push(userId);

      const user = await UserModel.findById(userId).select("username");
      // ------------------------------------------------------------------
      // TODO: add this info as message in db to make it available in chat history to show this info on chat screen
      let msg_doc = {
        room_type: "GROUP_CHAT",
        type: "Info",
        text: `${user.username} made admin by ${madeBy_name}`,
        time: new Date().getTime(),
        GroupRoom: roomId,
      };

      const msg = await MessageModel.create(msg_doc);
      room.message_list.push(msg);
      await room.save();

      // ------------------------------------------------------------------

      // participants's socket id
      const socketIds = await Promise.all(
        [...room.participants, userId].map(async (p) => {
          const user = await UserModel.findById(p).select("socket_id");
          return user.socket_id;
        })
      );

      // notify all users remaining in the group
      socketIds.forEach((sid) => {
        io.to(sid).emit("adminAddedToGroup", {
          user_id: userId,
          room_id: roomId,
          msg,
        });
      });

      // also notify removed user
    } catch (error) {
      console.error(error);
    }
  });

  socket.on(
    "removeFronAdminOfGroup",
    async (userId, roomId, removedBy_name) => {
      try {
        //remove user to group's admin list
        let room = await GroupRoomModel.findOne({ _id: roomId });
        room.admin = room.admin.filter((adm) => {
          return adm.toString() !== userId;
        });

        const user = await UserModel.findById(userId).select("username");
        // ------------------------------------------------------------------
        // TODO: add this info as message in db to make it available in chat history to show this info on chat screen
        let msg_doc = {
          room_type: "GROUP_CHAT",
          type: "Info",
          text: `${user.username} removed from admin by ${removedBy_name}`,
          time: new Date().getTime(),
          GroupRoom: roomId,
        };

        const msg = await MessageModel.create(msg_doc);
        room.message_list.push(msg);
        await room.save();

        // ------------------------------------------------------------------

        // participants's socket id
        const socketIds = await Promise.all(
          [...room.participants, userId].map(async (p) => {
            const user = await UserModel.findById(p).select("socket_id");
            return user.socket_id;
          })
        );

        // notify all users remaining in the group
        socketIds.forEach((sid) => {
          io.to(sid).emit("adminRemovedFromGroup", {
            user_id: userId,
            room_id: roomId,
            msg,
          });
        });

        // also notify removed user
      } catch (error) {
        console.error(error);
      }
    }
  );

  socket.on("disconnect", async () => {
    // Find user by ID and set status as offline

    if (socket.user_id) {
      await UserModel.findByIdAndUpdate(socket.user_id, { status: "Offline" });
    }

    // broadcast to all conversation rooms of this user that this user is offline (disconnected)
    io.emit("user_status", { user_id, isOnline: false });

    console.log("closing connection");
    socket.disconnect(0);
  });
});

app.use(errorHandler);
