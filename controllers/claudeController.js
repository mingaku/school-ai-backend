const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

const ANTHROPIC_SECRET_KEY = process.env.ANTHROPIC_SECRET_KEY;
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_SECRET_KEY,
});

exports.handleClaude = async (req, res) => {
  // console.log("req.body", {
  //   ...req.body,
  // });
  const { model, max_tokens, messages, temperature } = req.body;
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
  const stream = anthropic.messages
    .stream({
      model: model,
      max_tokens: max_tokens,
      messages: updatedMessages2,
    })
    .on("streamEvent", (event, snapshot) => {
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
    });
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
