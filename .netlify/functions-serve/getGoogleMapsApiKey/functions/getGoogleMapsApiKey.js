// functions/getGoogleMapsApiKey.cjs
exports.handler = async function() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Google Maps API key is not configured" })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey })
  };
};
//# sourceMappingURL=getGoogleMapsApiKey.js.map
