import { socket } from "@/socket";
import {
  archiveConversation,
  deleteMessage,
  getChatHistory,
  getGroupConversationsList,
  getPrivateConversationsList,
  pinConversation,
  starMessage,
} from "@/utils/api";
import { createSlice } from "@reduxjs/toolkit";
import { UnSelectConversation } from "./app";
// import { persistor } from "../store";

const initialState = {
  private_chat: {
    all_conversations: [],
  },
  group_chat: {
    all_conversations: [],
  },
  current_conversation: null,
  current_messages: [],
};

const slice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    reset: (state) => {
      state.private_chat.all_conversations = [];
      state.group_chat.all_conversations = [];
      state.current_conversation = null;
      state.current_messages = [];
    },

    setPrivateAllConversation(state, action) {
      const user_id = action.payload.user_id;

      const list = action.payload.conversations?.map((el) => {
        const other_user = el.participants.find(
          (ele) => ele._id.toString() !== user_id
        );

        // trim latest message
        if (el.latest_message?.text?.length > 20)
          el.latest_message.text =
            el.latest_message.text.substring(0, 20) + "...";

        return {
          room_id: el._id,
          other_user_id: other_user?._id,
          name: other_user?.username,
          avatar: other_user?.avatar,
          latest_message: el.latest_message,
          online: other_user?.status === "Online",
          unRead: el.unRead,
          pinned: el.pinned,
          archived: el.archived,
        };
      });

      state.private_chat.all_conversations = list;
    },

    setGroupAllConversation(state, action) {
      const list = action.payload.conversations?.map((el) => {
        // trim latest message
        if (el.latest_message?.text?.length > 20)
          el.latest_message.text =
            el.latest_message.text.substring(0, 20) + "...";

        return {
          room_id: el._id,
          name: el.name,
          creator: el.creator,
          admin: el.admin,
          participants: el.participants,
          avatar: el.avatar,
          latest_message: el.latest_message,
          unRead: el.unRead,
          pinned: el.pinned,
          archived: el.archived,
        };
      });

      state.group_chat.all_conversations = list;
    },

    updatePrivateChatConversation(state, action) {
      const user_id = action.payload.user_id;
      const this_convsersation = action.payload.conversation;

      // loop all_conversations and replace current conversation
      state.private_chat.all_conversations =
        state.private_chat.all_conversations.map((ele) => {
          if (ele.room_id !== this_convsersation._id) return ele;
          else {
            // find other users in user_id list
            const other_user = this_convsersation.participants.find(
              (el) => el._id.toString() !== user_id
            );

            // trim latest message
            if (this_convsersation.latest_message?.text.length > 20)
              this_convsersation.latest_message.text =
                this_convsersation.latest_message.text.substring(0, 20) + "...";

            return {
              room_id: this_convsersation._id,
              other_user_id: other_user?._id,
              name: other_user?.username,
              avatar: other_user?.avatar,
              latest_message: this_convsersation.latest_message,
              online: other_user?.status === "Online",
              unRead: this_convsersation.unRead,
              pinned: this_convsersation.pinned,
              archived: this_convsersation.archived,
            };
          }
        });
    },

    addPrivateChatConversation(state, action) {
      const user_id = action.payload.user_id;
      const this_convsersation = action.payload.conversation;

      // find other users in user_id list
      const other_user = this_convsersation.participants.find(
        (ele) => ele._id.toString() !== user_id
      );

      // trim latest message
      if (this_convsersation.latest_message?.text.length > 20)
        this_convsersation.latest_message.text =
          this_convsersation.latest_message.text.substring(0, 20) + "...";

      // add new conversation
      state.private_chat.all_conversations.push({
        room_id: this_convsersation._id,
        user_id: other_user?._id,
        name: other_user?.username,
        avatar: other_user?.avatar,
        latest_message: this_convsersation.latest_message,
        online: other_user?.status === "Online",
        unRead: this_convsersation.unRead,
        pinned: this_convsersation.pinned,
        archived: this_convsersation.archived,
      });
    },

    updateGroupConversation(state, action) {
      const this_convsersation = action.payload.conversation;
      state.group_chat.all_conversations =
        state.group_chat.all_conversations.map((ele) => {
          if (ele.room_id !== this_convsersation._id) return ele;
          else {
            // trim latest message
            if (this_convsersation.latest_message?.text.length > 20)
              this_convsersation.latest_message.text =
                this_convsersation.latest_message.text.substring(0, 20) + "...";

            return {
              room_id: this_convsersation._id,
              name: this_convsersation.name,
              avatar: this_convsersation.avatar,
              creator: this_convsersation.creator,
              admin: this_convsersation.admin,
              participants: this_convsersation.participants,
              latest_message: this_convsersation.latest_message,
              unRead: this_convsersation.unRead,
              pinned: this_convsersation.pinned,
              archived: this_convsersation.archived,
            };
          }
        });
    },

    addGroupConversation(state, action) {
      const this_convsersation = action.payload.conversation;

      // trim latest message
      if (this_convsersation.latest_message?.text.length > 20)
        this_convsersation.latest_message.text =
          this_convsersation.latest_message.text.substring(0, 20) + "...";

      state.group_chat.all_conversations.push({
        room_id: this_convsersation._id,
        name: this_convsersation.name,
        creator: this_convsersation.creator,
        admin: this_convsersation.admin,
        participants: this_convsersation.participants,
        avatar: this_convsersation.avatar,
        latest_message: this_convsersation.latest_message,
        unRead: this_convsersation.unRead,
        pinned: this_convsersation.pinned,
        archived: this_convsersation.archived,
      });
    },

    deleteConversation(state, action) {
      const { room_id, room_type } = action.payload;

      const room = room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
      state[room].all_conversations = state[room].all_conversations.filter(
        (ele) => ele.room_id !== room_id
      );
    },

    setCurrentConversation(state, action) {
      state.current_conversation = action.payload.conversation;
    },

    resetCurrentConversation(state, action) {
      state.current_conversation = null;
    },

    setCurrentMessages(state, action) {
      state.current_messages = action.payload.messages;
    },

    resetCurrentMessages(state, action) {
      state.current_messages = [];
    },

    addNewMessage(state, action) {
      const new_message = action.payload.message_doc;
      state.current_messages = [...state.current_messages, new_message];
    },
    updateFileMessage(state, action) {
      const { msg_id, url, saveStatus } = action.payload;
      state.current_messages = state.current_messages.map((message) => {
        if (message._id !== msg_id) return message;

        return { ...message, fileUrl: url, saveStatus };
      });
    },

    updateLatestMessage(state, action) {
      let new_message = { ...action.payload.message_doc };

      // trim latest message
      if (new_message?.text?.length > 20)
        new_message.text = new_message.text.substring(0, 20) + "...";

      const room =
        new_message.room_type === "PRIVATE_CHAT" ? "PrivateRoom" : "GroupRoom";
      const chat_type =
        new_message.room_type === "PRIVATE_CHAT"
          ? "private_chat"
          : "group_chat";

      if (
        state.current_conversation !== null &&
        new_message[room] === state.current_conversation.room_id
      )
        state.current_conversation.latest_message = new_message;

      state[chat_type].all_conversations = state[
        chat_type
      ].all_conversations.map((ele) => {
        if (ele.room_id === new_message[room]) ele.latest_message = new_message;
        return ele;
      });
    },

    incrementUnreadCount(state, action) {
      const room_id = action.payload.messageRoomId;
      const room_type = action.payload.room_type;

      const room = room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
      state[room].all_conversations = state[room].all_conversations.map(
        (ele) => {
          if (ele.room_id === room_id) ele.unRead++;
          return ele;
        }
      );
    },

    resetUnreadCount(state, action) {
      const room_id = action.payload.messageRoomId;
      const room_type = action.payload.room_type;

      const room = room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
      state[room].all_conversations = state[room].all_conversations.map(
        (ele) => {
          if (ele.room_id === room_id) ele.unRead = 0;
          return ele;
        }
      );
    },

    updateStatus(state, action) {
      const { user_id, isOnline } = action.payload;

      // get index of converstion
      const private_chatIdx = state.private_chat.all_conversations.findIndex(
        (ele) => {
          return ele.other_user_id === user_id;
        }
      );

      if (private_chatIdx !== -1)
        state.private_chat.all_conversations[private_chatIdx].online = isOnline;

      // update status if current conversation contains user
      if (
        state.current_conversation !== null &&
        state.current_conversation.other_user_id === user_id
      )
        state.current_conversation.online = isOnline;
    },

    pinConversation(state, action) {
      const { room_id, room_type, pinStatus } = action.payload;

      const room = room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
      state[room].all_conversations = state[room].all_conversations.map(
        (ele) => {
          if (ele.room_id === room_id) ele.pinned = pinStatus;
          return ele;
        }
      );
    },

    archiveConversation(state, action) {
      const { room_id, room_type, archiveStatus } = action.payload;

      const room = room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
      state[room].all_conversations = state[room].all_conversations.map(
        (ele) => {
          if (ele.room_id === room_id) {
            ele.archived = archiveStatus;
            ele.pinned = false;
          }
          return ele;
        }
      );
    },

    starMessage(state, action) {
      const { message_id, status } = action.payload;
      state.current_messages = state.current_messages.map((ele) => {
        if (ele._id === message_id) {
          ele.starred = status;
          return ele;
        } else return ele;
      });
    },

    deleteMessage(state, action) {
      const { message_id } = action.payload;

      let is_this_latest_message = false;
      let room_type, room_id;
      state.current_messages = state.current_messages.map((ele, idx) => {
        if (ele._id.toString() === message_id.toString()) {
          ele.deleted = true;
          is_this_latest_message = idx === state.current_messages.length - 1;
          room_type = ele.room_type;
          room_id =
            room_type === "PRIVATE_CHAT" ? ele.PrivateRoom : ele.GroupRoom;
        }
        return ele;
      });

      // update latest message
      if (is_this_latest_message === true) {
        const room =
          room_type === "PRIVATE_CHAT" ? "private_chat" : "group_chat";
        state[room].all_conversations = state[room].all_conversations.map(
          (ele) => {
            if (ele.room_id === room_id) ele.latest_message.deleted = true;
            return ele;
          }
        );
      }
    },

    AddToParticipantList_in_current_conversation(state, action) {
      const { user, room_id, msg } = action.payload;

      // add to participant list
      if (state.current_conversation.room_id === room_id) {
        state.current_conversation.participants = [
          ...state.current_conversation.participants,
          user,
        ];
        state.current_conversation.latest_message = msg;
      }

      //add info msg to current messages
      state.current_messages = [...state.current_messages, msg];
    },
    RemoveFromParticipantList_in_current_conversation(state, action) {
      const { user_id, room_id, msg } = action.payload;

      // remove from participant list
      if (state.current_conversation.room_id === room_id) {
        state.current_conversation.participants =
          state.current_conversation.participants.filter(
            (participant) => participant._id !== user_id
          );
        state.current_conversation.latest_message = msg;
      }

      //add info msg to current messages
      state.current_messages = [...state.current_messages, msg];
    },

    AddToParticipantList_in_allConversations(state, action) {
      const { user, room_id, msg } = action.payload;

      // add participant to participant list
      state.group_chat.all_conversations =
        state.group_chat.all_conversations.map((c) => {
          if (c.room_id !== room_id) return c;

          c.participants.push(user);
          c.latest_message = msg;
          return c;
        });
    },
    RemoveFromParticipantList_in_allConversations(state, action) {
      const { user_id, room_id } = action.payload;

      state.group_chat.all_conversations =
        state.group_chat.all_conversations.map((c) => {
          if (c.room_id !== room_id) return c;

          c.participants = c.participants.filter(
            (participant) => participant._id !== user_id
          );
          c.latest_message = msg;
          return c;
        });
    },

    addToAdminList(state, action) {
      const { user_id, room_id, msg } = action.payload;

      // add participant to admin list and msg to latest massage in all_conversations
      state.group_chat.all_conversations =
        state.group_chat.all_conversations.map((c) => {
          if (c.room_id !== room_id) return c;

          c.admin.push(user_id);
          c.latest_message = msg;
          return c;
        });

      // add participant to admin list in current_conversation
      if (state.current_conversation.room_id === room_id) {
        state.current_conversation.admin = [
          ...state.current_conversation.admin,
          user_id,
        ];
        state.current_conversation.latest_message = msg;
      }

      // add info msg to current messages
      state.current_messages = [...state.current_messages, msg];
    },

    removeFromAdminList(state, action) {
      const { user_id, room_id, msg } = action.payload;

      // add participant to admin list and msg to latest massage in all_conversations
      state.group_chat.all_conversations =
        state.group_chat.all_conversations.map((c) => {
          if (c.room_id !== room_id) return c;

          c.participants = c.participants.filter(
            (participant) => participant._id !== user_id
          );
          c.latest_message = msg;
          return c;
        });

      // add participant to admin list in current_conversation
      if (state.current_conversation.room_id === room_id) {
        state.current_conversation.admin =
          state.current_conversation.admin.filter((adm) => adm !== user_id);
        state.current_conversation.latest_message = msg;
      }

      // add info msg to current messages
      state.current_messages = [...state.current_messages, msg];
    },
  },
});

