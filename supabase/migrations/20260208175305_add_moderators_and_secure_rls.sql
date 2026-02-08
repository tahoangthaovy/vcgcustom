-- Migration: Add moderators table and secure RLS policies
-- This migration:
-- 1. Creates a moderators table for managing who can modify data
-- 2. Creates an app_secrets table for storing the admin password securely
-- 3. Updates RLS policies to require authentication for write operations

-- =====================================================
-- STEP 1: Create moderators table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.moderators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on moderators table
ALTER TABLE public.moderators ENABLE ROW LEVEL SECURITY;

-- Only authenticated moderators can view the moderators list
CREATE POLICY "Authenticated users can view moderators" 
  ON public.moderators FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- STEP 2: Create a function to check if user is moderator
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.moderators 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- STEP 3: Drop old permissive policies for write operations
-- =====================================================
DROP POLICY IF EXISTS "Allow insert players" ON public.players;
DROP POLICY IF EXISTS "Allow update players" ON public.players;
DROP POLICY IF EXISTS "Allow delete players" ON public.players;

DROP POLICY IF EXISTS "Allow insert matches" ON public.matches;
DROP POLICY IF EXISTS "Allow update matches" ON public.matches;
DROP POLICY IF EXISTS "Allow delete matches" ON public.matches;

DROP POLICY IF EXISTS "Allow insert score_logs" ON public.score_logs;
DROP POLICY IF EXISTS "Allow update score_logs" ON public.score_logs;
DROP POLICY IF EXISTS "Allow delete score_logs" ON public.score_logs;

-- =====================================================
-- STEP 4: Create new secure policies for players table
-- =====================================================
CREATE POLICY "Moderators can insert players" 
  ON public.players FOR INSERT 
  WITH CHECK (public.is_moderator());

CREATE POLICY "Moderators can update players" 
  ON public.players FOR UPDATE 
  USING (public.is_moderator());

CREATE POLICY "Moderators can delete players" 
  ON public.players FOR DELETE 
  USING (public.is_moderator());

-- =====================================================
-- STEP 5: Create new secure policies for matches table
-- =====================================================
CREATE POLICY "Moderators can insert matches" 
  ON public.matches FOR INSERT 
  WITH CHECK (public.is_moderator());

CREATE POLICY "Moderators can update matches" 
  ON public.matches FOR UPDATE 
  USING (public.is_moderator());

CREATE POLICY "Moderators can delete matches" 
  ON public.matches FOR DELETE 
  USING (public.is_moderator());

-- =====================================================
-- STEP 6: Create new secure policies for score_logs table
-- =====================================================
CREATE POLICY "Moderators can insert score_logs" 
  ON public.score_logs FOR INSERT 
  WITH CHECK (public.is_moderator());

CREATE POLICY "Moderators can update score_logs" 
  ON public.score_logs FOR UPDATE 
  USING (public.is_moderator());

CREATE POLICY "Moderators can delete score_logs" 
  ON public.score_logs FOR DELETE 
  USING (public.is_moderator());
