const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const axios = require("axios");

// Models (assume these are in ./models folder and correctly exported)
const Meal = require("./models/Meal");
const User = require("./models/User");
const Rating = require("./models/Rating");
const Order = require("./models/Order");
const Payment = require("./models/Payment");
const Notification = require("./models/Notification");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "c09fcffa3b437e8a729e8855900a121b5b3507c6f92db3806975b16eb78af642";

// Connect to MongoDB (make sure your URI is correct)
mongoose.connect(
  // process.env.MONGO_URI ||
  // "mongodb+srv://<db_username>:<db_password>@abuad.uskzl8q.mongodb.net/?retryWrites=true&w=majority&appName=abuad",
  "mongodb+srv://cuisino:Cuisino@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority&appName=abuad",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Middleware for JWT auth
const authenticate = async (req, res, next) => {
  console.log("Authenticate middleware called");
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer token
  if (!token)
    return res.status(401).json({ error: "Access denied, no token provided" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // { userId, isAdmin }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Session expired. Please log in again." });
    }
    console.log("Invalid token error:", err.message);
    res.status(400).json({ error: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ error: "Admin access required" });
  next();
};

//pinging server to keep it awake
app.get("/ping", (req, res) => {
  res.send("pong");
});

// --- Auth Routes ---

// In your .env file or environment config
const CAFETERIA_ADMIN_KEYS = {
  1: "C1ADMINPASS",
  2: "ShackADMINPASS",
  3: "Cafeteria2ADMINPASS",
  4: "ABUADTHADMINPASS",
  5: "DelisADMINPASS",
};

const cafeteriaIdToName = {
  1: "Cafeteria 1",
  2: "Smoothie Shack",
  3: "Cafeteria 2",
  4: "Med Cafeteria",
  5: "Seasons Deli",
};

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, adminKey, cafeteriaId, isAdmin } =
      req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Please provide email, password, and name" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const adminFlag = Boolean(isAdmin);

    if (adminFlag) {
      if (!cafeteriaId || !adminKey) {
        return res.status(400).json({
          error: "Admin key and cafeteria are required for admin registration",
        });
      }

      const expectedKey = CAFETERIA_ADMIN_KEYS[cafeteriaId];
      if (!expectedKey || adminKey !== expectedKey) {
        return res
          .status(400)
          .json({ error: "Invalid admin key for selected cafeteria" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone: phone || null,
      isAdmin: adminFlag,
      cafeteria_id: adminFlag ? cafeteriaId : null,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        isAdmin: user.isAdmin,
        cafeteria_id: user.cafeteria_id || null,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password, adminKey, cafeteriaId } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (user.isAdmin) {
      if (!adminKey || !cafeteriaId) {
        return res
          .status(400)
          .json({ error: "Admin key and cafeteria required" });
      }

      const expectedKey = CAFETERIA_ADMIN_KEYS[cafeteriaId];

      if (
        user.cafeteria_id !== cafeteriaId || // ⛔ mismatch cafeteria
        adminKey !== expectedKey // ⛔ mismatch key
      ) {
        return res.status(400).json({
          error: "Invalid cafeteria or admin key for this account",
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        phone: user.phone,
        cafeteria_id: user.cafeteria_id || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- Meals CRUD ---

// Create a new meal (Admin only)
app.post("/meals", authenticate, isAdmin, async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: "Failed to create meal" });
  }
});

// Get all meals (public)
app.get("/meals", async (req, res) => {
  try {
    const { cafeteria_id } = req.query;

    let meals;
    if (cafeteria_id) {
      meals = await Meal.find({ cafeteria_id: Number(cafeteria_id) });
    } else {
      meals = await Meal.find();
    }

    res.json(meals);
  } catch (err) {
    console.error("Failed to fetch meals:", err);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// Get trending meals (Top 10 by average rating)
app.get("/meals/trending", async (req, res) => {
  try {
    // Calculate average rating from separate Rating collection
    // Join Meal and Ratings, then sort by average rating descending
    const trending = await Meal.aggregate([
      {
        $lookup: {
          from: "ratings", // collection name is plural lowercase by default
          localField: "_id",
          foreignField: "meal_id",
          as: "mealRatings",
        },
      },
      {
        $addFields: {
          avgRating: { $avg: "$mealRatings.rating" },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $project: {
          mealRatings: 0, // exclude ratings details
        },
      },
    ]);
    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: "Failed to get trending meals" });
  }
});

// Get meal by ID
app.get("/meals/:id", async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: "Failed to get meal" });
  }
});

// Update meal (Admin only)
app.put("/meals/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(400).json({ error: "Failed to update meal" });
  }
});

