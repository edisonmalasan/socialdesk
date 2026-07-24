const scheduledPostsQueue = require("./scheduled-posts.queue");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.schedulePostJobs = async (req, res) => {
  try {
    const result = await scheduledPostsQueue.schedulePostTargets({
      postId: req.params.postId,
    });

    return successResponse(res, result);
  } catch (error) {
    console.error("Failed to schedule post jobs:", error.message || error);
    return errorResponse(res, error.message || "Failed to schedule post jobs", 500);
  }
};

exports.cancelPostJobs = async (req, res) => {
  try {
    const result = await scheduledPostsQueue.cancelPostTargets({
      postId: req.params.postId,
    });

    return successResponse(res, result);
  } catch (error) {
    console.error("Failed to cancel post jobs:", error.message || error);
    return errorResponse(res, error.message || "Failed to cancel post jobs", 500);
  }
};
