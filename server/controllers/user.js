import {
  FriendRequestModel,
  GroupRoomModel,
  MessageModel,
  PrivateRoomModel,
  UserModel,
} from "../models/index.js";

const updateUser = async (req, res, next) => {
  const user_id = req.user._id;
  const { username, about } = req.body;

  const user_doc = await UserModel.findByIdAndUpdate(
    user_id,
    {
      username,
      about,
    },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    data: { username: user_doc.username, about: user_doc.about },
    message: "user updated successfully",
  });
};

const updateUserAvatar = async (req, res, next) => {
  const user_id = req.user._id;
  const { avatarUrl } = req.body;
  const user_doc = await UserModel.findByIdAndUpdate(
    user_id,
    {
      avatar: avatarUrl,
    },
    { new: true }
  );

  return res.status(200).json({
    status: "success",
    data: { avatarUrl: user_doc.avatar },
    message: "user updated successfully",
  });
};

const getUsers = async (req, res, next) => {
  const user_id = req.user._id;
  const this_user = await UserModel.findById(user_id);

  // get all friendRequests in which this_user is either sender or receiver
  const friendRequests = await FriendRequestModel.find({
    $or: [{ sender: user_id }, { recipient: user_id }],
  });

  // create an array for execluded users
  let excludedUsers = [user_id, ...this_user.friends];

  // get all id that is of other users in the request
  const temp = friendRequests.map(({ sender, recipient }) => {
    if (sender.toString() !== user_id.toString()) return sender;
    else return recipient;
  });

  excludedUsers = [...excludedUsers, ...temp];

  const remaining_users = await UserModel.find({
    _id: { $nin: excludedUsers },
  });

  return res.status(200).json({
    status: "success",
    data: remaining_users,
    message: "users fetched successfully",
  });
};

const getUserInfo = async (req, res) => {
  const user_id = req.params.id;
  const user_doc = await UserModel.findById(user_id);
  return res.status(200).json({
    status: "success",
    data: {
      username: user_doc.username,
      email: user_doc.email,
      avatar: user_doc.avatar,
      about: user_doc.about,
    },
    message: "user info fetched successfully",
  });
};

