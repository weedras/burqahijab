import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

// GET /api/settings — Public read (no auth needed)
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main' } });
    }
    return jsonResponse({
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      tiktokUrl: settings.tiktokUrl,
      twitterUrl: settings.twitterUrl,
      youtubeUrl: settings.youtubeUrl,
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}
