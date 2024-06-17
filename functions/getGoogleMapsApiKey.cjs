exports.handler = async function() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey }),
  };
};
