import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { text, fromLang } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const translatedText = await translateText(text, fromLang);
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
