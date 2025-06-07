// // // ✅ MongoDB Connection (your current replica set string)
// // mongoose
// //   .connect(
// //     "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority"
// //   )
// //   .then(() => console.log("✅ Connected to MongoDB"))
// //   .catch((err) => console.error("MongoDB connection error:", err));

// const express = require("express");
// // const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// // const fetch = require("node-fetch");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const socketIO = require("socket.io");
// const meals = require("./meals.json"); // local file

// const io = require("socket.io")(http, {
//   cors: { origin: "*" },
// });

// const fs = require("fs");
// const path = require("path");

// const ordersFile = path.join(__dirname, "orders.json");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // mongoose.connect(
// //   "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority"
// // );

// // 🔌 Store connected users/admins
// let connectedUsers = {};
// let connectedAdmins = [];

// io.on("connection", (socket) => {
//   console.log("User connected: ", socket.id);

//   socket.on("register", ({ userId, role }) => {
//     if (role === "admin") {
//       connectedAdmins.push(socket.id);
//     } else {
//       connectedUsers[userId] = socket.id;
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("Disconnected:", socket.id);
//     // cleanup
//     connectedAdmins = connectedAdmins.filter((id) => id !== socket.id);
//     for (const key in connectedUsers) {
//       if (connectedUsers[key] === socket.id) {
//         delete connectedUsers[key];
//         break;
//       }
//     }
//   });
// });

// const resetMealAvailability = () => {
//   const now = new Date();
//   const hours = now.getHours();

//   if (hours === 8) {
//     const mealsPath = path.join(__dirname, "meals.json");
//     try {
//       const mealsData = fs.readFileSync(mealsPath, "utf-8");
//       const meals = JSON.parse(mealsData);

//       meals.forEach((meal) => {
//         meal.availabilityStatus = "Available";
//       });

//       fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2));
//       console.log("✅ Meal availability reset to 'Available'");
//     } catch (err) {
//       console.error("❌ Failed to reset meal availability:", err.message);
//     }
//   }
// };

// // ⏰ Check every 30 minutes if it's 8 AM and reset
// setInterval(resetMealAvailability, 30 * 60 * 1000);

// const mealsFile = path.join(__dirname, "meals.json");

// // Temporary route using meals.json directly
// app.get("/meals", (req, res) => {
//   const cafeteriaId = req.query.cafeteria_id;

//   let filtered = meals;

//   if (cafeteriaId) {
//     const filtered = meals.filter(
//       (m) => m.cafeteria_id === parseInt(cafeteriaId)
//     );

//     if (!isAdmin) {
//       filtered = filtered.filter(
//         (m) =>
//           !m.availabilityStatus ||
//           !["Temporarily Unavailable", "Finished for the Day"].includes(
//             m.availabilityStatus
//           )
//       );
//     }

//     res.json(filtered);
//   } else {
//     res.json(meals);
//   }
// });

// app.put("/meals/:id", (req, res) => {
//   console.log("🔧 PUT /meals/:id body:", req.body);

//   const { id } = req.params;
//   const { name, price, image } = req.body;

//   const meal = meals.find((m) => m.id === parseInt(id));
//   if (!meal) return res.status(404).json({ error: "Meal not found" });

//   meal.name = name || meal.name;
//   meal.price = price !== undefined ? parseFloat(price) : meal.price;
//   meal.image = image || meal.image;

//   fs.writeFileSync(
//     path.join(__dirname, "meals.json"),
//     JSON.stringify(meals, null, 2)
//   );

//   res.json({ message: "✅ Meal updated", meal });
//   console.log("Meal updated:", meal);
// });

// // Start listening for client connections
// io.on("connection", (socket) => {
//   console.log("📡 Client connected");

//   socket.on("disconnect", () => {
//     console.log("❌ Client disconnected");
//   });
// });

// // Make IO globally available
// app.set("io", io);

// // 🔄 Simulated in-memory orders
// let orders = [];

// // Load existing orders from file or fallback to empty array

// if (fs.existsSync(ordersFile)) {
//   const data = fs.readFileSync(ordersFile, "utf-8");
//   try {
//     orders = JSON.parse(data);
//   } catch {
//     orders = [];
//   }
// }

