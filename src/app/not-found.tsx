import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: '#0098AA' }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Página não encontrada
          </h2>
          <p className="text-gray-600 mb-8">
            A página que procura não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-400 transition-colors"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/pt/contacto"
              className="inline-flex items-center justify-center bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors border-2 border-primary-600"
            >
              Contactar-nos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
