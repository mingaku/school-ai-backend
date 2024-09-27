const express = require("express");
const router = express.Router();
const amazonBedrockClaude2Controller = require("../controllers/amazonBedrockClaudeController");

router.post(
  "/amazon-bedrock-claude",
  amazonBedrockClaude2Controller.handleAmazonBedrockClaude
);

module.exports = router;
