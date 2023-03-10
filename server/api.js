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
const gardens = require('./garden-access')

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");

router.post("/google-login", auth.googleLogin);
router.post("/register", auth.register);
router.post("/login", auth.loginNormal);
router.post("/logout", auth.logout);
router.post("/verify", auth.verify);
router.post('/get-verify-code', async (req, res) => {
    if (await Login.getEmail(req.body.email)) {
      return res.send(auth.sendVerifyCode(req.body.email));
    }
     return res.send({err: "Email is not registered yet."});
    }
);
router.get('/currency', (req, res) => {
  User.findById(req.user._id)
  .then((result) => {return res.send({currency : result.currency})})
})

router.get('/items', (req, res) => {
  User.findById(req.user._id)
  .then((result) => {return res.send(result.inventory)})
})

router.get("/is-verified", (req, res) => {
  let truth = User.findOne({ email: req.query.email})
              .then((res) => truth = ((res) ? true: false))
  
  return res.send({verified: truth});
});

router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }
  res.send(req.user);
});


// body: socketid to add a user to 
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
    const user = await User.findByIdAndUpdate(req.user._id, {$set: {notifications: []}}, {new:true});
    res.send(user);
  }
})

// specify friend-request or garden-request in body.type
router.post("/handle-request", requests.handleRequest);
router.post("/make-request", requests.makeRequest);
router.post("/delete-friend", requests.deleteFriend);
router.post("/delete-garden", requests.deleteGarden);
router.get("/all", async(req, res) => {
  const userList = await User.find();
  return res.status(200).send(userList);
})
router.get("/garden-status", async (req, res) => {
  const garden = await Garden.findById(req.query.gardenId);
  if (garden.isVerified) {
    return res.status(200).send({msg : "Garden already initialized"});
  }  if (garden.items.find(e => e.userId === req.user._id)) {
    return res.status(200).send({msg: "Wait for your partner to select a plant"})
  } return res.status(200).send({msg: "Select a plant"});
  
})

router.get("/friends", async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    return res.send(user.friends);
  }});

router.get("/notifications", async (req, res) => {
    if (req.user) {
      const user = await User.findById(req.user._id);
      return res.send(user.notifications);
    }});
router.get("/gardens-with", requests.gardensWith);
router.get("/requests", async (req, res) => {
  const requestType = ((req.query.type === 'friend-request') ? FriendRequest : GardenRequest);
  if (req.user) {
  return res.status(200).send(await requestType.find({userIdTo : req.user._id}));
  }
  return res.status(400).send({err : "Not logged in."})
});

// returns img name, garden name, garden id, verified status, and friend name of all of the session user's gardens
router.get("/all-gardens", async (req, res) => {
  if (req.user) {
    let gardenProps = [];
    if (req.user.gardenIds.length) {
      for (const gardenId of req.user.gardenIds) {
        let gardenObj = await Garden.findById(gardenId);
        let friend_id  = gardenObj.userIds.filter(function (el) {return el !== String(req.user._id);})
        const friend = await User.findById(friend_id);
        gardenProps.push([gardenObj.img, gardenObj.name, gardenId, gardenObj.isVerified, friend.name]);
        }
    }    
    return res.status(200).send(gardenProps);
    }
  });

router.get("/garden", async (req, res) => {
    return res.status(200).send(await Garden.findById(req.query.gardenId));
});


router.post("/create-garden", gardens.createGarden);
// // update last visited, update items' growth stages, and return garden document
router.post("/garden-access", gardens.gardenAccess);
router.post("/change-garden-name", async (req, res) => {
  const gardenId = req.body.id;
  const garden = await Garden.findbyIdAndUpdate(gardenId, {name: req.body.name});
  return res.status(200).send({msg : `Garden name changed to ${garden.name}.`});
})



// sockets for in-game play
// TO DO: add socket for adding and removing items
// enough time: add socket for chat feature

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
