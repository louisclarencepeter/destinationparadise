import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-GzMndbuvCzjcwousNwv4aLnz",
  project: "proj_0kJYNBJJ7WV1e705faOfCyes",
});

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const generatedResponse = response.choices[0].message.content.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: generatedResponse }),
    };
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate response" }),
    };
  }
};
