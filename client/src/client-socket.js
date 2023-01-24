import socketIOClient from "socket.io-client";
import { post } from "./utilities";
const endpoint = window.location.hostname + ":" + window.location.port;
export const socket = socketIOClient(endpoint);
socket.on("connect", () => {
  post("/api/initsocket", { socketid: socket.id });
});



// SOCKET FUNCTIONS TO INSERT INTO GARDEN PAGE FILE

// // call whenever user redirects away from room
// socket.emit("leaveRoom", {gardenId: gardenId});

// // call on garden-create POST request
// socket.emit('joinRoom', {gardenId: gardenId});


// socket.emit("garden:update", { title, completed: false }, (res) => {
//   if ("error" in res) {
//     // display old garden
//   } else {
//     // display new garden
//   }
// });

// socket.emit("garden:delete", { title, completed: false }, (res) => {
//   if ("error" in res) {
//     // display old garden
//   } else {
//     // display new garden
//   }
// });

// socket.emit("garden:add", { title, completed: false }, (res) => {
//   if ("error" in res) {
//     // display old garden
//   } else {
//     // display new garden
//   }
// });

// // call on all pages for user data
// socket.emit("updated", { title, completed: false }, (res) => {
//   if ("error" in res) {
//     // display old information
//   } else {
//     // display new information
//   }
// });