export default slice.reducer;

export function Reset() {
  return async function (dispatch, getState) {
    dispatch(slice.actions.reset());
    // persistor.purge();
  };
}

export function SetPrivateConversations() {
  return async function (dispatch, getState) {
    const { status, message, data } = await getPrivateConversationsList(
      getState().auth.token
    );
    if (status === "error") toast(message);

    dispatch(
      slice.actions.setPrivateAllConversation({
        user_id: getState().auth.user_id,
        conversations: data,
      })
    );
  };
}
export function SetGroupConversations() {
  return async function (dispatch, getState) {
    const { status, message, data } = await getGroupConversationsList(
      getState().auth.token
    );
    if (status === "error") toast(message);

    dispatch(slice.actions.setGroupAllConversation({ conversations: data }));
  };
}

export function UpdatePrivateConversation({ conversation }) {
  return function (dispatch, getState) {
    dispatch(
      slice.actions.updatePrivateChatConversation({
        conversation,
        user_id: getState().auth.user_id,
      })
    );
  };
}
export function AddPrivateConversation({ conversation }) {
  return function (dispatch, getState) {
    dispatch(
      slice.actions.addPrivateChatConversation({
        conversation,
        user_id: getState().auth.user_id,
      })
    );
  };
}
export function UpdateGroupConversation({ conversation }) {
  return function (dispatch, getState) {
    dispatch(slice.actions.updateGroupConversation({ conversation }));
  };
}
export function AddGroupConversation({ conversation }) {
  return function (dispatch, getState) {
    dispatch(slice.actions.addGroupConversation({ conversation }));
  };
}
export function DeleteConversation({ room_type, room_id }) {
  return function (dispatch, getState) {
    dispatch(UnSelectConversation());
    dispatch(slice.actions.deleteConversation({ room_type, room_id }));
  };
}

