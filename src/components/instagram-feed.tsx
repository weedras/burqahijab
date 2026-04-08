'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import { useStoreSettings } from '@/stores/store-settings-store';

const instagramPosts = [
  { image: '/images/instagram/insta-1.jpg', alt: 'Instagram post 1' },
  { image: '/images/instagram/insta-2.jpg', alt: 'Instagram post 2' },
  { image: '/images/instagram/insta-3.jpg', alt: 'Instagram post 3' },
  { image: '/images/instagram/insta-4.jpg', alt: 'Instagram post 4' },
  { image: '/images/instagram/insta-5.jpg', alt: 'Instagram post 5' },
];

function getInstagramHandle(url: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/^\//, '');
    return pathname ? `@${pathname}` : '@burqahijab';
  } catch {
    return '@burqahijab';
  }
}

export function InstagramFeed() {
  const { settings, fetch } = useStoreSettings();

  useEffect(() => { fetch(); }, [fetch]);

  const instagramUrl = settings.instagramUrl;
  const instagramHandle = useMemo(() => getInstagramHandle(instagramUrl), [instagramUrl]);

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title text-gray-900 dark:text-white">
            Follow Us on Instagram
          </h2>
          <div className="section-line" />
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-[#d79c4a] font-medium hover:text-[#c48a35] transition-colors"
          >
            <Instagram className="w-5 h-5" />
            {instagramHandle}
          </a>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.alt}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
