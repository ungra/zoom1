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
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer_from_client", (offer, roomName) => {
    socket.to(roomName).emit("offer_from_server", offer);
  });
  socket.on("answer_from_client", (answer, roomName) => {
    socket.to(roomName).emit("answer_from_server", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
  socket.on("disconnecting", () => {
    console.log("disconnecting");
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.to(room).emit("bye");
      }
    });
  });
  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
