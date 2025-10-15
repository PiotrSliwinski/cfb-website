# Security Remediation: Google API Key Exposure

## ⚠️ CRITICAL: API Key Was Exposed

The Google API key `AIzaSyCvqO2trFeioqL0InLD7vAwiNJJAiTG_vU` was committed to the repository and pushed to GitHub.

## ✅ Actions Taken

### 1. Removed from Codebase
- ✅ Removed API key from all documentation files
- ✅ Deleted `external/` directory containing old website files with the key
- ✅ Updated all documentation to reference environment variables instead
- ✅ Committed changes with security fix message
- ✅ Pushed to GitHub

### 2. Files Changed
- `docs/NEXT_STEP.md` - Removed hardcoded API key reference
- `docs/TROUBLESHOOTING.md` - Updated to use environment variable placeholders
- `external/` - Entire directory deleted (contained leaked key in JS files)

## 🚨 REQUIRED: Immediate Actions Needed

### 1. Rotate the API Key (URGENT)

The exposed API key should be rotated immediately:

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Delete the old key:**
   - Find key ending in `...TG_vU`
   - Click the trash icon to delete it
   - Confirm deletion

3. **Create a new API key:**
   - Click "CREATE CREDENTIALS" → "API key"
   - Copy the new key immediately
   - Click "RESTRICT KEY"

4. **Configure the new key:**
   - **Name:** `CFB Website - Google Reviews`
   - **Application restrictions:** HTTP referrers
   - **Website restrictions:**
     - `http://localhost:*/*`
     - `https://yourdomain.com/*` (add your production domain)
   - **API restrictions:**
     - Select "Restrict key"
     - Enable: "Places API (New)" or "Places API"
   - Click "SAVE"

5. **Update your local environment:**
   ```bash
   # Edit .env.local
   NEXT_PUBLIC_GOOGLE_API_KEY=your_new_api_key_here
   ```

6. **Update production environment:**
   - If using Vercel/Netlify: Update environment variables in dashboard
   - If using Cloud Run: Update secret in Google Cloud Console
   - If using Docker: Update environment variables in deployment

### 2. Review API Key Usage

Check Google Cloud Console for any suspicious activity:
- https://console.cloud.google.com/apis/dashboard
- Look for unusual spikes in API calls
- Check if there were any requests from unknown IP addresses

### 3. Update GitHub Secrets

If you're using GitHub Actions, update the secret:
1. Go to: https://github.com/PiotrSliwinski/cfb-website/settings/secrets/actions
2. Find `GOOGLE_API_KEY` (if exists)
3. Update it with the new key

## 📋 Git History Note

The old commit still exists in git history and contains the exposed key. While we've removed it from the current codebase and pushed a fix, the key appears in:
- Commit: `4ed94c4` - "Initial commit: Complete Clínica Ferreira Borges website..."

**Important:** This is why rotating the API key is critical. Even though the code no longer contains it, the git history still does and is publicly accessible on GitHub.

## ✅ Prevention for Future

To prevent this from happening again:

### 1. .gitignore is Configured
The repository already has `.env.local` in `.gitignore`, which prevents accidental commits.

### 2. Best Practices
- ✅ Never commit API keys to git
- ✅ Always use environment variables
- ✅ Keep `.env.local` file for local development only
- ✅ Use `.env.example` with placeholder values for documentation

### 3. Example .env.example
Already exists in the repository:
```bash
# Google Places API
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_PLACE_ID=your_place_id_here
```

## 📝 Current Status

- ✅ Code cleanup complete
- ✅ Security commit pushed to GitHub
- ✅ Documentation updated
- ⏳ **PENDING: API key rotation (MUST DO IMMEDIATELY)**
- ⏳ **PENDING: Production environment update**

## 🔗 Useful Links

- [Google Cloud Console - API Credentials](https://console.cloud.google.com/apis/credentials)
- [Google Cloud Console - API Dashboard](https://console.cloud.google.com/apis/dashboard)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)

---

**Last Updated:** 2025-10-15
**Status:** Code cleaned, API key rotation required
