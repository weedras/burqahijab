import { NextRequest, NextResponse } from 'next/server';

/** Allowed domains for URL validation */
const ALLOWED_DOMAINS = [
  'youtube.com', 'youtu.be', 'instagram.com', 'www.instagram.com',
  'tiktok.com', 'www.tiktok.com', 'open.spotify.com',
];

/** Block private/internal IP ranges */
const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|0\.|169\.254|::1|0:0:0:0:0:0:0:1)/;

function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    if (PRIVATE_IP_REGEX.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function isAllowedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  // Validate URL is safe (not internal/private IP)
  if (!isValidExternalUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Direct video file (.mp4, .webm, .ogg) — only from allowed domains
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    if (!isAllowedDomain(url)) {
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 400 });
    }
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
    return NextResponse.json({ type: 'unresolvable', videoId: igMatch[1] });
  }

  // TikTok video
  const tkMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tkMatch) {
    return NextResponse.json({ type: 'unresolvable', videoId: tkMatch[1] });
  }

  // Reject unknown URLs (no open proxy)
  return NextResponse.json({ error: 'Unsupported video URL. Use YouTube, Instagram, or TikTok.' }, { status: 400 });
}

// ── Instagram video URL extraction ──────────────────────────────────────
async function resolveInstagramVideo(videoId: string): Promise<string | null> {
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
  const ogSecure = html.match(/property="og:video:secure_url"\s+content="([^"]+)"/);
  if (ogSecure) return ogSecure[1];

  const ogVideo = html.match(/property="og:video"\s+content="([^"]+)"/);
  if (ogVideo) return ogVideo[1];

  const videoUrl = html.match(/"video_url"\s*:\s*"([^"]+)"/);
  if (videoUrl) return videoUrl[1].replace(/\\u0026/g, '&');

  const videoVersions = html.match(
    /"video_versions"\s*:\s*\[.*?"url"\s*:\s*"([^"]+)"/s
  );
  if (videoVersions) return videoVersions[1].replace(/\\u0026/g, '&');

  const videoSrc = html.match(/<video[^>]*\bsrc="([^"]+)"/);
  if (videoSrc) return videoSrc[1];

  return null;
}