// // 📦 Place an order
// app.post("/orders", (req, res) => {
//   const io = req.app.get("io");

//   const {
//     user_id,
//     meal_id,
//     cafeteria_id,
//     quantity,
//     sides,
//     delivery,
//     packing,
//     deliveryLocation,
//     total,
//   } = req.body;

//   if (!meal_id || !user_id || !cafeteria_id || !quantity) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   const order = {
//     id: Date.now(),
//     user_id,
//     meal_id,
//     quantity,
//     cafeteria_id,
//     sides: sides || [],
//     packing: !!packing,
//     delivery: !!delivery,
//     deliveryLocation: deliveryLocation || "",
//     total: total || 0,
//     status: "Pending",
//     paid: false,
//   };

//   orders.push(order);
//   fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

//   res.status(201).json(order);
// });

// app.post("/orders/:id/pay", (req, res) => {
//   const orderId = parseInt(req.params.id);
//   const index = orders.findIndex((o) => o.id === orderId);

//   if (index === -1) return res.status(404).json({ error: "Order not found" });

//   orders[index].paid = true;

//   fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

//   res.json({ message: "Order marked as paid", order: orders[index] });
// });

// const PAYSTACK_SECRET = "sk_test_cc58eabc688ab8ebc98cbc1567b9843fd141b53b";

// // server.js (Express backend)
// app.get("/verify/:reference", async (req, res) => {
//   const { reference } = req.params;

//   try {
//     const verifyRes = await fetch(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET}`,
//         },
//       }
//     );

//     const data = await verifyRes.json();

//     console.log("💡 Looking for order with ID:", data.data.metadata.order_id);
//     console.log(
//       "📦 Orders available:",
//       orders.map((o) => o.id)
//     );

//     if (!data.status || data.data.status !== "success") {
//       return res.status(400).json({ error: "Payment verification failed" });
//     }
//     // 🔁 Find and update order
//     const order = orders.find((o) => o.id == data.data.metadata.order_id);
//     if (!order) return res.status(404).json({ error: "Order not found" });

//     order.paid = true;

//     fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
//     return res.json({ message: "Payment verified", order });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Verification error" });
//   }
// });

// // ✅ GET all orders for a specific user
// app.get("/orders/user/:userId", (req, res) => {
//   const { userId } = req.params;
//   const userOrders = orders.filter((o) => o.user_id === userId);

//   if (!userOrders || userOrders.length === 0) {
//     // return res.status(404).json({ error: "No orders found for this user" });
//     return res.json(userOrders);
//   }

//   // Optional: map meal ID to full meal name/image
//   const mealsData = JSON.parse(fs.readFileSync(mealsFile, "utf-8"));
//   const mappedOrders = userOrders.map((order) => {
//     const meal = mealsData.find((m) => m.id === parseInt(order.meal_id));
//     return {
//       ...order,
//       meal: meal?.name || "Unknown Meal",
//       image: meal?.image || null,
//       cafeteria_name:
//         cafeterias.find((c) => c.id === order.cafeteria_id)?.name || "Unknown",
//       date: new Date(order.id).toISOString(),
//     };
//   });

//   res.json(mappedOrders);
// });

// // 🧾 View all orders (for admin)
// app.get("/orders", (req, res) => {
//   res.json(orders);
// });

// app.get("/orders/cafeteria/:id", (req, res) => {
//   const cafId = parseInt(req.params.id);
//   const filteredOrders = orders.filter((order) => order.cafeteria_id === cafId);

//   // Load users and meals
//   const usersData = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
//   const mealsData = JSON.parse(fs.readFileSync(mealsFile, "utf-8"));

//   const mapped = filteredOrders.map((order) => {
//     const user = usersData.find((u) => u.userId === order.user_id);
//     const meal = mealsData.find((m) => m.id === order.meal_id);

//     return {
//       ...order,
//       userPhone: user?.phone || "N/A",
//       userName: user?.name || "Unknown",
//       mealName: meal?.name || "Unknown",
//       location: order.deliveryLocation || "Not specified",
//     };
//   });

//   res.json(mapped);
// });

// app.get("/orders/cafeteria/:id/:status", (req, res) => {
//   const cafId = parseInt(req.params.id);
//   const status = req.params.status.toLowerCase();
//   const filteredOrders = orders.filter(
//     (order) =>
//       order.cafeteria_id === cafId && order.status.toLowerCase() === status
//   );
//   res.json(filteredOrders);
// });

