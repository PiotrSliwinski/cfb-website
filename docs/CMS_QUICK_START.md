# CMS Quick Start Guide

## Testing the CMS Implementation

### 1. Verify Database Content

Run these commands to verify the CMS data is properly seeded:

```bash
# Check pages
docker exec supabase_db_cfb-website psql -U postgres -d postgres -c "SELECT slug, template, is_homepage FROM cms_pages;"

# Check features
docker exec supabase_db_cfb-website psql -U postgres -d postgres -c "SELECT slug, icon FROM cms_features ORDER BY display_order;"

# Check CTAs
docker exec supabase_db_cfb-website psql -U postgres -d postgres -c "SELECT slug, style FROM cms_cta_sections;"

# Check home page structure
docker exec supabase_db_cfb-website psql -U postgres -d postgres -c "SELECT pt.language_code, pt.title, array_agg(ps.section_type ORDER BY ps.display_order) as sections FROM cms_pages p JOIN cms_page_translations pt ON p.id = pt.page_id JOIN cms_page_sections ps ON p.id = ps.page_id WHERE p.slug = 'home' GROUP BY pt.language_code, pt.title;"
```

### 2. Create a Test Page

Create a new file at `src/app/[locale]/cms-test/page.tsx`:

```tsx
import { PageRenderer } from '@/components/cms';
import { getPageBySlug } from '@/lib/supabase/queries/cms';
import { localizePageData } from '@/types/cms';
import { PageProps } from '@/types';

export default async function CMSTestPage({ params }: PageProps) {
  const { locale } = await params;

  // Fetch the home page from CMS
  const page = await getPageBySlug('home', locale);

  if (!page) {
    return (
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p>The requested CMS page could not be found.</p>
      </div>
    );
  }

  // Convert to localized format
  const localizedPage = localizePageData(page, locale);

  if (!localizedPage) {
    return (
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">No Content Available</h1>
        <p>This page doesn't have content for the selected language.</p>
      </div>
    );
  }

  // Render the page
  return <PageRenderer page={localizedPage} locale={locale} />;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('home', locale);
  const localizedPage = localizePageData(page, locale);

  return {
    title: localizedPage?.meta_title || localizedPage?.title,
    description: localizedPage?.meta_description,
  };
}
```

### 3. Start the Development Server

```bash
npm run dev
```

Then visit:
- Portuguese: http://localhost:3000/pt/cms-test
- English: http://localhost:3000/en/cms-test

### 4. Test Individual Components

Create a test file at `src/app/[locale]/cms-components-test/page.tsx`:

```tsx
import { HeroSection, FeatureGrid, CTASection } from '@/components/cms';
import { getFeatures, getCTABySlug } from '@/lib/supabase/queries/cms';
import { localizeFeature, localizeCTA } from '@/types/cms';
import { PageProps } from '@/types';

export default async function ComponentsTestPage({ params }: PageProps) {
  const { locale } = await params;

  // Fetch features
  const features = await getFeatures(locale);
  const localizedFeatures = features
    .map(f => localizeFeature(f, locale))
    .filter(Boolean);

  // Fetch CTA
  const cta = await getCTABySlug('main-booking', locale);
  const localizedCTA = cta ? localizeCTA(cta, locale) : null;

  // Hero content (hardcoded for testing)
  const heroContent = {
    badge: 'Test Badge',
    title: 'CMS Components Test',
    subtitle: 'Testing individual CMS components',
    description: 'This page demonstrates each CMS component individually.',
    primary_button_text: 'Primary Action',
    primary_button_url: '#',
    secondary_button_text: 'Secondary Action',
    secondary_button_url: '#',
    background_color: '#0098AA',
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection content={heroContent} />

      {/* Features Grid */}
      <FeatureGrid
        features={localizedFeatures}
        title="Our Features"
        subtitle="What makes us special"
        columns={4}
      />

      {/* CTA Section */}
      {localizedCTA && <CTASection cta={localizedCTA} />}
    </>
  );
}
```

Visit: http://localhost:3000/pt/cms-components-test

## Creating Your First Custom Page

### Step 1: Add Page to Database

```sql
-- Insert the page
INSERT INTO cms_pages (slug, template, is_published)
VALUES ('about-us', 'info', true);

-- Add Portuguese translation
INSERT INTO cms_page_translations (page_id, language_code, title, meta_title, meta_description)
SELECT
  id,
  'pt',
  'Sobre Nós',
  'Sobre a Clínica Ferreira Borges',
  'Conheça a história e valores da nossa clínica dentária'
FROM cms_pages WHERE slug = 'about-us';

-- Add English translation
INSERT INTO cms_page_translations (page_id, language_code, title, meta_title, meta_description)
SELECT
  id,
  'en',
  'About Us',
  'About Clínica Ferreira Borges',
  'Learn about our dental clinic history and values'
FROM cms_pages WHERE slug = 'about-us';
```

### Step 2: Add a Hero Section

