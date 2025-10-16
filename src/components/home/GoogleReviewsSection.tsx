import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { ExternalLink } from 'lucide-react';

import StarRating from '@/components/ui/StarRating';
import { getGoogleReviews } from '@/lib/google-reviews';

export default async function GoogleReviewsSection() {
  const t = await getTranslations({ namespace: 'testimonials' });
  const reviewsData = await getGoogleReviews(5);

  if (reviewsData.warning && reviewsData.reviews.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800 mb-2">
                <strong>{t('configRequired')}</strong>
              </p>
              <p className="text-sm text-yellow-700">{reviewsData.warning}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!reviewsData.reviews.length) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {t('label')}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#0098AA' }}>
            {t('title')}
          </h2>
          <div className="flex items-center justify-center gap-4 mb-2">
            <StarRating rating={reviewsData.totalRating} size="lg" showNumber />
            <span className="text-gray-600">
              {t('basedOn')} {reviewsData.totalReviews} {t('reviews')}
            </span>
          </div>
          <a
            href="https://www.google.com/maps/place/Clinica+Ferreira+Borges"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors text-sm"
          >
            {t('viewAllReviews')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviewsData.reviews.slice(0, 6).map((review, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary-400 transition-all duration-300"
            >
              {/* Author Info */}
              <div className="flex items-start gap-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                  {review.profile_photo_url ? (
                    <Image
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-semibold">
                      {review.author_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {review.author_url ? (
                      <a
                        href={review.author_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:text-primary-600 transition-colors truncate"
                        style={{ color: '#4E5865' }}
                      >
                        {review.author_name}
                      </a>
                    ) : (
                      <p className="font-semibold truncate" style={{ color: '#4E5865' }}>
                        {review.author_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-gray-500">
                      {review.relative_time_description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-6">
                {review.text}
              </p>

              {/* Google Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>{t('postedOn')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
