# Clínica Ferreira Borges Website - Transition Plan

## Executive Summary

This document outlines the complete transition plan for removing Strapi and implementing a custom Supabase-based content management system with a bespoke admin panel. The website will maintain optimal SEO, server-side rendering (SSR), and multilingual support (Portuguese/English).

**Status**: Ready to execute
**Timeline**: 3-5 days
**Risk Level**: Low (existing migrations provide proven schema)

---

## Current State Analysis

### Architecture
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL (local Docker container)
- **CMS**: Strapi (to be removed - in `cfb-cms/` directory)
- **Languages**: Portuguese (default) + English
- **Styling**: Tailwind CSS + shadcn/ui components

### Existing Database Schema (26 migrations analyzed)

The `supabase/migrations.old/` directory contains a **proven, working schema** with:

#### Core Content Tables
1. **languages** - Language configuration (pt, en)
2. **treatments** - Dental services/treatments
3. **treatment_translations** - PT/EN content for treatments
4. **treatment_faqs** - FAQs per treatment
5. **treatment_faq_translations** - PT/EN FAQ content
6. **team_members** - Staff/doctor profiles
7. **team_member_translations** - PT/EN team content
8. **team_member_specialties** - Link team to treatments
9. **testimonials** - Patient reviews
10. **testimonial_translations** - PT/EN testimonial content

#### Site Configuration Tables
11. **pages** - Page structure
12. **page_translations** - PT/EN page metadata
13. **settings** - App configuration (email, phone, features)
14. **site_settings** - Legacy settings table
15. **site_setting_translations** - Legacy settings i18n
16. **api_keys** - Secure API key storage
17. **contact_information** - Clinic contact details
18. **contact_information_translations** - PT/EN contact info
19. **social_media_links** - Social media URLs
20. **social_media_link_translations** - PT/EN social labels

#### Payment & Insurance Tables
21. **payment_options** - Payment methods (cash, cards, MB WAY)
22. **payment_option_translations** - PT/EN payment details
23. **financing_options** - Payment plans
24. **financing_option_translations** - PT/EN financing details
25. **service_prices** - Treatment pricing
26. **service_price_translations** - PT/EN price descriptions
27. **insurance_providers** - Accepted insurance companies
28. **insurance_provider_translations** - PT/EN insurance info

#### Support Tables
29. **media_items** - File/image management
30. **contact_submissions** - Contact form submissions

### Key Features
- ✅ Multilingual content (PT/EN) with translation tables
- ✅ Row Level Security (RLS) policies
- ✅ SEO-optimized with metadata per page
- ✅ Image optimization (WebP, AVIF)
- ✅ Google Reviews integration
- ✅ Storage buckets for media

---

## Transition Strategy

### Phase 1: Database Reset & Migration Consolidation
**Duration**: 2 hours

#### Actions:
1. **Consolidate Migrations**
   - Move all `.old` migrations to active `migrations/` folder
   - Create single consolidated schema file (optional but recommended)
   - Test migration sequence

2. **Reset Supabase Database**
   ```bash
   npx supabase db reset
   ```
   This will:
   - Drop all existing tables
   - Re-run all migrations in order
   - Apply seed data from migrations

3. **Verify Schema**
   - Check all tables created: `npx supabase db dump --schema-only`
   - Verify RLS policies active
   - Test storage buckets

#### Files to Create:
- `/supabase/migrations/20251014000000_consolidated_schema.sql` (optional)
- `/scripts/reset-and-migrate.sh` (automation script)

---

### Phase 2: Data Migration from Legacy CSV
**Duration**: 3-4 hours

#### Legacy Data Inventory:
From `/legacy/*.csv` files:
- **Services.csv** (16 treatments) - Full service pages with galleries, videos
- **Teams.csv** (13 team members) - Already partially migrated
- **Frequent Questions.csv** (24 FAQs) - Questions linked to services
- **Introductions.csv** (29 entries) - Service intro sections
- **Processes.csv** (7 entries) - Step-by-step process descriptions
- **Rationales.csv** (57 entries) - Service benefits/explanations

