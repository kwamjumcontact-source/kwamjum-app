-- ====================================================================
-- KWAMJUM FIX: ADD MISSING COLUMNS & REFRESH CACHE
-- ====================================================================
-- Please run this entire script in your Supabase SQL Editor.
-- This will add the missing settings columns and force the server to refresh.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 20;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_reviews_per_day INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_interval_days INTEGER DEFAULT 365;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ui_theme TEXT DEFAULT 'dark';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS font_size TEXT DEFAULT 'medium';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_flip_seconds INTEGER DEFAULT 0;

-- Force Supabase to refresh its API schema cache immediately
NOTIFY pgrst, 'reload schema';
