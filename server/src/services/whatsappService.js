function whatsappConfigured() {
  return process.env.WHATSAPP_ENABLED === 'true'
    && process.env.WHATSAPP_TOKEN
    && process.env.WHATSAPP_PHONE_NUMBER_ID
    && process.env.LAWYER_WHATSAPP_PHONE;
}

export async function sendWhatsAppText({ to, text }) {
  if (!whatsappConfigured()) {
    console.warn('WhatsApp not configured. Skipping WhatsApp notification.');
    return;
  }

  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text.slice(0, 3500) },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp API error: ${err}`);
  }
}

export async function notifyLawyerOnWhatsApp(text) {
  return sendWhatsAppText({
    to: process.env.LAWYER_WHATSAPP_PHONE,
    text,
  });
}
