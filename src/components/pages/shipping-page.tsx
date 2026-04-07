'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  Globe,
  MapPin,
  Package,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/stores/ui-store';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const domesticShipping = {
  standard: {
    title: 'Standard Delivery',
    time: '3–5 Business Days',
    cost: 'PKR 200',
    freeThreshold: 'Free on orders over PKR 3,000',
    description:
      'Our standard delivery service covers all major cities and towns across Pakistan. Orders are dispatched within 24 hours of placement (for orders before 2:00 PM PKT). You will receive a tracking number via SMS and email once your order has been shipped.',
  },
  express: {
    title: 'Express Delivery',
    time: '1–2 Business Days',
    cost: 'PKR 450',
    freeThreshold: 'Available for Karachi, Lahore, Islamabad & Rawalpindi only',
    description:
      'Need your order urgently? Our express delivery option ensures next-day delivery for orders placed before 12:00 PM PKT in Karachi, Lahore, Islamabad, and Rawalpindi. This service is perfect for last-minute Eid shopping or special occasions when you need your outfit in a hurry.',
  },
};

const internationalRegions = [
  {
    region: 'Middle East & GCC',
    countries: 'UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman',
    time: '5–8 Business Days',
    cost: 'Starting from $15 USD',
    free: 'Free on orders over $150 USD',
  },
  {
    region: 'United Kingdom & Europe',
    countries: 'UK, Germany, France, Netherlands, Sweden, Denmark',
    time: '7–10 Business Days',
    cost: 'Starting from $18 USD',
    free: 'Free on orders over $175 USD',
  },
  {
    region: 'North America',
    countries: 'USA, Canada',
    time: '8–12 Business Days',
    cost: 'Starting from $20 USD',
    free: 'Free on orders over $200 USD',
  },
  {
    region: 'Southeast Asia & Australia',
    countries: 'Malaysia, Indonesia, Singapore, Australia, New Zealand',
    time: '7–12 Business Days',
    cost: 'Starting from $16 USD',
    free: 'Free on orders over $160 USD',
  },
  {
    region: 'Rest of World',
    countries: 'All other countries',
    time: '10–14 Business Days',
    cost: 'Starting from $25 USD',
    free: 'Free on orders over $250 USD',
  },
];

const shippingPartners = [
  {
    name: 'TCS',
    type: 'Domestic',
    description: 'Pakistan\'s leading courier service with nationwide coverage and real-time tracking.',
  },
  {
    name: 'Leopards Courier',
    type: 'Domestic',
    description: 'Reliable domestic courier with extensive reach to smaller cities and rural areas.',
  },
  {
    name: 'DHL Express',
    type: 'International',
    description: 'Premium international courier with express delivery options and end-to-end tracking.',
  },
  {
    name: 'FedEx',
    type: 'International',
    description: 'Global logistics leader offering reliable international shipping to 200+ countries.',
  },
];

