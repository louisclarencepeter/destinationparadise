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
    console.log("Received message:", message); // Log the received message

    const thread = await openai.beta.threads.create();
    console.log("Thread created:", thread.id); // Log the thread ID

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
    console.log("Message created:", message); // Log the message content

    let responseText = '';
    const run = openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistantId,
    })
    .on('textDelta', (textDelta) => {
      console.log("Received text delta:", textDelta.value); // Log the text delta
      responseText += textDelta.value;
    })
    .on('toolCallCreated', (toolCall) => {
      console.log("Tool call created:", toolCall); // Log the tool call object
      responseText += `\n${toolCall.type}\n\n`;
    })
    .on('toolCallDelta', (toolCallDelta) => {
      console.log("Tool call delta:", toolCallDelta); // Log the tool call delta object
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

    await new Promise((resolve) => run.on('end', resolve));
    console.log("Final response:", responseText); // Log the final response

    return {
      statusCode: 200,
      body: JSON.stringify({ response: responseText }),
    };
  } catch (error) {
    console.error("Error generating response:", error); // Log the full error object
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate response" }),
    };
  }
};