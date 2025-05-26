// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const Meal = require("./models/Meal"); // Uses external schema

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ✅ MongoDB Connection (your current replica set string)
// mongoose
//   .connect(
//     "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority"
//   )
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

// // ✅ GET meals (optionally filter by cafeteria_id)
// app.get("/meals", async (req, res) => {
//   try {
//     const cafeteriaId = req.query.cafeteria_id;
//     const meals = cafeteriaId
//       ? await Meal.find({ cafeteria_id: parseInt(cafeteriaId) })
//       : await Meal.find();
//     res.json(meals);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch meals" });
//   }
// });

// // ✅ POST a new meal
// app.post("/meals", async (req, res) => {
//   try {
//     const meal = new Meal(req.body);
//     await meal.save();
//     res.json(meal);
//   } catch (err) {
//     res.status(400).json({ error: "Failed to add meal" });
//   }
// });

// app.listen(3000, () => console.log("🟢 Menu service running on port 3000"));

const express = require("express");
// const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const fetch = require("node-fetch");

const socketIO = require("socket.io");
const meals = require("./meals.json"); // local file

const io = require("socket.io")(http, {
  cors: { origin: "*" },
});

const fs = require("fs");
const path = require("path");

const ordersFile = path.join(__dirname, "orders.json");

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect(
//   "mongodb+srv://ohuejames101:abuadatlas@abuad.uskzl8q.mongodb.net/abuad?retryWrites=true&w=majority"
// );

// 🔌 Store connected users/admins
let connectedUsers = {};
let connectedAdmins = [];

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("register", ({ userId, role }) => {
    if (role === "admin") {
      connectedAdmins.push(socket.id);
    } else {
      connectedUsers[userId] = socket.id;
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    // cleanup
    connectedAdmins = connectedAdmins.filter((id) => id !== socket.id);
    for (const key in connectedUsers) {
      if (connectedUsers[key] === socket.id) {
        delete connectedUsers[key];
        break;
      }
    }
  });
});

const resetMealAvailability = () => {
  const now = new Date();
  const hours = now.getHours();

  if (hours === 8) {
    const mealsPath = path.join(__dirname, "meals.json");
    try {
      const mealsData = fs.readFileSync(mealsPath, "utf-8");
      const meals = JSON.parse(mealsData);

      meals.forEach((meal) => {
        meal.availabilityStatus = "Available";
      });

      fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2));
      console.log("✅ Meal availability reset to 'Available'");
    } catch (err) {
      console.error("❌ Failed to reset meal availability:", err.message);
    }
  }
};

// ⏰ Check every 30 minutes if it's 8 AM and reset
setInterval(resetMealAvailability, 30 * 60 * 1000);

const mealsFile = path.join(__dirname, "meals.json");

// Temporary route using meals.json directly
app.get("/meals", (req, res) => {
  const cafeteriaId = req.query.cafeteria_id;

  let filtered = meals;

  if (cafeteriaId) {
    const filtered = meals.filter(
      (m) => m.cafeteria_id === parseInt(cafeteriaId)
    );

    // // Hide unavailable meals
    // filtered = filtered.filter(
    //   (m) =>
    //     !m.availabilityStatus ||
    //     !["Finished for the Day", "Temporarily Unavailable"].includes(
    //       m.availabilityStatus
    //     )
    // );

    if (!isAdmin) {
      filtered = filtered.filter(
        (m) =>
          !m.availabilityStatus ||
          !["Temporarily Unavailable", "Finished for the Day"].includes(
            m.availabilityStatus
          )
      );
    }

    res.json(filtered);
  } else {
    res.json(meals);
  }
});

app.put("/meals/:id", (req, res) => {
  console.log("🔧 PUT /meals/:id body:", req.body);

  const { id } = req.params;
  const { name, price, image } = req.body;

  const meal = meals.find((m) => m.id === parseInt(id));
  if (!meal) return res.status(404).json({ error: "Meal not found" });

  meal.name = name || meal.name;
  meal.price = price !== undefined ? parseFloat(price) : meal.price;
  meal.image = image || meal.image;

  fs.writeFileSync(
    path.join(__dirname, "meals.json"),
    JSON.stringify(meals, null, 2)
  );

  res.json({ message: "✅ Meal updated", meal });
  console.log("Meal updated:", meal);
});

