const express = require("express");
const router = express.Router();
const claudeController = require("../controllers/claudeController");

router.post("/claude", claudeController.handleClaude);

module.exports = router;
