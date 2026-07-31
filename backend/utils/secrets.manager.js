import keyVaultService from './keyVault.service.js';

/**
 * Secrets Manager: Fetch secrets from Key Vault (production) or env (local)
 * This provides a unified interface for secret management across environments
 */
class SecretsManager {
  #nodeEnv = process.env.NODE_ENV || 'development';
  #useKeyVault = this.#nodeEnv === 'production' && process.env.AZURE_KEYVAULT_ENABLED === 'true';
  #secretMappings = {
    // Authentication
    'jwtSecret': 'JWT_SECRET',
    'jwt-secret': 'JWT_SECRET',

    // Database
    'dbPassword': 'DB_PASSWORD',
    'db-password': 'DB_PASSWORD',
    'mysqlPassword': 'MYSQL_PASSWORD',

    // Cache
    'valkeyPassword': 'VALKEY_PASSWORD',
    'valkey-password': 'VALKEY_PASSWORD',
    'redisPassword': 'REDIS_PASSWORD',

    // Blob Storage
    'blobToken': 'BLOB_READ_WRITE_TOKEN',
    'blob-token': 'BLOB_READ_WRITE_TOKEN',

    // AI/LLM
    'groqApiKey': 'GROQ_API_KEY',
    'groq-api-key': 'GROQ_API_KEY',

    // Google
    'googleCredentials': 'GOOGLE_CREDENTIALS',
    'google-credentials': 'GOOGLE_CREDENTIALS',

    // Azure (if not using Managed Identity)
    'azureClientSecret': 'AZURE_CLIENT_SECRET',
    'azure-client-secret': 'AZURE_CLIENT_SECRET',
  };

  async getSecret(secretName) {
    if (this.#useKeyVault) {
      // Production: Fetch from Azure Key Vault
      return await keyVaultService.getSecret(secretName);
    } else {
      // Local: Fetch from environment variables
      const envVarName = this.#secretMappings[secretName] || secretName;
      const value = process.env[envVarName];

      if (!value) {
        console.warn(`⚠️  Secret '${secretName}' not found in environment (looking for: ${envVarName})`);
      }

      return value;
    }
  }

  async getSecrets(...secretNames) {
    const secrets = {};
    for (const name of secretNames) {
      secrets[name] = await this.getSecret(name);
    }
    return secrets;
  }

  isProduction() {
    return this.#nodeEnv === 'production';
  }

  isUsingKeyVault() {
    return this.#useKeyVault;
  }

  getEnvironment() {
    return this.#nodeEnv;
  }

  printConfiguration() {
    console.log('\n📋 Secrets Configuration:');
    console.log(`  Environment: ${this.#nodeEnv}`);
    console.log(`  Using Key Vault: ${this.#useKeyVault ? 'YES (production)' : 'NO (local)'}`);
    if (this.#useKeyVault) {
      console.log(`  Key Vault URL: ${process.env.AZURE_KEYVAULT_URL || 'Not configured'}`);
    }
    console.log('');
  }
}

export default new SecretsManager();
