-- 004_influencer_commission.sql
-- Switch from flat commission_per_ticket to percentage-based commission_rate
-- Add account linking, pending payout tracking, and payout history

-- New columns
ALTER TABLE influencer_codes
  ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(4,3) DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS total_pending_payout DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS last_payout_date DATE;

-- Migrate existing rows to 10% rate
UPDATE influencer_codes SET commission_rate = 0.10 WHERE commission_rate IS NULL OR commission_rate = 0;

-- Drop old fixed-rate function and replace with percentage-based version
DROP FUNCTION IF EXISTS credit_influencer(TEXT, INT);

CREATE OR REPLACE FUNCTION credit_influencer(
  p_code TEXT,
  p_tickets INT,
  p_entry_price DECIMAL DEFAULT 10
) RETURNS void AS $$
DECLARE
  v_rate DECIMAL;
  v_commission DECIMAL;
BEGIN
  SELECT commission_rate INTO v_rate
  FROM influencer_codes
  WHERE code = p_code;

  v_commission := ROUND((v_rate * p_entry_price * p_tickets)::NUMERIC, 2);

  UPDATE influencer_codes
  SET
    total_tickets_credited = total_tickets_credited + p_tickets,
    total_commission_earned = total_commission_earned + v_commission,
    total_pending_payout    = total_pending_payout + v_commission
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark influencer paid: resets pending payout, stamps last payout date
CREATE OR REPLACE FUNCTION mark_influencer_paid(p_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE influencer_codes
  SET
    total_pending_payout = 0,
    last_payout_date     = CURRENT_DATE
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
