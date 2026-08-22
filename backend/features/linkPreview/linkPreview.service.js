import { safeFetch, assertPublicUrl } from '../../utils/safeFetch.js';
import { cacheable } from '../../utils/cache.middleware.js';

/**
 * Turns a profile link into something worth looking at: the real name, avatar,
 * bio and follower counts behind a GitHub URL, or the title, description and
 * preview image behind a personal site.
 *
 * Two providers deliberately return metadata only:
 *   - LinkedIn serves an HTTP 999 to anything that is not a browser session.
 *   - X/Twitter puts profile pages behind a login wall.
 * Pretending otherwise would mean scraping around a block, so those links come
 * back marked `enriched: false` with the handle the UI can already derive.
 */

/** Previews are cached for six hours — profiles change slowly and GitHub allows only 60 anonymous calls an hour. */
const CACHE_TTL = 6 * 60 * 60;
/** Links accepted in one batch, matching the five profile fields plus headroom. */
export const MAX_URLS = 6;

const trim = (value, max) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/**
 * User-entered links routinely omit the scheme, so `https://` is assumed.
 * A link that already carries *any* scheme is left untouched — prepending to
 * `file:///etc/passwd` would turn it into a bogus host and it would be rejected
 * for the wrong reason, instead of by the protocol check where it belongs.
 */
export const normalizeUrl = (value) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    return /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
};

