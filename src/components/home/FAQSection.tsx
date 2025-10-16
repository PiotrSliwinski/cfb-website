import { getTranslations } from 'next-intl/server';

export async function FAQSection() {
  const t = await getTranslations({ namespace: 'home.faqs' });

  const faqs = [
    { id: 1, question: t('q1.question'), answer: t('q1.answer') },
    { id: 2, question: t('q2.question'), answer: t('q2.answer') },
    { id: 3, question: t('q3.question'), answer: t('q3.answer') },
    { id: 4, question: t('q4.question'), answer: t('q4.answer') },
    { id: 5, question: t('q5.question'), answer: t('q5.answer') },
    { id: 6, question: t('q6.question'), answer: t('q6.answer') },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {t('label')}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0098AA' }}>
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group border border-gray-200 rounded-lg bg-white hover:border-primary-400 transition-all duration-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-medium pr-4" style={{ color: '#4E5865' }}>
                    {faq.question}
                  </span>
                  <svg
                    className="w-5 h-5 text-primary-600 flex-shrink-0 transition-transform group-open:-rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
