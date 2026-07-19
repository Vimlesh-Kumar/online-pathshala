# Secrets Management Setup Guide

This guide explains how to manage secrets for **local development** (no Key Vault) and **production** (Azure Key Vault).

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Your Application                          │
├─────────────────────────────────────────────────────────────┤
│  SecretsManager (utils/secrets.manager.js)                  │
├─────────────────────────────────────────────────────────────┤
│   ↓ NODE_ENV = development         ↓ NODE_ENV = production │
│   └─→ Read from .env.local          └─→ Fetch from          │
│       (no Key Vault)                    Azure Key Vault     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 Local Development Setup (No Key Vault)

### Step 1: Create `.env.local`

Copy this file to `backend/.env.local` and fill in your local values:

```bash
# backend/.env.local
cat > .env.local << 'EOF'
# ─────────────────────────────────────────────────────────────
# Online Pathshala — Local Development Environment
# This file is for LOCAL development only. Never commit secrets!
# ─────────────────────────────────────────────────────────────

# Node Environment (must be "development" to skip Key Vault)
NODE_ENV=development

# Server Configuration
APP_PORT=8000
CORS_ORIGIN=http://localhost:3000

# ── Authentication ──
JWT_SECRET=local-dev-secret-change-me-in-production-12345678901234567890

# ── Local MySQL Database ──
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=NewPassword123
MYSQL_DATABASE=online_pathshala
DB_SOCKET_PATH=/tmp/mysql.sock

# ── Valkey Cache (Local - No Key Vault) ──
VALKEY_HOST=localhost
VALKEY_PORT=6379
VALKEY_PASSWORD=
# Leave empty if local Redis has no password

# ── Vercel Blob Storage ──
BLOB_STORE_ID=your_vercel_store_id
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here

# ── AI Support (Groq - Optional) ──
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# ── Google Drive (Optional) ──
# Either point to a local key file (backend/googlekey.json) or paste JSON here
# GOOGLE_CREDENTIALS={"type":"service_account", ...}
# GDRIVE_FOLDER_ID=your_drive_folder_id

# ── Azure Key Vault (Disabled for Local) ──
AZURE_KEYVAULT_ENABLED=false
# AZURE_KEYVAULT_URL=https://your-keyvault.vault.azure.net/
# AZURE_CLIENT_ID=your-client-id
# AZURE_CLIENT_SECRET=your-client-secret
# AZURE_TENANT_ID=your-tenant-id
EOF
```

### Step 2: Update `.gitignore`

Ensure these are in your `.gitignore`:

```bash
# Add to backend/.gitignore
.env
.env.local
.env.*.local
.env.production
```

### Step 3: Run Locally

```bash
cd backend
npm run dev
```

Watch for:
```
📄 Using environment variables for secrets (development mode)
```

---

## 🔐 Production Setup (Azure Key Vault)

### List of Secrets for Azure Key Vault

Create these secrets in your Azure Key Vault with the **exact names** below:

#### Authentication Secrets
| Secret Name | Value | Example |
|---|---|---|
| `jwt-secret` | Your JWT signing key (generate new one) | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `jwt-expiry` | JWT token expiry time | `24h` |

#### Database Secrets
| Secret Name | Value | Source |
|---|---|---|
| `db-password` | Aiven MySQL password | Your Aiven dashboard |
| `db-host` | Aiven MySQL host | `*.aivencloud.com` |
| `db-port` | Aiven MySQL port | `23704` (example) |
| `db-user` | Aiven MySQL user | `avnadmin` |
| `db-ca-cert` | Aiven CA certificate (if using SSL) | Download from Aiven |

#### Cache Secrets
| Secret Name | Value | Source |
|---|---|---|
| `valkey-password` | Aiven Valkey password | Your Aiven dashboard |
| `valkey-host` | Aiven Valkey host | `vim-kv-dev-*.a.aivencloud.com` |
| `valkey-port` | Aiven Valkey port | `23627` |

#### Storage Secrets
| Secret Name | Value | Source |
|---|---|---|
| `blob-store-id` | Vercel Blob Store ID | Vercel dashboard |
| `blob-token` | Vercel Blob Read/Write Token | Vercel dashboard |

