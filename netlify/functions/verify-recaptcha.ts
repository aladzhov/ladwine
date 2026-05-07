import type { Handler } from "@netlify/functions";

/**
 * Server-side Google reCAPTCHA v3 verification.
 *
 * Required environment variable:
 *   RECAPTCHA_SECRET_KEY – Your reCAPTCHA v3 secret key
 * Optional environment variable:
 *   RECAPTCHA_MIN_SCORE – Minimum accepted score (0.0–1.0), defaults to 0.5
 */

const EXPECTED_ACTION = "checkout_submit";

const handler: Handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Request body required" }) };
  }

  let requestBody: { token?: string };

  try {
    requestBody = JSON.parse(event.body) as { token?: string };
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "Invalid JSON body" }),
    };
  }

  const token = requestBody.token;

  if (typeof token !== "string" || token.trim().length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: "reCAPTCHA token is required" }),
    };
  }

  const secretKey = process.env["RECAPTCHA_SECRET_KEY"];

  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "RECAPTCHA_SECRET_KEY env var is not configured" }),
    };
  }

  const configuredMinScore = Number(process.env["RECAPTCHA_MIN_SCORE"] ?? "0.5");
  const minScore = Number.isFinite(configuredMinScore) ? configuredMinScore : 0.5;

  const verifyResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token.trim())}`,
  });

  const verifyResult = (await verifyResponse.json()) as {
    success: boolean;
    score?: number;
    action?: string;
    hostname?: string;
    "error-codes"?: string[];
  };

  // Google said the token is invalid / expired / wrong secret
  if (!verifyResult.success) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        message: "reCAPTCHA verification failed",
        errors: verifyResult["error-codes"],
        hostname: verifyResult.hostname,
      }),
    };
  }

  // Action mismatch (possible replay / cross-site attack)
  if (verifyResult.action !== EXPECTED_ACTION) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        message: "reCAPTCHA action mismatch",
        expected: EXPECTED_ACTION,
        actual: verifyResult.action,
      }),
    };
  }

  // Score too low (likely bot)
  if (typeof verifyResult.score !== "number" || verifyResult.score < minScore) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        success: false,
        message: "reCAPTCHA score too low",
        score: verifyResult.score,
        minScore,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      message: "reCAPTCHA verified",
      score: verifyResult.score,
      action: verifyResult.action,
    }),
  };
};

export { handler };
