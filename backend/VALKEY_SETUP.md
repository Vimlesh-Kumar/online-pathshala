# Valkey Cache Setup (Aiven)

The backend uses **Valkey** (a Redis-compatible cache) hosted on Aiven. Connection
details come from environment variables — see [SECRETS_SETUP.md](./SECRETS_SETUP.md)
for how configuration is loaded.

---

## Getting the connection details

In the [Aiven console](https://console.aiven.io), open your Valkey service and find
the **Connection information** panel on the Overview tab:

| Field | Example |
| --- | --- |
| Service URI | `rediss://default:<password>@vim-kv-dev-vimlesh11072000-5930.c.aivencloud.com:23705` |
| Host | `vim-kv-dev-vimlesh11072000-5930.c.aivencloud.com` |
| Port | `23705` |
| User | `default` |

Click the eye icon to reveal the password, or the copy icon on **Service URI** to get
everything in one string.

---

## Configuring it

Two equivalent forms — pick one.

### Service URI (recommended)

One value carries host, port, user, password and TLS:

```bash
VALKEY_URI=rediss://default:<password>@vim-kv-dev-vimlesh11072000-5930.c.aivencloud.com:23705
```

`rediss://` (two s's) means TLS. This is the string Aiven gives you, so there is
nothing to transcribe.

### Separate parts

```bash
VALKEY_HOST=vim-kv-dev-vimlesh11072000-5930.c.aivencloud.com
VALKEY_PORT=23705
VALKEY_USERNAME=default
VALKEY_PASSWORD=<password>
```

TLS is enabled automatically for any non-localhost host. Override with
`VALKEY_TLS=true|false` if you ever need to.

### Local Redis instead

```bash
VALKEY_HOST=localhost
VALKEY_PORT=6379
VALKEY_PASSWORD=
```

No TLS, no password. Start one with `redis-server` (`brew install redis` on macOS).

---

## Verifying

```bash
npm run cache:ping
```

This runs the real bootstrap, connects, and performs a `SET` / `GET` / `DEL` round
trip — so a pass means the cache genuinely works, not just that a socket opened.

On success you'll see:

```text
✅ Valkey connected to vim-kv-dev-...c.aivencloud.com:23705 (TLS)
✅ SET/GET/DEL round trip succeeded
✅ Valkey is working.
```

---

## TLS notes

Aiven presents a certificate for `*.c.aivencloud.com` signed by a publicly trusted CA,
so Node's default trust store validates it. **No CA certificate file is needed** for
Valkey. (That is separate from `DB_CA_CERT`, which some hosted MySQL providers do
require.)

---

## Using the cache in code

```javascript
import cacheService from './utils/cache.service.js';

// Values are JSON-stringified on write; parse them on read.
await cacheService.set('user:123', { id: 123, name: 'Asha' }, 3600); // TTL in seconds
const user = JSON.parse(await cacheService.get('user:123'));

await cacheService.del('user:123');

if (cacheService.isConnected()) {
  console.log('Cache is ready');
}
```

Higher-level helpers in `utils/cache.middleware.js` (`cacheable`, `cacheMiddleware`,
`courseCache`, `userCache`, `sessionCache`) handle the JSON round trip for you and are
usually the better entry point.

The cache degrades gracefully: when Valkey is unreachable, every method returns
`null`/`false` and the app falls through to the database rather than erroring.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `WRONGPASS invalid username-password pair` | Wrong password. Re-copy it from the Aiven console — the client gives up immediately rather than retrying. |
| `connect ECONNREFUSED` | Wrong host/port, or no local `redis-server` running. |
| `Valkey unreachable after 10 attempts` | Network or firewall blocking the connection. |
| `Invalid Valkey configuration` | `VALKEY_URI` is malformed — it must look like `rediss://default:<password>@<host>:<port>`. |
| Connects but nothing is cached | Check `cacheService.isConnected()`; writes are skipped while disconnected. |

---

## Rotating the password

1. Aiven console → your service → **Reset password**.
2. Update `VALKEY_URI` (or `VALKEY_PASSWORD`) wherever it is set — `.env.local`
   locally, the host's environment settings in deployment.
3. Restart the service and confirm with `npm run cache:ping`.

---

## Security

- Never commit real credentials. `.env` and `.env.local` are gitignored; only
  `*.example` files belong in git.
- In deployment, set the variables in the host's dashboard rather than shipping a file.
- A password that has ever been committed is compromised — reset it in Aiven, don't
  just delete the line.
