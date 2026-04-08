'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Something Went Wrong
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-[#d79c4a] text-white px-8 py-3 rounded-md hover:bg-[#c48a35] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