// app.listen(3000, () =>
//   console.log("🟢 Offline menu server running on port 3000")
// );

// const http = require("http").createServer(app);

// Start listening for client connections
io.on("connection", (socket) => {
  console.log("📡 Client connected");

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

// Make IO globally available
app.set("io", io);

// 🔄 Simulated in-memory orders
let orders = [];

// Load existing orders from file or fallback to empty array

if (fs.existsSync(ordersFile)) {
  const data = fs.readFileSync(ordersFile, "utf-8");
  try {
    orders = JSON.parse(data);
  } catch {
    orders = [];
  }
}

// 📦 Place an order
app.post("/orders", (req, res) => {
  const io = req.app.get("io");

  const {
    user_id,
    meal_id,
    cafeteria_id,
    quantity,
    sides,
    delivery,
    packing,
    deliveryLocation,
    total,
  } = req.body;

  if (!meal_id || !user_id || !cafeteria_id || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const order = {
    id: Date.now(),
    user_id,
    meal_id,
    quantity,
    cafeteria_id,
    sides: sides || [],
    packing: !!packing,
    delivery: !!delivery,
    deliveryLocation: deliveryLocation || "",
    total: total || 0,
    status: "Pending",
    paid: false,
  };

  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  res.status(201).json(order);
});

// app.post("/orders/:id/pay", (req, res) => {
//   const orderId = parseInt(req.params.id);
//   const order = orders[orderId];
//   if (!order) return res.status(404).json({ error: "Order not found" });

//   order.paid = true;
//   res.json({ message: "Order marked as paid", order });
// });

app.post("/orders/:id/pay", (req, res) => {
  const orderId = parseInt(req.params.id);
  const index = orders.findIndex((o) => o.id === orderId);

  if (index === -1) return res.status(404).json({ error: "Order not found" });

  orders[index].paid = true;

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  res.json({ message: "Order marked as paid", order: orders[index] });
});

const PAYSTACK_SECRET = "sk_test_cc58eabc688ab8ebc98cbc1567b9843fd141b53b";

// server.js (Express backend)
app.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const data = await verifyRes.json();
    if (!data.status || data.data.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // 🔁 Find and update order
    const order = orders.find(
      (o) => o.id === parseInt(data.data.metadata.order_id)
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.paid = true;

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    return res.json({ message: "Payment verified", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Verification error" });
  }
});

// ✅ GET all orders for a specific user
app.get("/orders/user/:userId", (req, res) => {
  const { userId } = req.params;
  const userOrders = orders.filter((o) => o.user_id === userId);

  if (!userOrders || userOrders.length === 0) {
    return res.status(404).json({ error: "No orders found for this user" });
  }

  // Optional: map meal ID to full meal name/image
  const mealsData = JSON.parse(fs.readFileSync(mealsFile, "utf-8"));
  const mappedOrders = userOrders.map((order) => {
    const meal = mealsData.find((m) => m.id === parseInt(order.meal_id));
    return {
      ...order,
      meal: meal?.name || "Unknown Meal",
      image: meal?.image || null,
      cafeteria_name:
        cafeterias.find((c) => c.id === order.cafeteria_id)?.name || "Unknown",
      date: new Date(order.id).toISOString(),
    };
  });

  res.json(mappedOrders);
});

// 🧾 View all orders (for admin)
app.get("/orders", (req, res) => {
  res.json(orders);
});

app.get("/orders/cafeteria/:id", (req, res) => {
  const cafId = parseInt(req.params.id);
  const filteredOrders = orders.filter((order) => order.cafeteria_id === cafId);

  // Load users and meals
  const usersData = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  const mealsData = JSON.parse(fs.readFileSync(mealsFile, "utf-8"));

  const mapped = filteredOrders.map((order) => {
    const user = usersData.find((u) => u.userId === order.user_id);
    const meal = mealsData.find((m) => m.id === order.meal_id);

    return {
      ...order,
      userPhone: user?.phone || "N/A",
      userName: user?.name || "Unknown",
      mealName: meal?.name || "Unknown",
      location: order.deliveryLocation || "Not specified",
    };
  });

  res.json(mapped);
});

app.get("/orders/cafeteria/:id/:status", (req, res) => {
  const cafId = parseInt(req.params.id);
  const status = req.params.status.toLowerCase();
  const filteredOrders = orders.filter(
    (order) =>
      order.cafeteria_id === cafId && order.status.toLowerCase() === status
  );
  res.json(filteredOrders);
});

// PUT /orders/:id - update order status
app.put("/orders/:id", isAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = orders.findIndex((order) => order.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: "Order not found" });

  orders[index].status = status;

  // Save to disk
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

  const io = req.app.get("io");
  const userId = orders[index].user_id;

  // Notify admin and user
  const userSocket = connectedUsers[userId];
  if (userSocket) {
    io.to(userSocket).emit("order_update", orders[index]);
  }

  io.emit(`order_status_${userId}`, {
    status,
    meal: orders[index].meal,
    id: orders[index].id,
  });

  res.json({ message: "✅ Order status updated", order: orders[index] });
});

// POST /ratings
app.post("/ratings", async (req, res) => {
  const { meal_id, rating, user_id } = req.body;

  if (!meal_id || rating == null || !user_id) {
    return res
      .status(400)
      .json({ error: "Meal ID, user ID, and rating are required." });
  }

  try {
    const meal = await meal.findById(meal_id);
    if (!meal) {
      return res.status(404).json({ error: "Meal not found." });
    }

    // Optional: prevent multiple ratings from same user
    const existingIndex = meal.ratings.findIndex((r) => r.userId === user_id);
    if (existingIndex !== -1) {
      meal.ratings[existingIndex].rating = rating; // update rating
    } else {
      meal.ratings.push({ userId: user_id, rating }); // add new
    }

    await meal.save();
    res.json({ message: "Rating submitted", ratings: meal.ratings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit rating." });
  }
});

let notifications = [
  { message: "Welcome to ABUAD Eats!", timestamp: new Date() },
];

app.use(express.json());

const ADMIN_TOKEN = "mysecrettoken";

app.post("/notifications", (req, res) => {
  if (req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  // app.post("/notifications", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const newNotification = {
    message,
    timestamp: new Date(),
  };

  notifications.unshift(newNotification); // newest first
  res
    .status(201)
    .json({ message: "Notification added", data: newNotification });
});

// GET all notifications (already exists)
app.get("/notifications", (req, res) => {
  res.json(notifications);
});

// DELETE a notification
app.delete("/notifications/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < notifications.length) {
    const removed = notifications.splice(index, 1);
    return res.json({ message: "Deleted", removed });
  }
  res.status(404).json({ error: "Not found" });
});

const session = require("express-session");

app.use(
  session({
    secret: "topsecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// const users = [
//   {
//     username: "Caf1admin",
//     password: "adminpass",
//     isAdmin: true,
//     adminKey: "CAF1!",
//     cafeteriaId: 1,
//   },
//   {
//     username: "Caf2admin",
//     password: "adminpass",
//     isAdmin: true,
//     adminKey: "CAF2!",
//     cafeteriaId: 2,
//   },
//   {
//     username: "Caf3admin",
//     password: "adminpass",
//     isAdmin: true,
//     adminKey: "CAF3!",
//     cafeteriaId: 3,
//   },
//   { username: "Jacques", password: "studypass", isAdmin: false },
//   { username: "Brown", password: "studypas", isAdmin: false },
// ];

// // server.js or routes/users.js
app.post("/signup", (req, res) => {
  const { name, email, phone, password, adminKey, cafeteriaId } = req.body;
  const isAdmin = adminKey === "ADMINPASS";

  if (users.find((u) => u.email.toLowerCase() === email)) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const newUser = {
    name,
    email: email.toLowerCase(),
    password, // 🔐 hash in production
    phone,
    isAdmin,
    userId: `user_${Date.now()}`,
    cafeteriaId: isAdmin ? cafeteriaId : undefined,
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "User registered successfully", user: newUser });
});

// app.post("/login", (req, res) => {
//   const { username, password, adminKey } = req.body;
//   console.log("Login attempt:", req.body); // ✅ See input

//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );

//   console.log("Matched user:", user); // ✅ Check if user is matched

//   if (!user) {
//     return res.status(401).json({ error: "Invalid credentials" });
//   }

//   if (user.isAdmin) {
//     if (!adminKey || adminKey !== user.adminKey) {
//       return res.status(403).json({ error: "Invalid admin key" });
//     }
//   }

//   return res.json({
//     user: {
//       userId: username,
//       isAdmin: user.isAdmin,
//       role: user.isAdmin ? "admin" : "user",
//       adminCafeteriaId: user.cafeteriaId,
//     },
//   });
// });

app.post("/login", (req, res) => {
  console.log("Incoming request body:", req.body); // 👈 log this

  const { email, password, adminKey } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase();

  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (user.isAdmin && adminKey !== "ADMINPASS") {
    return res.status(403).json({ error: "Invalid admin key" });
  }

  return res.json({
    user: {
      userId: user.userId,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? "admin" : "user",
      name: user.name,
      email: user.email,
      adminCafeteriaId: user.cafeteriaId,
    },
  });
});

app.get("/me", (req, res) => {
  res.json(req.session.user || null);
});

// 🛡️ Setup middleware
// app.use(
//   session({
//     secret: "mysecrettoken",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }, // set to true if HTTPS
//   })
// );

// 🧑 Admin login
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   if (username === "admin" && password === "1234") {
//     req.session.user = { username, isAdmin: true };
//     res.json({ success: true });
//   } else {
//     res.status(401).json({ error: "Invalid credentials" });
//   }
// });

// 🔒 Middleware to protect admin routes
function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader === "Bearer mysecrettoken") {
    next();
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
}

// 🔐 Use protection for orders and meals update
app.get("/orders", isAdmin, (req, res) => {
  res.json(orders); // Example admin-protected route
});

// GET /meals/top-per-cafeteria
app.get("/meals/top-per-cafeteria", (req, res) => {
  // const cafeterias = [
  //   { id: 1, name: "CAFETERIA 1" },
  //   { id: 2, name: "SMOOTHIE SHACK" },
  //   { id: 3, name: "CAFETERIA 2" },
  //   { id: 4, name: "MED CAFETERIA" },
  //   { id: 5, name: "SEASONS DELI" },
  // ];

  const result = {};
  cafeterias.forEach((caf) => {
    result[caf.id] = meals.filter((m) => m.cafeteria_id === caf.id).slice(0, 2); // Top 2 for simplicity
  });

  res.json(result);
});

const usersFile = path.join(__dirname, "users.json");
let users = [];

if (fs.existsSync(usersFile)) {
  const data = fs.readFileSync(usersFile, "utf-8");
  try {
    users = JSON.parse(data);
  } catch {
    users = [];
  }
}

app.get("/trending", (req, res) => {
  let meals = [];

  try {
    const data = fs.readFileSync(mealsFile, "utf-8");
    meals = JSON.parse(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load meals data" });
  }

  const trending = meals
    .filter((m) => m.orderCount) // must have orderCount
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 10); // top 10

  res.json(trending);
});

const csvPath = path.join(__dirname, "orders_simple.csv");

// Append new order to CSV
function appendOrderToCSV(order) {
  const line = `${order.user_id},${order.meal_id},${order.quantity},${order.cafeteria_id}\n`;
  fs.appendFileSync(csvPath, line);
}

const adminUploadRoutes = require("./routes/adminUpload");
const { cafeterias } = require("./constants/cafeterias");
app.use(adminUploadRoutes);

// const server = http.createServer(app);

// server.listen(3000, () =>
//   console.log("🧠 WebSocket Server running on port 3000")
// );

const PORT = process.env.port || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
