-- Remove the unique constraint on nickname to allow multiple entries per player
DROP INDEX IF EXISTS unique_nickname;