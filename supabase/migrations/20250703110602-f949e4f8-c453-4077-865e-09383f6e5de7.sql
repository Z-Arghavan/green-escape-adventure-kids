
-- Create a table to store player scores for the global leaderboard
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  highest_score INTEGER NOT NULL,
  games_played INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on highest_score for faster sorting
CREATE INDEX idx_leaderboard_highest_score ON public.leaderboard (highest_score DESC);

-- Create an index on created_at for date-based queries
CREATE INDEX idx_leaderboard_created_at ON public.leaderboard (created_at DESC);

-- Enable Row Level Security (make it public so anyone can read the leaderboard)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Anyone can view leaderboard" 
  ON public.leaderboard 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert their scores
CREATE POLICY "Anyone can insert scores" 
  ON public.leaderboard 
  FOR INSERT 
  WITH CHECK (true);