const getGroupInfo = async (req, res, next) => {
  try {
    const room_id = req.params.id;
    const room_doc = await GroupRoomModel.findById(room_id).populate(
      "participants",
      "username avatar"
    );
    return res.status(200).json({
      status: "success",
      data: {
        name: room_doc.name,
        avatar: room_doc.avatar,
        participants: room_doc.participants,
      },
      message: "user info fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getFriends = async (req, res, next) => {
  const user_id = req.user._id;
  const user_doc = await UserModel.findById(user_id).populate(
    "friends",
    "_id username email avatar"
  );

  return res.status(200).json({
    status: "success",
    data: user_doc.friends,
    message: "friends fetched successfully",
  });
};

const getFriendRequests = async (req, res, next) => {
  const user_id = req.user._id;
  const request = await FriendRequestModel.find({
    $or: [{ sender: user_id }, { recipient: user_id }],
  })
    .populate("sender", "_id username email avatar")
    .populate("recipient", "_id username email avatar");

  return res.status(200).json({
    status: "success",
    data: request,
    message: "friend requests fetched successfully",
  });
};

const getPrivateConversationsList = async (req, res, next) => {
  const user_id = req.user._id;

  let conversations;
  try {
    conversations = await PrivateRoomModel.find({
      participants: { $all: [user_id] },
    })
      .lean() // Convert the Mongoose document to a plain JavaScript object
      .populate("participants", "_id username email avatar status")
      .populate("latest_message");
  } catch (error) {
    return next(error);
  }

  // filter out deleted conversations for this user
  conversations = conversations
    .filter((ele) => {
      if (ele.deleted.length === 0) return true;

      const not_delted = ele.deleted.some((el) => {
        return el.toString() !== user_id.toString();
      });

      return not_delted;
    })
    .map((ele) => {
      delete ele.deleted;
      return ele;
    });

  conversations = conversations.map((ele) => {
    // set pinned, archived
    ele.pinned = ele.pinned.some((el) => el.toString() === user_id.toString());
    ele.archived = ele.archived.some(
      (el) => el.toString() === user_id.toString()
    );

    if (ele.latest_message !== null) {
      // set latest message to null, if it was sent before history is cleared for this user for each conversation

      const cleardHistory = ele.clearedHistory.find(
        (el) => el.user.toString() === user_id.toString()
      );
      if (cleardHistory && cleardHistory.time > ele.latest_message.time) {
        ele.latest_message = null;
      } else {
        // set latest_message (deleted, starred)
        ele.latest_message.deleted = ele?.latest_message.deleted.some(
          (el) => el.toString() === user_id.toString()
        );

        ele.latest_message.starred = ele.latest_message.starred.some(
          (el) => el.toString() === user_id.toString()
        );
      }
    }
    // unread count
    const unReadObj = ele.unRead.find(
      (el) => el.user.toString() === user_id.toString()
    );
    ele.unRead = unReadObj.count;

    return ele;
  });

  return res.status(200).json({
    status: "success",
    data: conversations,
    message: "conversations fetched successfully",
  });
};

const getGroupConversationsList = async (req, res, next) => {
  const user_id = req.user._id;

  let conversations;
  try {
    conversations = await GroupRoomModel.find({
      $or: [
        { participants: { $all: [user_id] } },
        { removedParticipants: { $all: [user_id] } },
      ],
    })
      .lean()
      .populate("participants", "_id username email avatar status")
      .populate("latest_message");
  } catch (error) {
    return next(error);
  }

  // filter out deleted conversations for this user
  conversations = conversations
    .filter((ele) => {
      if (ele.deleted.length === 0) return true;

      const not_delted = ele.deleted.some((el) => {
        return el.toString() !== user_id.toString();
      });

      return not_delted;
    })
    .map((ele) => {
      delete ele.deleted;
      return ele;
    });

  conversations = conversations.map((ele) => {
    // set pinned, archived
    ele.pinned = ele.pinned.some((el) => el.toString() === user_id.toString());
    ele.archived = ele.archived.some(
      (el) => el.toString() === user_id.toString()
    );

    if (ele.latest_message !== null) {
      // set latest message to null, if it was sent before history is cleared for this user for each conversation

      const cleardHistory = ele.clearedHistory.find(
        (el) => el.user.toString() === user_id.toString()
      );
      if (cleardHistory && cleardHistory.time > ele.latest_message.time) {
        ele.latest_message = null;
      } else {
        // set latest_message (deleted, starred)
        ele.latest_message.deleted = ele?.latest_message.deleted.some(
          (el) => el.toString() === user_id.toString()
        );

        ele.latest_message.starred = ele.latest_message.starred.some(
          (el) => el.toString() === user_id.toString()
        );
      }
    }
    // unread count
    const unReadObj = ele.unRead.find(
      (el) => el.user.toString() === user_id.toString()
    );
    ele.unRead = unReadObj.count;

    return ele;
  });

  return res.status(200).json({
    status: "success",
    data: conversations,
    message: "conversations fetched successfully",
  });
};

const getPrivateConversation = async (req, res, next) => {
  const user_id = req.user._id;
  const other_user_id = req.query.other_user;

  let conversation;
  try {
    // check if there is a conversation
    conversation = await PrivateRoomModel.findOne({
      participants: { $all: [user_id, other_user_id] },
    })
      .lean() // Convert the Mongoose document to a plain JavaScript object
      .populate("participants", "_id username email avatar status")
      .populate("latest_message");

    // if not create a new one
    if (!conversation) {
      conversation = await PrivateRoomModel.create({
        participants: [user_id, other_user_id],
      });

      conversation = await PrivateRoomModel.findById(conversation._id)
        .lean() // Convert the Mongoose document to a plain JavaScript object
        .populate("participants", "_id username email avatar status")
        .populate("latest_message");
    }
    // Mongoose documents are immutable by default, and directly modifying Mongoose document properties may not work as expected.
    // so to do some modifications, we need to convert the Mongoose document to a plain JavaScript object with lean() method

    // check if this conversation has been deleted previously
    // if yes then remove the entry for this user in it and save the document
    const deleted = conversation.deleted.filter(
      (ele) => ele.toString() !== user_id.toString()
    );

    await PrivateRoomModel.findByIdAndUpdate(conversation._id, {
      deleted: deleted,
    });
  } catch (error) {
    return next(error);
  }

  // delete the 'deleted' property as it is not needed by user
  // delete conversation.deleted;

  // setting pinned and archived from array to boolean value
  conversation.pinned = conversation.pinned.some(
    (el) => el.toString() === user_id.toString()
  );
  conversation.archived = conversation.archived.some(
    (el) => el.toString() === user_id.toString()
  );

  // unread count
  const unReadObj = conversation.unRead.find(
    (el) => el.user.toString() === user_id.toString()
  );
  conversation.unRead = unReadObj.count;

  if (conversation.latest_message !== null) {
    // set latest message to null, if it was sent before history is cleared for this user for each conversation

    const cleardHistory = conversation.clearedHistory.find(
      (el) => el.user.toString() === user_id.toString()
    );

    if (
      cleardHistory &&
      cleardHistory.time > conversation.latest_message.time
    ) {
      conversation.latest_message = null;
    } else {
      // set latest_message (deleted, starred)
      conversation.latest_message.deleted =
        conversation.latest_message.deleted.some(
          (el) => el.toString() === user_id.toString()
        );
      conversation.latest_message.starred =
        conversation.latest_message.starred.some(
          (el) => el.toString() === user_id.toString()
        );
    }
  }

  return res.status(200).json({
    status: "success",
    data: conversation,
    message: "conversation fetched successfully",
  });
};

// TODO: remove redundant comments
const getGroupConversation = async (req, res, next) => {
  const user_id = req.user._id;
  const { group_name, creator, admin, member_list } = req.body;

  // add time of joining of each member to show filtered chats
  const participantAddTime_list = member_list.map((member) => {
    return {
      participant: member,
      time: new Date().getTime(),
    };
  });

  let conversation;
  try {
    conversation = await GroupRoomModel.create({
      name: group_name,
      creator,
      admin,
      participants: member_list,
      participantAddTime: participantAddTime_list,
    });

    conversation = await GroupRoomModel.findById(conversation._id)
      .lean()
      .populate("participants", "_id username email avatar status")
      .populate("latest_message");

    // check if this conversation has been deleted previously
    // if yes then remove the entry for this user in it and save the document
    const deleted = conversation.deleted.filter(
      (ele) => ele.toString() !== user_id.toString()
    );

    await PrivateRoomModel.findByIdAndUpdate(conversation._id, {
      deleted: deleted,
    });
  } catch (error) {
    return next(error);
  }

  // delete the 'deleted' property as it is not needed by user
  delete conversation.deleted;

  // setting pinned and archived from array to boolean value
  conversation.pinned = conversation.pinned.some(
    (el) => el.toString() === user_id.toString()
  );
  conversation.archived = conversation.archived.some(
    (el) => el.toString() === user_id.toString()
  );

  // unread count
  const unReadObj = conversation.unRead.find(
    (el) => el.user.toString() === user_id.toString()
  );
  conversation.unRead = unReadObj.count;

  if (conversation.latest_message !== null) {
    // set latest message to null, if it was sent before history is cleared for this user for each conversation

    const cleardHistory = conversation.clearedHistory.find(
      (el) => el.user.toString() === user_id.toString()
    );

    if (
      cleardHistory &&
      cleardHistory.time > conversation.latest_message.time
    ) {
      conversation.latest_message = null;
    } else {
      // set latest_message (deleted, starred)
      conversation.latest_message.deleted =
        conversation.latest_message.deleted.some(
          (el) => el.toString() === user_id.toString()
        );
      conversation.latest_message.starred =
        conversation.latest_message.starred.some(
          (el) => el.toString() === user_id.toString()
        );
    }
  }

  return res.status(200).json({
    status: "success",
    data: conversation,
    message: "conversation fetched successfully",
  });
};

const getChatHistory = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_type, room_id } = req.query;

  let chat_history, room;
  try {
    // get list of message ids from respective room
    const roomModel =
      room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;
    room = await roomModel
      .findById(room_id)
      .select("message_list clearedHistory");
  } catch (error) {
    return next(error);
  }

  // populate chat_history from message ids
  chat_history = await MessageModel.find({
    _id: { $in: room.message_list },
  })
    .lean()
    .populate("sender", "_id username avatar");

  // filtering messages, which are send after latest clearedHistory time
  const cleardHistory = room.clearedHistory.find(
    (ele) => ele.user.toString() === user_id.toString()
  );

  if (cleardHistory)
    chat_history = chat_history.filter((ele) => ele.time > cleardHistory.time);

  // set deleted and starred properties
  chat_history = chat_history.map((msg) => {
    msg.deleted = msg.deleted.some(
      (el) => el.toString() === user_id.toString()
    );

    msg.starred = msg.starred.some(
      (el) => el.toString() === user_id.toString()
    );
    return msg;
  });

  return res.status(200).json({
    status: "success",
    data: chat_history,
    message: "chat history fetched successfully",
  });
};

const clearChatHistory = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_type, room_id, time } = req.query;

  const roomModel =
    room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;

  let room;
  try {
    room = await roomModel.findById(room_id);

    // find the index of entry for this user
    const idx = room.clearedHistory.findIndex(
      (ele) => ele.user.toString() === user_id.toString()
    );

    // clear history
    if (idx === -1) room.clearedHistory.push({ user: user_id, time });
    else room.clearedHistory[idx].time = time;

    //set unread = 0
    room.unRead = room.unRead.map((ele) => {
      if (ele.user.toString() !== user_id.toString()) return ele;

      ele.count = 0;
      return ele;
    });

    await room.save();
  } catch (error) {
    return next(error);
  }

  return res.status(200).json({
    status: "success",
    message: "Chat history cleared successfully",
  });
};

