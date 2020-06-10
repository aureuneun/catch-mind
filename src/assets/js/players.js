import {
  disableCanvas,
  hideControls,
  showControls,
  enableCanvas,
  paintInit,
} from "./paint";
import { getSocket } from "./sockets";
import { disableChat, enableChat } from "./chat";

const board = document.getElementById("jsPBoard");
const notification = document.getElementById("jsNotification");
const time = document.getElementById("jsShowTime");

const READY_PLAYER = "ready-player";

const readyPlayer = (ready) => {
  const socket = getSocket();
  socket.emit(window.events.readyPlayer, { ready });
};

const handlePlayerClick = (e) => {
  const { target } = e;
  if (target.classList.contains(READY_PLAYER)) {
    target.classList.remove(READY_PLAYER);
    readyPlayer(false);
  } else {
    target.classList.add(READY_PLAYER);
    readyPlayer(true);
  }
};

const addPlayers = (players) => {
  const socket = getSocket();
  board.innerHTML = "";
  players.forEach((player) => {
    const playerElement = document.createElement("span");
    playerElement.id = player.id;
    if (player.ready === true) {
      playerElement.classList.add(READY_PLAYER);
    } else {
      playerElement.classList.remove(READY_PLAYER);
    }
    if (socket.id === player.id) {
      playerElement.addEventListener("click", handlePlayerClick);
    }
    playerElement.innerText = `${player.nickname}: ${player.points}`;
    board.appendChild(playerElement);
  });
};

const setNotification = (text) => {
  notification.innerHTML = "";
  notification.innerHTML = text;
  time.innerHTML = 30;
};

export const handlePlayerUpdate = ({ sockets }) => {
  setNotification("Game Ready");
  addPlayers(sockets);
};

export const handleGameStarted = () => {
  setNotification("Game Start");
  disableCanvas();
  hideControls();
  paintInit();
};

export const handleGameEnded = () => {
  setNotification("Game End");
  disableCanvas();
  hideControls();
  paintInit();
  enableChat();
};

export const handleLeaderNotification = ({ word }) => {
  setNotification(`Paint: ${word}`);
  enableCanvas();
  showControls();
  disableChat();
};

export const handleShowTime = ({ timeCnt }) => {
  time.innerHTML = timeCnt;
};
