import express from "express";
import path from "path";
//import WebSocket, { WebSocketServer } from "ws";
import { Server } from "socket.io";
import http from "http";
import { instrument } from "@socket.io/admin-ui";

const app = express();
const __dirname = path.resolve();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
  mode: "development",
});

io.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  io.sockets.emit("room_change", publicRooms());
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, cb) => {
    socket.join(roomName);
    cb(countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message_from_client", (msg, roomName, cb) => {
    socket
      .to(roomName)
      .emit("new_message_from_server", `${socket.nickname} : ${msg}`);
    cb();
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((value, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  console.log(io.sockets.adapter.rooms.get(roomName)?.size);
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

//const wss = new WebSocketServer({ server });

/*
const sockets = [];

function handleClose() {
  console.log("Disconnected from the Browser");
}

function handleConnection(socket)ㅌ {
  console.log("Connected to Browser");
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  socket.on("close", handleClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    console.log(message);
    console.log(`${socket.nickname}`);
    console.log(sockets.length);
    if (message.type === "message") {
      sockets.forEach((asocket) =>
        asocket.send(`${socket.nickname}: ${message.payload}`)
      );
    } else if (message.type === "nickname") {
      socket["nickname"] = message.payload;
    }
  });
}
*/
const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
