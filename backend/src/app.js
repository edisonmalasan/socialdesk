const express = require("express");
const facebookRoutes = require("./modules/meta/meta.routes");
const pinterestRoutes = require("./modules/pinterest/pinterest.routes");
const authRoutes = require("./modules/auth/auth.routes");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/api/", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/facebook", facebookRoutes);
app.use("/api/auth/pinterest", pinterestRoutes);

module.exports = app;