// // PUT /orders/:id - update order status
// app.put("/orders/:id", isAdmin, (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const index = orders.findIndex((order) => order.id === parseInt(id));
//   if (index === -1) return res.status(404).json({ error: "Order not found" });

//   orders[index].status = status;

//   // Save to disk
//   fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

//   const io = req.app.get("io");
//   const userId = orders[index].user_id;

//   // Notify admin and user
//   const userSocket = connectedUsers[userId];
//   if (userSocket) {
//     io.to(userSocket).emit("order_update", orders[index]);
//   }

//   io.emit(`order_status_${userId}`, {
//     status,
//     meal: orders[index].meal,
//     id: orders[index].id,
//   });

//   res.json({ message: "✅ Order status updated", order: orders[index] });
// });

// // POST /ratings
// app.post("/ratings", async (req, res) => {
//   const { meal_id, rating, user_id } = req.body;

//   if (!meal_id || rating == null || !user_id) {
//     return res
//       .status(400)
//       .json({ error: "Meal ID, user ID, and rating are required." });
//   }

//   try {
//     const meal = await meal.findById(meal_id);
//     if (!meal) {
//       return res.status(404).json({ error: "Meal not found." });
//     }

//     // Optional: prevent multiple ratings from same user
//     const existingIndex = meal.ratings.findIndex((r) => r.userId === user_id);
//     if (existingIndex !== -1) {
//       meal.ratings[existingIndex].rating = rating; // update rating
//     } else {
//       meal.ratings.push({ userId: user_id, rating }); // add new
//     }

//     await meal.save();
//     res.json({ message: "Rating submitted", ratings: meal.ratings });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to submit rating." });
//   }
// });

// let notifications = [
//   { message: "Welcome to ABUAD Eats!", timestamp: new Date() },
// ];

// app.use(express.json());

// const ADMIN_TOKEN = "mysecrettoken";

// app.post("/notifications", (req, res) => {
//   if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) {
//     return res.status(403).json({ error: "Unauthorized" });
//   }

//   // app.post("/notifications", (req, res) => {
//   const { message } = req.body;
//   if (!message) return res.status(400).json({ error: "Message is required" });

//   const newNotification = {
//     message,
//     timestamp: new Date(),
//   };

//   notifications.unshift(newNotification); // newest first
//   res
//     .status(201)
//     .json({ message: "Notification added", data: newNotification });
// });

// // GET all notifications (already exists)
// app.get("/notifications", (req, res) => {
//   res.json(notifications);
// });

// // DELETE a notification
// app.delete("/notifications/:index", (req, res) => {
//   const index = parseInt(req.params.index);
//   if (index >= 0 && index < notifications.length) {
//     const removed = notifications.splice(index, 1);
//     return res.json({ message: "Deleted", removed });
//   }
//   res.status(404).json({ error: "Not found" });
// });

// const session = require("express-session");

// app.use(
//   session({
//     secret: "topsecretkey",
//     resave: false,
//     saveUninitialized: false,
//   })
// );

// // // server.js or routes/users.js
// app.post("/signup", (req, res) => {
//   const { name, email, phone, password, adminKey, cafeteriaId } = req.body;
//   const isAdmin = adminKey === "ADMINPASS";

//   if (users.find((u) => u.email.toLowerCase() === email)) {
//     return res.status(400).json({ error: "Email already in use" });
//   }

//   const newUser = {
//     name: name.trim(),
//     email: email.toLowerCase(),
//     password, // 🔐 hash in production
//     phone,
//     isAdmin,
//     userId: `user_${Date.now()}`,
//     cafeteriaId: isAdmin ? cafeteriaId : undefined,
//   };

//   users.push(newUser);
//   fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

//   res.json({ message: "User registered successfully", user: newUser });
// });

// app.post("/login", (req, res) => {
//   console.log("Incoming request body:", req.body); // 👈 log this

//   const { email, password, adminKey } = req.body || {};

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   const normalizedEmail = email.toLowerCase();

//   const user = users.find(
//     (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
//   );

//   if (!user) {
//     return res.status(401).json({ error: "Invalid credentials" });
//   }

