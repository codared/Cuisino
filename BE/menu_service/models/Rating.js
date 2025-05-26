const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  meal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meal",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rating", RatingSchema);
