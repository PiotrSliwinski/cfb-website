# Enable API Permissions in Strapi

Before running the migration, you need to enable API permissions for your token.

## Steps:

1. **Open Strapi Admin** at http://localhost:1337/admin

2. **Go to Settings → Roles** (under USERS & PERMISSIONS PLUGIN section)

3. **Click on "Authenticated"** role

4. **Scroll down and enable ALL permissions for these content types:**

   ### Service-category
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete

   ### Dental-service
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete

   ### Testimonial
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete

   ### Clinic-info
   - ✅ find
   - ✅ findOne
   - ✅ create
   - ✅ update
   - ✅ delete

5. **Click "Save"** at the top right

6. **Now run the migration:**
   ```bash
   cd cfb-cms
   node scripts/migrate-from-website.js
   ```

## Alternative: Use Strapi Bootstrap

If you prefer, I can create a bootstrap script that will run automatically when Strapi starts and populate the data without needing API calls.
