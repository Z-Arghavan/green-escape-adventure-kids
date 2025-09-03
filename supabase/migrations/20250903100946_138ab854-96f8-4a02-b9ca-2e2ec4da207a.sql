-- Remove the unique constraint on nickname to allow multiple entries per player
ALTER TABLE leaderboard DROP CONSTRAINT IF EXISTS unique_nickname;