import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/settings — Read settings (admin only)
export async function GET(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

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

// PUT /api/admin/settings — Update settings (admin only)
export async function PUT(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();

    const settings = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: {
        facebookUrl: body.facebookUrl ?? '',
        instagramUrl: body.instagramUrl ?? '',
        tiktokUrl: body.tiktokUrl ?? '',
        twitterUrl: body.twitterUrl ?? '',
        youtubeUrl: body.youtubeUrl ?? '',
        whatsappNumber: body.whatsappNumber ?? '',
        whatsappMessage: body.whatsappMessage ?? '',
      },
      create: {
        id: 'main',
        facebookUrl: body.facebookUrl ?? '',
        instagramUrl: body.instagramUrl ?? '',
        tiktokUrl: body.tiktokUrl ?? '',
        twitterUrl: body.twitterUrl ?? '',
        youtubeUrl: body.youtubeUrl ?? '',
        whatsappNumber: body.whatsappNumber ?? '',
        whatsappMessage: body.whatsappMessage ?? '',
      },
    });

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
    console.error('Error updating settings:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
