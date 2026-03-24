import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

// Validate that resolved path stays within base directory (prevents path traversal)
function assertSafePath(basePath: string, key: string): string {
  const resolvedBase = resolve(basePath);
  const resolvedPath = resolve(join(basePath, key));
  if (!resolvedPath.startsWith(resolvedBase + '/') && resolvedPath !== resolvedBase) {
    throw new Error('Invalid file path: path traversal detected');
  }
  return resolvedPath;
}

// Storage configuration
export interface StorageConfig {
  provider: 'local' | 's3' | 'cloudflare';
  basePath?: string; // For local storage
  bucket?: string; // For S3/Cloudflare
  region?: string;
  publicUrl?: string;
}

export interface UploadOptions {
  filename?: string;
  contentType?: string;
  folder?: string;
  isPublic?: boolean;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

// Get storage config from environment
function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as StorageConfig['provider'];

  return {
    provider,
    basePath: process.env.STORAGE_LOCAL_PATH || './uploads',
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION,
    publicUrl: process.env.STORAGE_PUBLIC_URL || '/uploads',
  };
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return ext ? `${timestamp}-${hash}.${ext}` : `${timestamp}-${hash}`;
}

// Local storage implementation
async function uploadLocal(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  const config = getStorageConfig();
  const filename = options.filename || generateFilename('upload');
  const folder = options.folder || 'files';
  const key = `${folder}/${filename}`;
  const filePath = assertSafePath(config.basePath || './uploads', key);

  // Ensure directory exists
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  // Write file
  await writeFile(filePath, buffer);

  return {
    key,
    url: `${config.publicUrl}/${key}`,
    size: buffer.length,
    contentType: options.contentType || 'application/octet-stream',
  };
}

// Get file from local storage
async function getLocal(key: string): Promise<Buffer> {
  const config = getStorageConfig();
  const filePath = assertSafePath(config.basePath || './uploads', key);
  return readFile(filePath);
}

// Delete file from local storage
async function deleteLocal(key: string): Promise<void> {
  const config = getStorageConfig();
  const filePath = assertSafePath(config.basePath || './uploads', key);
  await unlink(filePath);
}

// S3 storage implementation (stub — install @aws-sdk/client-s3 to enable)
async function uploadS3(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  throw new Error(
    'S3 storage requires @aws-sdk/client-s3. ' +
    'Install it with `pnpm add @aws-sdk/client-s3` and configure STORAGE_BUCKET, STORAGE_REGION, ' +
    'and AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) in your environment.'
  );
}

async function getS3(key: string): Promise<Buffer> {
  throw new Error(
    'S3 storage requires @aws-sdk/client-s3. See storage configuration docs for setup instructions.'
  );
}

async function deleteS3(key: string): Promise<void> {
  throw new Error(
    'S3 storage requires @aws-sdk/client-s3. See storage configuration docs for setup instructions.'
  );
}

// Cloudflare R2 implementation (stub — install @aws-sdk/client-s3 to enable)
async function uploadCloudflare(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  throw new Error(
    'Cloudflare R2 storage requires @aws-sdk/client-s3 with a Cloudflare endpoint. ' +
    'Install it with `pnpm add @aws-sdk/client-s3` and configure STORAGE_BUCKET, ' +
    'CLOUDFLARE_ACCOUNT_ID, and R2 credentials in your environment.'
  );
}

async function getCloudflare(key: string): Promise<Buffer> {
  throw new Error(
    'Cloudflare R2 storage requires @aws-sdk/client-s3. See storage configuration docs for setup instructions.'
  );
}

async function deleteCloudflare(key: string): Promise<void> {
  throw new Error(
    'Cloudflare R2 storage requires @aws-sdk/client-s3. See storage configuration docs for setup instructions.'
  );
}

// Bug #152: Maximum file size enforced at storage layer (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Bug #153: Allowed MIME types for uploads
const ALLOWED_CONTENT_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
  'application/pdf',
  'text/csv',
];

// Bug #151: Sanitize filenames to prevent special character issues
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_')            // Collapse multiple underscores
    .replace(/^\.+/, '')               // Remove leading dots
    .slice(0, 200);                    // Limit length
}

// Main storage functions
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const config = getStorageConfig();
  const bufferData = Buffer.from(buffer);

  // Bug #152: Enforce file size limit
  if (bufferData.length > MAX_FILE_SIZE) {
    throw new Error(`File size (${Math.round(bufferData.length / 1024 / 1024)}MB) exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Bug #153: Validate content type if provided
  if (options.contentType && !ALLOWED_CONTENT_TYPES.includes(options.contentType)) {
    throw new Error(`Content type '${options.contentType}' is not allowed`);
  }

  // Bug #151: Sanitize filename
  if (options.filename) {
    options = { ...options, filename: sanitizeFilename(options.filename) };
  }

  switch (config.provider) {
    case 'local':
      return uploadLocal(bufferData, options);
    case 's3':
      return uploadS3(bufferData, options);
    case 'cloudflare':
      return uploadCloudflare(bufferData, options);
    default:
      return uploadLocal(bufferData, options);
  }
}

export async function getFile(key: string): Promise<Buffer> {
  const config = getStorageConfig();

  switch (config.provider) {
    case 'local':
      return getLocal(key);
    case 's3':
      return getS3(key);
    case 'cloudflare':
      return getCloudflare(key);
    default:
      return getLocal(key);
  }
}

export async function deleteFile(key: string): Promise<void> {
  const config = getStorageConfig();

  switch (config.provider) {
    case 'local':
      return deleteLocal(key);
    case 's3':
      return deleteS3(key);
    case 'cloudflare':
      return deleteCloudflare(key);
    default:
      return deleteLocal(key);
  }
}

// Helper to get public URL for a file
export function getPublicUrl(key: string): string {
  const config = getStorageConfig();
  return `${config.publicUrl}/${key}`;
}

// Helper to upload from a File/Blob
export async function uploadFromFile(
  file: File | Blob,
  options: Omit<UploadOptions, 'contentType'> = {}
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'application/octet-stream';
  const filename = options.filename || (file instanceof File ? file.name : generateFilename('upload'));

  return uploadFile(buffer, {
    ...options,
    filename,
    contentType,
  });
}

// Helper to upload base64 encoded data
export async function uploadFromBase64(
  base64Data: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  return uploadFile(buffer, options);
}

// Specific upload helpers
export async function uploadLogo(
  buffer: Buffer | Uint8Array,
  filename: string
): Promise<UploadResult> {
  return uploadFile(buffer, {
    filename,
    folder: 'logos',
    isPublic: true,
    contentType: 'image/png',
  });
}

export async function uploadSignature(
  base64Data: string,
  quoteId: string
): Promise<UploadResult> {
  return uploadFromBase64(base64Data, {
    filename: `signature-${quoteId}-${Date.now()}.png`,
    folder: 'signatures',
    contentType: 'image/png',
  });
}

export async function uploadPdf(
  buffer: Buffer,
  filename: string
): Promise<UploadResult> {
  return uploadFile(buffer, {
    filename,
    folder: 'pdfs',
    contentType: 'application/pdf',
  });
}

export async function uploadAttachment(
  buffer: Buffer | Uint8Array,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  return uploadFile(buffer, {
    filename,
    folder: 'attachments',
    contentType,
  });
}
