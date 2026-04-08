'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Star,
  Heart,
  Palette,
  Scissors,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

const milestones = [
  {
    year: '2019',
    title: 'The Beginning',
    description:
      'BurqaHijab was born from a small workshop in Karachi. With a grandmother\'s sewing machine, a passion for beautiful fabrics, and a vision to elevate modest fashion, our founder created the first collection of 12 handcrafted abayas. Every piece was made with meticulous attention to detail and an unwavering commitment to quality that would become the hallmark of our brand.',
  },
  {
    year: '2020',
    title: 'Going Digital',
    description:
      'The global pandemic accelerated our digital transformation. We launched our online store, bringing our curated collection of premium abayas and hijabs to customers across Pakistan. Despite the challenges, our commitment to quality and customer service helped us build a loyal community of modest fashion enthusiasts who spread the word through their networks and social media.',
  },
  {
    year: '2021',
    title: 'Expanding the Collection',
    description:
      'We introduced our hijab collection, featuring premium chiffon, Nida, and jersey hijabs in a carefully curated color palette. The response was overwhelming — our hijabs quickly became bestsellers, praised for their quality fabrics, beautiful colors, and generous sizing. We also partnered with our first artisan cooperative, bringing traditional hand-embroidery techniques to our designs.',
  },
  {
    year: '2022',
    title: 'International Launch',
    description:
      'BurqaHijab crossed borders, launching international shipping to the Middle East, UK, Europe, and North America. We partnered with DHL Express and FedEx to ensure reliable worldwide delivery. What started as a local Karachi brand was now reaching modest fashion lovers in over 30 countries, proving that the appeal of beautifully crafted modest fashion is truly universal.',
  },
  {
    year: '2023',
    title: 'Luxury Redefined',
    description:
      'We unveiled our first luxury collection, featuring premium Nida silk abayas with hand-finished details, custom-designed embellishments, and our signature gold-accent packaging. The collection was a milestone in our evolution, establishing BurqaHijab as a serious contender in the global modest luxury fashion space. Our customer base grew to include fashion-forward women across 50+ countries.',
  },
  {
    year: '2024',
    title: 'Community & Impact',
    description:
      'We deepened our commitment to community impact, launching our Community Impact Fund that supports women\'s education and vocational training. We expanded our team to over 50 talented individuals, opened a new design studio in Clifton, Karachi, and introduced our made-to-order customization service — allowing customers to personalize their abayas with custom sizing, embroidery, and fabric choices.',
  },
  {
    year: '2025',
    title: 'The Future',
    description:
      'Today, BurqaHijab stands as a testament to what passion, quality, and purpose can achieve. We continue to innovate with new collections, sustainable practices, and technological enhancements. Our dream remains the same as the day we started: to create beautiful, high-quality modest fashion that empowers women around the world to express their elegance with confidence and grace.',
  },
];

const craftsmanshipDetails = [
  {
    icon: Scissors,
    title: 'Handcrafted Excellence',
    description:
      'Every BurqaHijab garment is handcrafted by skilled artisans with decades of experience. From the initial pattern cutting to the final stitch, our pieces are made with a level of care and precision that machines simply cannot replicate. Our artisans take pride in their work, treating every garment as a work of art — because to us, that is exactly what it is.',
  },
  {
    icon: Palette,
    title: 'Premium Fabrics',
    description:
      'We source only the finest fabrics from trusted mills and suppliers. Our signature Nida fabric is known for its luxurious drape and buttery-soft texture. Our chiffon is lightweight and ethereal, our crepe is wrinkle-resistant and structured, and our jersey is impossibly soft and comfortable. Every fabric is chosen for its specific qualities and tested extensively before being used in our collections.',
  },
  {
    icon: Star,
    title: 'Attention to Detail',
    description:
      'It is the small details that elevate a garment from good to extraordinary. At BurqaHijab, we obsess over every detail — from the precise angle of a collar to the perfect placement of an embellishment, from the weight of a button to the drape of a sleeve. Our quality control process involves multiple inspection stages, ensuring that every stitch is perfect, every seam is straight, and every finishing detail is flawless.',
  },
  {
    icon: Crown,
    title: 'Signature Design',
    description:
      'Our designs strike a perfect balance between timeless elegance and contemporary sophistication. Drawing inspiration from Islamic geometric patterns, Pakistani textile traditions, and modern minimalist aesthetics, each collection tells a story. We believe in creating pieces that transcend seasons and trends — garments that you will reach for year after year, each time discovering new details to love.',
  },
];

