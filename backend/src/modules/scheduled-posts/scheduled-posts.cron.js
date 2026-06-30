const cron = require("node-cron");
const scheduledPostsService = require("./scheduled-posts.service");

const DEFAULT_CRON_EXPRESSION = "* * * * *";

let task = null;
let isRunning = false;

const isEnabled = () => {
  return process.env.SCHEDULED_POSTS_CRON_ENABLED !== "false";
};

const getCronExpression = () => {
  return process.env.SCHEDULED_POSTS_CRON_EXPRESSION || DEFAULT_CRON_EXPRESSION;
};

const tick = async () => {
  if (isRunning) {
    console.log("Scheduled posts cron skipped because the previous tick is still running");
    return;
  }

  isRunning = true;
  console.log("Scheduled posts cron tick started");

  try {
    const result = await scheduledPostsService.executeDueScheduledPosts();
    console.log(`Scheduled posts cron tick finished. Processed ${result.processed} target(s).`);
  } catch (error) {
    console.error("Scheduled posts cron tick failed:", error.message || error);
  } finally {
    isRunning = false;
  }
};

exports.start = () => {
  if (!isEnabled()) {
    console.log("Scheduled posts cron is disabled");
    return null;
  }

  if (task) {
    return task;
  }

  task = cron.createTask(getCronExpression(), tick, {
    name: "scheduled-post-execution",
  });

  task.start();
  console.log(`Scheduled posts cron started with expression: ${getCronExpression()}`);
  return task;
};

exports.stop = () => {
  if (!task) {
    return;
  }

  task.stop();
  task = null;
  isRunning = false;
  console.log("Scheduled posts cron stopped");
};

exports._private = {
  getCronExpression,
  isEnabled,
  tick,
};
