const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  meal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
  },
  quantity: { type: Number, required: true },
  cafeteria_id: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Ready", "Completed", "Sent out", "Cancelled"],
    default: "Pending",
  },
  timestamp: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
});

module.exports = mongoose.model("Order", OrderSchema);
