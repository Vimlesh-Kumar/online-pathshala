import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

class KeyVaultService {
  #client = null;
  #secretCache = new Map();

  initialize() {
    const vaultUrl = process.env.AZURE_KEYVAULT_URL;

    if (!vaultUrl) {
      console.warn('⚠️  Azure Key Vault URL not set. Skipping Key Vault initialization.');
      return false;
    }

    try {
      const credential = new DefaultAzureCredential();
      this.#client = new SecretClient(vaultUrl, credential);
      console.log('✅ Azure Key Vault client initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Azure Key Vault:', error.message);
      return false;
    }
  }

  async getSecret(secretName) {
    if (!this.#client) {
      console.warn(`⚠️  Key Vault not initialized. Cannot fetch secret: ${secretName}`);
      return null;
    }

    try {
      // Check cache first
      if (this.#secretCache.has(secretName)) {
        console.log(`📦 Secret '${secretName}' retrieved from cache`);
        return this.#secretCache.get(secretName);
      }

      // Fetch from Key Vault
      const secret = await this.#client.getSecret(secretName);
      const secretValue = secret.value;

      // Cache the secret
      this.#secretCache.set(secretName, secretValue);
      console.log(`🔑 Secret '${secretName}' fetched from Azure Key Vault`);

      return secretValue;
    } catch (error) {
      if (error.code === 'SecretNotFound') {
        console.error(`❌ Secret '${secretName}' not found in Azure Key Vault`);
      } else {
        console.error(`❌ Error fetching secret '${secretName}':`, error.message);
      }
      return null;
    }
  }

  clearCache(secretName = null) {
    if (secretName) {
      this.#secretCache.delete(secretName);
      console.log(`🗑️  Cleared cache for secret: ${secretName}`);
    } else {
      this.#secretCache.clear();
      console.log('🗑️  Cleared all secrets from cache');
    }
  }
}

export default new KeyVaultService();
