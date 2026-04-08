import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
      <div className="text-center px-6">
        <h1 className="text-8xl font-bold text-[#d79c4a] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-[#d79c4a] text-white px-8 py-3 rounded-md hover:bg-[#c48a35] transition-colors inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
