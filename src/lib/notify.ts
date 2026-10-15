import { getTwilio, TWILIO_FROM } from '@/lib/twilio/client'
import { whatsappConfigured, sendWhatsAppOtp, sendWhatsAppWinner } from '@/lib/whatsapp/client'

// WhatsApp when Meta credentials are set, otherwise Twilio SMS

export async function sendCode(phone: string, code: string): Promise<void> {
  if (whatsappConfigured()) return sendWhatsAppOtp(phone, code)
  await getTwilio().messages.create({
    from: TWILIO_FROM,
    to: phone,
    body: `Your DEDSTOK code is ${code}. Valid for 10 minutes.`,
  })
}

export async function sendWinnerNotice(phone: string, winningIndex: number, totalTickets: number): Promise<void> {
  const ticket = String(winningIndex + 1).padStart(4, '0')
  if (whatsappConfigured()) return sendWhatsAppWinner(phone, ticket, totalTickets)
  await getTwilio().messages.create({
    from: TWILIO_FROM,
    to: phone,
    body: `DEDSTOK: You won this week's drop. Ticket #${ticket} of ${totalTickets}. Check your email for next steps.`,
  })
}
