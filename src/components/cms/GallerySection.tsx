'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  category?: string;
  cms_gallery_image_translations: Array<{
    caption?: string;
    description?: string;
  }>;
}

interface GallerySectionProps {
  content: {
    label?: string;
    title: string;
    subtitle?: string;
  };
  settings: {
    columns?: number;
    show_captions?: boolean;
    category?: string;
  };
  images: GalleryImage[];
}

export function GallerySection({ content, settings, images }: GallerySectionProps) {
  const { title, subtitle, label } = content;
  const { columns = 3, show_captions = true } = settings;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <section className="py-20 bg-white">
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

          {/* Gallery Grid */}
          <div className={`grid ${gridClasses} gap-6 max-w-7xl mx-auto`}>
            {images.map((image, index) => {
              const translation = image.cms_gallery_image_translations?.[0];

              return (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-primary-400 transition-all cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <Image
                      src={image.thumbnail_url || image.image_url}
                      alt={image.alt_text || translation?.caption || 'Gallery image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>

                  {/* Caption */}
                  {show_captions && translation?.caption && (
                    <div className="p-4 bg-white">
                      <h3 className="font-semibold text-gray-700 mb-1">
                        {translation.caption}
                      </h3>
                      {translation.description && (
                        <p className="text-sm text-gray-600">
                          {translation.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={prevImage}
              className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] relative">
            <Image
              src={images[currentImageIndex].image_url}
              alt={images[currentImageIndex].alt_text || 'Gallery image'}
              width={1200}
              height={800}
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
            />

            {/* Caption */}
            {images[currentImageIndex].cms_gallery_image_translations?.[0]?.caption && (
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-medium">
                  {images[currentImageIndex].cms_gallery_image_translations[0].caption}
                </p>
                {images[currentImageIndex].cms_gallery_image_translations[0].description && (
                  <p className="text-gray-300 text-sm mt-2">
                    {images[currentImageIndex].cms_gallery_image_translations[0].description}
                  </p>
                )}
              </div>
            )}

            {/* Image Counter */}
            <div className="mt-4 text-center text-white text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={nextImage}
              className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
