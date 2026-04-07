import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/auth';
import { jsonResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Only JPEG, PNG, WebP, and GIF images are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('Image must be less than 5MB');
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `product-${timestamp}-${random}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/products/${filename}`;

    return jsonResponse({ url, filename }, 201);
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse('Failed to upload file', 500);
  }
}
