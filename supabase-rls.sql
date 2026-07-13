-- =========================================================================================
-- KWAMJUM SECURITY UPGRADE: ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================================
-- Run this entire script in your Supabase SQL Editor.
-- It ensures that users can only see, update, or delete their own personal data.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Table Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Insert handled automatically by trigger (from Phase 1), but let's ensure they can insert their own
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- 3. Decks Table Policies
CREATE POLICY "Users can view own decks" 
ON decks FOR SELECT 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own decks" 
ON decks FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own decks" 
ON decks FOR UPDATE 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own decks" 
ON decks FOR DELETE 
USING ( auth.uid() = user_id );

-- 4. Cards Table Policies
CREATE POLICY "Users can view own cards" 
ON cards FOR SELECT 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own cards" 
ON cards FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own cards" 
ON cards FOR UPDATE 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own cards" 
ON cards FOR DELETE 
USING ( auth.uid() = user_id );

-- 5. Review Logs Table Policies
CREATE POLICY "Users can view own review logs" 
ON review_logs FOR SELECT 
USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own review logs" 
ON review_logs FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- (Users generally shouldn't update or delete review logs, but just in case)
CREATE POLICY "Users can delete own review logs" 
ON review_logs FOR DELETE 
USING ( auth.uid() = user_id );

-- =========================================================================================
-- DONE! Security is now strictly enforced at the database level.
-- =========================================================================================
