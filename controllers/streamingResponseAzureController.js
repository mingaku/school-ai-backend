const axios = require("axios");

exports.handleStreamingResponseAzure = async (req, res) => {
  console.log(
    JSON.stringify({
      severity: "INFO",
      ...req.body,
    })
  );
  const { model } = req.body;
  const resourceName = "gpt-westus-mingaku";
  const AZURE_API_KEY = process.env.AZURE_API_KEY;
  let apiVersion = "2023-05-15";
  if (model === "gpt4v") {
    apiVersion = "2023-12-01-preview";
  }
  const AZURE_API_ENDPOINT = `https://${resourceName}.openai.azure.com/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;
  try {
    const response = await axios.post(
      AZURE_API_ENDPOINT,
      {
        ...req.body,
        stream: true,
      },
      {
        headers: {
          "api-key": AZURE_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    // ストリーミングレスポンスをクライアントにパイプする
    response.data.pipe(res);
  } catch (error) {
    const stream = error.response.data;
    let body = "";
    stream.on("data", (chunk) => {
      body += chunk.toString();
    });
    stream.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        console.log("エラーレスポンス（パース済み）:", JSON.stringify(parsed));

        const { message, innererror } = parsed.error || {};
        console.log("エラーメッセージ:", message);
        console.log("内部エラー詳細:", JSON.stringify(innererror, null, 2));
      } catch (err) {
        console.error("JSONパースエラー:", err.message);
      }
    });

    res.status(500).send({ error: error.message });
  }
};
