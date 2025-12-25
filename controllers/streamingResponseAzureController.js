const axios = require("axios");
const { handleAzureGpt5 } = require("./azureGpt5Handler");

exports.handleStreamingResponseAzure = async (req, res) => {
  console.log(
    JSON.stringify({
      severity: "INFO",
      ...req.body,
    })
  );

  // role が "loading" のメッセージをフィルタリング
  req.body.messages = req.body.messages.filter(
    (message) => message.role !== "loading"
  );

  const { model } = req.body;

  // azure-gpt-5は専用のハンドラーを使用
  if (
    [
      "azure-gpt-5",
      "azure-gpt-5-mini",
      "azure-gpt-5-nano",
      "azure-gpt-5-chat",
      "azure-gpt-5.2",
      "azure-gpt-5.2-chat",
    ].includes(model)
  ) {
    return handleAzureGpt5(req.body, res);
  }
  const resourceName = "gpt-westus-mingaku";
  let AZURE_API_KEY = process.env.AZURE_API_KEY;
  let apiVersion = "2023-05-15";
  let supportsStreamOptions = false; // stream_options requires API version >= 2024-08-01-preview

  let AZURE_API_ENDPOINT = "";
  if (model === "azure-o1") {
    //TODO: Eastでしかサポートされていないモデルが増えてくると、ちゃんとコードを整理した方が良い
    AZURE_API_ENDPOINT =
      "https://gpt-eastus2-mingaku.openai.azure.com/openai/deployments/azure-o1/chat/completions?api-version=2024-12-01-preview";
    AZURE_API_KEY = process.env.AZURE_SUB_API_KEY;
    supportsStreamOptions = true; // 2024-12-01-preview supports stream_options
  } else {
    if (model === "gpt4v") {
      apiVersion = "2023-12-01-preview";
      // supportsStreamOptions remains false
    } else if (model === "azure-o3-mini") {
      apiVersion = "2025-01-01-preview";
      supportsStreamOptions = true;
    }
    AZURE_API_ENDPOINT = `https://${resourceName}.openai.azure.com/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;
  }

  let reqBody = { ...req.body };
  if (
    ["azure-o1", "azure-o3-mini"].includes(model) &&
    "temperature" in reqBody
  ) {
    //TODO: o1はtemperatureをパラメータとして設定できないが、今後改善されるかもしれないので適宜temperatureが使えるか試した方が良い
    delete reqBody.temperature;
  }

  try {
    const requestBody = {
      ...reqBody,
      stream: true,
      ...(supportsStreamOptions ? { stream_options: { include_usage: true } } : {}),
    };

    const response = await axios.post(
      AZURE_API_ENDPOINT,
      requestBody,
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
    // error.responseがundefinedの場合のエラーハンドリング
    if (error.response && error.response.data) {
      const errorDetail = await getErrorDetail(error.response.data);
      res.status(500).send({ error: error.message, detail: errorDetail });
    } else {
      console.error("Azure API Error:", error.message);
      res.status(500).send({
        error: error.message,
        detail: { message: error.message, code: "network_error" }
      });
    }
  }
};

async function getErrorDetail(errorStream) {
  return new Promise((resolve, reject) => {
    let body = "";
    const detail = { message: "", innererror: null, code: "" };

    errorStream.on("data", (chunk) => {
      body += chunk.toString();
    });

    errorStream.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        console.log("エラーレスポンスBody:", JSON.stringify(parsed));
        const {
          message = "",
          innererror = null,
          code = "",
        } = parsed.error || {};
        detail.message = message;
        detail.innererror = innererror;
        detail.code = code;
        resolve(detail);
      } catch (e) {
        console.error("JSONパースエラー:", e.message);
        reject({ message: "", innererror: null });
      }
    });

    errorStream.on("error", (e) => {
      console.error("エラーストリーム処理エラー:", e.message);
      reject({ message: "", innererror: null });
    });
  });
}
