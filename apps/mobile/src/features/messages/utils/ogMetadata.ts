export interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  domain: string;
  favicon?: string;
  url: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

/**
 * Extract the first URL from a text string.
 */
export function extractUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match?.[0] ?? null;
}

/**
 * Fetch Open Graph metadata from a URL.
 * Falls back gracefully if parsing fails.
 */
export async function fetchOGMetadata(url: string): Promise<OGMetadata | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AHub/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const html = await response.text();
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');

    const title = extractMeta(html, 'og:title') ?? extractTitle(html);
    const description = extractMeta(html, 'og:description') ?? extractMeta(html, 'description');
    const image = extractMeta(html, 'og:image');
    const favicon = `https://${parsed.hostname}/favicon.ico`;

    if (!title && !description && !image) return null;

    return {
      title: title?.slice(0, 120),
      description: description?.slice(0, 200),
      image: image ? resolveUrl(image, url) : undefined,
      domain,
      favicon,
      url,
    };
  } catch {
    return null;
  }
}

function extractMeta(html: string, property: string): string | undefined {
  // Try og: and name= meta tags
  const ogRegex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const match = html.match(ogRegex);
  if (match?.[1]) return decodeHtmlEntities(match[1]);

  // Also try content before property (some sites order differently)
  const reverseRegex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    'i'
  );
  const reverseMatch = html.match(reverseRegex);
  return reverseMatch?.[1] ? decodeHtmlEntities(reverseMatch[1]) : undefined;
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeHtmlEntities(match[1].trim()) : undefined;
}

function resolveUrl(url: string, base: string): string {
  if (url.startsWith('http')) return url;
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
