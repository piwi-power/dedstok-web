-- Enforce one verified phone number per person across all accounts.
-- Prevents someone from creating multiple accounts (wallets, emails, etc.)
-- and verifying the same phone on each to bypass the 2-spot limit.
-- Partial index: only applies when phone_verified = true.

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_verified_phone
  ON public.users(phone)
  WHERE phone_verified = true;
