const mongoose = require("mongoose");
const Numbers = require("twilio/lib/rest/Numbers");

const UserSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  gardenIds: [String],
  friends:[String],
  currency: Numbers,
  inventory: [String]
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
