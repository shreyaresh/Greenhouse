const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: String,
  type_id: String,
  date: Date,
  content: Mixed
}
)

const UserSchema = new mongoose.Schema({
  name: String,
  id: String,
  email: String,
  gardenIds: [String],
  friends:[String],
  currency: Number,
  inventory: [String],
  friends: [String],
  notifications: [Notification]
});


UserSchema.statics.getUser = async function getUser (id) {
  try {
      return await this.findOne({ id: id});
  } catch (err) {
      console.log(err);
  }
}

// compile model from schema
let User = mongoose.model("user", UserSchema);
module.exports = User;
