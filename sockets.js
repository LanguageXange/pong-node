let playerCount = 0;

function listen(io) {
  const pongNameSpace = io.of("/pong");
  pongNameSpace.on("connection", (socket) => {
    let room = "room" + Math.floor(playerCount / 2);

    // listen to 'ready' event sent from the client
    socket.on("ready", (data) => {
      const { mode } = data;
      socket.join(room);
      if (mode == 1) {
        // start game right away
        pongNameSpace.in(room).emit("startGame", socket.id);
      } else {
        playerCount++;
        // even number of players
        if (playerCount % 2 == 0) {
          // broadcast 'startGame' event to everyone in the room !
          pongNameSpace.in(room).emit("startGame", socket.id); // choose the second player as the referee
        }
      }
    });

    // 'paddleMove' event
    socket.on("paddleMove", (paddleData) => {
      // broadcast to everyone except for the sender
      // socket.broadcast.emit("paddleMove", paddleData);
      // specify the room to broadcast
      socket.to(room).emit("paddleMove", paddleData);
    });

    // 'ballMove' event
    socket.on("ballMove", (data) => {
      // socket.broadcast.emit("ballMove", data);
      socket.to(room).emit("ballMove", data);
    });

    // disconnect
    socket.on("disconnect", (reason) => {
      console.log(`Client ${socket.id} disconnected : ${reason}`);
      socket.leave(room);
    });
  });
}

export default { listen };
