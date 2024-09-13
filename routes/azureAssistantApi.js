const express = require("express");
const router = express.Router();
const assistantApiController = require("../controllers/azureAssistantApiController");
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

router.post("/azure_create_assistant", assistantApiController.createAssistant);
router.post("/azure_delete_assistant", assistantApiController.deleteAssistant);
router.post(
  "/azure_upload_file",
  upload.single("file"),
  assistantApiController.uploadFile
);
router.post(
  "/azure_create_vector_store",
  assistantApiController.createVectorStore
);
router.post(
  "/azure_create_vector_store_file_batch",
  assistantApiController.createVectorStoreFileBatch
);
router.post(
  "/azure_upload_file_for_assistant_api",
  upload.single("file"),
  assistantApiController.uploadFileForAssistantApi
);
router.post(
  "/azure_get_vector_store_files",
  assistantApiController.getVectorStoreFiles
);
router.post("/azure_delete_file", assistantApiController.deleteFile);
router.post(
  "/azure_delete_vector_store",
  assistantApiController.deleteVectorStore
);
router.post(
  "/azure_create_thread_and_run",
  assistantApiController.createThreadAndRun
);
router.post("/azure_create_message", assistantApiController.createMessage);
router.post("/azure_create_run", assistantApiController.createRun);
router.post(
  "/azure_retrieve_assistant",
  assistantApiController.retrieveAssistant
);
router.post("/azure_modify_assistant", assistantApiController.modifyAssistant);

module.exports = router;
