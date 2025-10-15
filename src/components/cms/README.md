# CMS Components

This directory contains the CMS (Content Management System) components for rendering dynamic pages from the database.

## Components

### PageRenderer
The main component that renders an entire page with all its sections dynamically.

**Usage:**
```tsx
import { PageRenderer } from '@/components/cms';
import { getPageBySlug } from '@/lib/supabase/queries/cms';
import { localizePageData } from '@/types/cms';

export default async function Page({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug('home', locale);

  if (!page) {
    return <div>Page not found</div>;
  }

  const localizedPage = localizePageData(page, locale);

  if (!localizedPage) {
    return <div>No content available</div>;
  }

  return <PageRenderer page={localizedPage} locale={locale} />;
}
```

### HeroSection
Renders a hero section with title, subtitle, description, and CTA buttons.

**Content Structure:**
```typescript
{
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  primary_button_text?: string;
  primary_button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  background_image?: string;
  background_color?: string;
}
```

### FeatureGrid
Renders a grid of features with icons, titles, and descriptions.

**Usage:**
```tsx
import { FeatureGrid } from '@/components/cms';
import { getFeatures } from '@/lib/supabase/queries/cms';
import { localizeFeature } from '@/types/cms';

const features = await getFeatures('pt');
const localizedFeatures = features
  .map(f => localizeFeature(f, 'pt'))
  .filter(Boolean);

<FeatureGrid
  features={localizedFeatures}
  title="Why Choose Us"
  subtitle="Our advantages"
  columns={4}
/>
```

### CTASection
Renders a call-to-action section with customizable styling.

**Usage:**
```tsx
import { CTASection } from '@/components/cms';
import { getCTABySlug } from '@/lib/supabase/queries/cms';
import { localizeCTA } from '@/types/cms';

const cta = await getCTABySlug('main-booking', 'pt');
const localizedCTA = localizeCTA(cta, 'pt');

<CTASection cta={localizedCTA} />
```

## Supported Section Types

The `PageRenderer` component supports the following section types:

- `hero` - Hero section with title, subtitle, and CTAs
- `features` - Grid of feature cards
- `cta` - Call-to-action section
- `text_block` - Rich text content block
- `treatments_showcase` - Treatment listings (to be implemented)
- `team_showcase` - Team member listings (to be implemented)
- `testimonials` - Client testimonials (to be implemented)
- `faq` - Frequently asked questions (to be implemented)

## Database Structure

The CMS uses the following tables:

- `cms_pages` - Page definitions
- `cms_page_translations` - Page metadata (title, meta tags) by locale
- `cms_page_sections` - Sections within a page
- `cms_section_translations` - Section content by locale
- `cms_features` - Reusable feature cards
- `cms_feature_translations` - Feature translations
- `cms_cta_sections` - Reusable CTA sections
- `cms_cta_translations` - CTA translations
- `cms_faqs` - FAQ items
- `cms_faq_translations` - FAQ translations

## Example: Creating a New Page

1. **Add page to database:**
```sql
INSERT INTO cms_pages (slug, template, is_published)
VALUES ('about', 'info', true);

-- Add translations
INSERT INTO cms_page_translations (page_id, language_code, title, meta_title, meta_description)
SELECT id, 'pt', 'Sobre Nós', 'Sobre a Clínica', 'Conheça a nossa clínica'
FROM cms_pages WHERE slug = 'about';
```

2. **Add sections:**
```sql
-- Add hero section
INSERT INTO cms_page_sections (page_id, section_type, display_order)
SELECT id, 'hero', 1
FROM cms_pages WHERE slug = 'about';

-- Add hero content
INSERT INTO cms_section_translations (section_id, language_code, content)
SELECT id, 'pt', '{"title": "About Us", "subtitle": "Our story"}'::jsonb
FROM cms_page_sections
WHERE page_id = (SELECT id FROM cms_pages WHERE slug = 'about')
AND section_type = 'hero';
```

3. **Create Next.js page:**
```tsx
// app/[locale]/about/page.tsx
import { PageRenderer } from '@/components/cms';
import { getPageBySlug } from '@/lib/supabase/queries/cms';
import { localizePageData } from '@/types/cms';

export default async function AboutPage({ params }) {
  const { locale } = await params;
  const page = await getPageBySlug('about', locale);
  const localizedPage = localizePageData(page, locale);

  return <PageRenderer page={localizedPage} locale={locale} />;
}
```

## Server vs Client Components

- All query functions in `src/lib/supabase/queries/cms.ts` are **server-side only**
- The `PageRenderer` component is a **client component** because it needs to fetch related data
- Individual section components (HeroSection, FeatureGrid, CTASection) are **client components** for flexibility

## Type Safety

All CMS components are fully typed with TypeScript. See `src/types/cms.ts` for all type definitions.