const PROVIDERS = [
    { id: 'github', label: 'GitHub', hosts: ['github.com', 'www.github.com'] },
    { id: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com', 'www.linkedin.com'] },
    { id: 'twitter', label: 'Twitter / X', hosts: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'] },
    { id: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'] }
];

export const detectProvider = (hostname) => {
    const host = hostname.toLowerCase();
    return PROVIDERS.find((provider) => provider.hosts.includes(host)) || { id: 'website', label: 'Website' };
};

/** The username or channel a profile URL points at. */
const handleFrom = (url) => {
    const segments = url.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last) return url.hostname.replace(/^www\./, '');
    return last.startsWith('@') ? last : `@${last}`;
};

/** Meta tags are written every which way, so match on the property/name value. */
const metaContent = (html, keys) => {
    for (const key of keys) {
        const pattern = new RegExp(
            `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
            'i'
        );
        const match = pattern.exec(html);
        if (match?.[1]) return match[1];

        // Same tag with the attributes in the other order.
        const reversed = new RegExp(
            `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
            'i'
        );
        const reverseMatch = reversed.exec(html);
        if (reverseMatch?.[1]) return reverseMatch[1];
    }
    return null;
};

const decodeEntities = (value) =>
    String(value ?? '')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&#x27;', "'");

/**
 * Open Graph / HTML metadata for any page. This is what powers the personal
 * website and YouTube previews — YouTube serves full OG tags for channels.
 */
const fetchPageMeta = async (url) => {
    const { body, contentType, url: finalUrl } = await safeFetch(url.toString());
    if (!contentType.includes('html') || !body) return null;

    const title = metaContent(body, ['og:title', 'twitter:title']) ||
        decodeEntities(/<title[^>]*>([^<]*)<\/title>/i.exec(body)?.[1] || '');
    const description = metaContent(body, ['og:description', 'twitter:description', 'description']);
    const image = metaContent(body, ['og:image:secure_url', 'og:image', 'twitter:image']);
    const siteName = metaContent(body, ['og:site_name']);

    if (!title && !description && !image) return null;

    return {
        title: trim(decodeEntities(title), 120) || null,
        description: trim(decodeEntities(description), 220) || null,
        // A relative og:image is legal; resolve it against the page it came from.
        image: image ? new URL(decodeEntities(image), finalUrl).toString() : null,
        siteName: trim(decodeEntities(siteName), 60) || null
    };
};

/**
 * Real profile data from GitHub's public API — no token needed, which is what
 * keeps this feature free like the rest of the app.
 */
const fetchGithub = async (url) => {
    const username = url.pathname.split('/').filter(Boolean)[0];
    if (!username) return null;

    const { status, body } = await safeFetch(
        `https://api.github.com/users/${encodeURIComponent(username)}`,
        { accept: 'application/vnd.github+json' }
    );
    if (status !== 200 || !body) return null;

    const data = JSON.parse(body);
    if (!data?.login) return null;

    return {
        title: data.name || data.login,
        handle: `@${data.login}`,
        description: trim(data.bio, 220) || null,
        image: data.avatar_url || null,
        stats: [
            { label: 'Repos', value: data.public_repos ?? 0 },
            { label: 'Followers', value: data.followers ?? 0 },
            { label: 'Following', value: data.following ?? 0 }
        ],
        details: [data.company, data.location].filter(Boolean).map((text) => trim(text, 60))
    };
};

/**
 * YouTube previews.
 *
 * Video and playlist links go through the public oEmbed endpoint, which needs
 * no key. Channel pages are a different story: youtube.com answers 404 to every
 * non-browser request, whatever user agent is sent, so a channel can only be
 * read through the official Data API. That needs YOUTUBE_API_KEY — without it a
 * channel link falls back to its handle rather than pretending to be a browser.
 */
const fetchYouTube = async (url) => {
    const isVideo = url.pathname === '/watch' || url.hostname === 'youtu.be' || url.pathname.startsWith('/playlist');

    if (isVideo) {
        const oembed = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url.toString())}`;
        const { status, body } = await safeFetch(oembed, { accept: 'application/json' });
        if (status !== 200 || !body) return null;

        const data = JSON.parse(body);
        return {
            title: trim(data.title, 120) || null,
            description: data.author_name ? `by ${trim(data.author_name, 80)}` : null,
            image: data.thumbnail_url || null
        };
    }

    if (!process.env.YOUTUBE_API_KEY) return null;

    // Channels are addressed three different ways depending on the URL's age.
    const segments = url.pathname.split('/').filter(Boolean);
    const handle = segments.find((segment) => segment.startsWith('@'));
    const byId = segments[0] === 'channel' ? segments[1] : null;
    const byName = segments[0] === 'c' || segments[0] === 'user' ? segments[1] : null;

    let selector = null;
    if (handle) selector = `forHandle=${encodeURIComponent(handle)}`;
    else if (byId) selector = `id=${encodeURIComponent(byId)}`;
    else if (byName) selector = `forUsername=${encodeURIComponent(byName)}`;
    if (!selector) return null;

    const api = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&${selector}&key=${process.env.YOUTUBE_API_KEY}`;
    const { status, body } = await safeFetch(api, { accept: 'application/json' });
    if (status !== 200 || !body) return null;

    const channel = JSON.parse(body)?.items?.[0];
    if (!channel) return null;

    return {
        title: trim(channel.snippet?.title, 120) || null,
        description: trim(channel.snippet?.description, 220) || null,
        image: channel.snippet?.thumbnails?.default?.url || null,
        stats: [
            { label: 'Subscribers', value: Number(channel.statistics?.subscriberCount) || 0 },
            { label: 'Videos', value: Number(channel.statistics?.videoCount) || 0 }
        ]
    };
};

/** Everything a preview returns, whether or not enrichment succeeded. */
const basePreview = (url, provider) => ({
    url: url.toString(),
    provider: provider.id,
    providerLabel: provider.label,
    handle: handleFrom(url),
    domain: url.hostname.replace(/^www\./, ''),
    // Favicons come straight from the browser, so no server fetch is involved.
    favicon: `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`,
    enriched: false,
    title: null,
    description: null,
    image: null,
    stats: [],
    details: [],
    note: null
});

const buildPreview = async (rawUrl) => {
    const url = await assertPublicUrl(normalizeUrl(rawUrl));
    const provider = detectProvider(url.hostname);
    const preview = basePreview(url, provider);

    if (provider.id === 'linkedin' || provider.id === 'twitter') {
        preview.note = `${provider.label} blocks automated profile reads, so only your handle is shown.`;
        return preview;
    }

    const readers = {
        github: fetchGithub,
        youtube: fetchYouTube,
        website: fetchPageMeta
    };

    try {
        const data = await (readers[provider.id] || fetchPageMeta)(url);
        if (!data) {
            preview.note = provider.id === 'youtube'
                ? 'YouTube only exposes channel details through its API — set YOUTUBE_API_KEY to show them.'
                : 'That link could not be read — the preview shows the address only.';
            return preview;
        }
        return { ...preview, ...data, enriched: true };
    } catch (error) {
        console.warn(`[linkPreview] ${url.hostname} could not be previewed:`, error.message);
        preview.note = 'That link could not be reached just now.';
        return preview;
    }
};

/**
 * Preview one link, cached by URL so repeat visits to the profile page cost
 * nothing and GitHub's anonymous rate limit is not burned through.
 */
export const previewUrl = async (rawUrl) => {
    const normalized = normalizeUrl(rawUrl);
    if (!normalized) return null;

    try {
        return await cacheable(
            `link-preview:${normalized.toLowerCase()}`,
            () => buildPreview(normalized),
            CACHE_TTL
        );
    } catch (error) {
        // An invalid or blocked URL is a normal outcome here, not a server fault.
        return { url: normalized, error: error.message, enriched: false };
    }
};

/** Preview several links at once — one round trip for the whole profile form. */
export const previewMany = async (urls) => {
    const unique = [...new Set(urls.map(normalizeUrl).filter(Boolean))].slice(0, MAX_URLS);
    const previews = await Promise.all(unique.map((url) => previewUrl(url)));
    return previews.filter(Boolean);
};
