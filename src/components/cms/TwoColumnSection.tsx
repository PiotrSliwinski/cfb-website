import Image from 'next/image';
import * as LucideIcons from 'lucide-react';

interface Feature {
  icon: string;
  title_key: string;
  description_key: string;
}

interface TwoColumnSectionProps {
  content: {
    label?: string;
    title: string;
    subtitle?: string;
    [key: string]: any; // For dynamic feature titles/descriptions
  };
  settings: {
    image_url?: string;
    image_position?: 'left' | 'right';
    background?: string;
    features?: Feature[];
  };
}

export function TwoColumnSection({ content, settings }: TwoColumnSectionProps) {
  const { title, subtitle, label, ...dynamicContent } = content;
  const {
    image_url,
    image_position = 'right',
    background = 'white',
    features = [],
  } = settings;

  const bgClass = background === 'gray-50' ? 'bg-gray-50' : 'bg-white';
  const imageOnLeft = image_position === 'left';

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Circle;
  };

  return (
    <section className={`py-20 ${bgClass}`}>
      <div className="container mx-auto px-6">
        <div className={`grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto ${imageOnLeft ? 'lg:flex-row-reverse' : ''}`}>
          {/* Content Column */}
          <div className={imageOnLeft ? 'lg:order-2' : ''}>
            {/* Section Header */}
            <div className="mb-12">
              {label && (
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                </div>
              )}

              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#0098AA' }}>
                {title}
              </h2>

              {subtitle && (
                <p className="text-lg text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Features List */}
            {features.length > 0 && (
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = getIcon(feature.icon);
                  const featureTitle = dynamicContent[feature.title_key] || feature.title_key;
                  const featureDesc = dynamicContent[feature.description_key] || feature.description_key;

                  return (
                    <div key={index} className="flex gap-4">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#0098AA' }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: '#4E5865' }}>
                          {featureTitle}
                        </h3>
                        <p className="text-base text-gray-600 leading-relaxed">
                          {featureDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image Column */}
          <div className={imageOnLeft ? 'lg:order-1' : ''}>
            {image_url ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={image_url}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                <p className="text-gray-400">Image placeholder</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
