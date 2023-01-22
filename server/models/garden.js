const mongoose = require("mongoose");
const Numbers = require("twilio/lib/rest/Numbers");

const Position = new mongoose.Schema({
        position_x: Numbers,
        position_y: Numbers,
        item_id: String,
        growthStage: Numbers
})

const GardenSchema = new mongoose.Schema({
    gardenId: String,
    userOneId: String,
    userTwoId, String,
    dateCreated: Date,
    lastActive: Date,
    coordinates :[Position]
})

module.exports = mongoose.model("garden", GardenSchema);
