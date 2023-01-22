const mongoose = require("mongoose");

const FriendRequestSchema = new mongoose.Schema({
    notificationId: Number,
    userIdFrom: String,
    userIdTo: String,
    status: Number
});

let FriendRequest = mongoose.model("friendRequest", UserSchema);
module.exports = FriendRequest;
