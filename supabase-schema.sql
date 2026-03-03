-- Project Dashboard Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  pinned_repos INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manual Tasks Table
CREATE TABLE IF NOT EXISTS manual_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('todo', 'done')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Changelog Cache Table
CREATE TABLE IF NOT EXISTS changelog_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  bullets JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_owner, repo_name, date)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_manual_tasks_user_repo ON manual_tasks(user_id, repo_owner, repo_name);
CREATE INDEX IF NOT EXISTS idx_changelog_cache_repo_date ON changelog_cache(repo_owner, repo_name, date);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_cache ENABLE ROW LEVEL SECURITY;

-- User Preferences: users can only see/edit their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Manual Tasks: users can only see/edit their own tasks
CREATE POLICY "Users can view their own tasks"
  ON manual_tasks FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own tasks"
  ON manual_tasks FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own tasks"
  ON manual_tasks FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own tasks"
  ON manual_tasks FOR DELETE
  USING (user_id = auth.uid()::text);

-- Changelog Cache: read-only for everyone (cached AI generations)
CREATE POLICY "Anyone can read changelog cache"
  ON changelog_cache FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert into changelog cache"
  ON changelog_cache FOR INSERT
  WITH CHECK (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manual_tasks_updated_at
  BEFORE UPDATE ON manual_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
