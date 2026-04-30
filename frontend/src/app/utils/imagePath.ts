const CDN_BASE_URL = 'https://cdn.moliya.love';

export type ImageType = 'images' | 'avatar';

export interface ImagePathInfo {
  type: ImageType;
  filename: string;
  relativePath: string;
}

const urlCache = new Map<string, { url: string; expiresAt: number }>();

const CACHE_DURATION = 3500 * 1000;

function normalizePath(path: string): string {
  if (!path) return '';

  path = path.trim();

  if (path.startsWith(CDN_BASE_URL + '/')) {
    const url = new URL(path);
    const key = url.pathname.substring(1);
    return '/' + key;
  }

  if (path.startsWith('/api/files/image/')) {
    return '/images/' + path.replace('/api/files/image/', '');
  }

  if (path.startsWith('/api/files/avatar/')) {
    return '/avatar/' + path.replace('/api/files/avatar/', '');
  }

  if (path.startsWith('/api/files/article/')) {
    return '/article/' + path.replace('/api/files/article/', '');
  }

  if (path.startsWith('images/') || path.startsWith('avatar/') || path.startsWith('article/')) {
    return '/' + path;
  }

  if (path.startsWith('/images/') || path.startsWith('/avatar/') || path.startsWith('/article/')) {
    return path;
  }

  return path;
}

function isStandardPath(path: string): boolean {
  return path.startsWith('/images/') || path.startsWith('/avatar/') || path.startsWith('/article/');
}

function isExternalUrl(path: string): boolean {
  if (!path.startsWith('http://') && !path.startsWith('https://')) {
    return false;
  }
  return !path.startsWith(CDN_BASE_URL);
}

function extractImageType(path: string): ImageType | null {
  if (path.startsWith('/images/')) {
    return 'images';
  }
  if (path.startsWith('/avatar/')) {
    return 'avatar';
  }
  if (path.startsWith('/article/')) {
    return 'images'; // articles use 'images' type for COS
  }
  return null;
}

function extractCosKey(path: string): string | null {
  const normalized = normalizePath(path);
  if (isStandardPath(normalized)) {
    return normalized.substring(1);
  }
  // Special handling for /article/ path
  if (normalized.startsWith('/article/')) {
    return 'article/' + normalized.replace('/article/', '');
  }
  return null;
}

export function parseImagePath(path: string | null | undefined): ImagePathInfo | null {
  if (!path) return null;
  
  const normalized = normalizePath(path);
  const type = extractImageType(normalized);
  
  if (!type) return null;
  
  const filename = normalized.replace(`/${type}/`, '');
  
  return {
    type,
    filename,
    relativePath: normalized,
  };
}

export async function getImageUrl(path: string | null | undefined): Promise<string> {
  if (!path) {
    return '';
  }

  if (isExternalUrl(path)) {
    return path;
  }

  const normalized = normalizePath(path);

  if (!isStandardPath(normalized)) {
    return path;
  }

  const now = Date.now();
  const cached = urlCache.get(normalized);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  const cosKey = extractCosKey(normalized);
  if (!cosKey) {
    return path;
  }

  // 直接返回CDN URL，不再调用后端签名接口
  const cdnUrl = `${CDN_BASE_URL}/${cosKey}`;
  urlCache.set(normalized, {
    url: cdnUrl,
    expiresAt: now + CACHE_DURATION,
  });
  return cdnUrl;
}

export async function getAvatarUrl(avatar: string | null | undefined): Promise<string> {
  return getImageUrl(avatar);
}

export function createRelativePath(type: ImageType, filename: string): string {
  const cleanFilename = filename.replace(/^\//, '');
  return `/${type}/${cleanFilename}`;
}

export function createCosUploadKey(type: ImageType, filename: string): string {
  const cleanFilename = filename.replace(/^\//, '');
  return `${type}/${cleanFilename}`;
}

export async function processBackgroundSettings(backgroundSettings: any): Promise<any> {
  if (backgroundSettings && backgroundSettings.imageUrl) {
    return {
      ...backgroundSettings,
      imageUrl: await getImageUrl(backgroundSettings.imageUrl)
    };
  }
  return backgroundSettings;
}

export function clearImageUrlCache(): void {
  urlCache.clear();
}

export function invalidateCache(path: string): void {
  const normalized = normalizePath(path);
  urlCache.delete(normalized);
}
