import type { Handler } from "@netlify/functions";
import * as crypto from "crypto";

/**
 * MyPOS Checkout API integration.
 *
 * Required environment variables:
 *   MYPOS_STORE_ID          – Your myPOS store/merchant ID
 *   MYPOS_SECRET_KEY        – Your myPOS secret key for HMAC signature
 *   MYPOS_CHECKOUT_URL      – myPOS checkout endpoint (e.g. https://mypos.com/vmp/checkout)
 *   MYPOS_IPC_VERSION       – IPC version (default: "1.4")
 *   MYPOS_WALLET_NUMBER     – Your myPOS wallet number
 *   MYPOS_KEY_INDEX          – Key index (default: "1")
 *   SITE_URL                 – Your site URL for OK/Cancel redirects (falls back to process.env.URL)
 *
 * Reference: https://developers.mypos.com/apis/checkout-api
 */

interface CheckoutRequestBody {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
}

const generateSignature = (params: Record<string, string>, secretKey: string): string => {
  // MyPOS HMAC-SHA256 signature: concatenate all param values in order, then sign
  const concatenated = Object.values(params).join("");
  return crypto
    .createHmac("sha256", secretKey)
    .update(concatenated)
    .digest("hex");
};

const handler: Handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Request body required" }) };
  }

  const {
    amount,
    currency,
    orderId,
    customerEmail,
    customerName,
  } = JSON.parse(event.body) as CheckoutRequestBody;

  const storeId = process.env.MYPOS_STORE_ID || '000000000000010';
  const secretKey = process.env.MYPOS_SECRET_KEY || '1';
  const walletNumber = process.env.MYPOS_WALLET_NUMBER || '61938166610';
  const checkoutUrl = process.env.MYPOS_CHECKOUT_URL || "https://www.mypos.com/vmp/checkout-test";
  const ipcVersion = process.env.MYPOS_IPC_VERSION || "1.4";
  const keyIndex = process.env.MYPOS_KEY_INDEX || "1";
  const siteUrl = process.env.SITE_URL || process.env.URL || "http://localhost:8888";

  if (!storeId || !secretKey || !walletNumber) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "MyPOS configuration missing. Set MYPOS_STORE_ID, MYPOS_SECRET_KEY, and MYPOS_WALLET_NUMBER." }),
    };
  }

  // Build checkout parameters per MyPOS Checkout API docs
  const params: Record<string, string> = {
    IPCmethod: "IPCPurchase",
    IPCVersion: ipcVersion,
    IPCLanguage: "en",
    SID: storeId,
    WalletNumber: walletNumber,
    KeyIndex: keyIndex,
    Source: "LADWINE",
    Amount: amount.toFixed(2),
    Currency: currency || "EUR",
    OrderID: orderId,
    URL_OK: `${siteUrl}/checkout?payment=success&orderId=${orderId}`,
    URL_Cancel: `${siteUrl}/checkout?payment=cancelled&orderId=${orderId}`,
    URL_Notify: `${siteUrl}/.netlify/functions/mypos-notify`,
    CardTokenRequest: "0",
    PaymentParametersRequired: "1",
    CustomerEmail: customerEmail || "",
    CustomerFirstName: customerName?.split(" ")[0] || "",
    CustomerLastName: customerName?.split(" ").slice(1).join(" ") || "",
    CustomerPhone: "",
    CustomerCountry: "",
    CustomerCity: "",
    CustomerZip: "",
    CustomerAddress: "",
    Note: `Ladwine order ${orderId}`,
  };

  // Generate HMAC signature
  const signature = generateSignature(params, secretKey);
  params.Signature = signature;

  // Build the redirect URL with all params as query string
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  const paymentUrl = `${checkoutUrl}?${queryString}`;

  return {
    statusCode: 200,
    body: JSON.stringify({
      paymentUrl,
      sessionId: orderId,
    }),
  };
};

export { handler };

