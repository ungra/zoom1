import express from "express";
import path from "path";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const app = express();
const __dirname = path.resolve();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");
app.use("/public", express.static(__dirname + "/src/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const sockets = [];

function handleClose() {
  console.log("Disconnected from the Browser");
}

function handleConnection(socket) {
  console.log("Connected to Browser");
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  socket.on("close", handleClose);
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "message":
        sockets.forEach((asocket) =>
          asocket.send(`${socket.nickname}: ${message.payload}`)
        );
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
}

wss.on("connection", handleConnection);

server.listen(3000, handleListen);