#### Migration Script Requirements:
Create `/scripts/migrate-legacy-data.ts`:

```typescript
// Parse CSV files
// Map to database schema
// Handle PT/EN translations
// Upload images to Supabase Storage
// Insert data with proper relations
```

Key Mappings:
- CSV `Description` → treatment_translations.description
- CSV `Benefits` → treatment_translations.benefits (JSONB)
- CSV `Gallery` → media_items table
- CSV `Video Url` → Embed in treatment page
- CSV `Booking Url` → Store in settings or treatment data

---

### Phase 3: Custom Admin Panel Development
**Duration**: 1-2 days

#### Admin Panel Structure:
```
/src/app/admin/
├── layout.tsx                 # Admin shell with nav
├── page.tsx                   # Dashboard overview
├── login/
│   └── page.tsx              # Simple auth
├── treatments/
│   ├── page.tsx              # List all treatments
│   ├── [id]/
│   │   └── page.tsx          # Edit treatment
│   └── new/
│       └── page.tsx          # Create treatment
├── team/
│   ├── page.tsx              # List team members
│   └── [id]/page.tsx         # Edit member
├── faqs/
│   └── page.tsx              # Manage FAQs
├── settings/
│   ├── page.tsx              # App settings
│   ├── contact/page.tsx      # Contact info
│   ├── payments/page.tsx     # Payment options
│   └── insurance/page.tsx    # Insurance providers
├── media/
│   └── page.tsx              # Media library
└── submissions/
    └── page.tsx              # Contact form submissions
```

#### Admin Features:
1. **Authentication**
   - Use Supabase Auth (email/password)
   - Protected routes with middleware
   - Role-based access (admin, editor)

2. **Content Editors**
   - Rich text editor (e.g., Tiptap, Lexical)
   - Dual language editing (PT/EN side-by-side)
   - Image upload with drag-drop
   - Preview before publish
   - Draft/Published status

3. **Form Components**
   - Treatment editor (title, description, benefits, process, FAQs)
   - Team member editor (name, photo, bio, specialties)
   - Settings editor (contact info, social media, payment methods)
   - Media uploader (Supabase Storage integration)

4. **Data Tables**
   - Sortable, filterable lists
   - Bulk actions (publish, delete)
   - Search functionality
   - Pagination

#### Tech Stack for Admin:
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table or custom with shadcn/ui
- **Rich Text**: Tiptap or Lexical
- **File Upload**: react-dropzone + Supabase Storage
- **State**: React Server Components + Server Actions
- **UI**: shadcn/ui components (already installed)

---

### Phase 4: Frontend SSR Optimization
**Duration**: 1 day

#### SSR Strategy:
1. **Page-Level Optimization**
   - All pages use Server Components by default
   - Data fetching in RSC (no client-side loading states)
   - Parallel data fetching with Promise.all()
   - Streaming with Suspense where appropriate

2. **Data Fetching Functions**
   ```typescript
   // /src/lib/supabase/queries/treatments.ts
   export async function getAllTreatments(locale: Locale) {
     const supabase = createServerClient()
     return await supabase
       .from('treatments')
       .select(`
         *,
         treatment_translations!inner(*)
       `)
       .eq('treatment_translations.language_code', locale)
       .eq('is_published', true)
       .order('display_order')
   }
   ```

3. **SEO Enhancements**
   - Dynamic metadata generation per page
   - Structured data (JSON-LD) for treatments, team, FAQs
   - Optimized Open Graph tags
   - XML sitemap generation
   - robots.txt configuration

4. **Performance**
   - Image optimization (next/image with Supabase CDN)
   - Font optimization (next/font)
   - Static generation where possible
   - ISR (Incremental Static Regeneration) for content pages
   - Edge caching headers