// Delete meal (Admin only)
app.delete("/meals/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

// --- Orders ---

function calculateTotal(order) {
  const mealTotal = order.meal_id.price * order.quantity;
  const sidesTotal = order.sides.reduce(
    (sum, side) => sum + side.price * side.qty,
    0
  );
  const deliveryFee = order.delivery ? 1000 : 0; // example fixed delivery fee

  return mealTotal + sidesTotal + deliveryFee;
}

// Place an order (user only)
app.post("/orders", authenticate, async (req, res) => {
  try {
    const {
      meal_id,
      quantity,
      cafeteria_id,
      sides,
      delivery,
      deliveryLocation,
    } = req.body;

    if (!meal_id || !quantity || !cafeteria_id)
      return res
        .status(400)
        .json({ error: "meal_id, quantity, cafeteria_id required" });

    const order = new Order({
      user_id: req.user.userId,
      meal_id,
      quantity,
      cafeteria_id,
      status: "Pending",
      paid: false,
      sides: sides || [],
      delivery: delivery || false,
      deliveryLocation: deliveryLocation || "",
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to place order" });
  }
});

//verify payment
app.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    // Call Paystack verify transaction API
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer sk_test_cc58eabc688ab8ebc98cbc1567b9843fd141b53b`, // Your secret key
        },
      }
    );

    const data = response.data;

    if (data.status && data.data.status === "success") {
      const orderId = data.data.metadata?.order_id;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID missing in metadata" });
      }

      const order = await Order.findById(orderId).populate("meal_id").exec();
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      order.paid = true;
      order.paymentReference = reference;
      await order.save();

      const orderObj = order.toObject();
      orderObj.total = calculateTotal(orderObj); // Add this function to calculate total price including sides & delivery

      return res.json({ success: true, order: orderObj });
    } else {
      // Payment not successful
      return res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (err) {
    console.error(
      "Paystack verification error:",
      err.response?.data || err.message
    );
    return res.status(500).json({ error: "Server error verifying payment" });
  }
});

// Get all orders of the logged-in user
app.get("/orders/user", authenticate, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT in `authenticate` middleware

    const orders = await Order.find({ user_id: userId })
      .populate("meal_id") // Optional: shows full meal info
      .sort({ createdAt: -1 }); // Most recent orders first

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user's orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders of authenticated user
// app.get("/admin/orders", authenticate, isAdmin, async (req, res) => {
//   try {
//     const { cafeteria_id } = req.query;

//     const orders = await Order.find({ cafeteria_id })
//       .populate("user_id", "name phone") // 👈 Populates name & phone from User
//       .populate("meal_id"); // 👈 Populates full meal object

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // Admin: get all orders by cafeteria_id with status
// app.get("/admin/orders", authenticate, isAdmin, async (req, res) => {
//   try {
//     const cafeteriaId = parseInt(req.query.cafeteria_id);
//     if (!cafeteriaId)
//       return res
//         .status(400)
//         .json({ error: "cafeteria_id query param required" });

//     const orders = await Order.find({ cafeteria_id: cafeteriaId })
//       .populate("meal_id")
//       .populate("user_id", "name phone");

//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to get orders" });
//   }
// });

app.get("/admin/orders", authenticate, isAdmin, async (req, res) => {
  try {
    const { cafeteria_id } = req.query;

    if (!cafeteria_id)
      return res
        .status(400)
        .json({ error: "cafeteria_id query param required" });

    const orders = await Order.find({ cafeteria_id })
      .populate("user_id", "name phone")
      .populate("meal_id");

    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    });

    const enhancedOrders = orders.map((order) => {
      const mealPrice = order.meal_id?.price || 0;
      const sidesTotal = (order.sides || []).reduce(
        (sum, s) => sum + s.price * s.qty,
        0
      );
      const packingFee = order.packing ? 100 : 0;
      const deliveryFee = order.delivery ? 200 : 0;

      const total = mealPrice + sidesTotal + packingFee + deliveryFee;

      return {
        ...order._doc,
        total,
        formattedTotal: formatter.format(total), // e.g., ₦1,400
      };
    });

    res.json(enhancedOrders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status (admin only)
app.put("/orders/:id/status", authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (
      !["Pending", "Ready", "Completed", "Sent out", "Cancelled"].includes(
        status
      )
    )
      return res.status(400).json({ error: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to update order status" });
  }
});

// POST /meals - Admin adds a meal
app.post("/meals", authenticate, isAdmin, async (req, res) => {
  try {
    const { name, price, available, image, cafeteria_id } = req.body;

    const meal = new Meal({
      name,
      price,
      available,
      image,
      cafeteria_id,
    });

    await meal.save();
    res.status(201).json(meal);
  } catch (err) {
    console.error("Add meal error:", err);
    res.status(500).json({ error: "Failed to add meal" });
  }
});

//categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await Meal.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// --- Ratings ---

// Add a rating for a meal (user only)
app.post("/ratings", authenticate, async (req, res) => {
  try {
    const { meal_id, rating, comment } = req.body;
    if (!meal_id || !rating)
      return res.status(400).json({ error: "meal_id and rating required" });

    const newRating = new Rating({
      user_id: req.user.userId,
      meal_id,
      rating,
      comment,
    });
    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ error: "Failed to add rating" });
  }
});

// Get ratings for a meal
app.get("/ratings/:meal_id", async (req, res) => {
  try {
    const ratings = await Rating.find({ meal_id: req.params.meal_id });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: "Failed to get ratings" });
  }
});

// --- Payments ---

// Create a payment record (user only)
app.post("/payments", authenticate, async (req, res) => {
  try {
    const { order_id, amount, reference, status } = req.body;
    if (!order_id || !amount || !reference)
      return res
        .status(400)
        .json({ error: "order_id, amount, and reference required" });

    const payment = new Payment({
      user_id: req.user.userId,
      order_id,
      amount,
      reference,
      status: status || "pending",
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: "Failed to create payment" });
  }
});

// Get payments for user
app.get("/payments", authenticate, async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Failed to get payments" });
  }
});

// --- Notifications ---

// Get notifications for user
app.get("/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.userId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// Mark notification as read
app.put("/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: "Failed to mark notification as read" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
