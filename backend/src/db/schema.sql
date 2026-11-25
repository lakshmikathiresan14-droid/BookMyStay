-- Run with: npm run db:init
CREATE TABLE IF NOT EXISTS hotels (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(80)   NOT NULL,
  description TEXT          NOT NULL,
  latitude    NUMERIC(9, 6) NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude   NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  price       NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  -- e.g. /uploads/1732512345-ab12cd34.jpg (or a full URL for the seed data)
  image_path  TEXT          NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
CREATE INDEX IF NOT EXISTS idx_hotels_created_at ON hotels (created_at DESC);
