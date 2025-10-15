# Migration Guide: Website Data to Strapi

This guide will help you migrate data from your live website into Strapi.

## Prerequisites

1. **Strapi must be running** at http://localhost:1337
2. **Install axios** in the cfb-cms folder:
   ```bash
   cd cfb-cms
   npm install axios
   ```

## Step 1: Create an API Token in Strapi

1. Open Strapi admin at http://localhost:1337/admin
2. Go to **Settings** → **API Tokens** → **Create new API Token**
3. Name it: `Migration Token`
4. Token type: **Full access**
5. Token duration: **Unlimited**
6. Click **Save**
7. Copy the generated token

## Step 2: Set the Token as Environment Variable

```bash
export STRAPI_TOKEN="your-token-here"
```

Or add it to your `.env` file in cfb-cms:
```
STRAPI_TOKEN=your-token-here
```

## Step 3: Enable i18n Plugin

1. In Strapi admin, go to **Settings** → **Internationalization**
2. Make sure you have these locales:
   - **Portuguese (pt)** - set as default
   - **English (en)**

If English is not added, click **Add new locale** and add English.

## Step 4: Run the Migration

```bash
cd cfb-cms
node scripts/migrate-from-website.js
```

## What Gets Migrated

The script will create:

### Service Categories (9 categories)
- General, Preventive, Restorative, Cosmetic
- Orthodontics, Implants, Surgery, Pediatric, Specialized

### Dental Services (15 services)
Each with Portuguese and English content:
- Aparelho Invisível / Clear Aligners
- Branqueamento / Whitening
- Cirurgia Oral / Oral Surgery
- Consulta Dentária / Dental Consultation
- Dentisteria / Aesthetic Restorations
- Dor Orofacial / Orofacial Pain
- Endodontia / Endodontics
- Implantes Dentários / Dental Implants
- Limpeza Dentária / Dental Cleaning
- Medicina Dentária do Sono / Sleep Apnea
- Ortodontia / Orthodontics
- Odontopediatria / Pediatric Dentistry
- Periodontologia / Periodontology
- Prostodontia / Prosthodontics
- Dentisteria Estética / Cosmetic Dentistry

### Testimonials (3 testimonials)
Patient reviews in both languages

### Clinic Information
Basic clinic details in both languages

## Troubleshooting

### Error: "Authorization required"
- Make sure you created the API token
- Set the STRAPI_TOKEN environment variable correctly

### Error: "Locale 'en' not found"
- Go to Settings → Internationalization
- Add English locale

### Error: "Cannot find module 'axios'"
- Run: `npm install axios` in cfb-cms folder

## After Migration

1. Log into Strapi admin
2. Check **Content Manager**
3. You should see all content in both languages
4. You can now edit, add images, and customize the content!
