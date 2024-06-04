const { Configuration, OpenAIApi } = require('openai');

// Set up OpenAI API configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Replace this with your fine-tuned model ID
const MODEL_ID = 'ft-gpt-3.5-turbo-1106:personal:9WKUxzbq';

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { input } = JSON.parse(event.body);

    const response = await openai.createCompletion({
      model: MODEL_ID,
      prompt: input,
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const generatedResponse = response.data.choices[0].text.trim();

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