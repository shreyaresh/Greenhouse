const mongoose = require("mongoose");

const Position = new mongoose.Schema({
        position_x: Number,
        position_y: Number,
        item_id: String,
        growthStage: Number
})

const GardenSchema = new mongoose.Schema({
    name: String,
    userOneId: String,
    userTwoId: String,
    dateCreated: Date,
    lastActive: Date,
    coordinates :[Position]
})

module.exports = mongoose.model("garden", GardenSchema);
