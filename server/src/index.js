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

const documentRoutes = require("./routes/documentroutes");

const app = express();



app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use("/api/admin", adminRoutes);

// ✅ Serve uploaded images from server/uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("✅ Pet Platform API is running");
});

app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/documents", documentRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN }
});

// for later notifications feature
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
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