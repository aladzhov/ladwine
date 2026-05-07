import type { Handler } from "@netlify/functions";

/**
 * Server-side Google reCAPTCHA v2 verification.
 *
 * Required environment variable:
 *   RECAPTCHA_SECRET_KEY – Your reCAPTCHA secret key
 */

const handler: Handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Request body required" }) };
  }

  const { token } = JSON.parse(event.body) as { token: string };

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "reCAPTCHA token is required" }),
    };
  }

  const secretKey = process.env["RECAPTCHA_SECRET_KEY"] || "6LfTg94sAAAAAK0davvjWmtoRUjPd2p7QBtmEBgZ";

  const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
  });

  const verifyResult = (await verifyResponse.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  if (!verifyResult.success) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        message: "reCAPTCHA verification failed",
        errors: verifyResult["error-codes"],
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: "reCAPTCHA verified" }),
  };
};

export { handler };

