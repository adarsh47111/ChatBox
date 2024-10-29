import io from "socket.io-client";

let socket;
const Base_URL = "https://chatbox-r9sf.onrender.com/";

const connectSocket = (user_id) => {
  socket = io(Base_URL, {
    query: `user_id=${user_id}`,
  });
};

const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export { socket, connectSocket, disconnectSocket };
