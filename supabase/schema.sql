-- AI Venture Board — Supabase Schema
-- Run this once in your Supabase project's SQL Editor (supabase.com → your project → SQL Editor)

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL DEFAULT '',
  concept     TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  market      TEXT NOT NULL DEFAULT '',
  revenue     TEXT NOT NULL DEFAULT '',
  effort      TEXT NOT NULL DEFAULT '',
  deadline    TEXT NOT NULL DEFAULT '',
  tags        JSONB NOT NULL DEFAULT '[]',
  progress    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id         BIGSERIAL PRIMARY KEY,
  text       TEXT NOT NULL DEFAULT '',
  owner      TEXT NOT NULL DEFAULT '',
  due        TEXT NOT NULL DEFAULT '',
  done       BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Seed initial ideas (run only once — skip if you already have data)
INSERT INTO ideas (id, title, concept, description, market, revenue, effort, deadline, tags, progress, sort_order)
VALUES
  ('mensura',    'Mensura',                          'AI-powered inventory management tool for small businesses',          '', '', '', '', '', '["B2B"]',       0, 0),
  ('tourai',     'TourAI — City & Museum Tour',      'AI-narrated virtual tours of cities and museums worldwide',          '', 'Travelers, students, cultural institutions (B2C) + museums/tourism boards (B2B)', 'Freemium app + B2B licensing to museums and tourism boards', '', '', '["B2B","B2C"]', 0, 1),
  ('transcript', 'TranscriptAI — Transcription & Translation', 'AI transcription of audio/video into English text with optional translation', '', 'Content creators, podcasters, businesses, educators, non-native English speakers', 'Pay-per-minute credits + monthly subscriptions + API access for enterprise', '', '', '["B2B","B2C"]', 0, 2),
  ('figurinha',  'FigurinhAI — World Cup Sticker App', 'AI-generated stickers themed around the FIFA World Cup',          '', 'General public', '', '', '', '["B2C"]',       0, 3)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
-- After running the CREATE TABLE statements, Supabase will ask to "Run and enable RLS" — click that.
-- Then run this block separately to allow the app (anon key) to read and write data.
CREATE POLICY "anon_all_ideas" ON ideas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tasks" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
