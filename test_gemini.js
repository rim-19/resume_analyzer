const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  const key = "AIzaSyDqYh4hE3rg2bJ_lYce7bt_sv88eyCLI5s";

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Say hello";
    const result = await model.generateContent(prompt);
    console.log("Success! Response:", result.response.text());
  } catch (error) {
    console.error("Gemini Test Failed:", error);
  }
}

testGemini();
