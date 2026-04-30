import type { Handler } from "@netlify/functions";

/**
 * Revolut Merchant API – Create an order and return the checkout URL.
 *
 * Required environment variables:
 *   REVOLUT_API_KEY       – Your Revolut Merchant API secret key
 *   REVOLUT_API_URL       – API base URL
 *                           Sandbox: https://sandbox-merchant.revolut.com/api
 *                           Production: https://merchant.revolut.com/api
 *   SITE_URL              – Your site URL for redirect (falls back to process.env.URL)
 *
 * Reference: https://developer.revolut.com/docs/merchant/create-order
 */

interface OrderRequestBody {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
}

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
  } = JSON.parse(event.body) as OrderRequestBody;

  const apiKey = process.env['REVOLUT_API_KEY'];
  const apiUrl = process.env['REVOLUT_API_URL'] || "https://sandbox-merchant.revolut.com/api";
  const siteUrl = process.env['SITE_URL'] || process.env['URL'] || "http://localhost:8888";

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Revolut configuration missing. Set REVOLUT_API_KEY." }),
    };
  }

  try {
    // Revolut expects amount in minor currency units (cents)
    const amountInCents = Math.round(amount * 100);

    const response = await fetch(`${apiUrl}/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Revolut-Api-Version": "2024-09-01",
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: currency || "EUR",
        merchant_order_ext_ref: orderId,
        description: `Ladwine order ${orderId}`,
        customer_email: customerEmail || undefined,
        redirect_url: `${siteUrl}/checkout?payment=success&orderId=${orderId}`,
        cancel_redirect_url: `${siteUrl}/checkout?payment=cancelled&orderId=${orderId}`,
        metadata: {
          customer_name: customerName,
          source: "ladwine",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Revolut API error (${response.status}): ${errorText}`);
    }

    const order = await response.json() as {
      id: string;
      checkout_url: string;
      state: string;
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        paymentUrl: order.checkout_url,
        sessionId: order.id,
      }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Revolut checkout failed";
    return {
      statusCode: 500,
      body: JSON.stringify({ message }),
    };
  }
};

export { handler };

