import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    // Use Instagram's oEmbed endpoint to get thumbnail
    const oembedUrl = `https://graph.facebook.com/v22.0/instagram_oembed?url=${encodeURIComponent(url)}&fields=thumbnail_url`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return NextResponse.json({ thumbnail: data.thumbnail_url });
      }
    }

    // Fallback: try the old oEmbed endpoint
    const fallbackUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (fallbackData.thumbnail_url) {
        return NextResponse.json({ thumbnail: fallbackData.thumbnail_url });
      }
    }

    return NextResponse.json({ thumbnail: null });
  } catch {
    return NextResponse.json({ thumbnail: null });
  }
}
