import twilio from 'twilio'

let _twilio: ReturnType<typeof twilio> | null = null

export function getTwilio() {
  if (!_twilio) {
    _twilio = twilio(
      process.env.TWILIO_ACCOUNT_SID ?? 'placeholder',
      process.env.TWILIO_AUTH_TOKEN ?? 'placeholder'
    )
  }
  return _twilio
}

export const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER ?? ''
