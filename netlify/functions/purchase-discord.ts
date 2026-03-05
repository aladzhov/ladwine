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

const buildBasketLines = (basket: BasketItem[]) => {
  if (basket.length === 0) {
    return {
      lines: ["(No items)"],
      subtotal: 0,
      deliveryFee: 0,
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
    (entry) => `${entry.label} x${entry.quantity} - $${entry.subtotal.toFixed(2)}`
  );
  const deliveryFee = subtotal >= 200 ? 0 : 10;
  const total = subtotal + deliveryFee;
  const tax = total * 0.2;

  return { lines, subtotal, deliveryFee, total, tax };
};

const handler: Handler = async function(event) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify("DISCORD_WEBHOOK_URL is not configured"),
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

  const basketInfo = buildBasketLines(requestBody.basket ?? []);
  const messageLines = [
    `New order from ${requestBody.purchaseName} (${requestBody.purchaseEmail})`,
    "",
    ...basketInfo.lines,
    `Delivery: $${basketInfo.deliveryFee.toFixed(2)}`,
    `Total (20% Tax): $${basketInfo.total.toFixed(2)} (Tax $${basketInfo.tax.toFixed(2)})`,
  ];

  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      content: messageLines.join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord webhook error: ${errorText}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Discord notification sent" }),
  };
};

export { handler };
