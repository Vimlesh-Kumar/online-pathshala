# Valkey 9.1.0 & Azure Key Vault Integration Guide

This guide explains how to set up **Valkey** (Redis-compatible cache via Aiven) with **Azure Key Vault** for secure secret management in the Online Pathshala backend.

---

## 📋 Prerequisites

- Node.js >= 20
- An Aiven account (free tier available at https://aiven.io)
- An Azure subscription (for Key Vault)
- Azure CLI or Azure Portal access

---

## 🔧 Setup Steps

### Step 1: Create Valkey Service on Aiven

1. **Login to Aiven Console**
   - Visit: https://console.aiven.io/account/a5a1a31ae867/project/vimlesh11072000-5930/services/vim-kv-dev/overview
   - Your service name: `vim-kv-dev`

2. **Get Connection Details**
   - In the Aiven dashboard, find your Valkey service details:
     - **Host**: `vim-kv-dev-vimlesh11072000-5930.a.aivencloud.com`
     - **Port**: `23627` (or as shown in your service)
     - **Password**: Copy from "Authentication" section

3. **Update `.env` with Valkey Credentials**
   ```bash
   VALKEY_HOST=vim-kv-dev-vimlesh11072000-5930.a.aivencloud.com
   VALKEY_PORT=23627
   VALKEY_PASSWORD=your_actual_password_here
   ```

4. **Test Local Connection**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Watch for: `✅ Valkey cache connected to ...`

---

### Step 2: Set Up Azure Key Vault (Optional but Recommended)

#### Option A: Using Azure Portal

1. **Create a Key Vault**
   - Go to Azure Portal → "Key vaults" → "Create"
   - Fill in:
     - **Resource group**: Create new or use existing
     - **Key vault name**: `online-pathshala-kv` (must be globally unique)
     - **Region**: Same as your other Azure resources
   - Click "Review + Create"

2. **Add Secrets to Key Vault**
   - Open your Key Vault
   - Go to "Secrets" → "Generate/Import"
   - Add secret: `valkey-password`
     - **Value**: Paste your Aiven Valkey password
   - Add secret: `db-password` (optional)
     - **Value**: Your database password
   - Click "Create"

3. **Get the Key Vault URL**
   - On the Key Vault overview page, copy the **Vault URI**
   - Example: `https://online-pathshala-kv.vault.azure.net/`

#### Option B: Using Azure CLI

```bash
# Create Key Vault
az keyvault create \
  --resource-group my-resource-group \
  --name online-pathshala-kv \
  --location eastus

# Add secrets
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name valkey-password \
  --value "your-aiven-password"

az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name db-password \
  --value "your-database-password"

# Get Vault URI
az keyvault show --name online-pathshala-kv --query properties.vaultUri
```

---

### Step 3: Configure Azure Credentials

#### For Local Development (Service Principal)

1. **Create a Service Principal**
   ```bash
   az ad sp create-for-rbac --name "online-pathshala-sp" \
     --role "Key Vault Secrets User" \
     --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.KeyVault/vaults/online-pathshala-kv
   ```

2. **Save the Output**
   - Copy the returned `appId`, `password`, and `tenant`

3. **Update `.env`**
   ```bash
   AZURE_KEYVAULT_ENABLED=true
   AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/
   AZURE_CLIENT_ID=your-app-id
   AZURE_CLIENT_SECRET=your-password
   AZURE_TENANT_ID=your-tenant-id
   VALKEY_SECRET_NAME=valkey-password
   ```

4. **Test the Connection**
   ```bash
   npm run dev
   ```
   Watch for: `✅ Azure Key Vault client initialized` and `🔑 Secret 'valkey-password' fetched from Azure Key Vault`

#### For Production (Managed Identity)

1. **Enable Managed Identity on Your App Service**
   - In Azure Portal: App Service → Identity → System assigned → Toggle ON

2. **Grant Permissions**
   ```bash
   az keyvault set-policy \
     --name online-pathshala-kv \
     --object-id <managed-identity-principal-id> \
     --secret-permissions get list
   ```

3. **Update `.env` (Only Vault URL Needed)**
   ```bash
   AZURE_KEYVAULT_ENABLED=true
   AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/
   VALKEY_SECRET_NAME=valkey-password
   ```

---

## 🚀 Usage in Your Backend Code

### Using the Cache Service

```javascript
import cacheService from './utils/cache.service.js';

// Set a value (with optional TTL in seconds)
await cacheService.set('user:123', { id: 123, name: 'John' }, 3600);

// Get a value
const user = await cacheService.get('user:123');

// Set multiple values
await cacheService.mset({
  'key1': 'value1',
  'key2': 'value2'
});

// Get multiple values
const values = await cacheService.mget(['key1', 'key2']);

// Delete a key
await cacheService.del('user:123');

// Check connection status
if (cacheService.isConnected()) {
  console.log('Cache is ready!');
}
```

### Using Key Vault Service

```javascript
import keyVaultService from './utils/keyVault.service.js';

// Get a secret (automatically cached)
const dbPassword = await keyVaultService.getSecret('db-password');

// Clear cache for a specific secret
keyVaultService.clearCache('db-password');

// Clear all cached secrets
keyVaultService.clearCache();
```

---

## 📊 Deployment on Railway

### Step 1: Add Environment Variables

In your Railway project dashboard:

1. Go to **Variables** section
2. Add the following:
   ```
   VALKEY_HOST=vim-kv-dev-vimlesh11072000-5930.a.aivencloud.com
   VALKEY_PORT=23627
   VALKEY_PASSWORD=your-aiven-password
   AZURE_KEYVAULT_ENABLED=false  # or true if using Key Vault
   ```

3. If using Azure Key Vault:
   ```
   AZURE_KEYVAULT_ENABLED=true
   AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=your-tenant-id
   ```

### Step 2: Deploy

```bash
git add .
git commit -m "feat: add Valkey 9.1.0 with Azure Key Vault integration"
git push origin develop
```

Railway will automatically deploy with the new environment variables.

### Step 3: Verify Deployment

- Check Railway logs:
  ```
  ✅ Valkey cache connected to vim-kv-dev-vimlesh11072000-5930.a.aivencloud.com:23627
  ```
- Test with a request that uses the cache
- Monitor performance improvements!

---

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Keep `.env` in `.gitignore`
   - Use environment variables in production

2. **Rotate credentials regularly**
   - Update passwords in Aiven console
   - Update secrets in Azure Key Vault
   - Secrets are cached for performance—manual refresh may be needed

3. **Use Managed Identity in Production**
   - No hardcoded credentials in environment variables
   - Azure handles credential rotation automatically

4. **Enable Key Vault logging**
   - Monitor access to sensitive secrets
   - Audit trail for compliance

---

## 🐛 Troubleshooting

### Valkey Connection Failed
```
❌ Valkey connection error: ECONNREFUSED
```
- Check host and port in `.env`
- Ensure Aiven firewall allows your IP
- Verify password is correct

### Azure Key Vault Error
```
❌ Failed to initialize Azure Key Vault: ENOENT: no such file or directory
```
- Ensure Azure credentials are set in `.env`
- Check that the vault URL is correct (includes trailing `/`)
- Verify service principal has "Key Vault Secrets User" role

### Secret Not Found
```
❌ Secret 'valkey-password' not found in Azure Key Vault
```
- Verify secret exists in your Key Vault
- Check secret name spelling
- Ensure the service principal has access

---

## 📈 Performance Tips

1. **Use cache for frequently accessed data**
   - User sessions
   - Course catalogs
   - Search results

2. **Set appropriate TTLs**
   - Sessions: 24 hours
   - Catalog data: 7 days
   - Temporary data: 5-15 minutes

3. **Monitor cache hit rates**
   - Log cache operations
   - Optimize TTL based on usage patterns

---

## 📚 References

- [Valkey Documentation](https://valkey.io/)
- [Aiven Valkey Service](https://aiven.io/valkey)
- [Azure Key Vault Docs](https://learn.microsoft.com/en-us/azure/key-vault/)
- [DefaultAzureCredential](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential)

---

## ✅ Checklist

- [ ] Created Valkey service on Aiven
- [ ] Updated `.env` with Valkey credentials
- [ ] Tested local Valkey connection
- [ ] Created Azure Key Vault (optional)
- [ ] Added secrets to Key Vault (optional)
- [ ] Configured Azure credentials (optional)
- [ ] Deployed to Railway with environment variables
- [ ] Verified deployment logs
- [ ] Updated code to use cache service
- [ ] Added cache service to user sessions/routes
- [ ] Monitored performance improvements
