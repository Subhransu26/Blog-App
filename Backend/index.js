const express = require("express");
const path = require("path");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
const dotenv = require("dotenv");
const fs = require("fs");


dotenv.config();


// API routes
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();
const port = PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", FRONTEND_URL],
    credentials: true,
  })
);

app.use(express.json());

// Connect DB & Cloudinary
dbConnect();
cloudinaryConfig();

// API routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", blogRoutes);

// Serve static files
const frontendPath = path.resolve(__dirname, "../Frontend/dist");
app.use(express.static(frontendPath));

// // ✅ Correct fallback route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(frontendPath, "index.html"));
// });


app.listen(port, () => {
  console.log(`✅ Server started at http://localhost:${port}`);
});
