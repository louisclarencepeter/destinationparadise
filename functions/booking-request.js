// netlify/functions/booking-request.js
const handler = async (event) => {
    // Check if it's a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method Not Allowed' }),
      };
    }
  
    try {
      // Parse the form data
      const data = JSON.parse(event.body);
  
      // Here you can handle the data, for example, send an email or store it in a database
      console.log('Form data received:', data);
  
      // Respond with a success message
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Booking request received successfully' }),
      };
    } catch (error) {
      console.error('Error processing form data:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
      };
    }
  };
  
  module.exports = { handler };
  