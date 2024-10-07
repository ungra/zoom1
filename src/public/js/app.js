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

async function handleCameraChange() {
  await getMedia(cameraSelect.value, audioSelect.value);
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
