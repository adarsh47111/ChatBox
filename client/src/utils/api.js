const Base_URL = import.meta.env.VITE_BASE_URL;

const register = async ({ username, email, password }) => {
  let res, data;
  const body = { username, email, password };

  try {
    res = await fetch(Base_URL + "auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const login = async ({ email, password }) => {
  let res, data;
  const body = { email, password };
  try {
    res = await fetch(Base_URL + "auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const updateUserInfo = async (token, username, about) => {
  let res, data;
  const body = { username, about };
  try {
    res = await fetch(Base_URL + "user/update_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const updateAvatar = async (token, avatarUrl) => {
  let res, data;
  const body = { avatarUrl };
  try {
    res = await fetch(Base_URL + "user/update_userAvatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getAllUsers = async (token) => {
  let res, data;
  try {
    res = await fetch(Base_URL + "user/get-users", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getUserInfo = async (token, user_id) => {
  let res, data;
  try {
    res = await fetch(Base_URL + `user/userInfo/${user_id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getGroupInfo = async (token, room_id) => {
  let res, data;

  try {
    res = await fetch(Base_URL + `user/groupInfo/${room_id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getFriends = async (token) => {
  let res, data;
  try {
    res = await fetch(Base_URL + "user/get-friends", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getFriendRequest = async (token) => {
  let res, data;
  try {
    res = await fetch(Base_URL + "user/get-friendRequest", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getPrivateConversationsList = async (token) => {
  let res, data;
  try {
    res = await fetch(Base_URL + "user/get-privateConversationList", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getGroupConversationsList = async (token) => {
  let res, data;
  try {
    res = await fetch(Base_URL + "user/get-groupConversationList", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getPrivateConversation = async (token, other_user_id) => {
  let res, data;
  try {
    res = await fetch(
      Base_URL + `user/get-privateConversation?other_user=${other_user_id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getGroupConversation = async (
  token,
  { group_name, member_list, admin, creator }
) => {
  let res, data;
  const body = { group_name, creator, admin, member_list };

  try {
    res = await fetch(Base_URL + `user/get-groupConversation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const deleteConversation = async (token, room_type, room_id) => {
  let res, data;
  try {
    res = await fetch(
      Base_URL +
        `user/get-deleteConversation?room_type=${room_type}&room_id=${room_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getChatHistory = async (token, room_type, room_id) => {
  let res, data;
  try {
    res = await fetch(
      Base_URL +
        `user/get-chatHistory?room_type=${room_type}&room_id=${room_id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const clearHistory = async (token, room_type, room_id) => {
  let res, data;
  try {
    res = await fetch(
      Base_URL +
        `user/clearHistory?room_type=${room_type}&room_id=${room_id}&time=${Date.now()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const getCommonGroups = async (token, other_user_id) => {
  let res, data;
  try {
    res = await fetch(
      Base_URL + `user/get-commonGroups?other_user=${other_user_id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const pinConversation = async (token, room_type, room_id, status) => {
  let res, data;
  const body = { room_id, room_type, pin: status };
  try {
    res = await fetch(Base_URL + `user/pinConversation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const archiveConversation = async (token, room_type, room_id, status) => {
  let res, data;
  const body = { room_id, room_type, archive: status };

  try {
    res = await fetch(Base_URL + `user/archiveConversation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const starMessage = async (token, message_id, status) => {
  let res, data;

  try {
    res = await fetch(
      Base_URL + `user/starMessage?message_id=${message_id}&star=${status}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const deleteMessage = async (token, room_type, room_id, message_id, all) => {
  let res, data;

  try {
    res = await fetch(
      Base_URL +
        `user/deleteMessage?room_type=${room_type}&room_id=${room_id}&message_id=${message_id}&all=${all}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const sendEmail = async (email) => {
  let res, data;
  const body = { email };
  try {
    res = await fetch(Base_URL + "auth/passwordreset/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const sendOtp = async (email, otp) => {
  let res, data;
  const body = { email, otp };
  try {
    res = await fetch(Base_URL + "auth/passwordreset/verifyOtp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

const sendNewPassword = async (email, password) => {
  let res, data;
  const body = { email, password };

  try {
    res = await fetch(Base_URL + "auth/passwordreset/updatepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    data = await res.json();
  } catch (error) {
    console.log(error);
  }

  return { ...data };
};

export {
  updateUserInfo,
  updateAvatar,
  register,
  login,
  getAllUsers,
  getUserInfo,
  getGroupInfo,
  getFriends,
  getFriendRequest,
  getPrivateConversationsList,
  getGroupConversationsList,
  getPrivateConversation,
  getGroupConversation,
  deleteConversation,
  getChatHistory,
  clearHistory,
  getCommonGroups,
  pinConversation,
  archiveConversation,
  starMessage,
  deleteMessage,
  sendEmail,
  sendOtp,
  sendNewPassword,
  Base_URL,
};
