import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';
import sharp from 'sharp';

/** Map MIME types to safe file extensions */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided');
    }

    // Validate file type (MIME)
    const allowedTypes = Object.keys(MIME_TO_EXT);
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Only JPEG, PNG, WebP, and GIF images are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('Image must be less than 5MB');
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate actual image content using sharp (prevents MIME spoofing)
    try {
      await sharp(buffer).metadata();
    } catch {
      return errorResponse('Invalid image file. The content does not match the declared type.', 400);
    }

    // Derive extension from validated MIME type (not user filename)
    const ext = MIME_TO_EXT[file.type] || 'jpg';

    // Generate unique filename (no user-controlled parts)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `product-${timestamp}-${random}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/products/${filename}`;

    return jsonResponse({ url, filename }, 201);
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse('Failed to upload file', 500);
  }
}
