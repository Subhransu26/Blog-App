const express = require("express");
const dbConnect = require("./config/dbConnect");
const { PORT } = require("./config/dotenv.config");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const cloudinaryConfig = require("./config/cloudinaryConfig");

const app = express();

app.use(express.json());

const port = PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use('/api/v1', userRoutes);
app.use('/api/v1', blogRoutes);

app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
  dbConnect();
  cloudinaryConfig();
});