export function SetCurrentConversation() {
  return function (dispatch, getState) {
    const room_id = getState().app.room_id;
    const chat_type = getState().app.chat_type;

    let all_conversations;
    if (chat_type === "PRIVATE_CHAT")
      all_conversations =
        getState().conversations.private_chat.all_conversations;
    else if (chat_type === "GROUP_CHAT")
      all_conversations = getState().conversations.group_chat.all_conversations;

    const conversation = all_conversations.find(
      (el) => el.room_id.toString() === room_id.toString()
    );

    dispatch(slice.actions.setCurrentConversation({ conversation }));
  };
}
export function ResetCurrentConversation() {
  return function (dispatch, getState) {
    dispatch(slice.actions.resetCurrentConversation());
  };
}

export function SetCurrentMessages() {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const room_id = getState().app.room_id;
    const chat_type = getState().app.chat_type;

    const { status, message, data } = await getChatHistory(
      token,
      chat_type,
      room_id
    );

    if (status === "error") toast(message);
    dispatch(slice.actions.setCurrentMessages({ messages: data }));
  };
}

export function ResetCurrentMessages() {
  return function (dispatch, getState) {
    dispatch(slice.actions.resetCurrentMessages());
  };
}

export function AddNewMessage({ message_doc }) {
  return function (dispatch, getState) {
    dispatch(slice.actions.addNewMessage({ message_doc }));
  };
}
export function UpdateFileMessage({ msg_id, url, saveStatus }) {
  return function (dispatch, getState) {
    dispatch(slice.actions.updateFileMessage({ msg_id, url, saveStatus }));
  };
}

