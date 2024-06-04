const { Configuration, OpenAIApi } = require('openai');

// Set up OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: 'org-GzMndbuvCzjcwousNwv4aLnz',
});
const openai = new OpenAIApi(configuration);

// Replace this with your fine-tuned model ID
const MODEL_ID = 'ft-gpt-3.5-turbo-1106:personal:9WKUxzbq';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { input } = JSON.parse(event.body);

    const response = await openai.createChatCompletion({
      model: MODEL_ID,
      messages: [{ role: 'user', content: input }],
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const generatedResponse = response.data.choices[0].message.content.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ response: generatedResponse }),
    };
  } catch (error) {
    console.error('Error generating response:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate response' }),
    };
  }
};