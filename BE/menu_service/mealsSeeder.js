const mongoose = require("mongoose");
const meals = require("./meals.json");
const Meal = require("./models/Meal"); // Adjust path as needed

mongoose
  .connect(
    "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority"
  )
  .then(() => Meal.insertMany(meals))
  .then(() => {
    console.log("Meals successfully seeded to MongoDB Atlas!");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    mongoose.disconnect();
  });
