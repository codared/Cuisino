
const express = require("express");
const multer = require("multer");
const router = express.Router();
const Meal = require("../models/Meal");
const fetch = require("node-fetch");

const upload = multer({ storage: multer.memoryStorage() });

router.put("/meals/:id", upload.single("image"), async (req, res) => {
  try {
    const base64Image = req.file.buffer.toString("base64");
    const body = new URLSearchParams();
    body.append("file", `data:image/jpeg;base64,${base64Image}`);
    body.append("upload_preset", "YOUR_UPLOAD_PRESET");

    const uploadRes = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", {
      method: "POST",
      body,
    });

    const data = await uploadRes.json();
    const meal = await Meal.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        image: data.secure_url,
      },
      { new: true }
    );

    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update meal" });
  }
});

module.exports = router;
