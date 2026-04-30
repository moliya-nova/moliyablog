export {
  getImageUrl,
  getAvatarUrl,
  processBackgroundSettings,
  clearImageUrlCache,
  parseImagePath,
  createRelativePath,
  createCosUploadKey,
  invalidateCache,
} from './imagePath';

export type { ImageType, ImagePathInfo } from './imagePath';

// 统一图片文件校验规则
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): { valid: true } | { valid: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小不能超过 20MB' };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: '只支持 JPG、PNG 和 WebP 格式的图片' };
  }
  return { valid: true };
}