const { BedrockRuntime } = require("@aws-sdk/client-bedrock-runtime");

exports.handleAmazonBedrockClaude2 = async (req, res) => {
  console.log("req.body", req.body);
  const accessKeyId = process.env.AMAZON_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY;
  const credentials = {
    accessKeyId,
    secretAccessKey,
  };
  const bedrock = new BedrockRuntime({
    credentials,
    region: "us-east-1",
  });
  const params = {
    modelId: "anthropic.claude-v2:1",
    contentType: "application/json",
    accept: "*/*",
    body: JSON.stringify({
      prompt:
        "\n\nHuman: 50文字の文章を作成してください.終わったら2つの改行を開けて「完」と書いてください\n\nAssistant:",
      messages: [
        {
          role: "user",
          content: "あああ",
        },
      ],
      max_tokens_to_sample: 300,
      temperature: 0.5,
      top_k: 250,
      top_p: 1,
      stop_sequences: ["\n\nHuman:"],
      anthropic_version: "bedrock-2023-05-31",
    }),
  };
  try {
    const response = await bedrock.invokeModelWithResponseStream(params);
    console.log("response", response);
    console.log("response.body", response.body);
    for await (const event of response.body) {
      if (event.chunk) {
        const completion = JSON.parse(
          Buffer.from(event.chunk.bytes).toString("utf-8")
        ).completion;
        res.write(completion);
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
