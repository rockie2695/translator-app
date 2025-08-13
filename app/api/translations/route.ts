import { NextRequest, NextResponse } from 'next/server';
import { getTranslations, addTranslation } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await getTranslations(search, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chinese, cantonese } = await request.json();
    
    if (!chinese || !cantonese) {
      return NextResponse.json(
        { error: 'Chinese and Cantonese text are required' },
        { status: 400 }
      );
    }

    const translation = await addTranslation(chinese, cantonese);
    return NextResponse.json(translation);
  } catch (error) {
    console.error('Error adding translation:', error);
    return NextResponse.json(
      { error: 'Failed to add translation' },
      { status: 500 }
    );
  }
}
