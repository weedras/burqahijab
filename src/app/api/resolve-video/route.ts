import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  // Direct video file (.mp4, .webm, .ogg)
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return NextResponse.json({ type: 'direct', videoUrl: url, thumbnailUrl: '' });
  }

  // YouTube watch / short / embed / youtu.be
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/
  );
  if (ytMatch) {
    return NextResponse.json({
      type: 'youtube',
      videoId: ytMatch[1],
      thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    });
  }

  // Instagram reel or post — try to resolve to a direct video URL
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
  if (igMatch) {
    const resolvedUrl = await resolveInstagramVideo(igMatch[1]);
    if (resolvedUrl) {
      return NextResponse.json({ type: 'direct', videoUrl: resolvedUrl, thumbnailUrl: '' });
    }
    // Could not resolve — return so the frontend can show a clean fallback
    return NextResponse.json({ type: 'unresolvable', videoId: igMatch[1] });
  }

  // TikTok video
  const tkMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tkMatch) {
    return NextResponse.json({ type: 'unresolvable', videoId: tkMatch[1] });
  }

  // Treat anything else as a direct URL (might work, might not)
  return NextResponse.json({ type: 'direct', videoUrl: url, thumbnailUrl: '' });
}

// ── Instagram video URL extraction ──────────────────────────────────────
async function resolveInstagramVideo(videoId: string): Promise<string | null> {
  // Method 1: Fetch the reel page and extract from meta tags / embedded data
  try {
    const reelUrl = `https://www.instagram.com/reel/${videoId}/`;
    const response = await fetch(reelUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    if (response.ok) {
      const html = await response.text();
      const videoUrl = extractVideoUrlFromHtml(html);
      if (videoUrl) return videoUrl;
    }
  } catch {
    /* continue to next method */
  }

  // Method 2: Fetch the embed page (designed to be publicly embeddable)
  try {
    const embedUrl = `https://www.instagram.com/reel/${videoId}/embed/`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    if (response.ok) {
      const html = await response.text();
      const videoUrl = extractVideoUrlFromHtml(html);
      if (videoUrl) return videoUrl;
    }
  } catch {
    /* all methods failed */
  }

  return null;
}

/** Look for video URLs in HTML using multiple extraction strategies */
function extractVideoUrlFromHtml(html: string): string | null {
  // og:video:secure_url meta tag
  const ogSecure = html.match(/property="og:video:secure_url"\s+content="([^"]+)"/);
  if (ogSecure) return ogSecure[1];

  // og:video meta tag
  const ogVideo = html.match(/property="og:video"\s+content="([^"]+)"/);
  if (ogVideo) return ogVideo[1];

  // "video_url" field in Instagram's JSON data
  const videoUrl = html.match(/"video_url"\s*:\s*"([^"]+)"/);
  if (videoUrl) return videoUrl[1].replace(/\\u0026/g, '&');

  // video_versions array
  const videoVersions = html.match(
    /"video_versions"\s*:\s*\[.*?"url"\s*:\s*"([^"]+)"/s
  );
  if (videoVersions) return videoVersions[1].replace(/\\u0026/g, '&');

  // Literal <video src="...">
  const videoSrc = html.match(/<video[^>]*\bsrc="([^"]+)"/);
  if (videoSrc) return videoSrc[1];

  return null;
}
