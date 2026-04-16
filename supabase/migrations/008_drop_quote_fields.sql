-- Migration 008: Add quote fields to drops table
-- Allows each drop to carry a relevant quote from a cultural figure
-- related to the item being raffled. Displayed on the drop card.

ALTER TABLE drops ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE drops ADD COLUMN IF NOT EXISTS quote_attribution TEXT;
