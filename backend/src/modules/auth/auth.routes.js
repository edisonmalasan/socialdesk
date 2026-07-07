const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { validate } = require("../../shared/middleware/validate.middleware");
const { loginSchema } = require("./auth.schema");

router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);

module.exports = router;
