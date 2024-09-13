const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const multer = require("multer");
const upload = multer({ dest: "tmp/" }); // 一時ファイルの保存先
const { AzureOpenAI } = require("openai");

const AZURE_API_KEY = process.env.AZURE_API_KEY; // 環境変数からAPIキーを読み込み
const azureOpenAIEndpoint = "https://gpt-westus-mingaku.openai.azure.com";
const azureOpenAIVersion = "2024-05-01-preview";
const assistantsClient = new AzureOpenAI({
  endpoint: azureOpenAIEndpoint,
  apiVersion: azureOpenAIVersion,
  apiKey: AZURE_API_KEY,
});

exports.createAssistant = async (req, res) => {
  console.log("req.body", req.body);
  try {
    const myAssistant = await assistantsClient.beta.assistants.create({
      ...req.body,
    });
    console.log(myAssistant);
    res.json({ myAssistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    res.status(500).json(error);
  }
};

exports.modifyAssistant = async (req, res) => {
  try {
    const { assistant_id, modifyContent } = req.body;
    console.log("assistant_id", assistant_id);
    console.log("modifyContent", modifyContent);
    const myUpdatedAssistant = await assistantsClient.beta.assistants.update(
      assistant_id,
      {
        ...modifyContent,
      }
    );
    console.log(myUpdatedAssistant);
    res.json({ myUpdatedAssistant });
  } catch (error) {
    console.error("Error updateing assistant:", error);
    res.status(500).json(error);
  }
};

exports.retrieveAssistant = async (req, res) => {
  try {
    const { assistant_id } = req.body;
    const myAssistant = await assistantsClient.beta.assistants.retrieve(
      assistant_id
    );
    console.log(myAssistant);
    res.json({ myAssistant });
  } catch (error) {
    console.error("Error retrieving assistant:", error);
    res.status(500).json(error);
  }
};

exports.deleteAssistant = async (req, res) => {
  try {
    const { assistant_id } = req.body;
    const response = await assistantsClient.beta.assistants.del(assistant_id);
    console.log(response);
    res.json({ response });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    res.status(500).json(error);
  }
};

exports.createVectorStore = async (req, res) => {
  try {
    const { mode_name } = req.body;
    const vectorStore = await assistantsClient.beta.vectorStores.create({
      name: mode_name,
    });
    console.log(vectorStore);
    res.json({ vectorStore });
  } catch (error) {
    console.error("Error creating vector store:", error);
    res.status(500).json(error);
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  try {
    const filePath = req.file.path;
    const file = await assistantsClient.files.create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    });
    console.log(file);
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
    res.json({
      message: "File uploaded successfully.",
      response: file,
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
    res.status(500).json(error);
  }
};

exports.createVectorStoreFileBatch = async (req, res) => {
  try {
    const { vector_store_id, file_ids } = req.body;
    const myVectorStoreFileBatch =
      await assistantsClient.beta.vectorStores.fileBatches.create(
        vector_store_id,
        {
          file_ids,
        }
      );
    console.log(myVectorStoreFileBatch);
    res.json({ myVectorStoreFileBatch });
  } catch (error) {
    console.error("Error creating vector store file batch:", error);
    res.status(500).json(error);
  }
};

exports.uploadFileForAssistantApi = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("req.file.filename", req.file.filename);
  const filePath = req.file.path; // req.file.pathが与えられたパス
  const fileName = path.basename(filePath);
  try {
    let vectorStore = await assistantsClient.beta.vectorStores.create({
      name: "testVectorStore",
    });
    console.log("vectorStore", vectorStore);
    const response =
      await assistantsClient.beta.vectorStores.fileBatches.uploadAndPoll(
        vectorStore.id,
        { files: [fs.createReadStream(filePath)] }
      );
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
    res.status(500).json(error);
  }
};

exports.getVectorStoreFiles = async (req, res) => {
  try {
    const { vector_store_id } = req.body;
    const vectorStoreFiles =
      await assistantsClient.beta.vectorStores.files.list(vector_store_id);
    const fileIds = vectorStoreFiles.data.map((file) => file.id);
    const filesPromise = fileIds.map((fileId) =>
      assistantsClient.files.retrieve(fileId)
    );
    const files = await Promise.all(filesPromise);
    res.json({ files });
  } catch (error) {
    console.error("Error retrieving vector store files:", error);
    res.status(500).json(error);
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { file_id } = req.body;
    const file = await assistantsClient.files.del(file_id);
    res.json({ file });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json(error);
  }
};

exports.deleteVectorStore = async (req, res) => {
  try {
    const { vector_store_id } = req.body;
    const deletedVectorStore = await assistantsClient.beta.vectorStores.del(
      vector_store_id
    );
    console.log(deletedVectorStore);
    res.json({ deletedVectorStore });
  } catch (error) {
    console.error("Error deleting vector store:", error);
    res.status(500).json(error);
  }
};

exports.createThreadAndRun = async (req, res) => {
  const { assistant_id, messages } = req.body;
  console.log({ assistant_id, messages });
  let headersSent = false; // ヘッダーが送信されたかどうかを追跡

  try {
    const stream = await assistantsClient.beta.threads.createAndRun({
      assistant_id,
      thread: {
        messages,
      },
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    headersSent = true; // ヘッダーが送信されたことを記録

    for await (const chunk of stream.iterator()) {
      res.write(`${JSON.stringify(chunk)}`);
    }
    res.end(); // ストリームの終わりをフロントエンドに通知
  } catch (error) {
    console.error("Error streaming data:", error);
    if (!headersSent) {
      // ヘッダーがまだ送信されていない場合のみエラーレスポンスを送信
      res.status(500).json(error);
    }
  }
};

exports.createMessage = async (req, res) => {
  console.log("req.body", req.body);
  let { thread_id, message } = req.body;
  console.log("message", message);
  try {
    const threadMessages = await assistantsClient.beta.threads.messages.create(
      thread_id,
      message
    );
    console.log(threadMessages);
    res.json({ threadMessages });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json(error);
  }
};

exports.createRun = async (req, res) => {
  const { assistant_id, thread_id } = req.body;
  console.log({ assistant_id, thread_id });
  let headersSent = false; // ヘッダーが送信されたかどうかを追跡

  try {
    const stream = await assistantsClient.beta.threads.runs.create(thread_id, {
      assistant_id,
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    headersSent = true; // ヘッダーが送信されたことを記録

    for await (const chunk of stream.iterator()) {
      res.write(`${JSON.stringify(chunk)}`);
    }
    res.end(); // ストリームの終わりをフロントエンドに通知
  } catch (error) {
    console.error("Error streaming data:", error);
    if (!headersSent) {
      // ヘッダーがまだ送信されていない場合のみエラーレスポンスを送信
      res.status(500).json(error);
    }
  }
};
