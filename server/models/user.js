const mongoose = require("mongoose");

const Friend = new mongoose.Schema({
  username: String,
  id: String
});

const Notification = new mongoose.Schema({
  type: String,
  typeId: String,
  date: Date,
  content: String
});

const UserSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  gardenIds: [String],
  friends:[String],
  currency: Number,
  inventory: [String],
  friends: [Friend],
  notifications: [Notification]
});


UserSchema.statics.getUser = async function getUser (id) {
  try {
      return await this.findOne({_id: id});
  } catch (err) {
      console.log(err);
  }
}

// compile model from schema
let User = mongoose.model("user", UserSchema);
module.exports = User;
