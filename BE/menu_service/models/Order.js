const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   user_id: { type: String, required: true },
//   meal_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Meal",
//     required: true,
//   },
//   quantity: { type: Number, required: true },
//   cafeteria_id: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ["Pending", "Ready", "Completed", "Sent out", "Cancelled"],
//     default: "Pending",
//   },
//   timestamp: { type: Date, default: Date.now },
//   paid: { type: Boolean, default: false },
// });

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  meal_id: { type: mongoose.Schema.Types.ObjectId, ref: "Meal" },
  quantity: Number,
  cafeteria_id: Number,
  status: {
    type: String,
    enum: ["Pending", "Ready", "Completed", "Sent out", "Cancelled"],
    default: "Pending",
  },
  paid: Boolean,
  sides: [
    {
      name: String,
      qty: Number,
      price: Number,
    },
  ],
  delivery: Boolean,
  deliveryLocation: String,
  timestamp: { type: Date, default: Date.now },
  // any other fields you want...
});

module.exports = mongoose.model("Order", OrderSchema);
