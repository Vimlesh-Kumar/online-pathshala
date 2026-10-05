/**
 * groq.service.js
 *
 * Thin client for Groq's chat completions API (OpenAI-compatible wire format).
 * Groq's free tier runs open models (Llama 3.3, etc.) with no billing —
 * generous rate limits, but genuinely $0 cost — which is why it backs the
 * "real AI" support features instead of a paid provider like OpenAI/Claude.
 *
 * Every caller in aiSupport.service.js MUST check isConfigured() first and
 * fall back to the rule-based logic already in this codebase when it's
 * false, or when a call throws (missing key, rate limit, network error).
 * That fallback is what keeps the AI support feature always-available even
 * with zero external configuration.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Llama 3.3 70B is Groq's strongest free-tier model as of writing; overridable
// via env in case a model gets deprecated without needing a code change.
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Whether a Groq API key is present in the environment.
 * Callers use this to decide between the real AI path and the rule-based fallback.
 */
export const isConfigured = () => Boolean(process.env.GROQ_API_KEY);

/**
 * Send a chat-completion request to Groq and return the reply text.
 *
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages - chat history, system prompt first
 * @param {{temperature?: number, maxTokens?: number, json?: boolean}} [options]
 * @returns {Promise<string>} the assistant's reply (raw JSON string when options.json is true)
 * @throws when the key is missing, the request fails, or Groq returns a non-2xx status
 */
export const chatComplete = async (messages, options = {}) => {
    if (!isConfigured()) {
        throw new Error('GROQ_API_KEY is not configured.');
    }

    const body = {
        model: DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 500
    };
    if (options.json) {
        body.response_format = { type: 'json_object' };
    }

    // Groq calls that hang would otherwise block the request indefinitely —
    // abort after 12s so the caller's rule-based fallback still runs in time.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    let response;
    try {
        response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Groq API error ${response.status}: ${errorBody.slice(0, 300)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('Groq returned an empty response.');
    return text;
};

/**
 * Stream a chat completion from Groq, yielding text deltas as they arrive.
 *
 * Only the wait for the first response is bounded by the 12s timeout — once
 * tokens are flowing a long answer is allowed to finish. An `abortSignal`
 * (e.g. the learner closing the tab) stops the upstream request too, so an
 * abandoned answer stops spending the free-tier quota.
 *
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {{temperature?: number, maxTokens?: number, abortSignal?: AbortSignal}} [options]
 * @returns {AsyncGenerator<string>}
 * @throws before the first delta when the key is missing or Groq rejects the request
 */
export async function* chatStream(messages, options = {}) {
    if (!isConfigured()) {
        throw new Error('GROQ_API_KEY is not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const onCallerAbort = () => controller.abort();
    options.abortSignal?.addEventListener('abort', onCallerAbort);

    try {
        let response;
        try {
            response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: DEFAULT_MODEL,
                    messages,
                    temperature: options.temperature ?? 0.4,
                    max_tokens: options.maxTokens ?? 700,
                    stream: true
                }),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(`Groq API error ${response.status}: ${errorBody.slice(0, 300)}`);
        }

        // Groq streams OpenAI-style server-sent events: `data: {json}` lines,
        // terminated by `data: [DONE]`. A network chunk can end mid-line, so
        // the trailing partial line is carried over to the next chunk.
        const decoder = new TextDecoder();
        let buffered = '';
        for await (const chunk of response.body) {
            buffered += decoder.decode(chunk, { stream: true });
            const lines = buffered.split('\n');
            buffered = lines.pop();

            for (const line of lines) {
                const payload = line.trim();
                if (!payload.startsWith('data:')) continue;
                const data = payload.slice(5).trim();
                if (data === '[DONE]') return;

                let parsed;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    continue;
                }
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) yield delta;
            }
        }
    } finally {
        options.abortSignal?.removeEventListener('abort', onCallerAbort);
    }
}
