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

app.set("trust proxy", 1);

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

// Routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);

// Serve frontend
app.use("/", express.static(path.join(__dirname, "../Frontend/dist")));

app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
  console.log(`✅ Allowed Origin: ${FRONTEND_URL}`);
});
