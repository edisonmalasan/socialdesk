const express = require("express");
const facebookRoutes = require("./routes/facebook.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("TEST!")
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/auth/facebook", facebookRoutes);

module.exports = app;