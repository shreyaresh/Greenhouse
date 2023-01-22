const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const Login = require("./models/login");
const socketManager = require("./server-socket");
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const argon2 = require('argon2');
const user = require("./models/user");


const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.SERVICE_SID;
const twilioClient = twilio(accountSid, authToken);

sgMail.setApiKey(SENDGRID_API_KEY)




async function createUser (user) {
  if (Login.getUser(user.username)) {return false}
  if (Login.getEmail(user.email)) {return false}
  
  const newUser = Login({
    name: user.username,
    email: user.email,
    emailToken: crypto.randomBytes(64).toString('hex'),
    password: await argon2.hash(user.password),
    isVerified: false 
  });

  return newUser.save();
}

function register(req, res) {
  const user = createUser(req.body);
  if (!user) {
    res.status(400).send({ err: "User already exists in system." })
  };

  twilioClient.verify.services(serviceSid)
  .verifications.create({to: user.email, channel: "email"})
  .then(verification => {
    console.log("Verification email sent");
    res.redirect(`/verify?email=${user.email}`);
  })
  .catch(error => {
    console.log(error);
  });
}

// login function: redirect to verify if in Login but not verified

function verify (req, res){
  const email = req.body.email;
  const userCode = req.body.code;

  console.log(`Code: ${userCode}`);
  console.log(`Email: ${email}`);

  twilioClient.verify
    .services(process.env.SERVICE_SID)
    .verificationChecks.create({ to: email, code: userCode })
    .then(verification_check => {
      if (verification_check.status === "approved") {
        Login.verifyUser(email);
        const info = Login.getInfo(email);
        // adds user to big db
        const newUser = getOrCreateUser({
          name: info.user,
          sub: info.id,
          email: email
        });
          // persist user in the session
          req.session.user = newUser;
          res.send(newUser);
      } else {
        res.render("verify", {
          email: email,
          message: "Verification Failed. Please enter the code from your email"
        });
      }
    })
    .catch(error => {
      console.log(error);
      res.render("verify", {
        email: email,
        message: "Verification Failed. Please enter the code from your email"
      });
    });
    };


    // TODO: finish login 
  function loginNormal (req, res) {
    const email = req.body.email
    if (!getUser(email)) {res.status(401)}
  }

// google auth

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


// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ id: user.sub }).then((existingUser) => {
    if (existingUser) return existingUser;

    const newUser = new User({
      name: user.name,
      id: user.sub,
      email: user.email
    });

    return newUser.save();
  });
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
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
