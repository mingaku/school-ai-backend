const axios = require("axios");

const subscriptionKey =
  "AifeQNFGlahvTxZcOdBR1pYXPCIjNTakLgi2lqyXpnt0vq0Zl0cDJQQJ99BDAC4f1cMXJ3w3AAAAACOGU2Ng";
const region = "westus"; // e.g., "japaneast"

exports.handleAzureCredentialInfo = async (req, res) => {
  console.log(111);
  try {
    const response = await axios.post(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      {
        headers: { "Ocp-Apim-Subscription-Key": subscriptionKey },
      }
    );
    const token = response.data;
    console.log("response.data", response.data);
    res.json({ token, region });
  } catch (error) {
    res.status(500).json({ error: "トークン取得に失敗しました" });
  }
};
