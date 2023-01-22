const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
    name: String,
    email: String,
    emailToken: String,
    password: String,
    isVerified: Boolean 
});

LoginSchema.statics.getUser = async function getUser (user) {
    try {
        return await this.findOne({ name: user});
    } catch (err) {
        console.log(err);
    }
}

LoginSchema.statics.getEmail = async function getEmail (userEmail) {
    try {
        return await this.findOne({ email: userEmail});

    } catch (err) {
        console.log(err);
    }
}

LoginSchema.statics.verifyUser = async function verifyUser (userEmail) {
    try {
    const doc = await this.findOne({ email: userEmail})
    doc.isVerified = true;
    doc.save();
    } 
    catch (err) {
        console.log(err);
    }
};

// compile model from schema
let Login = mongoose.model("login", LoginSchema);
module.exports = Login;
