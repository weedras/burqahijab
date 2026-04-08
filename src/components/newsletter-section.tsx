'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitted(true);
  };

  return (
    <section className="py-20 md:py-28 bg-[#f5f5f5] dark:bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <h2 className="section-title text-gray-900 dark:text-white">
            Subscribe to Our Newsletter
          </h2>
          <div className="section-line" />
          <p className="section-subtitle mt-4">
            Be the first to know about new collections, exclusive offers, and styling tips
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <CheckCircle className="h-12 w-12 text-[#d79c4a]" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Welcome to the family!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Check your inbox for a special welcome offer.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-12 flex-1 rounded-none border border-gray-300 bg-white px-5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#d79c4a] focus:outline-none dark:bg-[#0A0A0A] dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="h-12 px-8 bg-[#d79c4a] text-white text-sm font-semibold uppercase tracking-wider hover:bg-[#c48a35] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                By subscribing, you agree to our Privacy Policy. Unsubscribe at any time.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
