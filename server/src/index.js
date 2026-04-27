require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { connectDB } = require("./config/db");

const petRoutes = require("./routes/petRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const documentRoutes = require("./routes/documentRoutes");
const userRoutes = require("./routes/userRoutes");
const petshopRoutes = require("./routes/petshopRoutes");
const vaccinationCampaignRoutes = require("./routes/vaccinationCampaignRoutes");
const shopItemRoutes = require("./routes/shopItemRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const rescueRoutes = require("./routes/rescueRoutes");


const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const isExplicitAllowed = allowedOrigins.includes(origin);
    const isLocalhostDev =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isExplicitAllowed || isLocalhostDev) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("✅ Pet Platform API is running");
});

app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/petshops", petshopRoutes);
app.use("/api/vaccination-campaigns", vaccinationCampaignRoutes);
app.use("/api/shop-items", shopItemRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/rescue", rescueRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);
  socket.on("join", ({ userId }) => {
    if (userId) socket.join(`user:${userId}`);
  });
});

app.set("io", io);

(async () => {
  await connectDB(process.env.MONGO_URI);
  server.listen(process.env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
  });
})();