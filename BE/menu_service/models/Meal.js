const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  cafeteria_id: { type: Number },
  cafeteria_name: { type: String },
  tags: [String],
  available: { type: Boolean, default: true },
  description: { type: String },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
  ratings: [
    {
      userId: String,
      rating: Number,
    },
  ],
});

module.exports = mongoose.model("Meal", MealSchema);
