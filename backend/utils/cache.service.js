import { createClient } from 'redis';
import keyVaultService from './keyVault.service.js';

class CacheService {
  #client = null;
  #isConnected = false;

  async initialize() {
    try {
      const host = process.env.VALKEY_HOST || 'localhost';
      const port = Number.parseInt(process.env.VALKEY_PORT || '6379', 10);

      // Fetch password from Azure Key Vault if configured
      let password = process.env.VALKEY_PASSWORD;
      if (!password && process.env.AZURE_KEYVAULT_ENABLED === 'true') {
        password = await keyVaultService.getSecret(process.env.VALKEY_SECRET_NAME || 'valkey-password');
      }

      this.#client = createClient({
        host,
        port,
        password: password || undefined,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
          connectTimeout: 10000,
        },
      });

      this.#client.on('connect', () => {
        this.#isConnected = true;
        console.log(`✅ Valkey cache connected to ${host}:${port}`);
      });

      this.#client.on('error', (err) => {
        console.error('❌ Valkey connection error:', err.message);
        this.#isConnected = false;
      });

      this.#client.on('end', () => {
        this.#isConnected = false;
        console.log('⚠️  Valkey connection closed');
      });

      await this.#client.connect();
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Valkey:', error.message);
      return false;
    }
  }

  isConnected() {
    return this.#isConnected;
  }

  async get(key) {
    if (!this.#client) return null;
    try {
      return await this.#client.get(key);
    } catch (error) {
      console.error(`❌ Error getting key '${key}':`, error.message);
      return null;
    }
  }

  async set(key, value, ttlSeconds = null) {
    if (!this.#client) return false;
    try {
      if (ttlSeconds) {
        await this.#client.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        await this.#client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error(`❌ Error setting key '${key}':`, error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.#client) return false;
    try {
      await this.#client.del(key);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting key '${key}':`, error.message);
      return false;
    }
  }

  async mget(keys) {
    if (!this.#client) return [];
    try {
      return await this.#client.mget(keys);
    } catch (error) {
      console.error('❌ Error getting multiple keys:', error.message);
      return [];
    }
  }

  async mset(keyValuePairs) {
    if (!this.#client) return false;
    try {
      const args = [];
      for (const [key, value] of Object.entries(keyValuePairs)) {
        args.push(key, JSON.stringify(value));
      }
      await this.#client.mset(...args);
      return true;
    } catch (error) {
      console.error('❌ Error setting multiple keys:', error.message);
      return false;
    }
  }

  async flushAll() {
    if (!this.#client) return false;
    try {
      await this.#client.flushall();
      console.log('🗑️  Valkey cache flushed');
      return true;
    } catch (error) {
      console.error('❌ Error flushing cache:', error.message);
      return false;
    }
  }

  async close() {
    if (this.#client) {
      try {
        await this.#client.disconnect();
        console.log('🔌 Valkey connection closed');
      } catch (error) {
        console.error('❌ Error closing Valkey:', error.message);
      }
    }
  }
}

export default new CacheService();
