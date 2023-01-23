const mongoose = require("mongoose");

// be able to change coords, but not remove unless you are the user who planted it
const Position = new mongoose.Schema({
        userId: String,
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

    lastVisited: Date,
    coordinates :[Position]
})

module.exports = mongoose.model("garden", GardenSchema);
