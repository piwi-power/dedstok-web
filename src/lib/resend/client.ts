import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    // Falls back to a placeholder at build time — actual key required at runtime
    _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  }
  return _resend
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'noreply@dedstok.com'
