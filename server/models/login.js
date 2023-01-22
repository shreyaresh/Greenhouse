const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
    name: String,
    email: String,
    emailToken: String,
    password: String,
    isVerified: Boolean 
});

LoginSchema.methods.getUser = async function getUser (user) {
    try {
        return await LoginSchema.findOne({ name: user});
    } catch (err) {
        console.log(err);
    }
}

LoginSchema.methods.getEmail = async function getEmail (userEmail) {
    try {
        return await LoginSchema.findOne({ email: userEmail});

    } catch (err) {
        console.log(err);
    }
}

LoginSchema.methods.verifyStatus = async function verifyStatus (username) {
    try {
        const doc = await LoginSchema.findOne({ name: username});
        return doc.isVerified;
    } catch (err) {
        console.log(err);
    }
} 

LoginSchema.methods.verifyUser = async function verifyUser (userEmail) {
    try {
    const doc = await LoginSchema.findOne({ email: userEmail})
    doc.verifyUser = true;
    doc.save();
    } 
    catch (err) {
        console.log(err);
    }
};

let accessibleInfo = (username, token) => ({user: username, id:token})

LoginSchema.methods.getInfo = async function getId (userEmail) {
    LoginSchema.findOne({email: userEmail}).then((user) => {
        return accessibleInfo(user.name, user.emailToken);
    })
}
// compile model from schema
module.exports = mongoose.model("login", LoginSchema);
