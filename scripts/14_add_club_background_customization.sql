-- Add background customization fields to clubs table
ALTER TABLE clubs
ADD COLUMN background_type VARCHAR(20) DEFAULT 'color' CHECK (background_type IN ('color', 'image')),
ADD COLUMN background_value TEXT,
ADD COLUMN background_image_url TEXT;

-- Update the comment to reflect new fields
COMMENT ON COLUMN clubs.background_type IS 'Type of background: color or image';
COMMENT ON COLUMN clubs.background_value IS 'Color value (hex code or preset name) when background_type is color';
COMMENT ON COLUMN clubs.background_image_url IS 'URL of background image when background_type is image';

-- Set default background for existing clubs
UPDATE clubs
SET background_type = 'color',
    background_value = '#1a1a1a'
WHERE background_type IS NULL;
