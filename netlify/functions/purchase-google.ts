import type { Handler } from "@netlify/functions";

type BasketItem = {
  name: string;
  packaging?: string;
  price: number;
};

const formatPackaging = (packaging?: string) => {
  if (!packaging || packaging === "bottle") {
    return "Bottle";
  }
  if (packaging === "bag-in-box") {
    return "3L Bag-in-box";
  }
  return packaging;
};

const buildOrderSummary = (basket: BasketItem[]) => {
  if (basket.length === 0) {
    return {
      order: "(No items)",
      total: 0,
      tax: 0,
    };
  }

  const map = new Map<string, { label: string; quantity: number; subtotal: number }>();
  let subtotal = 0;

  for (const item of basket) {
    const packaging = formatPackaging(item.packaging);
    const key = `${item.name}|${packaging}`;
    const label = `${item.name} (${packaging})`;
    const current = map.get(key);
    subtotal += item.price;

    if (current) {
      current.quantity += 1;
      current.subtotal += item.price;
    } else {
      map.set(key, { label, quantity: 1, subtotal: item.price });
    }
  }

  const lines = Array.from(map.values()).map(
    (entry) => `${entry.label} x${entry.quantity} - ${entry.subtotal.toFixed(2)}`
  );

  const deliveryFee = subtotal >= 200 ? 0 : 10;
  const total = subtotal + deliveryFee;
  const tax = total * 0.2;

  lines.push(`Delivery - ${deliveryFee.toFixed(2)}`);

  return {
    order: lines.join("\n"),
    total: Number(total.toFixed(2)),
    tax: Number(tax.toFixed(2)),
  };
};

const handler: Handler = async function(event) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK;

  if (!webhookUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify("GOOGLE_SHEETS_WEBHOOK is not configured"),
    };
  }

  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify("Payload required"),
    };
  }

  const requestBody = JSON.parse(event.body) as {
    purchaseName: string;
    purchaseEmail: string;
    basket?: BasketItem[];
  };

  const summary = buildOrderSummary(requestBody.basket ?? []);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: requestBody.purchaseName,
      email: requestBody.purchaseEmail,
      order: summary.order,
      total: summary.total,
      tax: summary.tax,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets webhook error: ${errorText}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Google Sheets order sent" }),
  };
};

export { handler };
