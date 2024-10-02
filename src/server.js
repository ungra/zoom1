import express from "express";
import path from "path";
//import WebSocket, { WebSocketServer } from "ws";
import SocketIO from "socket.io";
import http from "http";
import { Server } from "socket.io";

const app = express();
const __dirname = path.resolve();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
<<<<<<< HEAD
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("enter_room", (roomName, fn) => {
    socket.join(roomName);
    fn();
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

const io = SocketIO(httpServer);

io.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    setTimeout(() => {
      done("hello from the backend");
    }, 5000);
  });
});

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
