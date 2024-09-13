const express = require("express");
const router = express.Router();
const streamingResponseAzureController = require("../controllers/streamingResponseAzureController");

router.post(
  "/streaming-response-azure",
  streamingResponseAzureController.handleStreamingResponseAzure
);

module.exports = router;
