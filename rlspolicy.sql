-- 匿名ユーザーのinsert権限を追加するポリシー
CREATE POLICY "Allow anonymous insert access" 
ON public.japan_info
FOR INSERT 
TO anon
USING (true); 