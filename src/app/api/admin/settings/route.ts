import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth';

const ALL_SETTINGS_KEYS = [
  'facebookUrl', 'instagramUrl', 'tiktokUrl', 'twitterUrl', 'youtubeUrl',
  'whatsappNumber', 'whatsappMessage',
  'phoneNumber', 'supportEmail', 'contactEmail', 'careersEmail',
  'storeName', 'storeTagline', 'storeAddress', 'storeAddressShort',
  'businessHours', 'copyrightText', 'announcementMessage',
  'freeShippingThreshold', 'shippingCostDomestic', 'shippingCostExpress',
  'domesticDeliveryDays', 'internationalDeliveryDays', 'freeShippingInternational',
  'returnWindowDays', 'refundDaysJazzCash', 'refundDaysBank',
] as const;

type SettingsKey = (typeof ALL_SETTINGS_KEYS)[number];

function buildUpdateData(body: Record<string, unknown>) {
  const data: Record<string, string> = {};
  for (const key of ALL_SETTINGS_KEYS) {
    if (key in body) {
      data[key] = String(body[key] ?? '');
    }
  }
  return data;
}

// GET /api/admin/settings — Read all settings (admin only)
export async function GET(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main' } });
    }

    const out: Record<string, string> = {};
    for (const key of ALL_SETTINGS_KEYS) {
      out[key] = (settings as unknown as Record<string, string>)[key] || '';
    }
    return jsonResponse(out);
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
    const updateData = buildUpdateData(body);

    const settings = await db.siteSettings.upsert({
      where: { id: 'main' },
      update: updateData,
      create: { id: 'main', ...updateData },
    });

    const out: Record<string, string> = {};
    for (const key of ALL_SETTINGS_KEYS) {
      out[key] = (settings as unknown as Record<string, string>)[key] || '';
    }
    return jsonResponse(out);
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
