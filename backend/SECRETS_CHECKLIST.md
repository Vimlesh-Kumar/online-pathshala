# 🔐 Secrets Setup Checklist

## 📋 Quick Reference

### LOCAL DEVELOPMENT (No Key Vault Needed)

```bash
# 1. Copy template to local file
cp .env.local.example .env.local

# 2. Edit .env.local with your local values
# Essential fields:
#   - DB_PASSWORD (your local MySQL password)
#   - APP_PORT (default 8000)
#   - VALKEY_HOST & VALKEY_PORT (if using Redis)

# 3. Make sure KEY_VAULT is DISABLED
NODE_ENV=development
AZURE_KEYVAULT_ENABLED=false

# 4. Start server
npm run dev

# Expected output:
# ✅ Valkey cache connected to localhost:6379
# 📄 Using environment variables for secrets (development mode)
```

---

## 🔐 PRODUCTION DEPLOYMENT (Azure Key Vault)

### Secrets to Add in Azure Key Vault

| #  | Secret Name | Example Value | Get From |
|----|---|---|---|
| 1  | `jwt-secret` | `abc123def456...` (48-byte hex) | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| 2  | `valkey-password` | Aiven password | Aiven console → Valkey service |
| 3  | `db-password` | Aiven password | Aiven console → MySQL service |
| 4  | `blob-token` | `vercel_blob_rw_...` | Vercel dashboard → Storage |
| 5  | `groq-api-key` | (optional) | https://console.groq.com/keys |
| 6  | `google-credentials` | (optional) JSON | Google Cloud Console |

### Add Secrets to Azure Key Vault

```bash
# Quick command to add all secrets:

# 1. JWT Secret (REQUIRED)
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name jwt-secret \
  --value "$(node -e 'console.log(require(\"crypto\").randomBytes(48).toString(\"hex\"))')"

# 2. Valkey Password (REQUIRED)
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name valkey-password \
  --value "your-aiven-valkey-password"

# 3. Database Password (REQUIRED)
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name db-password \
  --value "your-aiven-mysql-password"

# 4. Blob Token (REQUIRED)
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name blob-token \
  --value "vercel_blob_rw_..."

# 5. Groq API Key (Optional)
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name groq-api-key \
  --value "your-groq-key"

# Verify all secrets added
az keyvault secret list --vault-name online-pathshala-kv --query "[].name"
```

### Environment Variables in Railway

Set these in **Railway Dashboard** → **Variables**:

```
NODE_ENV=production
AZURE_KEYVAULT_ENABLED=true
AZURE_KEYVAULT_URL=https://online-pathshala-kv.vault.azure.net/
CORS_ORIGIN=https://your-frontend.com
APP_PORT=8000

# If using Service Principal (not Managed Identity):
AZURE_CLIENT_ID=xxx
AZURE_CLIENT_SECRET=yyy
AZURE_TENANT_ID=zzz
```

### Verify Deployment

```bash
# In Railway logs, should see:
# 🔐 Using Azure Key Vault for secrets (production mode)
# ✅ Azure Key Vault client initialized
# 🔑 Secret 'jwt-secret' fetched from Azure Key Vault
# ✅ Valkey cache connected to vim-kv-dev-*.a.aivencloud.com:23627
```

---

## 🎯 Environment-Specific Setup

### LOCAL DEVELOPMENT

| Setting | Value |
|---------|-------|
| `.env.local` file | ✅ Use |
| `NODE_ENV` | `development` |
| `AZURE_KEYVAULT_ENABLED` | `false` |
| Secrets source | Environment variables |
| Database | Local MySQL (localhost) |
| Cache | Local Redis (localhost:6379) |

**Setup Command:**
```bash
cp .env.local.example .env.local
# Edit .env.local
npm run dev
```

---

### PRODUCTION (Railway)

