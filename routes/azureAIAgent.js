const express = require("express");
const router = express.Router();
const azureAIAgentController = require("../controllers/azureAIAgentController");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    cb(null, decodeURIComponent(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post(
  "/agent_create_thread_and_run",
  azureAIAgentController.createThreadAndRun
);

module.exports = router;
