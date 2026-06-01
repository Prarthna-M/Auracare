const axios = require("axios");
require("dotenv").config();

async function testOpenRouter() {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "user",
            content: "Suggest a skincare routine for oily acne-prone skin"
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // optional
          "X-Title": "Skincare App" // optional
        }
      }
    );

    console.log("✅ Response:\n");
    console.log(response.data.choices[0].message.content);

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testOpenRouter();