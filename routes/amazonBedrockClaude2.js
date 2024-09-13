const express = require("express");
const router = express.Router();
const amazonBedrockClaude2Controller = require("../controllers/amazonBedrockClaude2Controller");

router.post(
  "/amazon-bedrock-claude2",
  amazonBedrockClaude2Controller.handleAmazonBedrockClaude2
);

module.exports = router;
