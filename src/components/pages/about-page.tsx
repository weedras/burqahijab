'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Eye,
  Gem,
  Leaf,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const values = [
  {
    icon: Gem,
    title: 'Uncompromising Quality',
    description:
      'Every garment we create is crafted from premium, carefully sourced fabrics. We never compromise on material quality, construction, or finishing. Each piece undergoes rigorous quality inspection before it reaches you, ensuring that every BurqaHijab.shop garment meets the highest standards of excellence in modest fashion.',
  },
  {
    icon: Heart,
    title: 'Empowering Modesty',
    description:
      'We believe that modesty and style are not mutually exclusive — they are a powerful combination. Our designs celebrate the beauty of modest fashion, empowering women to express their personal style while honoring their values. We create pieces that make every woman feel confident, elegant, and beautifully covered.',
  },
  {
    icon: Eye,
    title: 'Craftsmanship & Detail',
    description:
      'From precise stitching to thoughtful embellishments, every detail matters to us. Our skilled artisans bring decades of experience to every garment, ensuring impeccable construction and attention to detail that sets our pieces apart. We take pride in the invisible artistry that goes into each creation.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Practices',
    description:
      'We are committed to minimizing our environmental impact through responsible sourcing, ethical production, and sustainable packaging. We prioritize working with suppliers who share our values and continuously seek ways to reduce waste, use eco-friendly materials, and support fair labor practices throughout our supply chain.',
  },
  {
    icon: Users,
    title: 'Community Impact',
    description:
      'We believe in giving back to the community that has supported our growth. A portion of every sale goes towards supporting women\'s education and vocational training programs in underserved communities across Pakistan. We also partner with local artisan cooperatives to provide fair-wage employment opportunities.',
  },
  {
    icon: Award,
    title: 'Customer First',
    description:
      'Our customers are at the heart of everything we do. From the moment you visit our website to the day your order arrives at your doorstep (and beyond), we strive to create an exceptional experience. Our dedicated customer service team is always ready to assist, ensuring that every interaction with BurqaHijab.shop is positive and memorable.',
  },
];