| Setting | Value |
|---------|-------|
| `.env.local` file | ❌ Not used |
| `NODE_ENV` | `production` |
| `AZURE_KEYVAULT_ENABLED` | `true` |
| Secrets source | Azure Key Vault |
| Database | Aiven MySQL |
| Cache | Aiven Valkey |

**Setup Commands:**
```bash
# 1. Create Key Vault
az keyvault create --name online-pathshala-kv --resource-group mygroup

# 2. Add secrets (see table above)
az keyvault secret set --vault-name online-pathshala-kv --name jwt-secret --value "..."

# 3. Set Railway environment variables
# (via Railway Dashboard)

# 4. Deploy
git push origin develop
```

---

## ✅ Pre-Deployment Checklist

### LOCAL DEVELOPMENT
- [ ] Created `.env.local` from `.env.local.example`
- [ ] Added `.env.local` to `.gitignore`
- [ ] Set `NODE_ENV=development`
- [ ] Set `AZURE_KEYVAULT_ENABLED=false`
- [ ] Filled in local database credentials
- [ ] Filled in local cache credentials (if using Redis)
- [ ] Started server: `npm run dev`
- [ ] Verified logs: "Using environment variables for secrets"
- [ ] Tested API endpoints work

### PRODUCTION DEPLOYMENT
- [ ] Created Azure Key Vault
- [ ] Added JWT secret to Key Vault
- [ ] Added Valkey password to Key Vault
- [ ] Added database password to Key Vault
- [ ] Added Blob token to Key Vault
- [ ] Set up Service Principal OR Managed Identity
- [ ] Granted Key Vault permissions to SP/MI
- [ ] Set `NODE_ENV=production` in Railway
- [ ] Set `AZURE_KEYVAULT_ENABLED=true` in Railway
- [ ] Added `AZURE_KEYVAULT_URL` in Railway
- [ ] Added Azure credentials (if using Service Principal)
- [ ] Deployed to Railway
- [ ] Checked logs for successful Key Vault initialization
- [ ] Tested production API endpoints

---

## 🔄 Updating Secrets

### Local Development

```bash
# 1. Update .env.local
nano .env.local

# 2. Restart server
npm run dev
```

### Production (Azure Key Vault)

```bash
# Update secret
az keyvault secret set \
  --vault-name online-pathshala-kv \
  --name jwt-secret \
  --value "new-value"

# Clear cache to fetch new value
# (Usually automatic on next request)

# Or restart the application:
# Railway → Settings → Restart app
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Secret not found in environment" | Missing key in `.env.local` | Add the missing variable to `.env.local` |
| "AZURE_KEYVAULT_ENABLED: cannot read" | Key Vault tries to init locally | Set `NODE_ENV=development` in `.env.local` |
| "AuthorizationPermissionMismatch" | SP/MI doesn't have permissions | Grant "Key Vault Secrets User" role |
| "Secret not found in Key Vault" | Wrong secret name | Check exact name in Key Vault (case-sensitive) |
| Server starts but fails on first request | JWT secret not in Key Vault | Add `jwt-secret` to Key Vault |

---

## 📞 File References

- **Local .env template**: `backend/.env.local.example`
- **Secrets manager**: `backend/utils/secrets.manager.js`
- **Key Vault service**: `backend/utils/keyVault.service.js`
- **Detailed setup guide**: `backend/SECRETS_SETUP.md`
- **Cache integration**: `backend/utils/cache.service.js`

---

## 🚀 Quick Start Commands

```bash
# Local Development
cp backend/.env.local.example backend/.env.local
cd backend
npm run dev

# Production: Add to Azure Key Vault
az keyvault secret set --vault-name online-pathshala-kv --name jwt-secret --value "your-secret"
az keyvault secret set --vault-name online-pathshala-kv --name valkey-password --value "your-password"
az keyvault secret set --vault-name online-pathshala-kv --name db-password --value "your-password"

# Production: Deploy
git push origin develop
```

---

**Last Updated:** 2026-07-19
**Node Version:** >= 20
**Key Vault Service:** Azure Key Vault
**Cache Service:** Aiven Valkey
