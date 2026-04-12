-- 005_influencer_soft_delete.sql
-- Soft delete for influencer codes — preserves earnings history

ALTER TABLE influencer_codes
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
