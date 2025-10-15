import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  source: string;
  author_name: string;
  author_photo_url?: string;
  rating: number;
  review_date: string;
  cms_testimonial_translations: Array<{
    review_text: string;
  }>;
}

interface TestimonialsSectionProps {
  content: {
    label?: string;
    title: string;
    subtitle?: string;
  };
  settings: {
    source?: string;
    layout?: 'carousel' | 'grid';
    show_rating?: boolean;
    show_date?: boolean;
    limit?: number;
  };
  testimonials: Testimonial[];
}

export function TestimonialsSection({ content, settings, testimonials }: TestimonialsSectionProps) {
  const { title, subtitle, label } = content;
  const { show_rating = true, show_date = true } = settings;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => {
            const translation = testimonial.cms_testimonial_translations?.[0];
            if (!translation) return null;

            return (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-400 transition-all"
              >
                {/* Rating */}
                {show_rating && (
                  <div className="mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                )}

                {/* Review Text */}
                <p className="text-base text-gray-600 mb-6 leading-relaxed">
                  "{translation.review_text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  {testimonial.author_photo_url && (
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src={testimonial.author_photo_url}
                        alt={testimonial.author_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!testimonial.author_photo_url && (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {testimonial.author_name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="font-semibold text-gray-700">
                      {testimonial.author_name}
                    </div>
                    {show_date && testimonial.review_date && (
                      <div className="text-sm text-gray-500">
                        {formatDate(testimonial.review_date)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Source Badge */}
                {testimonial.source === 'google' && (
                  <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google Review</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
