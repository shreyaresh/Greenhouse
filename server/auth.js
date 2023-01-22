
const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const Login = require("./models/login");
const socketManager = require("./server-socket");
const user = require("./models/user");

require('dotenv').config()


const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const argon2 = require('argon2');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const ServiceSid = process.env.SERVICE_SID;
const twilioClient = twilio(accountSid, authToken);



async function createlocalUser (user) {
  console.log(`Request body for user function: ${JSON.stringify(user)}`);
  if (await Login.getUser(user.username)){
    console.log(await Login.getUser(user.username));
    return false;
  } else if (await Login.getEmail(user.email)){ 
    console.log(await Login.getEmail(user.username));
    return false;
  } else {  
    const newUser = Login({
      name: user.username,
      email: user.email,
      emailToken: crypto.randomBytes(64).toString('hex'),
      password: await argon2.hash(user.password),
      isVerified: false 
    });
    return newUser.save();
  }
}

async function register(req, res) {
  const user = await createlocalUser(req.body);
  console.log(user);
  if (!user) {
    res.status(400).send({ err: "User already exists in system." })
  } else {;
  console.log("User created successfully.")
  if (sendVerifyCode(user.email)){res.redirect(`/verify?email=${user.email}`);}
  }
}

// sends the code to the email
async function sendVerifyCode (email) {
  if (await Login.getEmail(email).then((res) => res.isVerified)) {
    console.log('User already verified.')
    return;
  }
  twilioClient.verify.services(ServiceSid)
  .verifications.create({to: email, channel: "email"})
  .then(verification => {
    console.log("Verification email sent");
    return true;
  })
  .catch(error => {
    console.log(error);
  });
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ id: user.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    const newUser = new User({
      name: user.name,
      id: user.id,
      email: user.email,
      gardenIds: [],
      friends:[],
      currency: 0,
      inventory: [],
      friends: [],
      notifications: []
    });

    return newUser.save();
  });
}

// checks whether the email has been verified
async function verify (req, res){
  const email = req.body.email;
  const userCode = req.body.code;

  console.log(`Code: ${userCode}`);
  console.log(`Email: ${email}`);

  twilioClient.verify
    .services(ServiceSid)
    .verificationChecks.create({ to: email, code: userCode })
    .then(async verification_check => {
      if (verification_check.status === "approved") {
        await Login.verifyUser(email);
        const info = await Login.getEmail(email);
        // adds user to big db
        const newUser = getOrCreateUser({
          name: info.name,
          id: info.emailToken,
          email: email,
        });
          // persist user in the session
          req.session.user = newUser;
          res.send(newUser);
      } else {
        // res.render("verify", {
        //   email: email,
        //   message: "Verification Failed. Please enter the code from your email"
        // });
        res.send({err : "Verification Failed -- wrong code."});
      }
    })
    .catch(error => {
      console.log(error);
      res.send({err : "Verification Failed -- system error."});
      // next(error)
      // res.render("verify", {
      //   email: email,
      //   message: "Verification Failed. Please enter the code from your email"
      // });
    });
    };

  // login via Greenhouse's DB
  async function loginNormal (req, res) {
    const user = req.body;
    const userObj = await Login.getUser(user.username);
    if (!userObj){
      (res.status(401).send({err: "User not found"}))
    } else if (!userObj.isVerified) {
      console.log('here');
      sendVerifyCode(userObj.email);
      res.redirect(`/verify?email=${email}`);
    } else {   
        if (await argon2.verify(userObj.password, user.password)) {
            try {
              req.session.user = userObj;
              res.send(userObj);
            } catch (err) {
              console.log(err);
              res.send({err});
            }
        } else {
          res.send({err: 'Wrong Password'})
        }
        
        }
      }
    

/*

GOOGLE AUTHENTICATION--USES SEPARATE FUNCTIONS

*/

// create a new OAuth client used to verify google sign-in
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verifyGoogle(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

function googleLogin(req, res) {
  verifyGoogle(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      // persist user in the session
      req.session.user = user;
      res.send(user);
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

module.exports = {
  googleLogin,
  logout,
  sendVerifyCode,
  loginNormal,
  verify,
  register,
  populateCurrentUser,
  ensureLoggedIn,
};
