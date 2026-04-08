import { NextRequest, NextResponse } from 'next/server';

/** Only allow Instagram URLs for oEmbed */
const ALLOWED_OEMBED_DOMAINS = ['instagram.com', 'www.instagram.com'];

function isAllowedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_OEMBED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate domain — only allow Instagram URLs
  if (!isAllowedDomain(url)) {
    return NextResponse.json({ error: 'Only Instagram URLs are supported' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://graph.facebook.com/v22.0/instagram_oembed?url=${encodeURIComponent(url)}&fields=thumbnail_url`;
    
    const response = await fetch(oembedUrl, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return NextResponse.json({ thumbnail: data.thumbnail_url });
      }
    }

    // Fallback: old oEmbed endpoint
    const fallbackUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: { 'Accept': 'application/json' },
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