const getCommonGroups = async (req, res, next) => {
  const user_id = req.user._id;
  const other_user_id = req.query.other_user;

  let groups = await GroupRoomModel.find({
    participants: { $all: [user_id, other_user_id] },
  });

  groups = groups.map((ele) => {
    return {
      _id: ele._id,
      name: ele.name,
      avatar: ele.avatar,
      participants_count: ele.participants.length,
    };
  });

  return res.status(200).json({
    status: "success",
    data: groups,
    message: "common groups fetched successfully",
  });
};

const pinConversation = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_id, room_type, pin } = req.body;

  const roomModel =
    room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;
  const room = await roomModel.findById(room_id);

  if (pin === true) room.pinned = [...room.pinned, user_id];
  else
    room.pinned = room.pinned.filter(
      (el) => el.toString() !== user_id.toString()
    );

  await room.save();

  return res.status(200).json({
    status: "success",
    message: "Pin status changed successfully",
  });
};

const archiveConversation = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_id, room_type, archive } = req.body;

  const roomModel =
    room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;
  const room = await roomModel.findById(room_id);

  if (archive === true) {
    // add to archive
    room.archived = [...room.archived, user_id];

    // remove from pinned list
    room.pinned = room.pinned.filter(
      (el) => el.toString() !== user_id.toString()
    );
  } else
    room.archived = room.archived.filter(
      (el) => el.toString() !== user_id.toString()
    );

  await room.save();

  return res.status(200).json({
    status: "success",
    message: "Archive status changed successfully",
  });
};

