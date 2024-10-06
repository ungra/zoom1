const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const audioSelect = document.getElementById("audios");

let myStream;
let muted = false;
let cameraOff = false;
let devices;

function getCameras() {
  const cameras = devices.filter((device) => device.kind === "videoinput");
  cameras.forEach((camera) => {
    const option = document.createElement("option");
    option.value = camera.deviceId;
    option.innerText = camera.label;
    cameraSelect.appendChild(option);
  });
}

function getAudios() {
  const audios = devices.filter((device) => {
    return device.kind === "audioinput";
  });
  audios.forEach((audio) => {
    const option = document.createElement("option");
    option.value = audio.deviceId;
    option.innerText = audio.label;
    audioSelect.appendChild(option);
  });
}

async function getMedia() {
  try {
    devices = await navigator.mediaDevices.enumerateDevices();
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    getCameras();
    getAudios();
  } catch (e) {
    console.log(e);
  }
}

getMedia();

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

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);

//socket.io vs websocket
//1) 어떤 event라도 보낼 수 있다.
//2) javascript object도 전송할 수 있다
//3) 여러가지 type의 data를 여러개 동시에 보낼 수 있음.
