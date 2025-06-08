import { io } from "socket.io-client";

// export const socket = io("http://localhost:3000"); // or your IP
export const socket = io("https://cuisino.onrender.com");

export const registerSocket = (userId, role = "user") => {
  socket.emit("register", { userId, role });
};
