'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: '#0098AA' }}>
            Erro
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Algo correu mal
          </h2>
          <p className="text-gray-600 mb-8">
            Pedimos desculpa pelo inconveniente. Ocorreu um erro inesperado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-400 transition-colors"
            >
              Tentar Novamente
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-primary-600"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
