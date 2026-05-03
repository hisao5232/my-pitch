CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date TEXT NOT NULL,      -- '2026-05-10' 形式
  category TEXT DEFAULT 'general' -- 'soccer', 'work', etc.
);

-- テストデータ
INSERT INTO schedules (title, date, category) VALUES ('週末サッカー大会', '2026-05-10', 'soccer');
INSERT INTO schedules (title, date, category) VALUES ('MyPitch 開発タイム', '2026-05-04', 'work');
