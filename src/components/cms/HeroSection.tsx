/**
 * CMS Hero Section Component
 * Renders a hero section from CMS content
 */

'use client';

import { ArrowRight } from 'lucide-react';
import { HeroSectionContent } from '@/types/cms';

interface HeroSectionProps {
  content: HeroSectionContent;
}

export function HeroSection({ content }: HeroSectionProps) {
  const {
    badge,
    title,
    subtitle,
    description,
    primary_button_text,
    primary_button_url,
    secondary_button_text,
    secondary_button_url,
    background_image,
    background_color,
  } = content;

  return (
    <section
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        backgroundColor: background_color || '#111827',
      }}
    >
      {/* Background Image */}
      {background_image && (
        <div className="absolute inset-0">
          <img
            src={background_image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        </div>
      )}

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm shadow-lg">
                <span className="text-sm font-medium text-white">{badge}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight text-white">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(primary_button_text || secondary_button_text) && (
            <div className="flex flex-col sm:flex-row gap-4">
              {primary_button_text && primary_button_url && (
                <a
                  href={primary_button_url}
                  target={primary_button_url.startsWith('http') ? '_blank' : undefined}
                  rel={primary_button_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors"
                >
                  {primary_button_text}
                  <ArrowRight className="w-5 h-5" />
                </a>
              )}

              {secondary_button_text && secondary_button_url && (
                <a
                  href={secondary_button_url}
                  target={secondary_button_url.startsWith('http') ? '_blank' : undefined}
                  rel={secondary_button_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors border-2 border-primary-600"
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
