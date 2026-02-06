-- Add email field to clubs table
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS email VARCHAR;
COMMENT ON COLUMN clubs.email IS 'Club email address for order notifications';
