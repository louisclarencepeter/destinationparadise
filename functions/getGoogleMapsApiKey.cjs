exports.handler = async function () {
  // Retrieve the API key from environment variables
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // Check if the API key is available
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Maps API key is not configured" }),
    };
  }

  // Respond with the API key
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
  };
};
