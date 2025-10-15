# Strapi Migration Status

## ✅ Completed

### 1. Strapi Setup
- ✅ Updated Strapi from v5.26.0 to v5.27.0
- ✅ Master API token configured in `.env`
- ✅ Strapi server running at http://localhost:1337

### 2. Collections Created
- ✅ **Dental Services** (15 services) - PT/EN
- ✅ **Service Categories** (9 categories) - PT/EN
- ✅ **Testimonials** (3 testimonials) - PT/EN
- ✅ **Clinic Info** (single type) - PT/EN
- ✅ **Team** (10 members) - PT/EN with specializations

### 3. Team Photos
- ✅ 7 team photos uploaded to Media Library (IDs 31-37):
  - Anna Carolina Ribeiro (ID 31)
  - Carlos Sousa (ID 32)
  - Filipa Caeiro (ID 33)
  - Filipa Cunha (ID 34)
  - Filipa Marques (ID 35)
  - Gonçalo Selas (ID 36)
  - Ronite Harjivan (ID 37)

## ⚠️ Pending

### 1. Link Photos to Team Members
**Issue**: API permissions not returning team members
**Solution**: Need to enable API permissions in Strapi Admin

**Manual Steps**:
1. Open http://localhost:1337/admin
2. Go to Settings → Roles → Authenticated
3. Enable for "Team":
   - ✅ find
   - ✅ findOne
   - ✅ update
4. Save
5. Run: `cd cfb-cms && node scripts/link-photos-to-team.js`

**OR Link Manually** in Strapi Admin:
- Content Manager → Team → Each member → Image field → Select photo

### 2. Missing Team Photos
Need to upload for:
- Samira Soares
- Tomás Godinho
- Ângela Lino

Download manually from website or use placeholders.

## 📋 Legacy Data Migration

### Legacy CSV Files Located in `/legacy/`:

1. **Frequent Questions.csv** (23 FAQs)
   - Question, Description, Service relation, Active status

2. **Introductions.csv** (28 entries)
   - Service introductions with descriptions and images

3. **Processes.csv** (6 entries)
   - Step-by-step process descriptions

4. **Rationales.csv** (56 entries)
   - Detailed service explanations and benefits

5. **Services.csv** (15 services)
   - Full service pages with:
     - Mission statements
     - Hero sections
     - Gallery images
     - Video URLs
     - Booking URLs

6. **Teams.csv** (12 team members)
   - Already migrated to Strapi

### Collections to Create for Legacy Data:

#### 1. FAQ Collection
```
- question (text, localized)
- answer (richtext, localized)
- service (relation to dental-service)
- category (optional)
- displayOrder (integer)
- active (boolean)
```

#### 2. Service Introduction Collection (or Component)
```
- title (text, localized)
- description (richtext, localized)
- image (media)
- service (relation to dental-service)
- active (boolean)
```

#### 3. Service Rationale Collection (or Component)
```
- title (text, localized)
- description (richtext, localized)
- service (relation to dental-service)
- active (boolean)
```

#### 4. Service Process Collection (or Component)
```
- title (text, localized)
- description (richtext, localized)
- steps (richtext, localized)
- service (relation to dental-service)
- active (boolean)
```

#### 5. Enhance Dental Service Collection
Add fields:
```
- heroHeader (text, localized)
- heroDescription (richtext, localized)
- heroImage (media)
- missionStatement (richtext, localized)
- gallery (media, multiple)
- videoUrl (string)
- bookingUrl (string)
- sections (components for intro/rationale/process/faq)
```

## Next Steps

1. **Immediate**: Enable API permissions to link photos
2. **Create FAQ collection** in Strapi
3. **Enhance Dental Service schema** with additional fields
4. **Create CSV migration script** to import all legacy data
5. **Upload missing team photos** (3 members)
6. **Verify all data** in Strapi admin

## Files & Scripts

### Migration Scripts Created:
- `cfb-cms/scripts/migrate-from-website.js` - Initial migration
- `cfb-cms/scripts/upload-photos-master.js` - Upload team photos
- `cfb-cms/scripts/link-photos-to-team.js` - Link photos (needs permissions)
- `cfb-cms/scripts/download-photos-only.js` - Download photos locally

### Important Files:
- `cfb-cms/.env` - Contains master API token
- `cfb-cms/src/bootstrap-data.ts` - Initial seed data
- `cfb-cms/src/index.ts` - Bootstrap function
- `.claude/STRAPI_RULES.md` - Important: Never use direct DB access!

## API Access

**Master Token**: `97e868ac59e69b4b5e5556772e86a512e125bcf12a98121349024fbbc3183be0c2e56e245a043f0eb44e809e533bdc41971cc44180ceaaea9871d4a761ba503f6963e61baa12ac9ef99224e0791da3689c519b1896d05c334645cc29226ed4e657afa7adab6bacb7e3e97a3925f0dc0b6b2bb519a615701b5cf4cb862db3c692`

**Strapi URL**: http://localhost:1337

## Contact Info from Legacy

**Booking URL**: https://booking.clinicaferreiraborges.pt
