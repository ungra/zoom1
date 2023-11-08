const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg) {
  console.log("The backend says:", msg);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", { payload: input.value }, backendDone);
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

//socket.io vs websocket
//1) 어떤 event라도 보낼 수 있다.
//2) javascript object도 전송할 수 있다
//3) 여러가지 type의 data를 여러개 동시에 보낼 수 있음.
