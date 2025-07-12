const express = require("express");
const dbConnect = require("./config/dbConnect");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://blog-app-gw98.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());

const port = PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/v1", userRoutes);

app.use("/api/v1", blogRoutes);

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
  dbConnect();
  cloudinaryConfig();
});