export function AboutPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToBrandStory = useUIStore((s) => s.navigateToBrandStory);

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
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              About BurqaHijab.shop
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              Where timeless elegance meets modern modesty. We are a luxury modest fashion
              brand rooted in Pakistani heritage, dedicated to creating garments that
              celebrate the art of being beautifully covered.
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

        {/* Mission & Vision */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="border-[#d79c4a]/20 bg-gradient-to-br from-[#d79c4a]/5 to-elevated">
              <CardContent className="p-6">
                <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white ">
                  Our Mission
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                  To redefine modest fashion by creating luxurious, high-quality
                  garments that empower women to express their individuality with
                  elegance and confidence. We strive to make premium modest fashion
                  accessible to women around the world while preserving the rich
                  textile traditions of Pakistan and supporting local artisans and
                  communities.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
              <CardContent className="p-6">
                <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white ">
                  Our Vision
                </h2>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                  To become the world\'s most trusted and beloved modest fashion brand —
                  a name that represents the perfect fusion of tradition and innovation,
                  quality and accessibility, beauty and purpose. We envision a world
                  where every woman can find her perfect expression of modest elegance,
                  regardless of her location, background, or budget.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Our Story */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Story
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
            <p>
              BurqaHijab.shop was born from a simple yet powerful belief: that modest
              fashion deserves the same level of luxury, craftsmanship, and attention to
              detail as any high-end fashion house. Founded in Karachi, Pakistan — the
              vibrant heart of South Asia\'s textile industry — our brand grew from a
              small family workshop into a globally recognized name in modest fashion.
            </p>
            <p>
              Our journey began with a grandmother\'s sewing machine and a dream to
              create abayas and hijabs that were not just modest, but truly beautiful.
              What started as a passion project quickly gained recognition among
              discerning customers who appreciated the quality of our fabrics, the
              precision of our tailoring, and the thoughtfulness of our designs. Word of
              mouth spread, orders flowed in, and BurqaHijab.shop evolved from a local
              atelier into a brand that ships to over 50 countries worldwide.
            </p>
            <p>
              Today, we are proud to have a team of over 50 talented individuals — from
              designers and pattern makers to skilled artisans and customer service
              specialists — all united by a shared passion for modest fashion excellence.
              Our design studio in Clifton, Karachi, is where the magic happens: where
              sketches become patterns, where fabrics are hand-selected, and where every
              garment is carefully crafted to perfection.
            </p>
          </div>
          <Button
            onClick={navigateToBrandStory}
            variant="link"
            className="mt-4 text-[#d79c4a] hover:text-[#d79c4a]/80 p-0 "
          >
            Read our full brand story →
          </Button>
        </motion.div>

        <Separator className="my-12" />

        {/* Quality & Craftsmanship */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Commitment to Quality
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  Quality is not just a standard at BurqaHijab.shop — it is our
                  obsession. Every fabric we use is hand-selected from the finest mills
                  and suppliers, ensuring that each material meets our strict criteria
                  for durability, comfort, drape, and beauty. We work exclusively with
                  premium fabrics including Nida, crepe, chiffon, and jersey — each
                  chosen for its unique qualities and suitability for modest fashion.
                </p>
                <p>
                  Our quality control process is comprehensive and uncompromising.
                  Every garment goes through multiple inspection stages: fabric quality
                  check upon arrival, pattern accuracy verification during cutting,
                  stitch-by-stitch inspection during assembly, and a final detailed
                  review before packaging. We check every seam, every hem, every
                  embellishment, and every finishing detail to ensure that the garment
                  you receive is nothing short of perfect.
                </p>
                <p>
                  We stand behind the quality of our products with confidence. Every
                  BurqaHijab.shop garment is designed to be a lasting addition to your
                  wardrobe — a piece that you will reach for again and again, season
                  after season, knowing that it was made with care, skill, and an
                  unwavering commitment to excellence.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Artisan Partnerships */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Artisan Partnerships
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  Behind every BurqaHijab.shop garment are the hands of skilled artisans
                  who carry forward centuries of Pakistani textile traditions. We are
                  deeply proud of our partnerships with local artisan cooperatives and
                  family-run workshops across Karachi, Lahore, and Faisalabad. These
                  partnerships are the backbone of our brand and the source of our
                  distinctive quality.
                </p>
                <p>
                  Our artisans specialize in a range of traditional techniques including
                  intricate hand embroidery, delicate beadwork, precision tailoring, and
                  specialized fabric treatments. Many of these skills have been passed
                  down through generations, and we are committed to preserving and
                  celebrating this rich heritage through our designs. We provide our
                  artisan partners with fair wages, safe working conditions, and
                  ongoing training to help them develop their skills and support their
                  families.
                </p>
                <p>
                  When you purchase from BurqaHijab.shop, you are not just buying a
                  garment — you are supporting a community of talented craftspeople,
                  investing in the preservation of traditional arts, and contributing
                  to the economic empowerment of women and families across Pakistan.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Sustainable Practices */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Sustainable Practices
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Ethical Sourcing',
                desc: 'We source our fabrics from certified suppliers who adhere to ethical labor practices and environmental standards. We prioritize natural and sustainably produced materials wherever possible.',
              },
              {
                title: 'Minimal Waste',
                desc: 'Our pattern cutting processes are optimized to minimize fabric waste. Scraps and offcuts are repurposed into accessories, sample garments, or donated to local textile recycling programs.',
              },
              {
                title: 'Eco-Friendly Packaging',
                desc: 'Our packaging is made from recycled and recyclable materials. We have eliminated single-use plastics from our packaging entirely, using tissue paper, cardboard boxes, and paper-based fillers instead.',
              },
              {
                title: 'Conscious Production',
                desc: 'We produce in small, carefully planned batches to avoid overproduction and waste. Our made-to-order options further reduce excess inventory and ensure every garment finds a loving home.',
              },
            ].map((item) => (
              <Card key={item.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white ">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Community Impact */}
        <motion.div
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Community Impact
          </h2>
          <Card className="border-[#d79c4a]/20 bg-gradient-to-br from-[#d79c4a]/5 to-elevated">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  Giving back is woven into the fabric of who we are. At
                  BurqaHijab.shop, we believe that a successful business has a
                  responsibility to uplift the community that supports it. That is why
                  we have established several initiatives aimed at making a meaningful
                  difference in the lives of women and families across Pakistan.
                </p>
                <p>
                  A dedicated portion of every sale is contributed to our Community
                  Impact Fund, which supports women&apos;s education scholarships,
                  vocational training programs in sewing and textile arts, and
                  micro-grants for women entrepreneurs in underserved communities. To
                  date, we have helped fund the education of over 200 girls and
                  provided skills training to more than 100 women.
                </p>
                <p>
                  We also regularly organize donation drives during Ramadan and Eid,
                  distributing clothing and essential items to families in need. Our
                  team actively volunteers at local shelters and community centers,
                  reinforcing our commitment to being a force for good beyond the
                  world of fashion.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Our Values */}
        <motion.div
          custom={6}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Values
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d79c4a]/10">
                    <value.icon className="h-5 w-5 text-[#d79c4a]" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white ">
                    {value.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 ">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
