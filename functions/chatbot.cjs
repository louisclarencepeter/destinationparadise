import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-GzMndbuvCzjcwousNwv4aLnz",
  project: "proj_0kJYNBJJ7WV1e705faOfCyes",
});

const assistantId = 'asst_vDBb5Rc2RZ8sLD6gf0uCxPl0';

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

    let responseText = '';
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistantId,
    })
      .on('textDelta', (textDelta) => {
        responseText += textDelta.value;
      })
      .on('toolCallCreated', (toolCall) => {
        responseText += `\n${toolCall.type}\n\n`;
      })
      .on('toolCallDelta', (toolCallDelta) => {
        if (toolCallDelta.type === 'code_interpreter') {
          if (toolCallDelta.code_interpreter.input) {
            responseText += toolCallDelta.code_interpreter.input;
          }
          if (toolCallDelta.code_interpreter.outputs) {
            responseText += "\noutput >\n";
            toolCallDelta.code_interpreter.outputs.forEach(output => {
              if (output.type === "logs") {
                responseText += `\n${output.logs}\n`;
              }
            });
          }
        }
      })
      .on('error', (error) => {
        console.error("Stream error:", error);
      });

    await new Promise((resolve, reject) => {
      run.on('end', resolve).on('error', reject);
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
