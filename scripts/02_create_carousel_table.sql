-- Create carousel table for hero images
CREATE TABLE IF NOT EXISTS carousel_images (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title VARCHAR NOT NULL,
  image_url VARCHAR NOT NULL,
  description TEXT,
  cta_text VARCHAR,
  cta_link VARCHAR,
  order_index INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- RLS Policy - public can view active carousel images
CREATE POLICY "Carousel images are viewable by everyone" ON carousel_images
  FOR SELECT TO anon, authenticated USING (active = true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_carousel_active_order ON carousel_images(active, order_index);
