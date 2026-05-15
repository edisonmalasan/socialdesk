const express = require("express");
const facebookRoutes = require("./routes/meta.routes");
const pinterestRoutes = require("./routes/pinterest.routes");
const authRoutes = require("./routes/auth.routes")

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("TEST!")
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/auth", authRoutes);
app.use("/auth/facebook", facebookRoutes);
app.use("/auth/pinterest", pinterestRoutes);

module.exports = app;