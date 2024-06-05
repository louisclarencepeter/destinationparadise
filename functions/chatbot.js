import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-GzMndbuvCzjcwousNwv4aLnz",
  project: "proj_0kJYNBJJ7WV1e705faOfCyes",
});

const assistantId = 'asst_vDBb5Rc2RZ8sLD6gf0uCxPl0'; // Replace with your actual assistant ID

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Create Thread
    const thread = await openai.beta.threads.create();

    // Add Message to Thread
// Add Message to Thread
const userMessage = await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: message,
});
console.log('User message created:', userMessage);

console.log('Request body:', event.body);
console.log('Message:', message);

    // Create and Stream Run
    let responseText = '';
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistantId,
    })
    .on('textCreated', () => {
      responseText += '\nassistant > ';
    })
    .on('textDelta', (textDelta) => {
      responseText += textDelta.value;
    })
    .on('toolCallCreated', (toolCall) => {
      responseText += `\nassistant > ${toolCall.type}\n\n`;
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
    });

    // Wait for the response
    await new Promise((resolve) => run.on('end', resolve));

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
