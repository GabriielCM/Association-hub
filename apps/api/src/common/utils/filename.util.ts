/**
 * Sanitizes uploaded filenames to prevent path traversal attacks and other security issues.
 * This utility removes dangerous characters and path components while preserving the file extension.
 */

const MAX_FILENAME_LENGTH = 255;
const SAFE_BASENAME_LENGTH = 200; // Leave room for timestamp prefix and extension

/**
 * Sanitizes a filename by removing path traversal sequences, control characters,
 * null bytes, and other potentially dangerous content.
 *
 * @param filename - The original filename from user upload
 * @returns A safe filename containing only the basename with extension
 *
 * @example
 * sanitizeFilename('../../etc/passwd') // returns 'etc-passwd'
 * sanitizeFilename('image.png/../../../config.json') // returns 'image.png-config.json'
 * sanitizeFilename('avatar.png') // returns 'avatar.png'
 * sanitizeFilename('my file (1).jpg') // returns 'my-file-1.jpg'
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'file';
  }

  // Normalize unicode to prevent unicode-based attacks (e.g., full-width characters)
  let sanitized = filename.normalize('NFD');

  // Remove null bytes and control characters (ASCII 0-31 and 127)
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');

  // Remove path traversal sequences
  // This handles: .., ../, ..\, /.., \.., and variations
  sanitized = sanitized.replace(/\.\.[/\\]?/g, '');
  sanitized = sanitized.replace(/[/\\]\.\./g, '');

  // Remove all remaining path separators (/, \)
  sanitized = sanitized.replace(/[/\\]/g, '-');

  // Remove other potentially dangerous characters
  // Keep: letters, numbers, dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '-');

  // Remove leading/trailing dots and hyphens (can cause issues on some filesystems)
  sanitized = sanitized.replace(/^[.-]+|[.-]+$/g, '');

  // Collapse multiple dots, hyphens, or underscores into single ones
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  sanitized = sanitized.replace(/-{2,}/g, '-');
  sanitized = sanitized.replace(/_{2,}/g, '_');

  // Ensure we have something left after sanitization
  if (!sanitized || sanitized.length === 0) {
    return 'file';
  }

  // Truncate to safe length while preserving extension
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const extension = getFileExtension(sanitized);
    const baseName = sanitized.substring(0, sanitized.length - extension.length);
    const truncatedBase = baseName.substring(0, SAFE_BASENAME_LENGTH);
    sanitized = truncatedBase + extension;
  }

  return sanitized;
}

/**
 * Safely extracts the file extension from a filename.
 * Always returns the extension with a leading dot, or empty string if no extension.
 *
 * @param filename - The filename to extract extension from
 * @returns The file extension including the dot (e.g., '.png'), or empty string
 *
 * @example
 * getFileExtension('image.png') // returns '.png'
 * getFileExtension('document.tar.gz') // returns '.gz'
 * getFileExtension('noextension') // returns ''
 * getFileExtension('') // returns ''
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  const lastDotIndex = filename.lastIndexOf('.');

  // No extension found, or dot is at the start (hidden file on Unix)
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return '';
  }

  // Extension is everything after the last dot
  const extension = filename.substring(lastDotIndex);

  // Validate extension doesn't contain path separators (double-check)
  if (extension.includes('/') || extension.includes('\\')) {
    return '';
  }

  return extension;
}
