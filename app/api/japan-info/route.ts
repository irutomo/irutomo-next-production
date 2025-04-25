import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const tag = searchParams.get('tag');
    const isPopular = searchParams.get('isPopular') === 'true';
    const language = searchParams.get('language') || 'ko';
    
    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;
    
    // Start building the query
    let query = supabase
      .from('japan_info')
      .select('*')
      .order('published_at', { ascending: false });
    
    // Apply filters if provided
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (isPopular) {
      query = query.eq('is_popular', true);
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + pageSize - 1)
      .returns<Database['public']['Tables']['japan_info']['Row'][]>();
    
    if (error) {
      console.error('Error fetching Japan info:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Japan info' },
        { status: 500 }
      );
    }
    
    // Process data based on language preference
    const processedData = data.map((item: Database['public']['Tables']['japan_info']['Row']) => ({
      ...item,
      title: language === 'ko' && item.korean_title ? item.korean_title : item.title,
      description: language === 'ko' && item.korean_description ? item.korean_description : item.description,
    }));
    
    return NextResponse.json({
      data: processedData,
      meta: {
        currentPage: page,
        pageSize: pageSize,
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.content || !body.image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert new Japan info
    const { data, error } = await supabase
      .from('japan_info')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating Japan info:', error);
      return NextResponse.json(
        { error: 'Failed to create Japan info' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 