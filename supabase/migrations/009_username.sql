-- ============================================================
-- MIGRATION 009: Username + auth_provider + updated trigger
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add username column (nullable for backward compat with any existing accounts)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username text;

-- 2. Case-insensitive unique index (app enforces lowercase; this is the DB safety net)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
  ON public.users(lower(username))
  WHERE username IS NOT NULL;

-- 3. Auth provider tracking
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'email';

-- 4. Update handle_new_user trigger to also generate referral_code on creation
--    This covers both email+password (via admin.createUser) and OAuth flows.
--    The referral_code uniqueness constraint prevents overwriting on upsert.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, referral_code)
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    lower(substring(replace(new.id::text, '-', ''), 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
