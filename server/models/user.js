const mongoose = require("mongoose");
const Numbers = require("twilio/lib/rest/Numbers");

const UserSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  gardenIds: [String],
  friends:[String],
  currency: Number,
  inventory: [String]
});

// compile model from schema
let User = mongoose.model("user", UserSchema);
module.exports = User;
