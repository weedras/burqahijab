'use client';

import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Lock } from 'lucide-react';

const signals = [
  {
    icon: Truck,
    label: 'Free Shipping',
    description: 'On orders over PKR 3,000',
  },
  {
    icon: ShieldCheck,
    label: 'Quality Guarantee',
    description: 'Premium fabrics & craftsmanship',
  },
  {
    icon: RotateCcw,
    label: 'Easy Returns',
    description: '14-day hassle-free returns',
  },
  {
    icon: Lock,
    label: 'Secure Payment',
    description: 'SSL encrypted checkout',
  },
];

export function TrustSignals() {
  return (
    <section className="border-y border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-[#111]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.label}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#0A0A0A] shadow-sm">
                <signal.icon className="h-5 w-5 text-[#d79c4a]" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {signal.label}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {signal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
