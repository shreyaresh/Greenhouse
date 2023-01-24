const mongoose = require("mongoose");

const options = { discriminatorKey: 'kind' };

const RequestSchema = new mongoose.Schema({
    Date: Date,
    userIdFrom: String,
    usernameFrom: String,
    userIdTo: String,
    usernameTo: String,
    status: String
}, options);

const Request = mongoose.model("Request", RequestSchema);


const FriendRequest = Request.discriminator('FriendRequest', new mongoose.Schema({
    friendReqId: String
}, options));
const GardenRequest = Request.discriminator('GardenRequest', new mongoose.Schema({
    gardenReqId: String
}, options));


module.exports = {FriendRequest, GardenRequest}