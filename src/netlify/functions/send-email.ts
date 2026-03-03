import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env["NETLIFY_EMAILS_PROVIDER_API_KEY"] || '',
});

export const handler = async (event: { httpMethod: string; body: string; }) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email, message } = JSON.parse(event.body);

  try {
    await mg.messages.create(process.env["NETLIFY_EMAILS_MAILGUN_DOMAIN"] || '', {
      from: `Winery Contact <postmaster@${process.env["NETLIFY_EMAILS_MAILGUN_DOMAIN"]}>`,
      to: ["ladjo@gbg.bg"],
      subject: `New Winery Feedback from ${name}`,
      text: `Message: ${message} \nReply to: ${email}`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email" })
    };
  }
};
