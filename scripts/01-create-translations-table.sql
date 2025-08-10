-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  chinese TEXT NOT NULL,
  english TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_translations_chinese ON translations USING gin(to_tsvector('simple', chinese));
CREATE INDEX IF NOT EXISTS idx_translations_english ON translations USING gin(to_tsvector('english', english));
CREATE INDEX IF NOT EXISTS idx_translations_chinese_text ON translations(chinese);
CREATE INDEX IF NOT EXISTS idx_translations_english_text ON translations(english);
