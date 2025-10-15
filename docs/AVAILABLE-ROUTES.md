# Available Routes - Clínica Ferreira Borges Website

Complete reference of all routes available in the application.

## 🌐 Public Frontend Routes

### Homepage
- `/` - Portuguese homepage (default locale)
- `/pt` - Portuguese homepage (explicit)
- `/en` - English homepage

### Treatment Pages
- `/[locale]/tratamentos/[slug]` - Individual treatment detail page
  - Example: `/pt/tratamentos/implantes-dentarios`
  - Example: `/en/tratamentos/dental-implants`

### Information Pages
- `/[locale]/contacto` - Contact page
- `/[locale]/equipa` - Team members page
- `/[locale]/tecnologia` - Technology/equipment page
- `/[locale]/pagamentos` - Payment options & financing page
- `/[locale]/termos-condicoes` - Terms & Conditions

**Note:** `[locale]` can be `pt` (Portuguese) or `en` (English)

## 🔐 Admin Panel Routes

### Authentication
- `/admin/login` - Admin login page (public)

### Dashboard & Main Sections
- `/admin` - Main admin dashboard (requires auth)
- `/admin/treatments` - Treatments management list
- `/admin/treatments/[id]` - Edit specific treatment
- `/admin/team` - Team members management list
- `/admin/team/[id]` - Edit specific team member
- `/admin/faqs` - FAQ management list
- `/admin/faqs/[id]` - Edit specific FAQ
- `/admin/submissions` - Contact form submissions list
- `/admin/submissions/[id]` - View specific submission
- `/admin/content` - Content management overview
- `/admin/content/[page]/[lang]` - Edit page content for specific language
  - Example: `/admin/content/home/pt`
  - Example: `/admin/content/technology/en`

### Settings
- `/admin/settings` - Settings overview page

#### Clinic Settings
- `/admin/settings/clinic` - Clinic information, hours, location

#### Contact Settings
- `/admin/settings/contact` - Contact information list
- `/admin/settings/contact/[id]` - Edit specific contact entry

#### Language Management
- `/admin/settings/languages` - Manage supported languages (NEW)

#### Insurance Providers
- `/admin/settings/insurance` - Manage insurance providers (NEW)

#### Payment Options
- `/admin/settings/payments` - Manage payment methods (NEW)

#### Social Media
- `/admin/settings/social` - Manage social media links (NEW)

## 🔌 Public API Routes

### Content APIs
- `GET /api/treatments` - Get all treatments
  - Query params: `?locale=pt|en`
- `GET /api/team` - Get all team members
  - Query params: `?locale=pt|en`
- `GET /api/settings` - Get clinic settings
- `GET /api/google-reviews` - Get Google reviews
  - Query params: `?minRating=1-5`

### Payment & Insurance APIs
- `GET /api/insurance` - Get insurance providers
- `GET /api/financing` - Get financing options
- `GET /api/prices` - Get pricing information

### Social Media & Content Sections
- `GET /api/social-media` - Get social media links
- `GET /api/hero-sections` - Get hero banner sections
- `GET /api/cta-sections` - Get call-to-action sections

### Form Submission
- `POST /api/contact` - Submit contact form

## 🔒 Admin API Routes

### Language Management
- `GET /api/admin/languages` - Get all languages
- `POST /api/admin/languages` - Create new language
- `PUT /api/admin/languages/[id]` - Update language
- `DELETE /api/admin/languages/[id]` - Delete language

### Translation Management
- `POST /api/admin/translations/create` - Auto-create translation file

### Content Management
- `GET /api/admin/content/[lang]` - Get content for language
- `POST /api/admin/faqs` - Create FAQ (requires auth)
- `POST /api/admin/submissions` - Create submission (requires auth)

### Settings Management
- `POST /api/admin/clinic-settings` - Update clinic settings
- `POST /api/admin/settings/contact` - Update contact settings

### Authentication
- `POST /api/auth/signout` - Sign out user

## 📊 Data Management APIs

### Generic Collection APIs
- `GET /api/[collection]` - Get all items in collection
- `POST /api/[collection]` - Create new item in collection
- `GET /api/[collection]/[id]` - Get specific item
- `PUT /api/[collection]/[id]` - Update specific item
- `DELETE /api/[collection]/[id]` - Delete specific item
- `POST /api/[collection]/[id]/actions` - Perform actions on item

**Available Collections:**
- `insurance` - Insurance providers
- `social-media` - Social media links
- `hero-sections` - Hero banners
- `cta-sections` - Call-to-action sections
- `prices` - Pricing information
- `financing` - Financing options

### Publishing & Ordering
- `POST /api/insurance/publish` - Publish/unpublish insurance provider
- `POST /api/insurance/reorder` - Reorder insurance providers
- `POST /api/social-media/publish` - Publish/unpublish social media link
- `POST /api/social-media/reorder` - Reorder social media links
- `POST /api/hero-sections/publish` - Publish/unpublish hero section
- `POST /api/hero-sections/reorder` - Reorder hero sections
- `POST /api/cta-sections/publish` - Publish/unpublish CTA section
- `POST /api/cta-sections/reorder` - Reorder CTA sections

