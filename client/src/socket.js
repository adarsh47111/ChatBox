// import exp from "constants";
import io from "socket.io-client";

let socket;
const connectSocket = (user_id) => {
  socket = io("http://localhost:3000", {
    query: `user_id=${user_id}`,
  });
};

const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export { socket, connectSocket, disconnectSocket };
