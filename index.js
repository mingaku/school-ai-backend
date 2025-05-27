/*
デプロイ手順
参考記事：https://qiita.com/riku-shiru/items/d3f7dda5a5e87c4b26e9
gcloud builds submit --project chatgpt-teacher --tag gcr.io/chatgpt-teacher/gpt && gcloud beta run deploy school-ai --image gcr.io/chatgpt-teacher/gpt --platform managed
*/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const streamingResponseRouter = require("./routes/streamingResponse");
const streamingResponseAzureRouter = require("./routes/streamingResponseAzure");
const assistantApi = require("./routes/assistantApi");
const azureAssistantApi = require("./routes/azureAssistantApi");
const azureAIAgent = require("./routes/azureAIAgent");
const amazonBedrock = require("./routes/amazonBedrock");
const tts = require("./routes/tts");
const claude = require("./routes/claude");
const vertexAI = require("./routes/vertexAI");
const azureCredentialInfo = require("./routes/azureCredentialInfo");
const app = express();
const PORT = process.env.PORT || 8080; // Cloud Runで指定されたPORT環境変数を使用

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(streamingResponseRouter);
app.use(streamingResponseAzureRouter);
app.use(assistantApi);
app.use(azureAssistantApi);
app.use(azureAIAgent);
app.use(amazonBedrock);
app.use(tts);
app.use(claude);
app.use(vertexAI);
app.use("/", azureCredentialInfo);

const http = require("http");
const server = http.createServer(app); // ✅ http server を使う

// HTTPルートの動作確認用
app.get("/", (req, res) => {
  res.send("Hello from Cloud Run + WebSocket");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
