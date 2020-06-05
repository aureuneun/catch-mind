import { handleNewUser, handleDisconnected } from "./notifications";
import { handleNewMsg } from "./chat";

let socket = null;

export const getSocket = () => socket;

export const updateSocket = (uSocket) => (socket = uSocket);

export const initSocket = (iSocket) => {
  const { events } = window;
  updateSocket(iSocket);
  socket.on(events.newUser, handleNewUser);
  socket.on(events.disconnected, handleDisconnected);
  socket.on(events.newMsg, handleNewMsg);
};
