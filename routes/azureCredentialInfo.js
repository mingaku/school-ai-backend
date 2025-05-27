const express = require("express");
const router = express.Router();
const azureCredentialInfoController = require("../controllers/azureCredentialInfoController");

router.get(
  "/speech-token",
  azureCredentialInfoController.handleAzureCredentialInfo
);

module.exports = router;
