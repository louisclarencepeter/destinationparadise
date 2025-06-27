// sendEmail.handler.cjs
require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY || 'fallback-api-key');

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    const response = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // make sure this domain is verified
      to: [email],
      subject: 'Subscription Confirmation',
      text: 'Thank you for subscribing to our newsletter!',
      attachments: [
        {
          filename: 'invoice.pdf',
          content: Buffer.from('Your invoice content here').toString('base64'),
        },
      ],
      headers: {
        'X-Entity-Ref-ID': '123456789',
      },
      tags: [
        {
          name: 'category',
          value: 'confirm_email',
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Email sent successfully',
        data: response,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error sending email',
        error: error.message,
      }),
    };
  }
};