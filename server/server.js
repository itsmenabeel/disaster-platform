const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ✅ FIXED CORS (NO BUGS, NO SLASH ISSUES) */
app.use(
  cors({
    origin: "http://localhost:5173", // 🔥 hardcoded → safest for now
    credentials: true,
  }),
);

/* ✅ EXTRA SAFETY (handles preflight requests) */
app.options("*", cors());

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const path = require("path");
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sos/:sosId/messages", require("./routes/messageRoutes"));
app.use("/api/sos", require("./routes/sosRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/camps", require("./routes/campRoutes"));
app.use("/api/distribution", require("./routes/distributionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Health check
app.get("/", (req, res) =>
  res.json({ message: "Disaster Platform API running" }),
);

/* Global error handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
