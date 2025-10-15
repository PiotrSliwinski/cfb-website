export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">A carregar...</p>
      </div>
    </div>
  );
}
