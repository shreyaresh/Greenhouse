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
const Garden = require("./models/garden");

// import authentication library
const auth = require("./auth");

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
router.get("/is-verified", async (req, res) => {
  const doc = await Login.getEmail(req.query.email);
  return res.send({verified: doc.isVerified});
});

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

// |------------------------------|
// | write your API methods below!|
// |------------------------------|

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
