import type { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const handler: Handler = async function(event) {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify("Payload required"),
    };
  }

  const requestBody = JSON.parse(event.body) as {
    purchaseName: string;
    purchaseEmail: string;
    wineryEmail: string;
  };

  await fetch(`${process.env.URL}/.netlify/functions/emails/purchase`, {
    headers: {
      "netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET as string,
    },
    method: "POST",
    body: JSON.stringify({
      from: requestBody.wineryEmail,
      to: requestBody.purchaseEmail,
      subject: "Expect your order soon!",
      parameters: {
        name: requestBody.purchaseName,
        email: requestBody.purchaseEmail,
      },
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify("Email sent!"),
  };
};

export { handler };
