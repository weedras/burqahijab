'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Something Went Wrong
            </h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              className="bg-[#d79c4a] text-white px-8 py-3 rounded-md hover:bg-[#c48a35] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
