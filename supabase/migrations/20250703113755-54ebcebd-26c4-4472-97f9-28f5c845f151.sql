
-- Add unique constraint to nickname to prevent duplicates
ALTER TABLE public.leaderboard ADD CONSTRAINT unique_nickname UNIQUE (nickname);

-- Add a sequential ID column for display purposes
ALTER TABLE public.leaderboard ADD COLUMN display_id SERIAL;
