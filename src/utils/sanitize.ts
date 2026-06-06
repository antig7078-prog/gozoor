/**
 * Safely sanitizes user input by stripping HTML tags to prevent XSS.
 */
export function sanitizeInput(val: string): string {
  if (!val) return '';
  // Strips HTML tags like <script>, <iframe>, etc.
  return val.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validates and sanitizes dynamic URLs to prevent javascript: or data: injection in href/src.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }
  return trimmed;
}
