import { getAllUsers, getFriendRequest, getFriends } from "@/utils/api";
import { createSlice } from "@reduxjs/toolkit";
import {
  ResetCurrentConversation,
  ResetCurrentMessages,
  SetCurrentConversation,
  SetCurrentMessages,
  UpdateUnreadCount,
} from "./conversation";
import { toast } from "sonner";
// import { persistor } from "../store";

const initialState = {
  MenuPanel: {
    type: "PRIVATE_CHAT", // can be PRIVATE_CHAT, GROUP_CHAT, SETTINGS
  },
  ContactSidebar: {
    open: false,
    type: "CONTACT", // can be CONTRACT, STARRED, SHARED
  },
  SettingsPage: {
    open: false,
    type: null, // can be PROFILE
  },
  all_users: [], // all users of app who are not friends and not requested yet
  friendsList: [], // all friends
  friendRequests: [], // all friend requests
  chat_type: null, // ["PRIVATE_CHAT", "GROUP_CHAT"]
  room_id: null,
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    reset: (state) => {
      state.MenuPanel = {
        type: "PRIVATE_CHAT", // can be PRIVATE_CHAT, GROUP_CHAT, SETTINGS
      };
      state.ContactSidebar = {
        open: false,
        type: "CONTACT", // can be CONTRACT, STARRED, SHARED
      };
      state.SettingsPage = {
        open: false,
        type: null, // can be PROFILE
      };
      state.all_users = [];
      state.friendsList = [];
      state.friendRequests = [];
      state.chat_type = null;
      state.room_id = null;
    },

    toggleContactSidebar(state) {
      state.ContactSidebar.type = "CONTACT";
      state.ContactSidebar.open = !state.ContactSidebar.open;
    },

    updateContactSidebarType(state, action) {
      state.ContactSidebar.type = action.payload;
    },

    updateMenuPanel(state, action) {
      if (action.payload !== "SETTINGS") {
        state.SettingsPage.open = false;
        state.SettingsPage.type = null;
      }
      state.MenuPanel.type = action.payload;
    },

    updateSettingPage(state, action) {
      if (state.SettingsPage.open === false) state.SettingsPage.open = true;

      // close contact sidebar if open
      state.ContactSidebar.type = "CONTACT";
      state.ContactSidebar.open = false;
      state.SettingsPage.type = action.payload;
      state.chat_type = null;
      state.room_id = null;
    },

    setALLUsers(state, action) {
      state.all_users = action.payload;
    },

    removeALLUsers(state, action) {
      state.all_users = state.all_users.filter(
        (el) => el._id.toString() !== action.payload.userId
      );
    },

    setFriendsList(state, action) {
      state.friendsList = action.payload;
    },

    addToFriendsList(state, action) {
      state.friendsList = [action.payload.friend, ...state.friendsList];
    },

    setFriendRequests(state, action) {
      state.friendRequests = action.payload;
    },

    addFriendRequest(state, action) {
      state.friendRequests = [action.payload, ...state.friendRequests];
    },

    removeFriendRequest(state, action) {
      state.friendRequests = state.friendRequests.filter(
        (el) => el._id.toString() !== action.payload.request_id.toString()
      );
    },

    selectConversation(state, action) {
      state.chat_type = action.payload.chat_type;
      state.room_id = action.payload.room_id;
    },

    unSelectConversation(state, action) {
      state.chat_type = null;
      state.room_id = null;
      state.ContactSidebar.open = false;
      state.ContactSidebar.type = "CONTACT";
    },
  },
});

export const { toggleSidebar, updateSiderBarType } = slice.actions;
export default slice.reducer;

export function Reset() {
  return async function (dispatch, getState) {
    dispatch(slice.actions.reset());
    // persistor.purge();
  };
}

export function FetchUsers() {
  return async (dispatch, getState) => {
    const res = await getAllUsers(getState().auth.token);

    if (res.status === "success") {
      dispatch(slice.actions.setALLUsers(res.data));
    } else if (res.status === "error") toast(res.message);
  };
}
export function RemoveFromUserList(userId) {
  return (dispatch, getState) => {
    dispatch(slice.actions.removeALLUsers({ userId }));
  };
}

// ----------------------------------------------------------------
export function FetchFriendList() {
  return async (dispatch, getState) => {
    const res = await getFriends(getState().auth.token);

    if (res.status === "success") {
      dispatch(slice.actions.setFriendsList(res.data));
    } else if (res.status === "error") toast(res.message);
  };
}
export function AddToFriendList(friend) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addToFriendsList({ friend }));
  };
}

// ----------------------------------------------------------------
export function FetchFriendRequests() {
  return async (dispatch, getState) => {
    const res = await getFriendRequest(getState().auth.token);

    if (res.status === "success") {
      dispatch(slice.actions.setFriendRequests(res.data));
    } else if (res.status === "error") toast(res.message);
  };
}
export function AddFriendRequest(request) {
  return (dispatch, getState) => {
    dispatch(slice.actions.addFriendRequest(request));
  };
}
export function RemoveFriendRequest(request) {
  return (dispatch, getState) => {
    dispatch(slice.actions.removeFriendRequest({ request_id: request._id }));
  };
}

// ----------------------------------------------------------------
export function SelectConversation({ chat_type, room_id }) {
  return (dispatch, getState) => {
    dispatch(slice.actions.selectConversation({ chat_type, room_id }));
    dispatch(SetCurrentConversation());
    dispatch(SetCurrentMessages());
    dispatch(
      UpdateUnreadCount({ messageRoomId: room_id, room_type: chat_type })
    );
  };
}

export function UnSelectConversation() {
  return (dispatch, getState) => {
    dispatch(slice.actions.unSelectConversation());
    dispatch(ResetCurrentConversation());
    dispatch(ResetCurrentMessages());
  };
}

// -----------------------------------------------------------------
export function ToggleContactSidebar() {
  return (dispatch, getState) => {
    dispatch(slice.actions.toggleContactSidebar());
  };
}
export function UpdateContactSidebarType(type) {
  return (dispatch, getState) => {
    dispatch(slice.actions.updateContactSidebarType(type));
  };
}
export function UpdateMenuPanel(type) {
  return (dispatch, getState) => {
    dispatch(slice.actions.updateMenuPanel(type));
  };
}

export function UpdateSettingPage(type) {
  return (dispatch, getState) => {
    switch (type.toLowerCase()) {
      case "profile":
        dispatch(slice.actions.updateSettingPage("PROFILE"));
        break;
      case "theme":
        dispatch(slice.actions.updateSettingPage("THEME"));
        break;
    }
  };
}