//   if (user.isAdmin && adminKey !== "ADMINPASS") {
//     return res.status(403).json({ error: "Invalid admin key" });
//   }

//   return res.json({
//     user: {
//       userId: user.userId,
//       isAdmin: user.isAdmin,
//       role: user.isAdmin ? "admin" : "user",
//       name: user.name,
//       email: user.email,
//       adminCafeteriaId: user.cafeteriaId,
//     },
//   });
// });

// app.get("/me", (req, res) => {
//   res.json(req.session.user || null);
// });

// // 🔒 Middleware to protect admin routes
// function isAdmin(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (authHeader === "Bearer mysecrettoken") {
//     next();
//   } else {
//     res.status(403).json({ error: "Unauthorized" });
//   }
// }

// // 🔐 Use protection for orders and meals update
// app.get("/orders", isAdmin, (req, res) => {
//   res.json(orders); // Example admin-protected route
// });

// // GET /meals/top-per-cafeteria
// app.get("/meals/top-per-cafeteria", (req, res) => {
//   const result = {};
//   cafeterias.forEach((caf) => {
//     result[caf.id] = meals.filter((m) => m.cafeteria_id === caf.id).slice(0, 2); // Top 2 for simplicity
//   });

//   res.json(result);
// });

// const usersFile = path.join(__dirname, "users.json");
// let users = [];

// if (fs.existsSync(usersFile)) {
//   const data = fs.readFileSync(usersFile, "utf-8");
//   try {
//     users = JSON.parse(data);
//   } catch {
//     users = [];
//   }
// }

// app.get("/trending", (req, res) => {
//   let meals = [];

//   try {
//     const data = fs.readFileSync(mealsFile, "utf-8");
//     meals = JSON.parse(data);
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to load meals data" });
//   }

//   const trending = meals
//     .filter((m) => m.orderCount) // must have orderCount
//     .sort((a, b) => b.orderCount - a.orderCount)
//     .slice(0, 10); // top 10

//   res.json(trending);
// });

// const csvPath = path.join(__dirname, "orders_simple.csv");

// // Append new order to CSV
// function appendOrderToCSV(order) {
//   const line = `${order.user_id},${order.meal_id},${order.quantity},${order.cafeteria_id}\n`;
//   fs.appendFileSync(csvPath, line);
// }

// const adminUploadRoutes = require("./routes/adminUpload");
// const { cafeterias } = require("./constants/cafeterias");
// app.use(adminUploadRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Models (assume these are in ./models folder and correctly exported)
const Meal = require("./models/Meal");
const User = require("./models/user");
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
  process.env.MONGO_URI ||
    // "mongodb+srv://<db_username>:<db_password>@abuad.uskzl8q.mongodb.net/?retryWrites=true&w=majority&appName=abuad",
    "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Middleware for JWT auth
const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Bearer token
  if (!token)
    return res.status(401).json({ error: "Access denied, no token provided" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // { userId, isAdmin }
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin)
    return res.status(403).json({ error: "Admin access required" });
  next();
};

// --- Auth Routes ---

// Register
app.post("/register", async (req, res) => {
  try {
    const { email, password, name, isAdmin } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Please provide email, password, and name" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      isAdmin: isAdmin || false,
    });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({ token, user: { email, name, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: { email: user.email, name: user.name, isAdmin: user.isAdmin },
    });
  } catch (err) {
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
    const meals = await Meal.find({});
    res.json(meals);
  } catch (err) {
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

// Place an order (user only)
app.post("/orders", authenticate, async (req, res) => {
  try {
    const { meal_id, quantity, cafeteria_id } = req.body;
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
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: "Failed to place order" });
  }
});

// Get all orders of authenticated user
app.get("/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).populate(
      "meal_id"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to get orders" });
  }
});

// Admin: get all orders by cafeteria_id with status
app.get("/admin/orders", authenticate, isAdmin, async (req, res) => {
  try {
    const cafeteriaId = parseInt(req.query.cafeteria_id);
    if (!cafeteriaId)
      return res
        .status(400)
        .json({ error: "cafeteria_id query param required" });

    const orders = await Order.find({ cafeteria_id: cafeteriaId }).populate(
      "meal_id"
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to get orders" });
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
