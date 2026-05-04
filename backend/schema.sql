DROP TABLE IF EXISTS schedules;

CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,      -- タイトル
  description TEXT,         -- 詳細
  date TEXT NOT NULL        -- 日付 (YYYY-MM-DD)
);

-- テストデータ
INSERT INTO schedules (title, description, date) 
VALUES ('サッカー試合', '〇〇公園 14:00キックオフ', '2026-05-10');
