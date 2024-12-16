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
    const errorDetail = await getErrorDetail(error.response.data);
    res.status(500).send({ error: error.message, detail: errorDetail });
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
