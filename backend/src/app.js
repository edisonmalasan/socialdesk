const express = require("express");
const facebookRoutes = require("./modules/meta/meta.routes");
const pinterestRoutes = require("./modules/pinterest/pinterest.routes");
const youtubeRoutes = require("./modules/youtube/youtube.routes");
const authRoutes = require("./modules/auth/auth.routes");
const scheduledPostsRoutes = require("./modules/scheduled-posts/scheduled-posts.routes");
<<<<<<< Updated upstream
const usersRoutes = require("./modules/users/users.routes");
const platformHealthRoutes = require("./modules/platform-health/platform-health.routes");
const accountAdminRoutes = require("./modules/account-admin/account-admin.routes");
const saasAnalyticsRoutes = require("./modules/saas-analytics/saas-analytics.routes");
=======
const settingsRoutes = require("./modules/settings/settings.routes");
>>>>>>> Stashed changes
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
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
<<<<<<< Updated upstream
app.use("/api/users", usersRoutes);
app.use("/api/platform-health", platformHealthRoutes);
app.use("/api/account-admin", accountAdminRoutes);
app.use("/api/saas-analytics", saasAnalyticsRoutes);
=======
app.use("/api/settings", settingsRoutes);
>>>>>>> Stashed changes

module.exports = app;
