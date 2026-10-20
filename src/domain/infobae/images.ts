import { BASE_URL } from './urls';

export type ImageRef = {
  /** The original image URL. */
  url: string;
  /** Signed path of the site's image resizer. Add `width` and `height` to it. */
  resizeUrl?: string;
};

/**
 * A resized copy of an image from the site's resizer (checked 2026-10-19: both 240x160 and
 * 1080x720 answer 200). Falls back to the original when the API gives no resize path.
 */
export function resizedImageUrl(
  image: ImageRef | null,
  width: number,
  height: number,
): string | null {
  if (!image) return null;
  if (!image.resizeUrl) return image.url;
  return `${BASE_URL}${image.resizeUrl}&width=${width}&height=${height}`;
}
