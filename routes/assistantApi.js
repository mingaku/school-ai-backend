const express = require("express");
const router = express.Router();
const assistantApiController = require("../controllers/assistantApiController");
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
  "/upload_file_to_openai",
  upload.single("file"),
  assistantApiController.handleAssistantApi
);
router.post(
  "/open_ai_create_assistant_api",
  assistantApiController.createAssistantApi
);
router.post("/open_ai_get_assistant_api", assistantApiController.getAssistants);
router.post(
  "/open_ai_get_assistant_files",
  assistantApiController.getAssistantFiles
);
router.post("/open_ai_create_thread", assistantApiController.createThread);
router.post("/open_ai_create_message", assistantApiController.createMessage);
router.post("/open_ai_run_thread", assistantApiController.runThread);
router.post(
  "/open_ai_create_thread_and_run",
  assistantApiController.createThreadAndRun
);
router.post("/open_ai_get_messages", assistantApiController.getMessages);
router.post("/open_ai_get_runs", assistantApiController.getRuns);
router.post("/open_ai_get_run_status", assistantApiController.getRunStatus);
router.post("/modify_assistant", assistantApiController.modifyAssistant);
router.post(
  "/create_asisstant_file",
  assistantApiController.createAsisstantFile
);
router.post(
  "/delete_assistant_file",
  assistantApiController.deleteAssistantFile
);
router.post("/delete_file", assistantApiController.deleteFile);
router.post("/delete_assistant", assistantApiController.deleteAssistant);
router.post(
  "/delete_assistant_and_assistant_files",
  assistantApiController.deleteAssistantAndAssistantFiles
);
router.post("/get_all_assistants", assistantApiController.getAllAssistants);
router.post("/get_assistant_files", assistantApiController.getAssistantFiles);
router.post("/get_file_info", assistantApiController.getFileInfo);

module.exports = router;