//TODO: modify it for group message
export function UpdateLatestMessage({ message_doc }) {
  // this fuction add latest_message got by "new_message" event
  // to its respective conversation
  // a conversation is nothing but a room

  return function (dispatch, getState) {
    dispatch(slice.actions.updateLatestMessage({ message_doc }));
  };
}

export function UpdateUnreadCount({ messageRoomId, room_type }) {
  return function (dispatch, getState) {
    // if conversation is selected and message is also for this conversation
    // also  if conversation is just selected
    if (
      getState().conversations.current_conversation !== null &&
      getState().conversations.current_conversation.room_id === messageRoomId
    ) {
      dispatch(slice.actions.resetUnreadCount({ messageRoomId, room_type }));
      socket?.emit("reset_unread_count", {
        room_id: messageRoomId,
        room_type: room_type,
        user_id: getState().auth.user_id,
      });
    } else {
      // if conversation is selected and message came for other conversation
      // if conversation is not selected and message came for a conversation
      dispatch(
        slice.actions.incrementUnreadCount({ messageRoomId, room_type })
      );
    }
  };
}

export function UpdateStatus({ user_id, isOnline }) {
  // update user status in current conversation
  return function (dispatch, getState) {
    dispatch(slice.actions.updateStatus({ user_id, isOnline }));
  };
}

