import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn("[email] SMTP not configured — skipping emails. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return transporter;
};

const FROM_ADDRESS = process.env.SMTP_FROM || "noreply@shopnest.com";

export const sendOrderConfirmation = async ({ email, name, orderId, items, total, deliveryAddress, paymentMethod }) => {
  const t = getTransporter();
  if (!t) return;

  const itemsList = items
    .map((item) => `  • ${item.name} x${item.quantity} — ₹${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  const text = `
Hi ${name},

Thank you for your order at ShopNest!

Order ID: #${orderId}
Payment Method: ${paymentMethod}
Delivery Address: ${deliveryAddress}

Items:
${itemsList}

Total: ₹${total.toFixed(2)}

We'll notify you once your order ships.

Cheers,
The ShopNest Team
`.trim();

  try {
    await t.sendMail({
      from: `"ShopNest" <${FROM_ADDRESS}>`,
      to: email,
      subject: `Order Confirmation — #${orderId}`,
      text,
    });
    console.log(`[email] Order confirmation sent to ${email} for order #${orderId}`);
  } catch (err) {
    console.warn(`[email] Failed to send confirmation for order #${orderId}:`, err.message);
  }
};
