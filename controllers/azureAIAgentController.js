const { AIProjectsClient } = require("@azure/ai-projects");
const { ClientSecretCredential } = require("@azure/identity");

const tenantId = process.env.AZURE_TENANT_ID; // GCPのCloud Runの環境変数からAzureの認証情報を取得。ローカルで動かす場合は、CPのCloud Runの環境変数を使用する
const clientId = process.env.AZURE_CLIENT_ID; // GCPのCloud Runの環境変数からAzureの認証情報を取得。ローカルで動かす場合は、CPのCloud Runの環境変数を使用する
const clientSecret = process.env.AZURE_CLIENT_SECRET; // GCPのCloud Runの環境変数からAzureの認証情報を取得。ローカルで動かす場合は、CPのCloud Runの環境変数を使用する
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const connectionString =
  "westus.api.azureml.ms;6c017415-cf3a-41f1-b9db-a156e9ac0180;AI;ai-basic-project-lgkh";
const client = AIProjectsClient.fromConnectionString(
  connectionString,
  credential
);

exports.createThreadAndRun = async (req, res) => {
  const { role, content } = req.body;
  const agentId = "asst_BeXUpEXKr8B2hPNCbzYHZrX1"; // https://ai.azure.com/playground/agentsList?wsid=/subscriptions/6c017415-cf3a-41f1-b9db-a156e9ac0180/resourcegroups/AI/providers/Microsoft.MachineLearningServices/workspaces/ai-basic-project-lgkh&tid=44f35f84-9ed6-4a57-93ab-a29896a9fd39
  try {
    const thread = await client.agents.createThread();
    await client.agents.createMessage(thread.id, {
      role,
      content,
    });
    const streamEventMessages = await client.agents
      .createRun(thread.id, agentId)
      .stream();
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    headersSent = true; // ヘッダーが送信されたことを記録
    for await (const eventMessage of streamEventMessages) {
      res.write(`${JSON.stringify(eventMessage)}`);
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
