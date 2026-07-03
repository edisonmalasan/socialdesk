const express = require("express");
const facebookRoutes = require("./modules/meta/meta.routes");
const pinterestRoutes = require("./modules/pinterest/pinterest.routes");
const youtubeRoutes = require("./modules/youtube/youtube.routes");
const authRoutes = require("./modules/auth/auth.routes");
const scheduledPostsRoutes = require("./modules/scheduled-posts/scheduled-posts.routes");
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
app.use("/api/auth/youtube", youtubeRoutes);
app.use("/api/scheduled-posts", scheduledPostsRoutes);

module.exports = app;
