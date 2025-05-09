const {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const axios = require("axios");

const accessKeyId = process.env.AMAZON_ACCESS_KEY_ID;
const secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY;

const credentials = {
  accessKeyId,
  secretAccessKey,
};

exports.handleAmazonBedrockClaude = async (req, res) => {
  const { model, max_tokens, messages, anthropic_version, temperature } =
    req.body;

  // us-east-2を使うユースケースを想定していなかったため、フロントからregionを送信する仕組みを作成していないので、一旦バックエンドでmodelに応じてregionを切り替える
  const region =
    model === "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
      ? "us-east-2"
      : "ap-northeast-1";
  const bedrock = new BedrockRuntimeClient({
    credentials,
    region,
  });

  const updatedMessages = messages.map((item) => ({
    ...item,
    role: item.role === "system" ? "user" : item.role,
  }));
  const updatedMessages2 = await Promise.all(
    updatedMessages.map(async (message) => {
      if (Array.isArray(message.content)) {
        const updatedContent = await Promise.all(
          message.content.map(async (content) => {
            if (content.type === "image_url") {
              const aaa = await fetchImageAndConvertToBase64(
                content.image_url.url
              );
              return aaa;
            } else {
              return content;
            }
          })
        );
        return {
          ...message,
          content: updatedContent,
        };
      } else {
        return message;
      }
    })
  );
  const testMessages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "50文字の文章を作成してください.終わったら2つの改行を開けて「完」と書いてください",
        },
      ],
    },
  ];
  const body = {
    anthropic_version: anthropic_version,
    max_tokens: max_tokens,
    messages: updatedMessages2,
  };
  const input = {
    modelId: model,
    accept: "application/json",
    contentType: "application/json",
    body: JSON.stringify(body),
  };
  console.log("input", input);
  try {
    const command = new InvokeModelWithResponseStreamCommand(input);
    const bedrockResponse = await bedrock.send(command);
    for await (const item of bedrockResponse.body) {
      const event = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
      if (event.type === "message_start") {
        res.writeHead(200, {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        });
      }
      if (event.type === "content_block_delta") {
        res.write(`data:${JSON.stringify(event.delta)}`); // Stream the message events as they arrive
      } else if (event.type === "content_block_stop") {
        res.end(); // Close the stream once all messages have been sent
      }
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

async function fetchImageAndConvertToBase64(imageUrl) {
  try {
    // 画像データをバイナリ形式で取得
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    // レスポンスヘッダーからメディアタイプを取得
    const mediaType = response.headers["content-type"];

    // バイナリデータをBase64文字列にエンコード
    const base64 = Buffer.from(response.data, "binary").toString("base64");

    return {
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: `${base64}`,
      },
    };
  } catch (error) {
    console.error("Error fetching or encoding image:", error);
    return null;
  }
}