#### AI/LLM Secrets
| Secret Name | Value | Source |
|---|---|---|
| `groq-api-key` | Groq API key (optional) | https://console.groq.com/keys |

#### Google Drive Secrets
| Secret Name | Value | Source |
|---|---|---|
| `google-credentials` | Google service account JSON | Google Cloud Console |
| `gdrive-folder-id` | Google Drive folder ID | Your Drive |

### Step 1: Add Secrets to Azure Key Vault

#### Using Azure Portal

1. Go to **Azure Portal** → **Key Vaults** → Your vault
2. Go to **Secrets** → **Generate/Import**
3. For each secret above:
   - **Name**: Use the exact name from the table
   - **Value**: Paste the secret value
   - Click **Create**

#### Using Azure CLI

```bash
# Example: Add JWT secret
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name jwt-secret \
  --value "$(node -e 'console.log(require("crypto").randomBytes(48).toString("hex"))')"

# Example: Add Valkey password
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name valkey-password \
  --value "your-aiven-valkey-password"

# Example: Add database password
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name db-password \
  --value "your-aiven-db-password"

# List all secrets
az keyvault secret list --vault-name online-pathshala-kv --query "[].name"
```

### Step 2: Update Production Environment Variables

In **Railway Dashboard** or your deployment platform:

```bash
# ONLY these in .env for production (rest come from Key Vault)
NODE_ENV=production
AZURE_KEYVAULT_ENABLED=true
AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/
CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Use Service Principal (if not using Managed Identity)
# AZURE_CLIENT_ID=your-client-id
# AZURE_CLIENT_SECRET=your-client-secret  ← ALSO add to Key Vault!
# AZURE_TENANT_ID=your-tenant-id
```

### Step 3: Configure Azure Authentication

#### Option A: Managed Identity (Recommended for Production)

```bash
# 1. Enable Managed Identity on Railway App/App Service
# 2. Grant permissions
az keyvault set-policy \
  --name online-pathshala-kv \
  --object-id <your-managed-identity-id> \
  --secret-permissions get list
```

#### Option B: Service Principal (for Local Testing)

```bash
# 1. Create Service Principal
az ad sp create-for-rbac --name "online-pathshala-sp" \
  --role "Key Vault Secrets User" \
  --scope /subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/online-pathshala-kv

# 2. Save the output (appId, password, tenant)

# 3. Add to .env.production or Railway env vars
AZURE_CLIENT_ID=<appId>
AZURE_CLIENT_SECRET=<password>
AZURE_TENANT_ID=<tenant>
```

---

## 🔄 Using Secrets in Your Code

### For All Environments (Local & Production)

```javascript
import secretsManager from './utils/secrets.manager.js';

// Single secret
const jwtSecret = await secretsManager.getSecret('jwt-secret');

// Multiple secrets
const { 'db-password': dbPass, 'valkey-password': valkeyPass } 
  = await secretsManager.getSecrets('db-password', 'valkey-password');

// Check if in production
if (secretsManager.isProduction()) {
  console.log('Running in production with Key Vault');
}

// Check environment
console.log(secretsManager.getEnvironment()); // "production" or "development"

// Print configuration (useful for debugging)
secretsManager.printConfiguration();
```

### Example: Initialize Database with Secret

```javascript
import secretsManager from './utils/secrets.manager.js';
import mysql from 'mysql2/promise';

async function initializeDatabase() {
  const dbPassword = await secretsManager.getSecret('db-password');
  const dbHost = await secretsManager.getSecret('db-host') || process.env.DB_HOST;
  
  const connection = await mysql.createConnection({
    host: dbHost,
    user: process.env.DB_USER,
    password: dbPassword,
    database: process.env.MYSQL_DATABASE,
  });

  return connection;
}
```

---

## 📊 Environment Comparison

| Aspect | Local Development | Production |
|--------|---|---|
| **File** | `.env.local` | Azure Key Vault |
| **NODE_ENV** | `development` | `production` |
| **Key Vault** | Disabled | Enabled |
| **Secret Source** | Environment variables | Azure Key Vault |
| **Refresh** | Restart server | Auto-cached by SecretsManager |
| **Security** | Development only | Managed by Azure |

