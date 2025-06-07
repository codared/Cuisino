const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // You can hash this
  name: { type: String, required: true },
  phone: { type: String }, // optional

  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  cafeteria_id: {
    type: Number,
    required: function () {
      return this.isAdmin;
    },
    location: String,
  }, // only required if isAdmin is true
});

module.exports = mongoose.model("User", UserSchema);
