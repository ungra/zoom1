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

function handleMessage(message) {
  console.log(message.toString("utf8"));
}

function handleClose() {
  console.log("Disconnected from the Browser");
}

function handleConnection(socket) {
  console.log("Connected to Browser");
  socket.on("close", handleClose);
  socket.on("message", handleMessage);
  socket.send("hello from the server");
}

wss.on("connection", handleConnection);

server.listen(3000, handleListen);
