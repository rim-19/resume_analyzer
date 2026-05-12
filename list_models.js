const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const key = "AIzaSyDqYh4hE3rg2bJ_lYce7bt_sv88eyCLI5s";
  try {
    const genAI = new GoogleGenerativeAI(key);
    // There is no direct listModels in the client, we usually use the REST API for that
    // But we can try a few common names
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`Success with ${m}:`, result.response.text());
            break;
        } catch (e) {
            console.log(`Failed with ${m}:`, e.message);
        }
    }
  } catch (error) {
    console.error("List failed:", error);
  }
}

listModels();
