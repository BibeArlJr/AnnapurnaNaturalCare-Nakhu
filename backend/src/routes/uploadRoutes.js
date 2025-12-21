const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const { uploadSingle } = require("../controllers/uploadController");

router.post("/", upload.single("image"), uploadSingle);

module.exports = router;
