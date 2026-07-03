const scheduledPostsQueue = require("./scheduled-posts.queue");

exports.schedulePostJobs = async (req, res) => {
  try {
    const result = await scheduledPostsQueue.schedulePostTargets({
      postId: req.params.postId,
    });

    res.json(result);
  } catch (error) {
    console.error("Failed to schedule post jobs:", error.message || error);
    res.status(500).json({ error: error.message || "Failed to schedule post jobs" });
  }
};

exports.cancelPostJobs = async (req, res) => {
  try {
    const result = await scheduledPostsQueue.cancelPostTargets({
      postId: req.params.postId,
    });

    res.json(result);
  } catch (error) {
    console.error("Failed to cancel post jobs:", error.message || error);
    res.status(500).json({ error: error.message || "Failed to cancel post jobs" });
  }
};
