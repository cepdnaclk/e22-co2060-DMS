/**
 * Converts a profile picture URL to an absolute URL that the browser can fetch.
 *
 * The backend stores the path as a relative URL like `/api/users/1/profile-picture`.
 * When used directly as <img src>, the browser resolves it against the FRONTEND origin
 * (e.g. localhost:5173 or vercel.app), which is wrong.
 *
 * This helper prepends the backend base URL for relative paths, leaving
 * blob://, data:, and already-absolute http(s):// URLs untouched.
 */
export function toAbsoluteAvatarUrl(url: string | undefined | null): string {
  if (!url) return '';
  // Already absolute — blob objects, data URIs, or a full http(s) URL
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  // Relative path → prepend the backend origin
  // VITE_API_BASE_URL is e.g. "https://dms-backend-api.azurewebsites.net/api"
  // We strip the trailing "/api" to get the root origin, then append the path.
  const backendBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/api\/?$/, '');
  return `${backendBase}${url}`;
}

/**
 * Resize + JPEG-compress an image File using the Canvas API.
 * Reduces a 10 MB wallpaper to ~100–300 KB before uploading.
 *
 * @param file    The original image file from an <input type="file">
 * @param maxPx   Maximum width OR height in pixels (default 1280)
 * @param quality JPEG quality 0–1 (default 0.82)
 */
export function compressImageFile(
  file: File,
  maxPx = 1280,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let { width, height } = img;

      // Scale down if larger than maxPx on either axis
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; } // fallback: upload original

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Failed to load image for compression'));
    };
    img.src = blobUrl;
  });
}