```sql
-- Add hero section
INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active)
SELECT id, 'hero', 1, true
FROM cms_pages WHERE slug = 'about-us';

-- Add Portuguese hero content
INSERT INTO cms_section_translations (section_id, language_code, content)
SELECT
  ps.id,
  'pt',
  jsonb_build_object(
    'title', 'Nossa História',
    'subtitle', 'Mais de 20 anos de excelência',
    'description', 'Dedicados a proporcionar os melhores cuidados dentários em Lisboa.',
    'primary_button_text', 'Conhecer a Equipa',
    'primary_button_url', '/pt/team',
    'background_color', '#0098AA'
  )
FROM cms_page_sections ps
JOIN cms_pages p ON ps.page_id = p.id
WHERE p.slug = 'about-us' AND ps.section_type = 'hero';

-- Add English hero content
INSERT INTO cms_section_translations (section_id, language_code, content)
SELECT
  ps.id,
  'en',
  jsonb_build_object(
    'title', 'Our Story',
    'subtitle', 'Over 20 years of excellence',
    'description', 'Dedicated to providing the best dental care in Lisbon.',
    'primary_button_text', 'Meet the Team',
    'primary_button_url', '/en/team',
    'background_color', '#0098AA'
  )
FROM cms_page_sections ps
JOIN cms_pages p ON ps.page_id = p.id
WHERE p.slug = 'about-us' AND ps.section_type = 'hero';
```

### Step 3: Add a Text Block Section

```sql
-- Add text block section
INSERT INTO cms_page_sections (page_id, section_type, display_order, is_active)
SELECT id, 'text_block', 2, true
FROM cms_pages WHERE slug = 'about-us';

-- Add Portuguese content
INSERT INTO cms_section_translations (section_id, language_code, content)
SELECT
  ps.id,
  'pt',
  jsonb_build_object(
    'title', 'Nossos Valores',
    'content', '<p>Na Clínica Ferreira Borges, acreditamos em cuidados personalizados...</p>'
  )
FROM cms_page_sections ps
JOIN cms_pages p ON ps.page_id = p.id
WHERE p.slug = 'about-us' AND ps.section_type = 'text_block';
```

### Step 4: Create the Next.js Page

Create `src/app/[locale]/about-us/page.tsx`:

```tsx
import { PageRenderer } from '@/components/cms';
import { getPageBySlug } from '@/lib/supabase/queries/cms';
import { localizePageData } from '@/types/cms';
import { PageProps } from '@/types';

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('about-us', locale);

  if (!page) {
    return <div>Page not found</div>;
  }

  const localizedPage = localizePageData(page, locale);

  if (!localizedPage) {
    return <div>No content available</div>;
  }

  return <PageRenderer page={localizedPage} locale={locale} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const page = await getPageBySlug('about-us', locale);
  const localizedPage = localizePageData(page, locale);

  return {
    title: localizedPage?.meta_title || localizedPage?.title,
    description: localizedPage?.meta_description,
  };
}
```

### Step 5: Test Your Page

Visit:
- http://localhost:3000/pt/about-us
- http://localhost:3000/en/about-us

## Troubleshooting

### Query Returns Null
Check that:
1. The page exists: `SELECT * FROM cms_pages WHERE slug = 'your-slug';`
2. Translations exist: `SELECT * FROM cms_page_translations WHERE page_id = 'your-page-id';`
3. The page is published: `is_published = true`
4. RLS policies allow reading

### Component Not Rendering
Check:
1. Section translations exist for the locale
2. Section is active: `is_active = true`
3. Content JSONB has required fields
4. Check browser console for errors

### Icons Not Showing
Ensure:
1. Icon name matches Lucide React icon name (lowercase with hyphens)
2. Icon exists in Lucide React library
3. Check the `cms_features.icon` column value

## Next Steps

1. **Explore the code**: Check out the files in `src/components/cms/`
2. **Read the docs**: See `src/components/cms/README.md`
3. **Add more pages**: Follow the pattern above
4. **Customize components**: Modify components to match your design system
5. **Build admin UI**: Create an admin panel for managing CMS content

## Useful Database Queries

```sql
-- List all pages with sections
SELECT
  p.slug,
  p.template,
  array_agg(DISTINCT ps.section_type ORDER BY ps.section_type) as section_types
FROM cms_pages p
LEFT JOIN cms_page_sections ps ON p.id = ps.page_id
GROUP BY p.id, p.slug, p.template;

-- Get full page data
SELECT
  p.slug,
  pt.language_code,
  pt.title,
  ps.section_type,
  ps.display_order,
  st.content
FROM cms_pages p
JOIN cms_page_translations pt ON p.id = pt.page_id
JOIN cms_page_sections ps ON p.id = ps.page_id
JOIN cms_section_translations st ON ps.id = st.section_id
WHERE p.slug = 'home'
  AND pt.language_code = 'pt'
  AND st.language_code = 'pt'
ORDER BY ps.display_order;
```

## Support

For questions or issues:
1. Check the documentation in `CMS_IMPLEMENTATION_SUMMARY.md`
2. Review component README at `src/components/cms/README.md`
3. Check TypeScript types in `src/types/cms.ts`
