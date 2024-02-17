import { createServer } from "http";
import { Server } from "socket.io";

import app from "./api.js"; // expressApp
import sockets from "./sockets.js"; // socket code

const PORT = 3000;
const httpServer = createServer(app);
const socketServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

httpServer.listen(PORT);
console.log(`Listening on port ${PORT}`);

// socket.io and express will be running on the same port
sockets.listen(socketServer);
