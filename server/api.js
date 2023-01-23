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
const FriendRequest = require("./models/friend-request")
const Garden = require("./models/garden");

// import authentication library
const auth = require("./auth");
const friends = require('./friends');

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
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
    res.send({});
  }
})

router.post("/handle-friend-request", friends.handleFriendRequest);
router.post("/add-friend", friends.makeFriendRequest);
router.post("/delete-friend", friends.deleteFriend);
router.get("/friends", (req, res) => {if (req.user) {res.send(req.user.friends);}});
router.get("/gardens-with", friends.gardensWith);


router.get("/all-gardens", async (req, res) => {
  if (req.user) {
    let gardenObj;
    let gardenProps = [];
    for (let gardenId of req.user.gardenIds) {
      let gardenObj = await Garden.findOne({_id: gardenId});
      let user1 = await User.findOne({_id: gardenObj.userOneId});
      let user2 = await User.findOne({_id: gardenObj.userTwoId})
      // add garden id and friend name
      gardenProps.push([gardenObj.name, gardenId, (user2.name ? (user1 === req.user) : user1.name)]);
      }
    return res.status(200).send(gardenProps);
    }
  });

router.get("/garden", async (req, res) => {
    return res.status(200).send(await Garden.find({_id: req.body.gardenId}));
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
