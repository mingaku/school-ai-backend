const express = require("express");
const router = express.Router();
const ttsController = require("../controllers/ttsController");

router.post("/openai_tts", ttsController.handleTts);

module.exports = router;