---

## 🚀 Deployment Checklist

- [ ] Created `.env.local` for local development
- [ ] Added `.env.local` to `.gitignore`
- [ ] Created Azure Key Vault
- [ ] Added all secrets to Key Vault (see table above)
- [ ] Set up Service Principal or Managed Identity
- [ ] Tested locally with `npm run dev` (NODE_ENV=development)
- [ ] Set `NODE_ENV=production` in Railway
- [ ] Set `AZURE_KEYVAULT_ENABLED=true` in Railway
- [ ] Added Azure credentials to Railway (if using Service Principal)
- [ ] Deployed and verified logs show Key Vault initialization
- [ ] Monitored first requests to confirm secrets loaded correctly

---

## 🐛 Troubleshooting

### Local Development Issues

**Issue**: "Secret not found in environment"
```
⚠️  Secret 'jwt-secret' not found in environment (looking for: JWT_SECRET)
```
**Solution**: Add `JWT_SECRET=...` to your `.env.local` file

**Issue**: Server tries to connect to Key Vault locally
```
❌ Failed to initialize Azure Key Vault: ENOENT
```
**Solution**: Ensure `NODE_ENV=development` in `.env.local`

### Production Issues

**Issue**: "Key Vault authentication failed"
```
❌ Failed to initialize Azure Key Vault: AuthorizationPermissionMismatch
```
**Solution**: 
- Verify Service Principal has "Key Vault Secrets User" role
- Verify Managed Identity is enabled on the app

**Issue**: "Secret not found in Key Vault"
```
❌ Secret 'jwt-secret' not found in Azure Key Vault
```
**Solution**: Check secret name exactly matches in Key Vault (case-sensitive in some cases)

**Issue**: Secrets not refreshing
```
The cache might have an old value
```
**Solution**: 
- Clear cache: `keyVaultService.clearCache('secret-name')`
- For immediate refresh, restart the application

---

## 🔒 Security Best Practices

1. **Never commit secrets**
   ```bash
   echo ".env.local" >> .gitignore
   git rm --cached .env.local
   ```

2. **Rotate secrets regularly**
   - Change JWT secret quarterly
   - Rotate API keys annually
   - Update database passwords after migrations

3. **Use Managed Identity in production**
   - No hardcoded credentials in environment
   - Azure handles credential rotation

4. **Audit Key Vault access**
   ```bash
   # View who accessed secrets
   az monitor diagnostic-settings create \
     --name KeyVaultDiagnostics \
     --resource /subscriptions/{id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/online-pathshala-kv \
     --logs '[{"category":"AuditEvent","enabled":true}]' \
     --workspace /subscriptions/{id}/resourcegroups/{rg}/providers/microsoft.operationalinsights/workspaces/{ws}
   ```

5. **Use different secrets for different environments**
   - Local: Dummy/simple secrets
   - Staging: Real but isolated credentials
   - Production: Unique, strong secrets

---

## 📚 Quick Reference

### Local Development Command
```bash
# .env.local is automatically loaded
npm run dev
# Should show: 📄 Using environment variables for secrets (development mode)
```

### Production Deployment Command
```bash
# In Railway dashboard, set:
NODE_ENV=production
AZURE_KEYVAULT_ENABLED=true
AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/

# Then deploy:
git push origin develop
# Should show: 🔐 Using Azure Key Vault for secrets (production mode)
```

### Adding a New Secret

1. Add to Azure Key Vault:
   ```bash
   az keyvault secret set --vault-name online-pathshala-kv --name new-secret --value "value"
   ```

2. Use in code:
   ```javascript
   const secret = await secretsManager.getSecret('new-secret');
   ```

3. For local dev, add to `.env.local`:
   ```bash
   NEW_SECRET=local-value
   ```

---

## 📞 Support

- **Azure Key Vault Docs**: https://learn.microsoft.com/en-us/azure/key-vault/
- **Azure CLI Reference**: https://learn.microsoft.com/en-us/cli/azure/keyvault/
- **DefaultAzureCredential**: https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential

---

**Last Updated**: 2026-07-19
