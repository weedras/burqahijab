'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Ruler, Scissors } from 'lucide-react';
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
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const abayaSizes = [
  { size: 'XS', bust: '34 in', length: '52 in', shoulder: '13.5 in' },
  { size: 'S', bust: '36 in', length: '54 in', shoulder: '14 in' },
  { size: 'M', bust: '38 in', length: '56 in', shoulder: '14.5 in' },
  { size: 'L', bust: '40 in', length: '56 in', shoulder: '15 in' },
  { size: 'XL', bust: '42 in', length: '58 in', shoulder: '15.5 in' },
  { size: 'XXL', bust: '44 in', length: '58 in', shoulder: '16 in' },
];

const hijabSizes = [
  {
    type: 'Regular Hijab',
    format: 'Rectangle',
    dimensions: '180cm x 70cm (71" x 28")',
    bestFor: 'Everyday wear, casual and formal',
    styling: 'Standard wrap, simple drape',
  },
  {
    type: 'Large Hijab',
    format: 'Rectangle',
    dimensions: '200cm x 75cm (79" x 30")',
    bestFor: 'Full coverage, turban styles, layered looks',
    styling: 'Turban, voluminous drape, multiple folds',
  },
  {
    type: 'Square Hijab',
    format: 'Square',
    dimensions: '140cm x 140cm (55" x 55")',
    bestFor: 'Classic pinning styles, voluminous coverage',
    styling: 'Triangle fold, classic pinned style, bandeau',
  },
  {
    type: 'Jersey Tube Hijab',
    format: 'Tube',
    dimensions: '55cm x 25cm (22" x 10")',
    bestFor: 'Sport, active wear, quick styling',
    styling: 'Pull-on, no pins needed',
  },
];

const internationalConversion = [
  { us: '0-2', uk: '4-6', eu: '32-34', ourSize: 'XS', bust: '30-32 in' },
  { us: '4-6', uk: '8-10', eu: '36-38', ourSize: 'S', bust: '33-35 in' },
  { us: '8-10', uk: '12-14', eu: '40-42', ourSize: 'M', bust: '36-38 in' },
  { us: '12-14', uk: '16-18', eu: '44-46', ourSize: 'L', bust: '39-41 in' },
  { us: '16-18', uk: '20-22', eu: '48-50', ourSize: 'XL', bust: '42-44 in' },
  { us: '20-22', uk: '24-26', eu: '52-54', ourSize: 'XXL', bust: '45-47 in' },
];

const fabricNotes = [
  {
    fabric: 'Nida',
    icon: '✨',
    description: 'Our signature fabric — luxuriously soft with a beautiful, natural drape. Nida is breathable, lightweight, and opaque, making it the perfect choice for premium abayas.',
    fit: 'True to size with a relaxed, flowing silhouette. Nida has minimal stretch.',
    tip: 'No ironing needed — simply hang after washing and wrinkles naturally fall out.',
  },
  {
    fabric: 'Chiffon',
    icon: '🌸',
    description: 'Elegant, lightweight, and semi-sheer with a beautiful floaty quality. Chiffon is perfect for formal occasions and layered designs. Our chiffon abayas include a full inner lining.',
    fit: 'Runs slightly large due to the fluid nature of the fabric. Consider sizing down if you prefer a more fitted look.',
    tip: 'Hand wash or dry clean recommended. Steam rather than iron to maintain the fabric delicate texture.',
  },
  {
    fabric: 'Crepe',
    icon: '🍃',
    description: 'A medium-weight fabric with a subtle texture and excellent wrinkle resistance. Crepe offers a structured yet comfortable fit that holds its shape beautifully throughout the day.',
    fit: 'True to size. Crepe has a slight give that makes it very comfortable for all-day wear.',
    tip: 'Machine washable on delicate cycle. Iron on medium heat for a crisp, polished look.',
  },
  {
    fabric: 'Jersey',
    icon: '🧵',
    description: 'Soft, stretchy, and incredibly comfortable. Jersey is our most practical fabric, perfect for everyday wear. It moves with your body and resists wrinkling.',
    fit: 'Form-fitting with excellent stretch. If you prefer a looser fit, we recommend going one size up.',
    tip: 'Machine washable and tumble dry safe. The easiest fabric to care for in our collection.',
  },
];

