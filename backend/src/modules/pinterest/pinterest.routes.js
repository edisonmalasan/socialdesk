const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const pinterestController = require("./pinterest.controller");
const cloudinaryupload = require("../media/upload.middleware");

const { validate } = require("../../shared/middleware/validate.middleware");
const { createPinSchema } = require("./pinterest.schema");

router.get("/oauth", pinterestController.redirectToPinterest);
router.get("/callback", pinterestController.handlePinterestCallback);
router.post("/board", pinterestController.createPinterestBoard);
router.post("/pins" , upload.single("file"), validate(createPinSchema), pinterestController.createPin);

module.exports = router;
