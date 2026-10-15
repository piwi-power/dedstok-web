// Meta WhatsApp Cloud API. Business-initiated messages must use approved templates.
const API_VERSION = process.env.META_WHATSAPP_API_VERSION ?? 'v25.0'
const LANG = process.env.META_WHATSAPP_TEMPLATE_LANG ?? 'en'

export function whatsappConfigured(): boolean {
  return Boolean(process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID)
}

async function sendTemplate(to: string, name: string, components: object[]): Promise<void> {
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${process.env.META_WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/^\+/, ''),
        type: 'template',
        template: { name, language: { code: LANG }, components },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`WhatsApp API error ${res.status}: ${JSON.stringify(err)}`)
  }
}

function requireTemplate(envVar: string): string {
  const name = process.env[envVar]
  if (!name) throw new Error(`${envVar} is not set`)
  return name
}

// Copy-code authentication template: the code goes in both the body and the button
export async function sendWhatsAppOtp(to: string, code: string): Promise<void> {
  await sendTemplate(to, requireTemplate('META_WHATSAPP_OTP_TEMPLATE'), [
    { type: 'body', parameters: [{ type: 'text', text: code }] },
    { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
  ])
}

// Utility template with two body variables: {{1}} ticket number, {{2}} total tickets
export async function sendWhatsAppWinner(to: string, ticket: string, total: number): Promise<void> {
  await sendTemplate(to, requireTemplate('META_WHATSAPP_WINNER_TEMPLATE'), [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: ticket },
        { type: 'text', text: String(total) },
      ],
    },
  ])
}