export function ShippingPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToReturns = useUIStore((s) => s.navigateToReturns);
  const navigateToContact = useUIStore((s) => s.navigateToContact);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-[#d79c4a]/10 to-background py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Truck className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Shipping Information
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              We ship worldwide with care and precision. Every BurqaHijab.shop order
              is lovingly packaged in our signature gift-ready boxes and dispatched
              through trusted delivery partners to ensure it arrives at your doorstep
              safely and on time.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={navigateHome}
          className="mb-8 gap-2 text-gray-500 dark:text-gray-400 hover:text-[#d79c4a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        {/* Domestic Shipping */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <MapPin className="mr-2 inline-block h-5 w-5 text-[#d79c4a]" />
            Domestic Shipping (Pakistan)
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(domesticShipping).map((option) => (
              <Card key={option.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-gray-900 dark:text-white ">
                      {option.title}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {option.time}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white ">
                      Cost
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ">
                      {option.cost}
                    </span>
                  </div>
                  <p className="text-xs text-[#d79c4a] ">
                    {option.freeThreshold}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* International Shipping */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <Globe className="mr-2 inline-block h-5 w-5 text-[#d79c4a]" />
            International Shipping
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 ">
            We are delighted to ship to over 50 countries worldwide. International
            orders are dispatched via DHL Express or FedEx with full tracking. Please
            note that customers are responsible for any customs duties or import taxes
            levied by their country of residence.
          </p>
          <div className="space-y-3">
            {internationalRegions.map((region) => (
              <Card key={region.region} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white ">
                        {region.region}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ">
                        {region.countries}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs ">
                      <div className="text-center">
                        <span className="block text-gray-500 dark:text-gray-400">Delivery</span>
                        <span className="font-medium text-gray-900 dark:text-white">{region.time}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-gray-500 dark:text-gray-400">Cost</span>
                        <span className="font-medium text-gray-900 dark:text-white">{region.cost}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-gray-500 dark:text-gray-400">Free Shipping</span>
                        <span className="font-medium text-[#d79c4a]">{region.free}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Order Tracking */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <ShieldCheck className="mr-2 inline-block h-5 w-5 text-[#d79c4a]" />
            Order Tracking
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                Every BurqaHijab.shop order comes with real-time tracking so you can
                monitor your package every step of the way. Once your order has been
                dispatched, you will receive:
              </p>
              <ul className="mb-4 space-y-2">
                {[
                  'A confirmation email with your tracking number and courier link',
                  'An SMS notification with the tracking number (for Pakistani numbers)',
                  'Real-time delivery updates via the courier\'s tracking system',
                  'A delivery confirmation notification when your package arrives',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 ">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d79c4a]" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 dark:text-gray-400 ">
                If you have not received tracking information within 48 hours of placing
                your order, please contact us at{' '}
                <span className="text-[#d79c4a]">hello@burqahijab.shop</span> or WhatsApp us
                at <span className="text-[#d79c4a]">+92 300 1234567</span>.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Shipping Partners */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Shipping Partners
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {shippingPartners.map((partner) => (
              <Card key={partner.name} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white ">
                        {partner.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        {partner.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 ">
                    {partner.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Packaging */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <Package className="mr-2 inline-block h-5 w-5 text-[#d79c4a]" />
            Our Packaging
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <p className="mb-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                Every BurqaHijab.shop order is a gift — to yourself or someone you
                love. We take great care in packaging each order to ensure your items
                arrive in perfect condition and create a memorable unboxing experience.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Premium Box', desc: 'Elegant branded packaging box that protects your items during transit and looks beautiful on your doorstep.' },
                  { title: 'Tissue Wrapping', desc: 'Each garment is carefully wrapped in branded tissue paper with a delicate gold pattern.' },
                  { title: 'Satin Ribbon', desc: 'A luxurious satin ribbon ties the package together, making it gift-ready right out of the box.' },
                  { title: 'Care Card', desc: 'A detailed care instruction card specific to your fabric type, so you can keep your garment looking beautiful.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg bg-white dark:bg-[#0A0A0A] p-4">
                    <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Address Change Policy */}
        <motion.div
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Address Change Policy
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                We understand that mistakes happen. If you need to change your delivery
                address after placing your order, please contact us as soon as possible.
                Address changes can only be made before the order has been dispatched. If
                your order has already been shipped, we will work with our courier
                partner to attempt a re-routing, but this is not guaranteed and may incur
                additional charges. To request an address change, email us at{' '}
                <span className="text-[#d79c4a]">hello@burqahijab.shop</span> with your
                order number and the updated address. We will do our best to accommodate
                your request.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#d79c4a]/20 bg-[#d79c4a]/5 p-8 text-center"
        >
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
            Have a Shipping Question?
          </h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
            Our customer service team is here to help with any shipping-related
            inquiries. Reach out and we&apos;ll respond promptly.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={navigateToContact}
              className="bg-[#d79c4a] text-white dark:text-[#0A0A0A] hover:bg-[#d79c4a]/90 "
            >
              Contact Us
            </Button>
            <Button
              onClick={navigateToReturns}
              variant="outline"
              className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
            >
              Returns Policy
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