const measurementSteps = [
  {
    step: 1,
    title: 'Bust Measurement',
    instruction:
      'Wrap the measuring tape around the fullest part of your bust, keeping the tape parallel to the floor. Ensure the tape is snug but not tight — you should be able to fit one finger between the tape and your body. Breathe normally and do not pull the tape too tight.',
  },
  {
    step: 2,
    title: 'Shoulder Width',
    instruction:
      'Measure from the edge of one shoulder to the edge of the other, across the back. Stand up straight with your arms relaxed at your sides. Place the tape at the point where your shoulder meets your arm (the shoulder seam of a well-fitting shirt is a good reference point).',
  },
  {
    step: 3,
    title: 'Abaya Length',
    instruction:
      'Stand straight and measure from the highest point of your shoulder (near your neck) down to your desired length. For ankle-length abayas, measure to your ankle bone. For floor-length abayas, measure to just above the floor while wearing the shoes you plan to pair with the abaya.',
  },
  {
    step: 4,
    title: 'Arm Length (Optional)',
    instruction:
      'Bend your elbow slightly and measure from the top of your shoulder down to your wrist. This measurement is helpful if you prefer abayas with fitted sleeves or want to ensure full arm coverage. Most of our abayas have generous sleeve lengths designed for complete coverage.',
  },
];

export function SizeGuidePage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
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
            <Ruler className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="page-title mb-3 text-4xl tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Size Guide
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              Find your perfect fit with our comprehensive size guide. We recommend
              taking your measurements carefully before placing your order to ensure the
              best possible experience with our garments.
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

        {/* How to Measure */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900 dark:text-white ">
                <Scissors className="h-5 w-5 text-[#d79c4a]" />
                How to Measure Yourself
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 ">
                For the most accurate results, wear light clothing and use a soft
                measuring tape. Ask a friend to help if possible, as self-measuring
                can sometimes be inaccurate. Take each measurement twice and use the
                average.
              </p>
              <div className="space-y-6">
                {measurementSteps.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d79c4a]/10 text-sm font-semibold text-[#d79c4a] ">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                        {item.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                        {item.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Abaya Size Chart */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Abaya Size Chart
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm ">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-[#d79c4a]/5">
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                        Bust
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                        Length
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">
                        Shoulder
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {abayaSizes.map((row, i) => (
                      <tr
                        key={row.size}
                        className={i % 2 === 0 ? 'border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A]' : 'border-b border-gray-200 dark:border-gray-700'}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{row.size}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.bust}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.length}</td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{row.shoulder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 ">
            All measurements are in inches. These are garment measurements, not body measurements.
            We recommend choosing a size where your body measurements are 1-2 inches less than the
            garment measurements for a comfortable, flowing fit.
          </p>
        </motion.div>

        <Separator className="my-12" />

        {/* International Size Conversion */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            International Size Conversion
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm ">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-[#d79c4a]/5">
                      <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">Our Size</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">US</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">UK</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">EU</th>
                      <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">Bust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internationalConversion.map((row, i) => (
                      <tr
                        key={row.ourSize}
                        className={i % 2 === 0 ? 'border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A]' : 'border-b border-gray-200 dark:border-gray-700'}
                      >
                        <td className="px-4 py-4 font-semibold text-[#d79c4a]">{row.ourSize}</td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.us}</td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.uk}</td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.eu}</td>
                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.bust}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Hijab Size Guide */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Hijab Size Guide
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {hijabSizes.map((hijab) => (
              <Card key={hijab.type} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-gray-900 dark:text-white ">
                      {hijab.type}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20">
                      {hijab.format}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ">
                      Dimensions
                    </span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white ">
                      {hijab.dimensions}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ">
                      Best For
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ">
                      {hijab.bestFor}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ">
                      Styling
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ">
                      {hijab.styling}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Fabric-Specific Fitting Notes */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Fabric-Specific Fitting Notes
          </h2>
          <div className="space-y-4">
            {fabricNotes.map((item) => (
              <Card key={item.fabric} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white ">
                        {item.fabric}
                      </h3>
                      <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                        {item.description}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-white dark:bg-[#0A0A0A] p-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#d79c4a] ">
                            Fit Notes
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white ">
                            {item.fit}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-[#0A0A0A] p-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#d79c4a] ">
                            Care Tip
                          </span>
                          <p className="mt-1 text-sm text-gray-900 dark:text-white ">
                            {item.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#d79c4a]/20 bg-[#d79c4a]/5 p-8 text-center"
        >
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
            Still Unsure About Your Size?
          </h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
            Our customer service team is happy to provide personalized sizing
            recommendations. Send us your measurements and we will help you find the
            perfect fit.
          </p>
          <Button
            onClick={navigateToContact}
            variant="outline"
            className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
          >
            Contact Us for Help
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
