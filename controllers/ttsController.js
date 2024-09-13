const axios = require("axios");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
// const speechFile = path.resolve("./speech.mp3");
const OPENAI_API_KEY = process.env.OPENAI_SECRET_KEY;
const openai = new OpenAI({
  organization: "org-8Q88nrRaQZ4lC18QcPXGNYSJ",
  apiKey: OPENAI_API_KEY,
});

exports.handleTts = async (req, res) => {
  console.log("req.body", req.body);
  if (req.body.input === "") return;
  const mp3 = await openai.audio.speech.create(req.body);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  console.log(buffer);
  res.type("audio/mp3"); // MIMEタイプを設定
  res.send(buffer);
};
