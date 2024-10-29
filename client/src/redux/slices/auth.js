import { createSlice } from "@reduxjs/toolkit";
import { register, login, updateUserInfo, updateAvatar } from "../../utils/api";
import { toast } from "sonner";
import { Reset as appReset } from "./app";
import { Reset as conversationsReset } from "./conversation";
import { persistor } from "../store";

const initialState = {
  user_id: null,
  username: null,
  email: null,
  avatar: null,
  about: null,
  isLoggedIn: false,
  token: null,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.user_id = action.payload.user_id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.about = action.payload.about;
      state.avatar = action.payload.avatar;
    },

    // logout: async (state) => {
    //   // localStorage.removeItem("persist:root")
    //   console.log("hi");
    //   persistor.purge();
    //   // state.isLoggedIn = false;
    //   // state.user_id = null;
    //   // state.username = null;
    //   // state.email = null;
    //   // state.token = null;
    //   // state.about = null;
    //   // state.avatar = null;
    // },

    reset: (state) => {
      state.user_id = null;
      state.username = null;
      state.email = null;
      state.avatar = null;
      state.about = null;
      state.isLoggedIn = false;
      state.token = null;
    },

    updateUser(state, action) {
      const { username, about } = action.payload;
      state.username = username;
      state.about = about;
    },

    updateAvatar(state, action) {
      const avatarUrl = action.payload.avatarUrl;
      state.avatar = avatarUrl;
    },
  },
});

export default slice.reducer;

export function LoginUser(data) {
  return async function (dispatch, getState) {
    persistor.purge();

    dispatch(
      slice.actions.login({
        user_id: data._id,
        username: data.username,
        email: data.email,
        token: data.token,
        avatar: data.avatar,
        about: data.about,
        isLoggedIn: true,
      })
    );
  };
}

export function LogoutUser() {
  return async function (dispatch, getState) {
    persistor.purge();
    dispatch(slice.actions.reset());
    dispatch(appReset());
    dispatch(conversationsReset());
  };
}

export function UpdateUserInfo({ username, about }) {
  return async function (dispatch, getState) {
    const { status, message, data } = await updateUserInfo(
      getState().auth.token,
      username,
      about
    );

    if (status === "success") {
      dispatch(
        slice.actions.updateUser({ username: data.username, about: data.about })
      );
      toast("Information updated");
    }
  };
}

export function UpdateUserAvatar({ avatarUrl }) {
  return async function (dispatch, getState) {
    const { status, message, data } = await updateAvatar(
      getState().auth.token,
      avatarUrl
    );

    if (status === "success") {
      dispatch(slice.actions.updateAvatar({ avatarUrl: data.avatarUrl }));
      toast("Avatar updated");
    }
  };
}
