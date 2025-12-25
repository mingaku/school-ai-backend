const { AzureOpenAI } = require("openai");

async function handleAzureGpt5(reqBody, res) {
  const endpoint = "https://gpt-eastus2-mingaku.openai.azure.com/";
  const deployment = reqBody.model;
  const apiKey = process.env.AZURE_SUB_API_KEY;
  const apiVersion = "2025-04-01-preview";

  const options = {
    endpoint,
    apiKey,
    deployment,
    apiVersion,
  };

  const client = new AzureOpenAI(options);

  try {
    // ストリーミングレスポンスの設定
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // リクエストボディの準備
    const completionRequest = {
      messages: reqBody.messages,
      stream: true,
      stream_options: { include_usage: true },
    };

    // オプショナルパラメータの追加
    if (reqBody.max_completion_tokens) {
      completionRequest.max_completion_tokens = reqBody.max_completion_tokens;
    }
    // GPT-5はtemperatureパラメータをサポートしていないため除外
    // if (reqBody.temperature !== undefined) {
    //   completionRequest.temperature = reqBody.temperature;
    // }
    if (reqBody.top_p !== undefined) {
      completionRequest.top_p = reqBody.top_p;
    }
    if (reqBody.frequency_penalty !== undefined) {
      completionRequest.frequency_penalty = reqBody.frequency_penalty;
    }
    if (reqBody.presence_penalty !== undefined) {
      completionRequest.presence_penalty = reqBody.presence_penalty;
    }

    // ストリーミングレスポンスの処理
    const stream = await client.chat.completions.create(completionRequest);

    for await (const chunk of stream) {
      const chunkData = JSON.stringify(chunk);
      res.write(`data: ${chunkData}\n\n`);
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Azure GPT-5 Error:", error);

    // エラーレスポンスの処理
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message,
        detail: {
          message: error.message,
          code: error.code || "azure_gpt5_error",
        },
      });
    } else {
      // ストリーミング中にエラーが発生した場合
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

module.exports = { handleAzureGpt5 };
