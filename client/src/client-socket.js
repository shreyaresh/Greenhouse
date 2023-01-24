import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});



// SOCKET FUNCTIONS TO INSERT INTO GARDEN PAGE FILE

this.socket.emit("garden:update", { title, completed: false }, (res) => {
  if ("error" in res) {
    // display old garden
  } else {
    // display new garden
  }
});

this.socket.emit("garden:delete", { title, completed: false }, (res) => {
  if ("error" in res) {
    // display old garden
  } else {
    // display new garden
  }
});

this.socket.emit("garden:add", { title, completed: false }, (res) => {
  if ("error" in res) {
    // display old garden
  } else {
    // display new garden
  }
});