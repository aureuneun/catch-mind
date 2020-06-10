import events from "./events";
import { chooseWord } from "./words";

const SET_TIME = 30000;

let sockets = [];
let inProgress = false;
let leader = null;
let word = null;
let timeout = null;
let timeCnt = null;
let showTime = null;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)];

const socketController = (socket, io) => {
  const broadcast = (event, data) => socket.broadcast.emit(event, data);
  const superBroadcast = (event, data) => io.emit(event, data);
  const sendPlayerUpdate = () => {
    superBroadcast(events.playerUpdate, { sockets });
  };
  const startGame = () => {
    if (inProgress === false) {
      inProgress = true;
      leader = chooseLeader();
      word = chooseWord();
      superBroadcast(events.gameStarted);
      leader
        ? io.to(leader.id).emit(events.leaderNotification, { word })
        : null;
      timeout = setTimeout(endGame, SET_TIME);
      timeCnt = SET_TIME / 1000;
      showTime = setInterval(() => {
        timeCnt -= 1;
        superBroadcast(events.showTime, { timeCnt });
        console.log(timeCnt);
      }, 1000);
    }
  };

  const endGame = () => {
    if (inProgress === true) {
      inProgress = false;
      sockets.forEach((item) => {
        item.ready = false;
      });
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      if (showTime !== null) {
        clearInterval(showTime);
      }
      superBroadcast(events.gameEnded);
      sendPlayerUpdate();
    }
  };

  const addPoints = (id) => {
    sockets = sockets.map((socket) => {
      if (socket.id === id) {
        socket.points += 10;
      }
      return socket;
    });
    sendPlayerUpdate();
  };

  socket.on(events.setNickname, ({ nickname }) => {
    socket.nickname = nickname;
    socket.ready = false;
    sockets.push({
      id: socket.id,
      points: 0,
      nickname,
      ready: socket.ready,
    });
    broadcast(events.newUser, { nickname });
    sendPlayerUpdate();
  });

  socket.on(events.disconnect, () => {
    sockets = sockets.filter((aSocket) => aSocket.id !== socket.id);
    endGame();
    broadcast(events.disconnected, { nickname: socket.nickname });
  });

  socket.on(events.sendMsg, ({ message }) => {
    broadcast(events.newMsg, { message, nickname: socket.nickname });
    if (inProgress && message === word) {
      superBroadcast(events.newMsg, {
        message: `Winner is ${socket.nickname}`,
        nickname: "Bot",
      });
      addPoints(socket.id);
      endGame();
    }
  });

  socket.on(events.beginPath, ({ x, y }) => {
    broadcast(events.beganPath, { x, y });
  });

  socket.on(events.stroke, ({ x, y, color, line }) => {
    broadcast(events.stroked, {
      x,
      y,
      color,
      line,
    });
  });

  socket.on(events.fill, ({ color }) => {
    broadcast(events.filled, { color });
  });

  // socket.on(events.readyPlayer, ({ ready }) => {
  //   let aReady = true;
  //   sockets.forEach((item) => {
  //     if (item.id === socket.id) {
  //       item.ready = ready;
  //     }
  //     if (item.ready === false) {
  //       aReady = false;
  //       endGame();
  //     }
  //   });
  //   if (aReady === true) startGame();
  //   broadcast(events.readyPlayers, { sockets });
  // });

  socket.on(events.readyPlayer, ({ ready }) => {
    let allReady = true;
    sockets = sockets.map((item) => {
      if (item.id === socket.id) {
        item.ready = ready;
      }
      if (item.ready === false) {
        allReady = false;
        endGame();
      }
      return item;
    });
    sendPlayerUpdate();
    if (allReady === true && sockets.length >= 2) startGame();
  });
};

export default socketController;
