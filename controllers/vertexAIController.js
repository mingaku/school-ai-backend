const axios = require("axios");
const { VertexAI } = require("@google-cloud/vertexai");
// Node.js環境ではBufferがグローバルに利用可能です。
// const { Buffer } = require('buffer');

const PROJECT_ID = "chatgpt-teacher";
const LOCATION = "us-central1";

/**
 * 画像URLから画像データを取得し、base64にエンコードしてGenerative Partオブジェクトを返します。
 * @param {string} url - Firebase Storageなどの公開画像URL
 * @returns {Promise<object | null>} Gemini APIのPartオブジェクト、またはエラーの場合はnull
 */
async function urlToGenerativePart(url) {
  try {
    // 画像データをバイナリバッファとして取得
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Content-TypeヘッダーからMIMEタイプを取得（デフォルトはimage/jpeg）
    const mimeType = response.headers["content-type"] || "image/jpeg";

    // バイナリデータをbase64文字列に変換
    const base64Data = Buffer.from(response.data, "binary").toString("base64");

    // Gemini APIが期待するinlineData形式で返却
    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  } catch (error) {
    // 画像の取得または処理に失敗した場合はログを出力し、nullを返して続行
    console.error(
      `Error fetching and processing image from URL: ${url}`,
      error.message
    );
    return null;
  }
}

exports.handleVertexAIGemini = async (req, res) => {
  const { model, messages } = req.body;

  console.log("req.body", req.body);

  // ----------------------------------------------------------------------
  // 1. メッセージを非同期で処理し、画像データを組み込む
  // ----------------------------------------------------------------------

  const updatedMessagesPromises = messages.map(async (item) => {
    const parts = [];
    // 元のロジックに従い、"system"ロールを"user"ロールにマップ（Vertex AIのチャット履歴構造に合わせるため）
    const role = item.role === "system" ? "user" : item.role;

    // item.content が配列の場合 (マルチモーダル形式)
    if (Array.isArray(item.content)) {
      for (const contentPart of item.content) {
        if (contentPart.type === "text" && contentPart.text) {
          // テキストパートの追加
          parts.push({
            text: contentPart.text,
          });
        } else if (
          contentPart.type === "image_url" &&
          contentPart.image_url &&
          contentPart.image_url.url
        ) {
          const imageUrl = contentPart.image_url.url;
          // URLの妥当性をチェックし、画像をフェッチ
          if (imageUrl.startsWith("http")) {
            const imagePart = await urlToGenerativePart(imageUrl);
            if (imagePart) {
              parts.push(imagePart);
            }
          }
        }
      }
    }
    // item.content が文字列の場合 (従来のテキストのみの形式)
    else if (typeof item.content === "string" && item.content) {
      parts.push({
        text: item.content,
      });
    }

    // partsが空になるのを防ぐため、空でないことを確認。
    // Vertex AIはpartsが空のメッセージを嫌う可能性があるため、空のテキストパートを入れます。
    if (parts.length === 0) {
      parts.push({ text: "" });
    }

    return {
      role: role,
      parts: parts,
    };
  });

  // すべての画像フェッチとメッセージ変換が完了するのを待つ
  const updatedMessages = await Promise.all(updatedMessagesPromises);

  console.log("updatedMessages", updatedMessages);

  // ----------------------------------------------------------------------
  // 2. Vertex AI APIを呼び出す
  // ----------------------------------------------------------------------

  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  const generativeModel = vertexAI.getGenerativeModel({ model });

  const request = {
    contents: updatedMessages,
    // Google Search grounding toolはそのまま残します
    tools: [{ googleSearch: {} }],
  };

  console.log("request", request);

  try {
    const result = await generativeModel.generateContentStream(request);

    // Server-Sent Events (SSE)のヘッダーを設定
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 結果をクライアントにストリーム配信
    for await (const item of result.stream) {
      console.log("item", item);
      // SSEフォーマット (data:<JSON>\n\n) で書き込む
      res.write(`data:${JSON.stringify(item)}\n\n`);
    }

    // 完了信号を送信
    res.write(`data:${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    // エラーレスポンスを返す
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
};
