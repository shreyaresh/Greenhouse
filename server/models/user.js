const mongoose = require("mongoose");

const Friend = new mongoose.Schema({
  username: String,
  id: String
});

const Item = new mongoose.Schema({
  growthTime: Number,
  item_id: String,
  growthStage: Number,
  quantity: Number
})
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
  currency: Number,
  inventory: [Item],
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
