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
<<<<<<< HEAD
const userRoutes = require("./routes/userRoutes");
const petshopRoutes = require("./routes/petshopRoutes");

=======
const vaccinationCampaignRoutes = require("./routes/vaccinationCampaignRoutes");
>>>>>>> 2f29e3fc152878b47b5a9261b3e45e6126a6fcfd
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));

app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/", (req, res) => {
  res.send("✅ Pet Platform API is running");
});

app.use("/api/pets", petRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
<<<<<<< HEAD
app.use("/api/users", userRoutes);
app.use("/api/petshops", petshopRoutes);
=======
app.use("/api/vaccination-campaigns", vaccinationCampaignRoutes);

>>>>>>> 2f29e3fc152878b47b5a9261b3e45e6126a6fcfd

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN }
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