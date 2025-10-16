/**
 * CMS Page Renderer Component
 * Dynamically renders page sections based on CMS content
 */

'use client';

import { LocalizedPage, LocalizedSection, HeroSectionContent } from '@/types/cms';
import { HeroSection } from './HeroSection';
import { FeatureGrid } from './FeatureGrid';
import { CTASection } from './CTASection';
import { TestimonialsSection } from './TestimonialsSection';
import { GallerySection } from './GallerySection';
import { TwoColumnSection } from './TwoColumnSection';
import { TreatmentsGridSection } from './TreatmentsGridSection';
import { localizeFeature, localizeCTA } from '@/types/cms';
import { Locale } from '@/types';
import { useEffect, useState } from 'react';
import {
  getFeatures,
  getCTABySlug,
  getTestimonials,
  getGalleryImages,
  getTreatmentsForGrid,
} from '@/app/actions/cms';

interface PageRendererProps {
  page: LocalizedPage;
  locale: Locale;
}

interface SectionRendererProps {
  section: LocalizedSection;
  locale: Locale;
}

function SectionRenderer({ section, locale }: SectionRendererProps) {
  const [featureData, setFeatureData] = useState<any>(null);
  const [ctaData, setCTAData] = useState<any>(null);
  const [testimonialsData, setTestimonialsData] = useState<any>(null);
  const [galleryData, setGalleryData] = useState<any>(null);
  const [treatmentsData, setTreatmentsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if ((section.section_type as string) === 'features') {
        try {
          const result = await getFeatures(locale);
          if (result.success && result.data) {
            const localizedFeatures = result.data
              .map((f: any) => localizeFeature(f, locale))
              .filter(Boolean);
            setFeatureData(localizedFeatures);
          }
        } catch (error) {
          console.error('Error loading features:', error);
        }
      }

      if ((section.section_type as string) === 'cta') {
        const ctaSlug = section.content.cta_slug || section.settings?.cta_slug;
        if (ctaSlug) {
          try {
            const result = await getCTABySlug(ctaSlug, locale);
            if (result.success && result.data) {
              const localizedCTA = localizeCTA(result.data as any, locale);
              setCTAData(localizedCTA);
            }
          } catch (error) {
            console.error('Error loading CTA:', error);
          }
        }
      }

      if ((section.section_type as string) === 'testimonials') {
        try {
          const limit = section.settings?.limit || 10;
          const source = section.settings?.source;
          const result = await getTestimonials(locale, { limit, source });
          if (result.success && result.data) {
            setTestimonialsData(result.data);
          }
        } catch (error) {
          console.error('Error loading testimonials:', error);
        }
      }

      if ((section.section_type as string) === 'gallery') {
        try {
          const category = section.settings?.category;
          const result = await getGalleryImages(locale, { category });
          if (result.success && result.data) {
            setGalleryData(result.data);
          }
        } catch (error) {
          console.error('Error loading gallery images:', error);
        }
      }

      if ((section.section_type as string) === 'treatments_grid') {
        try {
          const result = await getTreatmentsForGrid(locale);
          if (result.success && result.data) {
            setTreatmentsData(result.data);
          }
        } catch (error) {
          console.error('Error loading treatments:', error);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [section, locale]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  switch (section.section_type) {
    case 'hero':
      return <HeroSection content={section.content as HeroSectionContent} />;

    case 'features':
      if (!featureData) return null;
      return (
        <FeatureGrid
          features={featureData}
          title={section.content.title}
          subtitle={section.content.subtitle}
          columns={section.settings?.columns || 4}
        />
      );

    case 'cta':
      if (!ctaData) return null;
      return <CTASection cta={ctaData} />;

    case 'text_block':
      return (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {section.content.title && (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {section.content.title}
                </h2>
              )}
              {section.content.content && (
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content.content }}
                />
              )}
            </div>
          </div>
        </section>
      );

    case 'treatments_showcase':
      // This would integrate with your existing treatments system
      return (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              {section.content.title && (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
              )}
              {section.content.subtitle && (
                <p className="text-xl text-gray-600">
                  {section.content.subtitle}
                </p>
              )}
            </div>
            {/* TODO: Integrate with treatments query */}
            <div className="text-center text-gray-500">
              Treatments showcase coming soon...
            </div>
          </div>
        </section>
      );

    case 'team_showcase':
      // This would integrate with your existing team system
      return (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              {section.content.title && (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  {section.content.title}
                </h2>
              )}
              {section.content.subtitle && (
                <p className="text-xl text-gray-600">
                  {section.content.subtitle}
                </p>
              )}
            </div>
            {/* TODO: Integrate with team query */}
            <div className="text-center text-gray-500">
              Team showcase coming soon...
            </div>
          </div>
        </section>
      );

    case 'testimonials':
      if (!testimonialsData) return null;
      return (
        <TestimonialsSection
          content={section.content as { label?: string; title: string; subtitle?: string }}
          settings={section.settings || {}}
          testimonials={testimonialsData}
        />
      );

    case 'gallery':
      if (!galleryData) return null;
      return (
        <GallerySection
          content={section.content as { label?: string; title: string; subtitle?: string }}
          settings={section.settings || {}}
          images={galleryData}
        />
      );

    case 'two_column':
      return (
        <TwoColumnSection
          content={section.content as { label?: string; title: string; subtitle?: string; [key: string]: any }}
          settings={section.settings || {}}
        />
      );

    case 'treatments_grid':
      if (!treatmentsData) return null;
      return (
        <TreatmentsGridSection
          content={section.content as { label?: string; title: string; subtitle?: string; footer_text?: string; cta_text?: string }}
          settings={section.settings || {}}
          treatments={treatmentsData}
          locale={locale}
        />
      );

    case 'faq':
      // This would integrate with your FAQ system
      return (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {section.content.title && (
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
                  {section.content.title}
                </h2>
              )}
              {/* TODO: Integrate with FAQs query */}
              <div className="text-center text-gray-500">
                FAQs coming soon...
              </div>
            </div>
          </div>
        </section>
      );

    default:
      console.warn(`Unknown section type: ${section.section_type}`);
      return null;
  }
}

export function PageRenderer({ page, locale }: PageRendererProps) {
  if (!page || !page.sections || page.sections.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">No content available for this page.</p>
      </div>
    );
  }

  return (
    <>
      {page.sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          locale={locale}
        />
      ))}
    </>
  );
}
