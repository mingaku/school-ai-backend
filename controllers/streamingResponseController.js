const axios = require("axios");

exports.handleStreamingResponse = async (req, res) => {
  const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  const OPENAI_API_KEY = process.env.OPENAI_SECRET_KEY;
  try {
    console.log(
      JSON.stringify({
        severity: "INFO",
        ...req.body,
      })
    );
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        ...req.body,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
