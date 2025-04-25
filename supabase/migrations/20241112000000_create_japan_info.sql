-- Create japan_info table
CREATE TABLE IF NOT EXISTS public.japan_info (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    korean_title TEXT,
    description TEXT NOT NULL,
    korean_description TEXT,
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    content TEXT NOT NULL,
    korean_content TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    location TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author TEXT,
    views INTEGER DEFAULT 0,
    embed_links JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.japan_info ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow anonymous users to read japan_info table
CREATE POLICY "Allow anonymous read access" 
ON public.japan_info
FOR SELECT 
USING (true);

-- Allow authenticated users to insert, update, and delete
CREATE POLICY "Allow authenticated users full access" 
ON public.japan_info
USING (auth.role() = 'authenticated');

-- Create index for frequently accessed columns
CREATE INDEX idx_japan_info_tags ON public.japan_info USING GIN (tags);
CREATE INDEX idx_japan_info_is_popular ON public.japan_info (is_popular);
CREATE INDEX idx_japan_info_published_at ON public.japan_info (published_at);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function when a row is updated
CREATE TRIGGER update_japan_info_updated_at
BEFORE UPDATE ON public.japan_info
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.japan_info IS 'Table for storing Japan travel information and blog posts';
COMMENT ON COLUMN public.japan_info.embed_links IS 'JSON object to store external embeds like Instagram, Twitter, YouTube links'; 