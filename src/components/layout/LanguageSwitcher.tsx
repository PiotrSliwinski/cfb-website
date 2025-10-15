'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Language } from '@/types/admin/language';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/admin/languages');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Filter only enabled languages and sort by display_order
            const enabledLanguages = result.data
              .filter((lang: Language) => lang.enabled)
              .sort((a: Language, b: Language) => a.display_order - b.display_order);
            setLanguages(enabledLanguages);
          }
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages if fetch fails
        setLanguages([
          { code: 'pt', name: 'Portuguese', native_name: 'Português', flag: '🇵🇹', enabled: true } as Language,
          { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', enabled: true } as Language,
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchLanguages();
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    // Remove current locale from pathname
    const segments = pathname.split('/');
    const languageCodes = languages.map(lang => lang.code);
    if (languageCodes.includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPathname = segments.join('/');
    router.push(newPathname);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="px-2 py-1 text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLocaleChange(lang.code)}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
            locale === lang.code
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={lang.native_name}
        >
          {lang.flag || lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
