import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile } from '@/lib/services/storage';
import { updateBusinessLogo } from '@/lib/settings/actions';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// Validate actual file content via magic bytes (don't trust client MIME type alone)
function validateImageMagicBytes(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg';
  }
  // WebP: RIFF....WEBP
  if (buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp';
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 20 uploads per minute per user
  const rateLimitResult = checkRateLimit(`upload:${session.user.id}`, { limit: 20, windowMs: 60000 });
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const purpose = formData.get('purpose') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, WebP' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate actual file content matches claimed MIME type (prevents disguised uploads)
    const detectedType = validateImageMagicBytes(buffer);
    if (!detectedType) {
      return NextResponse.json(
        { error: 'File content does not match a valid image format' },
        { status: 400 }
      );
    }

    // Derive extension from validated MIME type, not user-provided filename
    const MIME_TO_EXT: Record<string, string> = {
      'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp',
    };
    const ext = MIME_TO_EXT[detectedType] || 'png';
    const timestamp = Date.now();
    const filename = `${timestamp}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const folder = purpose === 'logo' ? 'logos' : 'uploads';

    const result = await uploadFile(buffer, {
      filename,
      folder,
      contentType: file.type,
      isPublic: true,
    });

    // If this is a logo upload, also persist the URL to the business profile
    if (purpose === 'logo') {
      await updateBusinessLogo(result.url);
    }

    return NextResponse.json({
      url: result.url,
      key: result.key,
      size: result.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