// delete a conversation for a user
const deleteConversation = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_id, room_type } = req.query;

  const roomModel =
    room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;
  try {
    const room = await roomModel.findById(room_id);

    // check if deleted property already contains user
    const containsUser = room.deleted.some(
      (ele) => ele.toString() === user_id.toString
    );
    if (!containsUser) room.deleted.push(user_id);

    // check if all participants deleted this conversation
    const allDelete = room.participants.every((user) =>
      room.deleted.includes(user)
    );

    if (allDelete) {
      room.message_list.forEach(async (msg) => {
        //delete message from firebase if it is "image" or "document"
        if (msg.type === "Image" || msg.type === "Document") {
          await deleteFile({
            fileName: msg.time + "$" + msg.fileName,
          });
        }
      });
      await MessageModel.deleteMany({ _id: { $in: room.message_list } });
      await roomModel.findByIdAndDelete(room_id);
    } else {
      // clear history for this conversation for this user
      const idx = room.clearedHistory.findIndex(
        (ele) => ele.user.toString() === user_id.toString()
      );

      if (idx === -1)
        room.clearedHistory.push({ user: user_id, time: Date.now() });
      else room.clearedHistory[idx].time = Date.now();

      await room.save();
    }
  } catch (error) {
    return next(error);
  }

  return res.status(200).json({
    status: "success",
    message: "Conversation deleted successfully",
  });
};

const starMessage = async (req, res, next) => {
  const user_id = req.user._id;
  const { message_id, star } = req.query;

  try {
    const message = await MessageModel.findById(message_id);

    if (star === "true") message.starred = [...message.starred, user_id];
    else
      message.starred = message.starred.filter(
        (el) => el.toString() !== user_id.toString()
      );

    await message.save();
  } catch (error) {
    return next(error);
  }

  return res.status(200).json({
    status: "success",
    message: "Star status changed successfully",
  });
};

const deleteMessage = async (req, res, next) => {
  const user_id = req.user._id;
  const { room_type, room_id, message_id, all } = req.query;

  const roomModel =
    room_type === "PRIVATE_CHAT" ? PrivateRoomModel : GroupRoomModel;

  const room = await roomModel.findById(room_id);
  const message = await MessageModel.findById(message_id);

  if (all === "true") message.deleted = room.participants;
  else message.deleted = [...message.deleted, user_id];

  await message.save();

  return res.status(200).json({
    status: "success",
    message: "Message deleted successfully",
  });
};

export {
  updateUser,
  updateUserAvatar,
  getUsers,
  getUserInfo,
  getGroupInfo,
  getFriends,
  getFriendRequests,
  getPrivateConversationsList,
  getGroupConversationsList,
  getPrivateConversation,
  getGroupConversation,
  getChatHistory,
  clearChatHistory,
  getCommonGroups,
  pinConversation,
  archiveConversation,
  deleteConversation,
  starMessage,
  deleteMessage,
};
