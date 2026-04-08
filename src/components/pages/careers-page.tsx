'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  Heart,
  MapPin,
  Clock,
  GraduationCap,
  Plane,
  DollarSign,
  Building,
  Users,
  Zap,
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
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const openPositions = [
  {
    title: 'Social Media Manager',
    department: 'Marketing',
    type: 'Full-time',
    location: 'Karachi, Pakistan (Hybrid)',
    description:
      'We are looking for a creative and data-driven Social Media Manager to lead our social media presence across Instagram, Facebook, TikTok, and Pinterest. You will be responsible for developing and executing our social media strategy, creating engaging content calendars, producing compelling visual and video content, managing community engagement, analyzing performance metrics, and staying ahead of social media trends in the modest fashion space.',
    responsibilities: [
      'Develop and implement comprehensive social media strategies aligned with brand objectives',
      'Create and curate engaging content including photos, videos, reels, stories, and carousels',
      'Manage daily social media posting and community engagement across all platforms',
      'Analyze social media metrics and prepare monthly performance reports with actionable insights',
      'Collaborate with the design team on campaign visuals and brand storytelling',
      'Stay current with social media trends, algorithm changes, and industry best practices',
      'Plan and execute social media campaigns for product launches, seasonal collections, and sales events',
    ],
    requirements: [
      '2–3 years of experience in social media management, preferably in fashion or lifestyle brands',
      'Strong proficiency in Instagram, TikTok, Facebook, and Pinterest platforms',
      'Experience with social media management tools (Buffer, Hootsuite, or similar)',
      'Basic graphic design and video editing skills (Canva, CapCut, or Adobe Creative Suite)',
      'Excellent written and verbal communication skills in English and Urdu',
      'Understanding of the modest fashion industry and target audience preferences',
      'Data-driven mindset with the ability to translate analytics into actionable strategies',
    ],
  },
  {
    title: 'Fashion Designer — Modest Wear',
    department: 'Design',
    type: 'Full-time',
    location: 'Karachi, Pakistan (On-site)',
    description:
      'Join our creative team as a Fashion Designer specializing in modest wear. You will be responsible for designing abayas, hijabs, and modest accessories that embody our brand aesthetic — a fusion of timeless elegance and contemporary sophistication. This is an incredible opportunity to shape the future of modest fashion for a growing global audience.',
    responsibilities: [
      'Design seasonal collections of abayas, hijabs, and accessories from concept to final product',
      'Research global fashion trends, color palettes, and fabric innovations relevant to modest fashion',
      'Create detailed technical drawings, specifications, and patterns for production',
      'Source and select premium fabrics and trims in collaboration with the procurement team',
      'Work closely with artisans and sample machinists to bring designs to life',
      'Present design concepts and collection themes to the creative director for approval',
      'Oversee sampling, fitting sessions, and quality control throughout the production process',
    ],
    requirements: [
      'Bachelor\'s degree in Fashion Design or equivalent professional experience',
      '3–5 years of experience in fashion design, ideally with women\'s modest wear or ethnic wear',
      'Strong sketching, illustration, and technical drawing abilities',
      'Proficiency in Adobe Illustrator, Photoshop, and fashion design software (CLO3D is a plus)',
      'Deep understanding of fabric properties, draping, and garment construction techniques',
      'Knowledge of Pakistani textile traditions and Islamic design aesthetics',
      'Ability to work in a fast-paced environment while maintaining high creative standards',
    ],
  },
  {
    title: 'Customer Service Representative',
    department: 'Operations',
    type: 'Full-time',
    location: 'Karachi, Pakistan (On-site)',
    description:
      'We are seeking an empathetic and detail-oriented Customer Service Representative to be the voice of BurqaHijab.shop. You will be the first point of contact for our customers, handling inquiries across email, WhatsApp, phone, and social media. Your role is critical in ensuring every customer interaction reflects our commitment to excellence and builds lasting relationships.',
    responsibilities: [
      'Respond to customer inquiries via email, WhatsApp, phone calls, and social media messages promptly and professionally',
      'Provide accurate product information, sizing guidance, and order status updates',
      'Process returns, exchanges, and refund requests in accordance with company policies',
      'Resolve customer complaints and issues with empathy, patience, and creative problem-solving',
      'Collaborate with the shipping and warehouse teams to address delivery-related concerns',
      'Document customer feedback and escalate recurring issues to the management team',
      'Contribute to the development and improvement of customer service processes and FAQ resources',
    ],
    requirements: [
      '1–2 years of experience in customer service, preferably in e-commerce or retail fashion',
      'Excellent communication skills in both English and Urdu (Arabic is a plus)',
      'Strong problem-solving abilities and a patient, empathetic approach to customer interactions',
      'Proficiency in using customer service tools, CRM systems, and email management platforms',
      'Familiarity with e-commerce operations including order management and return processes',
      'Ability to multitask and manage time effectively in a fast-paced environment',
      'Genuine passion for fashion and helping customers find their perfect style',
    ],
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance coverage for you and your immediate family, including medical, dental, and vision benefits.',
  },
  {
    icon: GraduationCap,
    title: 'Learning & Development',
    description: 'Annual learning budget for courses, workshops, and conferences. Regular in-house training sessions and mentorship programs.',
  },
  {
    icon: Plane,
    title: 'Generous Leave',
    description: '20+ paid annual leave days, plus public holidays, maternity/paternity leave, and flexible working arrangements.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Compensation',
    description: 'Market-competitive salaries with annual performance-based reviews and bonuses. Profit-sharing program for senior roles.',
  },
  {
    icon: Building,
    title: 'Modern Workspace',
    description: 'Beautiful, inspiring design studio in Clifton, Karachi with collaborative spaces, natural light, and creative amenities.',
  },
  {
    icon: Users,
    title: 'Team Culture',
    description: 'Regular team outings, annual company retreats, festive celebrations, and a supportive, inclusive work environment.',
  },
  {
    icon: Zap,
    title: 'Growth Opportunities',
    description: 'Clear career progression paths, internal promotion opportunities, and the chance to shape the future of a fast-growing brand.',
  },
  {
    icon: MapPin,
    title: 'Employee Discount',
    description: 'Generous employee discount on all BurqaHijab.shop products, plus early access to new collections and exclusive sample sales.',
  },
];

