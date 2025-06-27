// chatbot.secure.cjs
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize OpenAI client using environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID || "fallback-org-id",
  project: process.env.OPENAI_PROJECT_ID || "fallback-project-id",
});

const assistantId = process.env.OPENAI_ASSISTANT_ID || "fallback-assistant-id";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    let responseText = "";

    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistantId,
    })
      .on("textDelta", (textDelta) => {
        responseText += textDelta.value;
      })
      .on("toolCallCreated", (toolCall) => {
        responseText += `\n${toolCall.type}\n\n`;
      })
      .on("toolCallDelta", (toolCallDelta) => {
        if (toolCallDelta.type === "code_interpreter") {
          if (toolCallDelta.code_interpreter.input) {
            responseText += toolCallDelta.code_interpreter.input;
          }
          if (toolCallDelta.code_interpreter.outputs) {
            responseText += "\noutput >\n";
            toolCallDelta.code_interpreter.outputs.forEach((output) => {
              if (output.type === "logs") {
                responseText += `\n${output.logs}\n`;
              }
            });
          }
        }
      })
      .on("error", (error) => {
        console.error("Stream error:", error);
      });

    await new Promise((resolve, reject) => {
      run.on("end", resolve).on("error", reject);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ response: responseText }),
    };
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate response" }),
    };
  }
};