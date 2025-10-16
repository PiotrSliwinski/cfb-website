'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Sparkles, Shield, Clock, Play, Pause } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

export function HeroSection() {
  const t = useTranslations('home.hero');
  const common = useTranslations('common');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    // Load video only after critical content is rendered and page is interactive
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative bg-gray-900 py-24 md:py-32 overflow-hidden">
      {/* Fallback gradient background - shown while video loads */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900"></div>

      {/* Video Background - Lazy loaded */}
      {shouldLoadVideo && (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/DJI_20250925180342_0012_D.mp4" type="video/mp4" />
          </video>
          {/* Lighter gradient overlay - only on left side for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
        </div>
      )}

      {/* Play/Pause Control */}
      <button
        onClick={toggleVideo}
        className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        aria-label={isPlaying ? 'Pause video' : 'Play video'}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge with icon */}
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">{t('trustBadge')}</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight text-white">
              {t('title')}
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a
                href="https://booking.clinicaferreiraborges.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-primary-400 transition-colors"
              >
                {common('bookAppointment')}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+351935189807"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-primary-50 transition-colors border-2 border-primary-600"
              >
                <span>{common('callNow')}</span>
              </a>
            </div>

            {/* Trust Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">20+</div>
                    <div className="text-sm text-gray-300">{t('yearsLabel')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">24h</div>
                    <div className="text-sm text-gray-300">{t('responseLabel')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Element - removed for video background */}
          <div className="relative hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}
