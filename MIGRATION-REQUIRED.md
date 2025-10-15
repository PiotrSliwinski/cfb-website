# ⚠️ IMPORTANT: Database Migrations Required

## You Must Run These Migrations

After pulling these changes, you **MUST** run the database migrations to:
1. Remove unused CMS tables
2. Create the new `clinic_settings` table

## How to Run Migrations

```bash
# Make sure Supabase is running
npx supabase status

# If not running, start it
npx supabase start

# Apply the migrations
npx supabase db push
```

## What Will Happen

The migrations will:

### Migration 1: `20251015000000_remove_unused_cms_tables.sql`
- **DROP** these unused tables:
  - `pages`
  - `section_types`
  - `pages_sections`
  - 12 `components_sections_*` tables

### Migration 2: `20251015000100_create_clinic_settings.sql`
- **CREATE** `clinic_settings` table
- **INSERT** default clinic data:
  - Phone: 935 189 807
  - Email: geral@clinicaferreiraborges.pt
  - Address: Rua Ferreira Borges 173C, Campo de Ourique, 1350-130 Lisboa
  - Operating hours: Mon-Fri 9h-19h, Sat 9h-13h, Sun closed
  - ERS Number: 25393
  - Establishment: E128470
  - Licence: 10984/2015

## After Running Migrations

1. Visit `/admin/settings/clinic` to see and edit clinic information
2. All contact page info will now be editable
3. Admin dashboard will show 4 stat cards instead of 5 (Pages removed)

## Verification

After running migrations, verify:

```bash
# Check that clinic_settings table exists
npx supabase db diff

# Or visit the admin panel
# Go to http://localhost:3002/admin/settings/clinic
```

## Rollback (if needed)

If you need to rollback:

```bash
# View migration history
npx supabase db migration list

# Rollback specific migration (not recommended after data entry)
# Contact the development team for assistance
```

---

## Don't Forget!

After running migrations locally, you'll need to apply them to production when deploying:

```bash
# For production deployment
npx supabase db push --db-url <production-database-url>
```

---

**Status**: ⏳ Migrations pending - Run `npx supabase db push` now!
