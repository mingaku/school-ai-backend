const axios = require("axios");
const { VertexAI } = require("@google-cloud/vertexai");

/**
 * TODO(developer): Update these variables before running the sample.
 */
const PROJECT_ID = "chatgpt-teacher";
const LOCATION = "us-central1";
// const MODEL = "gemini-1.5-flash-001";
// const MODEL = "gemini-1.5-pro-002";

exports.handleVertexAIGemini = async (req, res) => {
  const { model, max_tokens, messages, anthropic_version, temperature } =
    req.body;
  const updatedMessages = messages.map((item) => ({
    role: item.role === "system" ? "user" : item.role,
    parts: [
      {
        text: item.content,
      },
    ],
  }));
  const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
  const generativeModel = vertexAI.getGenerativeModel({ model });

  const request = {
    contents: updatedMessages,
    tools: [{ googleSearchRetrieval: {} }],
  };

  try {
    const result = await generativeModel.generateContentStream(request);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    for await (const item of result.stream) {
      res.write(`data:${JSON.stringify(item)}`);
    }
    res.write(`data:${JSON.stringify({ done: true })}`);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating content" });
  }
};