## 🧪 Development/Testing Routes

These routes are for development and testing purposes only:

- `GET /api/test-team-save` - Test team member save functionality
- `GET /api/test-treatments-update` - Test treatments update functionality
- `GET /api/test-direct-db` - Test direct database connection
- `POST /api/seed-specialties` - Seed specialties data

**⚠️ Warning:** These should be disabled or removed in production.

## 🗺️ Dynamic Route Patterns

### Frontend Dynamic Routes
- `/[locale]` - Any locale (pt, en, or future languages)
- `/[locale]/tratamentos/[slug]` - Any treatment slug
  - Slugs are defined in the database
  - Examples: `implantes-dentarios`, `ortodontia`, `branqueamento`

### Admin Dynamic Routes
- `/admin/treatments/[id]` - UUID of treatment
- `/admin/team/[id]` - UUID of team member
- `/admin/faqs/[id]` - UUID of FAQ
- `/admin/submissions/[id]` - UUID of submission
- `/admin/content/[page]/[lang]` - Page identifier and language code
- `/admin/settings/contact/[id]` - UUID of contact entry

### API Dynamic Routes
- `/api/[collection]` - Any valid collection name
- `/api/[collection]/[id]` - Collection name and item UUID
- `/api/admin/languages/[id]` - Language UUID

## 🔄 Redirects & Special Behaviors

### Locale Handling
- `/` → Defaults to Portuguese (`/pt`)
- `/pt/*` → Portuguese locale
- `/en/*` → English locale
- Missing locale → Defaults to `pt`

### Authentication Redirects
- Protected `/admin/*` routes → Redirect to `/admin/login` if not authenticated
- `/admin/login` when authenticated → Redirect to `/admin`

### 404 Handling
- Invalid routes → Custom 404 page
- Invalid treatment slugs → 404
- Invalid admin resources → 404

## 📝 Route Conventions

### URL Structure
- **Public pages:** `/{locale}/{page-name}`
- **Admin pages:** `/admin/{section}/{sub-section}`
- **API endpoints:** `/api/{resource}` or `/api/admin/{resource}`

### HTTP Methods
- `GET` - Retrieve data
- `POST` - Create new data
- `PUT` - Update existing data
- `DELETE` - Delete data

### Query Parameters
Most API endpoints support:
- `?locale=pt|en` - Filter by language
- `?published=true|false` - Filter by publish status
- `?page=1` - Pagination (where applicable)
- `?limit=10` - Results per page (where applicable)

## 🧪 Testing Routes

Run the comprehensive route test harness:

```bash
npm run test:routes
```

This will test all routes and generate a detailed report.

## 📋 Quick Reference

### Most Common Routes

**Public:**
- `/` - Homepage
- `/pt/contacto` - Contact
- `/pt/tratamentos/[slug]` - Treatment details

**Admin:**
- `/admin` - Dashboard
- `/admin/treatments` - Manage treatments
- `/admin/settings` - Settings

**API:**
- `/api/treatments?locale=pt` - Get treatments
- `/api/settings` - Get clinic info
- `/api/contact` - Submit form

## 🔐 Authentication Requirements

**Public Routes:** No authentication required
**Admin Routes:** Require authentication (redirect to `/admin/login`)
**Admin API Routes:** Require authentication (return 401)
**Public API Routes:** No authentication required

## 🌍 Localization

All frontend routes support internationalization:
- Default locale: `pt` (Portuguese)
- Available locales: `pt`, `en`
- Locale can be managed via `/admin/settings/languages`

To add a new language:
1. Go to `/admin/settings/languages`
2. Click "Add New Language"
3. Create translation file
4. Translate content

## 📚 Related Documentation

- [Route Test Results](./ROUTE-TEST-RESULTS.md) - Latest test results
- [Language Management Integration](./LANGUAGE-MANAGEMENT-INTEGRATION.md) - Language system guide
- [Audit and Improvements](./AUDIT-AND-IMPROVEMENTS.md) - Architecture audit
- [Improvements Implemented](./IMPROVEMENTS-IMPLEMENTED.md) - Recent changes

## 🔄 Updates

**Last Updated:** 2025-10-15

**Recent Changes:**
- ✅ Added `/admin/settings/insurance` page
- ✅ Added `/admin/settings/payments` page
- ✅ Added `/admin/settings/social` page
- ✅ Added language management at `/admin/settings/languages`
- ✅ Created comprehensive route testing harness

**Known Issues:**
- Portuguese routes returning 307 redirects (under investigation)
- `/en/contacto` returning 500 error (needs debugging)
- Some admin API routes return 405 (may be by design)

See [Route Test Results](./ROUTE-TEST-RESULTS.md) for detailed status.
