const express = require("express");

const scheduledPostsController = require("./scheduled-posts.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const { schedulePostSchema, cancelScheduleSchema } = require("./scheduled-posts.schema");

const router = express.Router();

router.post("/:postId/jobs", validate(schedulePostSchema), scheduledPostsController.schedulePostJobs);
router.delete("/:postId/jobs", validate(cancelScheduleSchema), scheduledPostsController.cancelPostJobs);

module.exports = router;
