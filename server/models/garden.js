const mongoose = require("mongoose");

// be able to change coords, but not remove unless you are the user who planted it
const Item = new mongoose.Schema({
        userId: String,
        growthTime: Number,
        position_x: Number,
        position_y: Number,
        item_id: String,
        growthStage: Number
})

const GardenSchema = new mongoose.Schema({
    name: String,
    userIds: [String],
    dateCreated: Date,
    isVerified: Boolean,
    dateVerified: Date,
    lastVisited: Date,
    items :[Item]
})

module.exports = mongoose.model("garden", GardenSchema);
