const axios = require("axios");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "tmp/" }); // 一時ファイルの保存先
const OpenAI = require("openai");
const OPENAI_API_KEY = process.env.OPENAI_SECRET_KEY;
const openai = new OpenAI({
  organization: "org-8Q88nrRaQZ4lC18QcPXGNYSJ",
  apiKey: OPENAI_API_KEY,
});

exports.handleAssistantApi = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("req.file.filename", req.file.filename);
  try {
    // OpenAIにファイルをアップロード
    const response = await openai.files.create({
      file: fs.createReadStream(req.file.path),
      purpose: "assistants",
    });
    // 一時ファイルの削除
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
    res.json({
      message: "File uploaded successfully.",
      response: response,
    });
  } catch (error) {
    console.error("Error uploading file to OpenAI:", error);
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
    res.status(500).send("Error uploading file.");
  }
};

exports.createAssistantApi = async (req, res) => {
  console.log(1);
  console.log(req.body);
  console.log(2);
  const myAssistant = await openai.beta.assistants.create(req.body);
  console.log(myAssistant);
  res.json({ myAssistant });
};

exports.getAssistants = async (req, res) => {
  const { assistant_id } = req.body;
  const myAssistant = await openai.beta.assistants.retrieve(assistant_id);
  console.log(myAssistant);
  res.json({ myAssistant });
};

exports.getAssistantFiles = async (req, res) => {
  const { assistant_id } = req.body;
  const assistantFiles = await openai.beta.assistants.files.list(assistant_id);
  console.log(assistantFiles);
  res.json({ assistantFiles });
};

exports.createThread = async (req, res) => {
  const emptyThread = await openai.beta.threads.create();
  console.log(emptyThread);
  res.json({ emptyThread });
};

exports.createThreadAndRun = async (req, res) => {
  const { assistant_id, messages } = req.body;
  const run = await openai.beta.threads.createAndRun({
    assistant_id,
    thread: {
      messages,
    },
  });
  console.log(run);
  res.json({ run });
};

exports.createMessage = async (req, res) => {
  console.log("req.body", req.body);
  const { thread_id, message } = req.body;
  const threadMessages = await openai.beta.threads.messages.create(thread_id, {
    ...message,
  });
  console.log(threadMessages);
  res.json({ threadMessages });
};

exports.runThread = async (req, res) => {
  const { thread_id, assistant_id } = req.body;
  const run = await openai.beta.threads.runs.create(thread_id, {
    assistant_id: assistant_id,
  });
  console.log(run);
  res.json({ run });
};

exports.getMessages = async (req, res) => {
  const { thread_id } = req.body;
  const threadMessages = await openai.beta.threads.messages.list(thread_id);
  console.log(threadMessages.data);
  res.json({ threadMessagesData: threadMessages.data });
};

exports.getRuns = async (req, res) => {
  const { thread_id } = req.body;
  const runs = await openai.beta.threads.runs.list(thread_id);
  console.log(runs);
  res.json({ runs });
};

exports.getRunStatus = async (req, res) => {
  const { thread_id, run_id } = req.body;
  const run = await openai.beta.threads.runs.retrieve(thread_id, run_id);
  res.json({ run });
};

exports.modifyAssistant = async (req, res) => {
  const { assistant_id, modifyContent } = req.body;
  console.log("assistant_id", assistant_id);
  console.log("modifyContent", modifyContent);
  const myUpdatedAssistant = await openai.beta.assistants.update(assistant_id, {
    ...modifyContent,
  });
  console.log(myUpdatedAssistant);
  res.json({ myUpdatedAssistant });
};

exports.createAsisstantFile = async (req, res) => {
  const { assistant_id, file_id } = req.body;
  const myAssistantFile = await openai.beta.assistants.files.create(
    assistant_id,
    {
      file_id: file_id,
    }
  );
  console.log(myAssistantFile);
  res.json({ myAssistantFile });
};

exports.deleteAssistantFile = async (req, res) => {
  const { assistant_id, file_id } = req.body;
  const deletedAssistantFile = await openai.beta.assistants.files.del(
    assistant_id,
    file_id
  );
  console.log(deletedAssistantFile);
  res.json({ deletedAssistantFile });
};

exports.deleteFile = async (req, res) => {
  const { file_id } = req.body;
  const file = await openai.files.del(file_id);
  console.log(file);
  res.json({ file });
};

exports.deleteAssistant = async (req, res) => {
  const { assistant_id } = req.body;
  const response = await openai.beta.assistants.del(assistant_id);
  console.log(response);
  res.json({ response });
};

exports.deleteAssistantAndAssistantFiles = async (req, res) => {
  try {
    const { assistant_id } = req.body;
    const myAssistant = await openai.beta.assistants.retrieve(assistant_id);
    const { file_ids } = myAssistant;
    const deleteFilesPromises = file_ids.map((file_id) =>
      openai.files.del(file_id)
    );
    const deleteAssistantPromise = openai.beta.assistants.del(assistant_id);
    await Promise.all([...deleteFilesPromises, deleteAssistantPromise]);
    res.json({ response: "delete assistant and files -> success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ response: "error", message: error.message });
  }
};

exports.getAllAssistants = async (req, res) => {
  const myAssistants = await openai.beta.assistants.list({
    order: "desc",
  });
  console.log(myAssistants.data);
  res.json({ myAssistantsData: myAssistants.data });
};

exports.getAssistantFiles = async (req, res) => {
  const { assistant_id } = req.body;
  const assistantFiles = await openai.beta.assistants.files.list(assistant_id);
  console.log(assistantFiles);
  res.json({ assistantFiles });
};

exports.getFileInfo = async (req, res) => {
  const { file_id } = req.body;
  const file = await openai.files.retrieve(file_id);
  console.log(file);
  res.json({ file });
};
