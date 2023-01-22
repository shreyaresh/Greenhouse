const mongoose = require("mongoose");

const FriendRequestSchema = new mongoose.Schema({
    friendReqId: String,
    Date: Date,
    userIdFrom: String,
    userIdTo: String,
    status: Number
});

FriendRequest.statics.alreadyExists = async function (userFrom, userTo) {
    return await FriendRequest.findOne({ userIdTo: userFrom, userIdFrom: userTo });
}

FriendRequest.statics.getRequest = async function(id) {return await FriendRequest.findOne({friendReqId : id});}

let FriendRequest = mongoose.model("friendRequest", UserSchema);
module.exports = FriendRequest;