#### Example: Treatment Page
```typescript
// /src/app/[locale]/tratamentos/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const treatment = await getTreatmentBySlug(slug, locale)

  return {
    title: treatment.title,
    description: treatment.description,
    openGraph: {
      title: treatment.title,
      description: treatment.description,
      images: [treatment.hero_image_url],
    },
    alternates: {
      canonical: `/${locale}/tratamentos/${slug}`,
      languages: {
        'pt': `/pt/tratamentos/${slug}`,
        'en': `/en/tratamentos/${slug}`,
      },
    },
  }
}

export default async function TreatmentPage({ params }) {
  const { locale, slug } = await params
  const treatment = await getTreatmentBySlug(slug, locale)
  const faqs = await getTreatmentFAQs(treatment.id, locale)

  return (
    <>
      <TreatmentHero treatment={treatment} />
      <TreatmentContent treatment={treatment} />
      <TreatmentFAQs faqs={faqs} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateTreatmentSchema(treatment))
        }}
      />
    </>
  )
}
```

---

### Phase 5: Remove Strapi Dependencies
**Duration**: 2 hours

#### Steps:
1. **Remove Strapi Directory**
   ```bash
   rm -rf cfb-cms/
   rm -rf strapi-cms/
   ```

2. **Clean Up Files**
   ```bash
   rm -rf src/lib/strapi/
   rm -rf src/types/strapi*.ts
   rm MIGRATION-STATUS.md
   rm .claude/STRAPI_RULES.md
   ```

3. **Update Environment Variables**
   Remove from `.env.example`:
   ```
   # Remove these:
   STRAPI_URL=
   STRAPI_API_TOKEN=
   ```

4. **Update Package.json**
   ```bash
   # Remove Strapi-related scripts if any
   npm uninstall any-strapi-packages
   ```

5. **Update Documentation**
   - Update README.md (remove Strapi references)
   - Update architecture docs
   - Document new admin panel URL

---

### Phase 6: Testing & Validation
**Duration**: 1 day

#### Test Checklist:

**Database**
- [ ] All 30 tables created successfully
- [ ] RLS policies working (public can read, auth can write)
- [ ] Triggers firing (updated_at timestamps)
- [ ] Foreign keys enforced
- [ ] Indexes created for performance

**Data Migration**
- [ ] All 16 treatments imported with PT/EN translations
- [ ] Team members (9-12) with photos and specialties
- [ ] FAQs (24) linked to correct treatments
- [ ] Contact information populated
- [ ] Payment/insurance options loaded

**Admin Panel**
- [ ] Login/authentication works
- [ ] Can create new treatment (PT/EN)
- [ ] Can edit existing treatment
- [ ] Can upload images to Supabase Storage
- [ ] Can manage team members
- [ ] Can edit FAQs
- [ ] Can update settings (contact, social media)
- [ ] Media library functional
- [ ] Form validation working

**Frontend**
- [ ] Homepage loads with SSR
- [ ] Treatment pages render with SEO metadata
- [ ] Team page shows all members
- [ ] Language switcher (PT ↔ EN) works
- [ ] Images load from Supabase Storage
- [ ] Google Reviews section works
- [ ] Contact form submits successfully
- [ ] All pages mobile-responsive

**SEO**
- [ ] Meta tags correct on all pages
- [ ] Open Graph tags present
- [ ] Structured data validates (schema.org)
- [ ] Sitemap.xml generates
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] Alternate language links present

**Performance**
- [ ] Lighthouse score > 90 (Performance, SEO, Accessibility)
- [ ] Images optimized (WebP/AVIF)
- [ ] SSR working (view source shows content)
- [ ] Time to First Byte < 600ms
- [ ] No console errors

---

## Implementation Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| 1. Database Reset | 2 hours | Day 1 AM | Day 1 AM |
| 2. Data Migration | 4 hours | Day 1 PM | Day 1 PM |
| 3. Admin Panel | 2 days | Day 2 | Day 3 |
| 4. SSR Optimization | 1 day | Day 4 | Day 4 |
| 5. Remove Strapi | 2 hours | Day 5 AM | Day 5 AM |
| 6. Testing | 1 day | Day 5 PM | Day 5 PM |

**Total**: 3-5 days

---

## Database Schema Details

