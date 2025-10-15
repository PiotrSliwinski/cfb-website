/**
 * CMS Feature Grid Component
 * Renders a grid of features from CMS content
 */

'use client';

import { LocalizedFeature } from '@/types/cms';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureGridProps {
  features: LocalizedFeature[];
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
}

export function FeatureGrid({
  features,
  title,
  subtitle,
  columns = 4
}: FeatureGridProps) {
  if (features.length === 0) {
    return null;
  }

  const getIcon = (iconName?: string): LucideIcon | null => {
    if (!iconName) return null;

    // Convert icon name to PascalCase (e.g., 'award' -> 'Award')
    const iconKey = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    return (Icons as any)[iconKey] as LucideIcon || null;
  };

  const columnClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Feature Grid */}
        <div className={`grid gap-8 ${columnClass}`}>
          {features.map((feature) => {
            const Icon = getIcon(feature.icon);

            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                {Icon && (
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: feature.icon_color
                        ? `${feature.icon_color}15`
                        : '#0098AA15'
                    }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{
                        color: feature.icon_color || '#0098AA'
                      }}
                    />
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                {feature.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
