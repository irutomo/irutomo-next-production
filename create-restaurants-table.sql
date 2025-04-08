-- テーブルが存在しない場合だけ作成する
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating NUMERIC(3,1) DEFAULT 0.0,
  description TEXT,
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- テストデータの挿入 (テーブルが空の場合のみ)
INSERT INTO restaurants (name, rating, description, image_url, location)
SELECT * FROM (
  VALUES
    ('寿司レストラン 海鮮', 4.8, '新鮮な魚介類を使用した本格的な寿司を提供しています。', 'https://placehold.jp/400x300.png', '東京都渋谷区'),
    ('焼肉 牛王', 4.6, '厳選された和牛を使った高級焼肉店です。', 'https://placehold.jp/400x300.png', '東京都新宿区'),
    ('イタリアン パスタ', 4.5, '本場イタリアの味を楽しめる家庭的なイタリアンレストラン。', 'https://placehold.jp/400x300.png', '東京都目黒区'),
    ('ラーメン 麺道', 4.7, '濃厚豚骨スープが自慢の人気ラーメン店。', 'https://placehold.jp/400x300.png', '東京都品川区'),
    ('カフェ 森の風', 4.4, '静かな雰囲気で美味しいコーヒーとケーキが楽しめるカフェ。', 'https://placehold.jp/400x300.png', '東京都世田谷区'),
    ('中華料理 龍門', 4.5, '本格四川料理から定番の中華料理まで幅広く提供。', 'https://placehold.jp/400x300.png', '東京都中央区')
) AS vals (name, rating, description, image_url, location)
WHERE NOT EXISTS (SELECT 1 FROM restaurants LIMIT 1);

-- Row-Level Securityポリシー設定
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能なポリシー (認証不要)
DROP POLICY IF EXISTS "誰でも読み取り可能" ON restaurants;
CREATE POLICY "誰でも読み取り可能" ON restaurants
  FOR SELECT USING (true); 