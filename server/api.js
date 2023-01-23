/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Login = require("./models/login");
const { GardenRequest, FriendRequest } = require('./models/request');
const Garden = require("./models/garden");

// import authentication library
const auth = require("./auth");
const requests = require('./requests');
const gardens = require('./garden-actions')

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.session.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});


router.post("/google-login", auth.googleLogin);
router.post("/register", auth.register);
router.post("/login", auth.loginNormal);
router.post("/logout", auth.logout);
router.post("/verify", auth.verify);
router.get('/get-verify-code', auth.newVerifyCode);

router.get("/is-verified", async (req, res) => {
  const doc = await Login.getEmail(req.body.email);
  return res.send({verified: doc.isVerified});
});

router.post("/clear-notifs", async (req, res) => {
  if (req.user){
    await User.findByIdAndUpdate(req.user._id, {$set: {notifications: []}});
    res.send(req.user);
  }
})

// specify friend-request or garden-request in body.type
router.post("/handle-request", requests.handleRequest);
router.post("/make-request", requests.makeRequest);
router.post("/delete-friend", requests.deleteFriend);
router.get("/friends", (req, res) => {if (req.user) {res.send(req.user.friends);}});
router.get("/gardens-with", requests.gardensWith);
router.get("/friend-requests", async (req, res) => {
  if (req.user) {
  return res.status(200).send(await FriendRequest.find({userIdTo : req.user._id}));
  }
  return res.status(400).send({err : "Not logged in."})
});


router.get("/all-gardens", async (req, res) => {
  if (req.user) {
    let gardenObj;
    let gardenProps = [];
    if (req.user.gardenIds.length) {
      for (const gardenId of req.user.gardenIds) {
        let gardenObj = await Garden.findById(gardenId);
        console.log(gardenObj);
        let friend_id  = gardenObj.userIds.filter(function (el) {return el !== String(req.user._id);})
        const friend = await User.findById(friend_id);
        // add garden name, garden id. and friend name
        gardenProps.push([gardenObj.name, gardenId, friend.name]);
        }
    }    
    return res.status(200).send(gardenProps);
    }
  });

router.get("/garden", async (req, res) => {
    return res.status(200).send(await Garden.findById(req.body.gardenId));
});

// // TO-DO: Write these functions
// // node: unique names only
// router.post("/create-garden", gardens.createGarden);
// router.post("/garden-request", gardens.sendRequest);
// // update last visited, update items' growth stages, and return garden document
// router.post("/garden-access", gardens.access);
// router.post("/handle-garden-request", gardens.handleGardenRequest);
// router.post("/delete-garden", gardens.deleteGarden);
// router.post("/change-garden-name", async (req, res) => {
//   const gardenId = req.body.id;
//   const garden = await Garden.findOneAndUpdate({gardenId : gardenId}, {name: req.body.name});
//   return res.status(200).send({msg : `Garden name changed to ${garden.name}.`});
// })


// sockets for in-game play
// TO DO: add socket for adding and removing items
// enough time: add socket for chat feature

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
