import { db } from '@/lib/db';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

// All fields the storefront can read
const PUBLIC_FIELDS = [
  'facebookUrl', 'instagramUrl', 'tiktokUrl', 'twitterUrl', 'youtubeUrl',
  'whatsappNumber', 'whatsappMessage',
  'phoneNumber', 'supportEmail', 'contactEmail', 'careersEmail',
  'storeName', 'storeTagline', 'storeAddress', 'storeAddressShort',
  'businessHours', 'copyrightText', 'announcementMessage',
  'freeShippingThreshold', 'shippingCostDomestic', 'shippingCostExpress',
  'domesticDeliveryDays', 'internationalDeliveryDays', 'freeShippingInternational',
  'returnWindowDays', 'refundDaysJazzCash', 'refundDaysBank',
] as const;

type PublicField = (typeof PUBLIC_FIELDS)[number];

function extractPublic(settings: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const key of PUBLIC_FIELDS) {
    out[key] = (settings[key] as string) || '';
  }
  return out;
}

// GET /api/settings — Public read (no auth needed)
export async function GET() {
  try {
    let settings = await db.siteSettings.findUnique({ where: { id: 'main' } });
    if (!settings) {
      settings = await db.siteSettings.create({ data: { id: 'main' } });
    }
    return new Response(JSON.stringify(extractPublic(settings as unknown as Record<string, unknown>)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse('Failed to fetch settings', 500);
  }
}
