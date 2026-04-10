import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder_stripe_key', {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}