### Multilingual Pattern
All content uses separate translation tables:
```
main_table (id, slug, is_published, ...)
main_table_translations (id, main_id, language_code, title, description, ...)
```

Benefits:
- Clean separation of structure vs content
- Easy to add new languages
- Efficient queries with JOIN filters
- No NULL values for missing translations

### Key Relations
```
treatments 1-→ many treatment_translations
treatments 1-→ many treatment_faqs 1-→ many treatment_faq_translations
team_members 1-→ many team_member_translations
team_members many-→ many treatments (via team_member_specialties)
```

### RLS Policies
- **Public**: SELECT on published content
- **Authenticated**: Full CRUD on all tables
- **Service Role**: Bypass RLS (for admin operations)

---

## Admin Panel Design

### Authentication Flow
```
/admin → Check auth → Redirect to /admin/login if not authenticated
         ↓
         Authenticated → Dashboard
```

### Dashboard Metrics
- Total treatments: XX
- Total team members: XX
- Pending contact submissions: XX
- Last updated: [timestamp]
- Quick actions: Add treatment, Add team member

### Color Scheme
Use clinic branding:
- Primary: Clinic brand color
- Secondary: Gray scale for admin UI
- Success: Green for published status
- Warning: Yellow for draft status

---

## SEO Optimization Checklist

### Per-Page SEO
- [x] Dynamic `<title>` tags (max 60 chars)
- [x] Meta descriptions (max 160 chars)
- [x] Open Graph tags (og:title, og:description, og:image)
- [x] Twitter Card tags
- [x] Canonical URLs
- [x] Alternate language links (hreflang)

### Structured Data (JSON-LD)
- [x] Organization schema (clinic info)
- [x] LocalBusiness schema (address, hours, contact)
- [x] MedicalBusiness schema (dental clinic)
- [x] Service schema (each treatment)
- [x] Person schema (team members)
- [x] FAQPage schema (FAQ sections)
- [x] Review schema (Google reviews)

### Technical SEO
- [x] Sitemap.xml at `/sitemap.xml`
- [x] robots.txt at `/robots.txt`
- [x] Proper heading hierarchy (H1 → H2 → H3)
- [x] Alt text for all images
- [x] Fast loading (< 3s)
- [x] Mobile-friendly (responsive design)
- [x] HTTPS (Supabase provides)

---

## File Structure After Transition

```
cfb-website/
├── supabase/
│   ├── migrations/              # All 26+ migrations consolidated
│   │   └── 20251005223123_initial_schema.sql
│   │   └── 20251006*_*.sql     # Feature migrations
│   │   └── 20251014000000_final_cleanup.sql
│   └── seed.sql                # Optional: seed data
├── scripts/
│   ├── reset-database.sh       # npx supabase db reset wrapper
│   ├── migrate-legacy-csv.ts   # CSV → Supabase import
│   └── seed-sample-data.ts     # Development seed data
├── src/
│   ├── app/
│   │   ├── [locale]/           # Public website (PT/EN)
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── tratamentos/    # Treatment pages
│   │   │   ├── equipa/         # Team page
│   │   │   ├── contacto/       # Contact page
│   │   │   └── ...
│   │   ├── admin/              # ⭐ NEW: Custom admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── treatments/
│   │   │   ├── team/
│   │   │   ├── settings/
│   │   │   └── ...
│   │   ├── api/                # API routes
│   │   │   ├── contact/route.ts
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── admin/              # ⭐ NEW: Admin UI components
│   │   │   ├── TreatmentEditor.tsx
│   │   │   ├── TeamEditor.tsx
│   │   │   ├── MediaUploader.tsx
│   │   │   └── RichTextEditor.tsx
│   │   ├── layout/             # Header, Footer, etc.
│   │   ├── home/               # Homepage sections
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # Client-side Supabase
│   │   │   ├── server.ts       # Server-side Supabase
│   │   │   ├── admin.ts        # ⭐ NEW: Admin with service role
│   │   │   ├── storage.ts      # File uploads
│   │   │   └── queries/        # Typed query functions
│   │   │       ├── treatments.ts
│   │   │       ├── team.ts
│   │   │       ├── settings.ts
│   │   │       └── ...
│   │   ├── i18n/               # Internationalization
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── messages/               # i18n translations
│       ├── pt.json
│       └── en.json
├── legacy/                     # Keep for reference
│   └── *.csv                   # Original data exports
├── docs/                       # Documentation
│   └── ADMIN_GUIDE.md          # ⭐ NEW: Admin panel user guide
├── .env.local                  # Environment variables
├── .env.example
├── next.config.js
├── package.json
├── README.md
├── TRANSITION-PLAN.md          # This file
└── tsconfig.json
```

