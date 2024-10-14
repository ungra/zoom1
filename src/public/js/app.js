const socket = io();

// localtunnel password
// https://loca.lt/mytunnelpassword

//stream

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const audioSelect = document.getElementById("audios");
const stream = document.getElementById("myStream");
const peerFace = document.getElementById("peerFace");

stream.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let devices;
let roomName;
let myPeerConnection;
let myDataChannel;

function getCameras() {
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const currentCamera = myStream.getVideoTracks()[0];
  cameras.forEach((camera) => {
    const option = document.createElement("option");
    option.value = camera.deviceId;
    option.innerText = camera.label;
    if (currentCamera.label === camera.label) {
      option.selected = true;
    }
    cameraSelect.appendChild(option);
  });
}

function getAudios() {
  const audios = devices.filter((device) => {
    return device.kind === "audioinput";
  });
  const currentAudio = myStream.getAudioTracks()[0];
  audios.forEach((audio) => {
    const option = document.createElement("option");
    option.value = audio.deviceId;
    option.innerText = audio.label;
    if (currentAudio.label === audio.label) {
      option.selected = true;
    }
    audioSelect.appendChild(option);
  });
}

async function getMedia(cameraId, audioId) {
  const initialConstraints = {
    audio: true,
    video: true,
  };
  const currentConstraints = {
    audio: { deviceId: { exact: audioId } },
    video: { deviceId: { exact: cameraId } },
  };
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
    myStream = await navigator.mediaDevices.getUserMedia(
      cameraId ? currentConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if (!cameraId) {
      getCameras();
      getAudios();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteBtnClick() {
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (muted) {
    muteBtn.innerText = "Mute";
    muted = false;
  } else {
    muteBtn.innerText = "UnMute";
    muted = true;
  }
}
function handleCameraBtnClick() {
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (cameraOff) {
    cameraBtn.innerText = "Turn Off Camera";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn On Camera";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(cameraSelect.value, audioSelect.value);
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

async function handleAudioChange() {
  await getMedia(cameraSelect.value, audioSelect.value);
}

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
cameraSelect.addEventListener("input", handleCameraChange);
audioSelect.addEventListener("input", handleAudioChange);

//socket.io vs websocket
//1) 어떤 event라도 보낼 수 있다.
//2) javascript object도 전송할 수 있다
//3) 여러가지 type의 data를 여러개 동시에 보낼 수 있음.

//welcome

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

welcome.hidden = false;

async function initCall() {
  welcome.hidden = true;
  stream.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomSubmit);

//socket

socket.on("welcome", async () => {
  console.log("someone joined");
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => {
    console.log(event.data);
  });
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer_from_client", offer, roomName);
});

socket.on("offer_from_server", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    console.log("received the datachannel");
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", (event) => {
      console.log(event.data);
    });
  });
  console.log("received the offer");
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  console.log("sent the answer");
  socket.emit("answer_from_client", answer, roomName);
});

socket.on("answer_from_server", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received the ice");
  myPeerConnection.addIceCandidate(ice);
});

socket.on("bye", () => {
  console.log("someone left");
  peerFace.srcObject = null;
});

//WebRTC code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handlerIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, myStream);
  });
}

function handlerIce(data) {
  console.log("sent the ice");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  console.log("add peerStream");
  peerFace.srcObject = data.stream;
}
