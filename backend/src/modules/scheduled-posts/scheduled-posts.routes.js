const express = require("express");

const scheduledPostsController = require("./scheduled-posts.controller");

const router = express.Router();

router.post("/:postId/jobs", scheduledPostsController.schedulePostJobs);
router.delete("/:postId/jobs", scheduledPostsController.cancelPostJobs);

module.exports = router;
