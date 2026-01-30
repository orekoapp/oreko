import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

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
  const filePath = join(config.basePath || './uploads', key);

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
  const filePath = join(config.basePath || './uploads', key);
  return readFile(filePath);
}

// Delete file from local storage
async function deleteLocal(key: string): Promise<void> {
  const config = getStorageConfig();
  const filePath = join(config.basePath || './uploads', key);
  await unlink(filePath);
}

// S3 storage implementation (placeholder)
async function uploadS3(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  // Implementation would use @aws-sdk/client-s3
  throw new Error('S3 storage not implemented. Please install @aws-sdk/client-s3');
}

async function getS3(key: string): Promise<Buffer> {
  throw new Error('S3 storage not implemented');
}

async function deleteS3(key: string): Promise<void> {
  throw new Error('S3 storage not implemented');
}

// Cloudflare R2 implementation (placeholder)
async function uploadCloudflare(
  buffer: Buffer,
  options: UploadOptions
): Promise<UploadResult> {
  // Implementation would use @aws-sdk/client-s3 with Cloudflare endpoint
  throw new Error('Cloudflare R2 storage not implemented');
}

async function getCloudflare(key: string): Promise<Buffer> {
  throw new Error('Cloudflare R2 storage not implemented');
}

async function deleteCloudflare(key: string): Promise<void> {
  throw new Error('Cloudflare R2 storage not implemented');
}

// Main storage functions
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const config = getStorageConfig();
  const bufferData = Buffer.from(buffer);

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
