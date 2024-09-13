const express = require("express");
const router = express.Router();
const streamingResponseController = require("../controllers/streamingResponseController");

router.post(
  "/streaming-response",
  streamingResponseController.handleStreamingResponse
);

module.exports = router;