export function BrandStoryPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToAbout = useUIStore((s) => s.navigateToAbout);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#d79c4a]/15 to-background py-20 md:py-32">
        {/* Decorative geometric pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A96E' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20">
              Our Journey
            </Badge>
            <h1 className="page-title mb-4 text-4xl tracking-tight text-gray-900 dark:text-white md:text-6xl ">
              The BurqaHijab Story
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400 ">
              From a small Karachi workshop to a globally beloved modest fashion brand —
              this is our story of passion, craftsmanship, and purpose.
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

        {/* Opening Narrative */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <div className="space-y-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#d79c4a]" />
            <blockquote className="text-2xl font-light leading-relaxed text-gray-900 dark:text-white md:text-3xl  italic">
              &ldquo;Every thread tells a story, every stitch carries a legacy. We didn&apos;t
              just create a fashion brand — we wove a dream into fabric.&rdquo;
            </blockquote>
            <p className="text-sm text-gray-500 dark:text-gray-400 ">
              — The BurqaHijab Founding Team
            </p>
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* The Beginning */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Where It All Began
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  In the bustling lanes of Karachi&apos;s textile district, surrounded by
                  bolts of exquisite fabric and the rhythmic hum of sewing machines, a
                  dream was born. Our founder grew up watching her grandmother transform
                  simple fabric into elegant garments — each one a labor of love, each
                  stitch placed with intention and care. Those early memories planted a
                  seed that would eventually grow into BurqaHijab.
                </p>
                <p>
                  The vision was clear yet ambitious: to create modest fashion that did
                  not compromise on quality, design, or the experience of wearing
                  something truly beautiful. Too often, modest fashion was treated as an
                  afterthought — generic designs, mediocre fabrics, mass production with
                  no soul. We wanted to change that narrative entirely. We believed —
                  and still believe — that a woman who chooses modesty deserves garments
                  that are every bit as luxurious, well-crafted, and thoughtfully
                  designed as the finest haute couture.
                </p>
                <p>
                  With that belief as our compass, we set out to build a brand that
                  would honor both tradition and innovation, craftsmanship and
                  accessibility, beauty and purpose. The journey was not easy — there
                  were late nights, learning curves, and moments of doubt — but every
                  challenge only strengthened our resolve. And with the unwavering
                  support of our early customers, who became our most passionate
                  advocates, BurqaHijab began to flourish.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Photography / Visual Section */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            A Visual Journey
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Our Atelier',
                description: 'Inside our Karachi design studio where creativity meets craftsmanship. Every collection begins here — from initial sketches to final prototypes.',
                gradient: 'from-[#d79c4a]/20 to-amber-900/20',
              },
              {
                title: 'The Artisans',
                description: 'Our talented team of artisans, each bringing decades of skill and passion. Their hands create the magic that makes our garments truly special.',
                gradient: 'from-[#d79c4a]/10 to-emerald-900/20',
              },
              {
                title: 'The Fabrics',
                description: 'A curated selection of the finest fabrics — Nida silk, premium crepe, ethereal chiffon — each chosen for its exceptional quality and beauty.',
                gradient: 'from-purple-900/20 to-[#d79c4a]/20',
              },
              {
                title: 'The Details',
                description: 'Every embellishment, every seam, every finishing touch is considered and perfected. This obsessive attention to detail is what sets us apart.',
                gradient: 'from-rose-900/20 to-[#d79c4a]/10',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br ${item.gradient} p-6 md:p-8`}
              >
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white ">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Milestones */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="mb-8 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Milestones
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 md:left-1/2 md:-translate-x-px" />

            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`relative flex flex-col gap-4 pl-12 md:pl-0 ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-[#d79c4a] bg-white dark:bg-[#0A0A0A] md:left-1/2 md:-translate-x-1/2" />

                  {/* Year badge */}
                  <div className={`md:w-1/3 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Badge variant="secondary" className="bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20 text-sm">
                      {milestone.year}
                    </Badge>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white ">
                      {milestone.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="md:w-2/3 md:px-6">
                    <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Craftsmanship */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Craftsmanship
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {craftsmanshipDetails.map((detail) => (
              <Card key={detail.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#d79c4a]/10">
                    <detail.icon className="h-5 w-5 text-[#d79c4a]" />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white ">
                    {detail.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                    {detail.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-xl border border-[#d79c4a]/20 bg-gradient-to-br from-[#d79c4a]/5 to-elevated p-8 text-center">
            <Heart className="mx-auto mb-4 h-8 w-8 text-[#d79c4a]" />
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white ">
              Thank You for Being Part of Our Story
            </h2>
            <p className="mx-auto mb-4 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
              Every customer who wears a BurqaHijab garment becomes a part of our
              story. Your trust, your feedback, and your love for our creations inspire
              us to keep pushing boundaries and reaching new heights. We are grateful
              beyond words for the incredible community that has grown around this
              brand, and we promise to continue creating with the same passion,
              quality, and purpose that started it all.
            </p>
            <Button
              onClick={navigateToAbout}
              variant="outline"
              className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
            >
              Learn More About Us
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