export function CareersPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToContact = useUIStore((s) => s.navigateToContact);
  const navigateToAbout = useUIStore((s) => s.navigateToAbout);

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
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Join Our Team
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              Be part of something beautiful. We are always looking for talented, passionate
              individuals who share our love for modest fashion and our commitment to
              excellence. Discover a career where creativity meets purpose.
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

        {/* Company Culture */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Our Culture
          </h2>
          <Card className="border-[#d79c4a]/20 bg-gradient-to-br from-[#d79c4a]/5 to-elevated">
            <CardContent className="p-6 md:p-8">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  At BurqaHijab.shop, we believe that great things are built by great
                  teams. Our culture is rooted in creativity, collaboration, mutual
                  respect, and a shared passion for our mission: to create the world&apos;s
                  finest modest fashion. We foster an environment where every team member
                  is valued, every idea is heard, and every contribution is recognized.
                </p>
                <p>
                  We are a diverse team of designers, artisans, marketers, technologists,
                  and customer advocates — united by our love for beautiful garments and
                  our dedication to empowering women through fashion. Our workplace is
                  inclusive, supportive, and designed to inspire creativity. From our
                  open-plan design studio to our collaborative team meetings, every
                  aspect of our work environment is crafted to bring out the best in our
                  people.
                </p>
                <p>
                  We celebrate our wins together, learn from our challenges as a team,
                  and never lose sight of the purpose that drives us. If you are someone
                  who thrives in a creative, fast-paced environment and cares about making
                  a positive impact through your work, you will feel right at home with
                  us.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Open Positions */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Open Positions
          </h2>
          <div className="space-y-6">
            {openPositions.map((position) => (
              <Card key={position.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white ">
                        {position.title}
                      </CardTitle>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                          {position.department}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20">
                          {position.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                          <MapPin className="mr-1 h-2.5 w-2.5" />
                          {position.location}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                    {position.description}
                  </p>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white ">
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-1.5">
                      {position.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 ">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d79c4a]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white ">
                      Requirements
                    </h4>
                    <ul className="space-y-1.5">
                      {position.requirements.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 ">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Benefits */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Benefits & Perks
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d79c4a]/10">
                      <benefit.icon className="h-5 w-5 text-[#d79c4a]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                        {benefit.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 ">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* How to Apply */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            How to Apply
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                <p>
                  We are excited to hear from you! To apply for any of the positions
                  listed above, please follow these steps:
                </p>
                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: 'Prepare Your Application',
                      desc: 'Update your resume/CV and write a brief cover letter explaining why you are interested in joining BurqaHijab.shop and how your skills and experience align with the role.',
                    },
                    {
                      step: 2,
                      title: 'Email Your Application',
                      desc: 'Send your resume, cover letter, and portfolio (if applicable for design roles) to careers@burqahijab.shop with the subject line: "Application: [Position Title] — [Your Full Name]".',
                    },
                    {
                      step: 3,
                      title: 'What Happens Next',
                      desc: 'Our HR team will review your application within 5 business days. Shortlisted candidates will be contacted for an initial phone screening, followed by in-person interviews and, where relevant, a practical assessment or portfolio review.',
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d79c4a] text-sm font-semibold text-white dark:text-[#0A0A0A] ">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="mb-0.5 text-sm font-semibold text-gray-900 dark:text-white ">
                          {item.title}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2">
                  <strong className="text-gray-900 dark:text-white ">
                    Don&apos;t see a role that fits?
                  </strong>{' '}
                  We are always looking for talented individuals. Send your resume to{' '}
                  <span className="text-[#d79c4a]">careers@burqahijab.shop</span> with
                  a note about the type of role you are interested in, and we will keep
                  your profile on file for future opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#d79c4a]/20 bg-[#d79c4a]/5 p-8 text-center"
        >
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
            Ready to Create Something Beautiful?
          </h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
            Take the first step towards an inspiring career in modest fashion. We
            would love to hear from you and explore how your talents can contribute
            to our growing brand.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={navigateToContact}
              className="bg-[#d79c4a] text-white dark:text-[#0A0A0A] hover:bg-[#d79c4a]/90 "
            >
              Contact Us
            </Button>
            <Button
              onClick={navigateToAbout}
              variant="outline"
              className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
            >
              Learn About Our Brand
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
