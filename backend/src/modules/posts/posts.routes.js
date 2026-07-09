const express = require("express");

const postsController = require("./posts.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const { authenticate } = require("../../shared/middleware/auth.middleware");
const {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  listPostsQuerySchema,
} = require("./posts.schema");

const router = express.Router();

// All posts routes require authentication
router.use(authenticate);

router.get("/", validate(listPostsQuerySchema), postsController.listPosts);
router.get("/:id", validate(postIdParamSchema), postsController.getPost);
router.post("/", validate(createPostSchema), postsController.createPost);
router.put("/:id", validate(updatePostSchema), postsController.updatePost);
router.delete("/:id", validate(postIdParamSchema), postsController.deletePost);

module.exports = router;
