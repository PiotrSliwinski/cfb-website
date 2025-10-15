/**
 * CMS CTA Section Component
 * Renders a call-to-action section from CMS content
 */

'use client';

import { ArrowRight } from 'lucide-react';
import { LocalizedCTA } from '@/types/cms';

interface CTASectionProps {
  cta: LocalizedCTA;
}

export function CTASection({ cta }: CTASectionProps) {
  const {
    badge,
    title,
    subtitle,
    description,
    button_text,
    button_url,
    secondary_button_text,
    secondary_button_url,
    style,
    button_style,
    background_color,
  } = cta;

  // Define style variations
  const bgColorClass = background_color || (
    style === 'primary' ? '#0098AA' :
    style === 'secondary' ? '#6366F1' :
    '#DC2626' // urgent
  );

  const getButtonClasses = (isPrimary: boolean) => {
    if (button_style === 'outlined') {
      return isPrimary
        ? 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600'
        : 'bg-white border-2 border-white text-primary-600 hover:bg-gray-100';
    }
    if (button_style === 'text') {
      return 'bg-transparent text-white hover:bg-white/10';
    }
    // filled (default)
    return isPrimary
      ? 'bg-white text-primary-600 hover:bg-gray-100'
      : 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600';
  };

  return (
    <section
      className="py-20"
      style={{ backgroundColor: bgColorClass }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}

          {/* Buttons */}
          {(button_text || secondary_button_text) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {button_text && button_url && (
                <a
                  href={button_url}
                  target={button_url.startsWith('http') ? '_blank' : undefined}
                  rel={button_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg transition-all ${getButtonClasses(true)}`}
                >
                  {button_text}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}

              {secondary_button_text && secondary_button_url && (
                <a
                  href={secondary_button_url}
                  target={secondary_button_url.startsWith('http') ? '_blank' : undefined}
                  rel={secondary_button_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-lg transition-all ${getButtonClasses(false)}`}
                >
                  {secondary_button_text}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
