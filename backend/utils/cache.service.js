import { createClient } from 'redis';
import { isUsable } from '../config/secrets.registry.js';

/**
 * Valkey (Redis-compatible) cache client, targeting Aiven in deployed environments.
 *
 * Credentials are read straight from process.env: by the time this module is
 * imported, `bootstrapSecrets()` has already populated VALKEY_* from either
 * Azure Key Vault or the local .env file. This service no longer talks to
 * Key Vault itself.
 */
class CacheService {
  #client = null;
  #isConnected = false;
  #lastError = null;
  #isAuthFailure = false;

  /** Aiven (and every hosted provider) terminates TLS; plain localhost does not. */
  #resolveTls(host) {
    if (process.env.VALKEY_TLS === 'true') return true;
    if (process.env.VALKEY_TLS === 'false') return false;
    return host !== 'localhost' && host !== '127.0.0.1';
  }

  /**
   * node-redis surfaces connection failures as AggregateError, whose own `message`
   * is empty — the useful detail sits in `.errors`. Unwrap it so the log is actionable.
   */
  #describe(error) {
    if (error?.errors?.length) {
      const causes = [...new Set(error.errors.map((e) => e?.message || String(e)))];
      return causes.join('; ');
    }
    return error?.message || String(error);
  }

  /**
   * Build the node-redis options from either VALKEY_URI (the Aiven "Service URI")
   * or the individual VALKEY_* parts. Returns { options, host, port, tls } so the
   * caller can log where it is connecting without re-parsing.
   */
  #buildClientOptions() {
    // Retry a bounded number of times instead of reconnecting forever — but give up
    // at once on a rejected credential, which no amount of retrying will fix.
    const reconnectStrategy = (retries) => {
      if (this.#isAuthFailure) return new Error('Valkey rejected the credentials');
      return retries > 10 ? new Error('Valkey unreachable after 10 attempts') : Math.min(retries * 100, 3000);
    };

    const uri = process.env.VALKEY_URI;
    if (isUsable(uri)) {
      // `rediss://` already encodes TLS, credentials, host and port.
      const parsed = new URL(uri);
      return {
        options: { url: uri, socket: { connectTimeout: 10_000, reconnectStrategy } },
        host: parsed.hostname,
        port: Number(parsed.port),
        tls: parsed.protocol === 'rediss:',
      };
    }

    const host = process.env.VALKEY_HOST;
    const port = Number.parseInt(process.env.VALKEY_PORT || '6379', 10);
    const username = process.env.VALKEY_USERNAME;
    const password = process.env.VALKEY_PASSWORD;
    const tls = this.#resolveTls(host);

    return {
      options: {
        socket: { host, port, tls, connectTimeout: 10_000, reconnectStrategy },
        // Aiven's user is `default`; omitting it makes node-redis send a plain
        // AUTH <password>, which authenticates as `default` anyway.
        ...(isUsable(username) && { username }),
        ...(isUsable(password) && { password }),
      },
      host,
      port,
      tls,
    };
  }

  async initialize() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    let config;

    try {
      config = this.#buildClientOptions();
    } catch (error) {
      console.error(`❌ Invalid Valkey configuration: ${error.message}`);
      console.error('   💡 VALKEY_URI must look like rediss://default:<password>@<host>:<port>');
      return false;
    }

    const { options, host, port, tls } = config;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';

    // A remote host with no credentials at all can never authenticate — don't try.
    if (!isLocalHost && !options.url && !isUsable(options.password)) {
      console.warn(`⏭️  Skipping Valkey: ${host} needs a password but VALKEY_PASSWORD is not set`);
      console.warn('   💡 Set VALKEY_URI or VALKEY_PASSWORD in .env.local, or add it to Key Vault');
      return false;
    }

    try {
      this.#client = createClient(options);

      this.#client.on('ready', () => {
        this.#isConnected = true;
        this.#lastError = null;
        this.#isAuthFailure = false;
        console.log(`✅ Valkey connected to ${host}:${port}${tls ? ' (TLS)' : ''}`);
      });

      // Reconnect attempts re-emit the same failure; only log each distinct one once.
      this.#client.on('error', (err) => {
        this.#isConnected = false;
        const description = this.#describe(err);

        if (/WRONGPASS|NOAUTH|invalid username-password/i.test(description)) {
          this.#isAuthFailure = true;
        }

        if (description === this.#lastError) return;
        this.#lastError = description;
        console.error(`❌ Valkey error: ${description}`);

        if (this.#isAuthFailure) {
          console.error('   💡 Check VALKEY_URI / VALKEY_PASSWORD against the Aiven console');
        }
      });

      this.#client.on('end', () => {
        this.#isConnected = false;
      });

      await this.#client.connect();
      return true;
    } catch (error) {
      this.#isConnected = false;
      this.#client = null;
      const message = this.#describe(error);

      if (nodeEnv === 'production') {
        console.error(`❌ Failed to initialize Valkey: ${message}`);
      } else {
        console.log(`⏭️  Valkey not available (local development): ${message}`);
        // The credential hint was already printed by the error handler; suggesting a
        // local server here would just be wrong advice.
        if (!this.#isAuthFailure) {
          console.log('   💡 Run a local one with `redis-server`, or point VALKEY_HOST at Aiven');
        }
      }
      return false;
    }
  }

  isConnected() {
    return this.#isConnected;
  }

  /** Returns the raw stored string; callers JSON.parse it. */
  async get(key) {
    if (!this.#isConnected) return null;
    try {
      return await this.#client.get(key);
    } catch (error) {
      console.error(`❌ Error getting key '${key}':`, error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = null) {
    if (!this.#isConnected) return false;
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await this.#client.setEx(key, ttlSeconds, payload);
      } else {
        await this.#client.set(key, payload);
      }
      return true;
    } catch (error) {
      console.error(`❌ Error setting key '${key}':`, error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.#isConnected) return false;
    try {
      await this.#client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting key '${key}':`, error.message);
      return false;
    }
  }

  async mget(keys) {
    if (!this.#isConnected) return [];
    try {
      return await this.#client.mGet(keys);
    } catch (error) {
      console.error('❌ Error getting multiple keys:', error.message);
      return [];
    }
  }

  async mset(keyValuePairs) {
    if (!this.#isConnected) return false;
    try {
      const flattened = Object.entries(keyValuePairs).flatMap(
        ([key, value]) => [key, JSON.stringify(value)]
      );
      await this.#client.mSet(flattened);
      return true;
    } catch (error) {
      console.error('❌ Error setting multiple keys:', error.message);
      return false;
    }
  }

  async flushAll() {
    if (!this.#isConnected) return false;
    try {
      await this.#client.flushAll();
      console.log('🗑️  Valkey cache flushed');
      return true;
    } catch (error) {
      console.error('❌ Error flushing cache:', error.message);
      return false;
    }
  }

  async close() {
    if (!this.#client) return;
    try {
      await this.#client.quit();
      console.log('🔌 Valkey connection closed');
    } catch {
      // Already disconnected — nothing to clean up.
    } finally {
      this.#isConnected = false;
      this.#client = null;
    }
  }
}

export default new CacheService();
