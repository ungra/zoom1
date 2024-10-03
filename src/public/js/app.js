const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room Name : ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  console.log(roomName);
  socket.emit("enter_room", input.value, showRoom);
  console.log(roomName);
  roomName = input.value;
  console.log(roomName);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

//socket.io vs websocket
//1) 어떤 event라도 보낼 수 있다.
//2) javascript object도 전송할 수 있다
//3) 여러가지 type의 data를 여러개 동시에 보낼 수 있음.
