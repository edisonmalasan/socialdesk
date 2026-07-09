const postsService = require("./posts.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.listPosts = async (req, res) => {
  try {
    const { status, platform } = req.query;
    const posts = await postsService.listPosts(req.user.id, { status, platform });
    return successResponse(res, posts);
  } catch (error) {
    console.error("listPosts error:", error);
    return errorResponse(res, error.message || "Failed to fetch posts", 500);
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await postsService.getPost(req.params.id, req.user.id);
    
    if (!post) {
      return errorResponse(res, "Post not found", 404);
    }
    
    return successResponse(res, post);
  } catch (error) {
    console.error("getPost error:", error);
    return errorResponse(res, error.message || "Failed to fetch post", 500);
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = await postsService.createPost(req.user.id, req.body);
    return successResponse(res, post, 201);
  } catch (error) {
    console.error("createPost error:", error);
    return errorResponse(res, error.message || "Failed to create post", 500);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await postsService.updatePost(req.params.id, req.user.id, req.body);
    
    if (!post) {
      return errorResponse(res, "Post not found", 404);
    }
    
    return successResponse(res, post);
  } catch (error) {
    console.error("updatePost error:", error);
    return errorResponse(res, error.message || "Failed to update post", 500);
  }
};

exports.deletePost = async (req, res) => {
  try {
    await postsService.deletePost(req.params.id, req.user.id);
    // Explicitly return a success flag so it matches { success: true }
    return successResponse(res, { success: true });
  } catch (error) {
    console.error("deletePost error:", error);
    return errorResponse(res, error.message || "Failed to delete post", 500);
  }
};
