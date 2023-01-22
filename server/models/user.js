const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  notificationId: String,
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

// compile model from schema
let User = mongoose.model("user", UserSchema);
module.exports = User;