**Removed**:
- ❌ `cfb-cms/` (Strapi directory)
- ❌ `strapi-cms/` (Empty Strapi directory)
- ❌ `src/lib/strapi/` (Strapi client code)
- ❌ `src/types/strapi*.ts` (Strapi types)
- ❌ `MIGRATION-STATUS.md` (Strapi migration docs)

---

## Risk Mitigation

### Backup Strategy
1. **Before Starting**: Export current Supabase database
   ```bash
   npx supabase db dump > backup-$(date +%Y%m%d).sql
   ```

2. **Git Commits**: Commit after each phase

3. **Rollback Plan**: Keep `migrations.old/` until fully validated

### Common Issues & Solutions

**Issue**: Migration fails halfway
- **Solution**: `npx supabase db reset` will retry from scratch

**Issue**: Images not loading
- **Solution**: Check storage bucket policies and CORS settings

**Issue**: RLS blocking admin actions
- **Solution**: Use service role key in admin API routes

**Issue**: Performance degradation
- **Solution**: Add missing indexes, enable connection pooling

---

## Success Criteria

✅ **Database**
- All tables created with correct schema
- RLS policies active and tested
- Data migrated from legacy CSV

✅ **Admin Panel**
- Functional CRUD for all content types
- Image upload working
- PT/EN editing side-by-side
- Authentication secure

✅ **Frontend**
- All pages render with SSR
- SEO metadata complete
- Lighthouse score > 90
- No Strapi dependencies

✅ **Development Experience**
- Clear documentation
- Type-safe queries
- Fast local development
- Easy deployments

---

## Next Steps After Transition

1. **User Training**
   - Create admin user guide
   - Record video tutorials
   - Schedule training session

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Analytics (Vercel Analytics, Google Analytics)

3. **Future Enhancements**
   - Blog/news section
   - Online booking integration
   - Patient portal
   - Multi-clinic support (if needed)

4. **Maintenance**
   - Regular database backups
   - Security updates
   - Performance monitoring
   - Content reviews

---

## Appendix

### Useful Commands

```bash
# Start Supabase locally
npx supabase start

# Reset database (re-run all migrations)
npx supabase db reset

# Check Supabase status
npx supabase status

# Stop Supabase
npx supabase stop

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/types/database.ts

# Run Next.js dev server
npm run dev

# Build for production
npm run build
npm start
```

### Environment Variables

```env
# Supabase (local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Services
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=...
NEXT_PUBLIC_GOOGLE_PLACE_ID=ChIJI6mkuRNzJA0RNwj5bykp9vk

# Admin (optional)
ADMIN_EMAIL=admin@clinicaferreiraborges.pt
ADMIN_PASSWORD_HASH=...
```

---

## Conclusion

This transition plan provides a **complete roadmap** to remove Strapi and implement a custom, high-performance CMS solution. The existing Supabase migrations provide a **proven foundation**, reducing risk significantly.

**Key Benefits**:
- 🚀 Full control over admin interface
- 💰 Zero CMS licensing costs
- ⚡ Optimal SSR performance
- 🌍 Native multilingual support
- 🔒 Built-in security (RLS)
- 📊 Better SEO capabilities

**Estimated Effort**: 3-5 days for complete implementation and testing.

---

*Document Version: 1.0*
*Last Updated: October 14, 2025*
*Author: Claude (AI Assistant)*
