const mongoose = require("mongoose");

const FriendRequestSchema = new mongoose.Schema({
    friendReqId: String,
    Date: Date,
    userIdFrom: String,
    usernameFrom: String,
    userIdTo: String,
    usernameTo: String,
    status: String
});


FriendRequestSchema.statics.alreadyExists = async function (userFrom, userTo) {
    return await this.findOne({ userIdTo: userFrom, userIdFrom: userTo });
}

FriendRequestSchema.statics.getRequest = async function(id) {try{return await this.findOne({friendReqId : id});} catch(err){console.log(err);}}

let FriendRequest = mongoose.model("friendRequest", FriendRequestSchema);
module.exports = FriendRequest;
