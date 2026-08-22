import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * HTTP fetch for URLs supplied by users.
 *
 * Fetching a user-controlled address from the server is a server-side request
 * forgery (SSRF) primitive: without checks, anyone could point a profile link at
 * `http://169.254.169.254/` (cloud metadata) or `http://localhost:3306` and use
 * this API to read internal services. Every request here is therefore restricted
 * to public IP addresses, standard ports, plain HTTP(S), a short timeout and a
 * capped body — and redirects are followed manually so each hop is re-checked.
 */

/** How long any single hop may take. */
const TIMEOUT_MS = 6000;
/** Bytes read before the response is abandoned — page metadata sits in the head. */
const MAX_BYTES = 256 * 1024;
/** Redirect hops allowed before giving up. */
const MAX_REDIRECTS = 3;

const USER_AGENT = 'OnlinePathshala-LinkPreview/1.0 (+profile link preview)';

const ipv4ToInt = (ip) =>
    ip.split('.').reduce((total, part) => (total << 8) + Number(part), 0) >>> 0;

/** Reserved IPv4 blocks that must never be reachable through this helper. */
const BLOCKED_V4 = [
    ['0.0.0.0', 8],          // "this" network
    ['10.0.0.0', 8],         // private
    ['100.64.0.0', 10],      // carrier-grade NAT
    ['127.0.0.0', 8],        // loopback
    ['169.254.0.0', 16],     // link-local, incl. cloud metadata
    ['172.16.0.0', 12],      // private
    ['192.0.0.0', 24],       // IETF protocol assignments
    ['192.168.0.0', 16],     // private
    ['198.18.0.0', 15],      // benchmarking
    ['224.0.0.0', 4],        // multicast
    ['240.0.0.0', 4]         // reserved
];

const isPrivateV4 = (ip) => {
    const value = ipv4ToInt(ip);
    return BLOCKED_V4.some(([base, bits]) => {
        const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
        return (value & mask) === (ipv4ToInt(base) & mask);
    });
};

const isPrivateV6 = (ip) => {
    const address = ip.toLowerCase().split('%')[0];
    if (address === '::' || address === '::1') return true;

    // IPv4-mapped (::ffff:10.0.0.1) is just IPv4 wearing a hat.
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(address);
    if (mapped) return isPrivateV4(mapped[1]);

    const head = Number.parseInt(address.split(':')[0] || '0', 16);
    if ((head & 0xfe00) === 0xfc00) return true;  // unique local  fc00::/7
    if ((head & 0xffc0) === 0xfe80) return true;  // link local    fe80::/10
    return false;
};

export const isPrivateAddress = (ip) => {
    const version = net.isIP(ip);
    if (version === 4) return isPrivateV4(ip);
    if (version === 6) return isPrivateV6(ip);
    return true;
};

/**
 * Validate a URL and confirm every address its host resolves to is public.
 *
 * Rejecting when *any* resolved address is private means a host that mixes
 * public and private records cannot be used to slip through.
 */
export const assertPublicUrl = async (rawUrl) => {
    let url;
    try {
        url = new URL(rawUrl);
    } catch {
        throw new Error('That does not look like a valid URL.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Only http and https links are supported.');
    }
    // A non-standard port is almost always an internal service.
    if (url.port && url.port !== '80' && url.port !== '443') {
        throw new Error('Only standard web ports are supported.');
    }

    // A literal IP host skips DNS entirely, so check it directly. `hostname`
    // keeps the brackets around IPv6 literals, which net.isIP does not accept.
    const literal = url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname;
    if (net.isIP(literal)) {
        if (isPrivateAddress(literal)) throw new Error('That address is not reachable.');
        return url;
    }

    let addresses;
    try {
        addresses = await dns.lookup(url.hostname, { all: true });
    } catch {
        throw new Error('That domain could not be resolved.');
    }

    if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) {
        throw new Error('That address is not reachable.');
    }
    return url;
};

/** Read at most MAX_BYTES of a response body, then stop. */
const readCapped = async (response) => {
    const reader = response.body?.getReader();
    if (!reader) return '';

    const decoder = new TextDecoder('utf-8');
    let text = '';
    let total = 0;

    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.length;
            text += decoder.decode(value, { stream: true });
            if (total >= MAX_BYTES) break;
        }
    } finally {
        // Abandoning a partly-read body must not leak the socket.
        await reader.cancel().catch(() => {});
    }
    return text;
};

/**
 * Fetch a user-supplied URL safely and return its text body.
 *
 * @param {string} rawUrl - the URL to fetch
 * @param {{accept?: string, hops?: number}} [options]
 * @returns {Promise<{url: string, status: number, contentType: string, body: string}>}
 */
export const safeFetch = async (rawUrl, options = {}) => {
    const { accept = 'text/html,application/xhtml+xml', hops = 0 } = options;

    const url = await assertPublicUrl(rawUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let response;
    try {
        response = await fetch(url, {
            // Manual redirects keep every hop under the same public-address check.
            redirect: 'manual',
            signal: controller.signal,
            headers: { 'User-Agent': USER_AGENT, Accept: accept }
        });
    } finally {
        clearTimeout(timer);
    }

    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || hops >= MAX_REDIRECTS) throw new Error('Too many redirects.');
        return safeFetch(new URL(location, url).toString(), { accept, hops: hops + 1 });
    }

    return {
        url: url.toString(),
        status: response.status,
        contentType: response.headers.get('content-type') || '',
        body: response.ok ? await readCapped(response) : ''
    };
};
