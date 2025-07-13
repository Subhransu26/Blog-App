const express = require("express");
const path = require("path");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");

const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const port = PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173", FRONTEND_URL],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Connect to DB and Cloudinary
dbConnect();
cloudinaryConfig();

// API routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);

// Serve frontend build files
app.use("/", express.static(path.join(__dirname, "../Frontend/dist")));


// Start server
app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
