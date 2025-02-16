const express = require("express");
const router = express.Router();
const vertexAIController = require("../controllers/vertexAIController");

router.post("/vertex-ai-gemini", vertexAIController.handleVertexAIGemini);

module.exports = router;