export function PinConversation({ room_id, room_type, pinStatus }) {
  return async function (dispatch, getState) {
    const { status } = await pinConversation(
      getState().auth.token,
      room_type,
      room_id,
      pinStatus
    );

    if (status === "error") return;
    dispatch(slice.actions.pinConversation({ room_id, room_type, pinStatus }));
  };
}

export function ArchiveConversation({ room_id, room_type, archiveStatus }) {
  return async function (dispatch, getState) {
    const { status } = await archiveConversation(
      getState().auth.token,
      room_type,
      room_id,
      archiveStatus
    );

    if (status === "error") return;
    dispatch(
      slice.actions.archiveConversation({ room_id, room_type, archiveStatus })
    );
  };
}

export function StarMessage({ message_id, starStatus }) {
  return async function (dispatch, getState) {
    const { status } = await starMessage(
      getState().auth.token,
      message_id,
      starStatus
    );

    if (status === "success")
      dispatch(slice.actions.starMessage({ message_id, status: starStatus }));
  };
}
export function DeleteMessage({ message_id }) {
  return async function (dispatch, getState) {
    dispatch(slice.actions.deleteMessage({ message_id }));
  };
}

export function AddToParticipantList({ user, room_id, msg }) {
  return async function (dispatch, getState) {
    const current_conversation_room_id =
      getState().conversations.current_conversation.room_id;

    dispatch(
      slice.actions.AddToParticipantList_in_allConversations({
        user,
        room_id,
        msg,
      })
    );

    if (current_conversation_room_id === room_id) {
      dispatch(
        slice.actions.AddToParticipantList_in_current_conversation({
          user,
          room_id,
          msg,
        })
      );
    }
  };
}

export function RemoveFromParticipantList({ user_id, room_id, msg }) {
  return async function (dispatch, getState) {
    const current_conversation_room_id =
      getState().conversations.current_conversation.room_id;

    dispatch(
      slice.actions.RemoveFromParticipantList_in_allConversations({
        user_id,
        room_id,
        msg,
      })
    );

    if (current_conversation_room_id === room_id) {
      dispatch(
        slice.actions.RemoveFromParticipantList_in_current_conversation({
          user_id,
          room_id,
          msg,
        })
      );
    }
  };
}

export function AddAdmin({ user_id, room_id, msg }) {
  return async function (dispatch, getState) {
    dispatch(
      slice.actions.addToAdminList({
        user_id,
        room_id,
        msg,
      })
    );
  };
}
export function RemoveAdmin({ user_id, room_id, msg }) {
  return async function (dispatch, getState) {
    dispatch(
      slice.actions.removeFromAdminList({
        user_id,
        room_id,
        msg,
      })
    );
  };
}
