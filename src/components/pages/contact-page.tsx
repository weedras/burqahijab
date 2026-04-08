'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/stores/ui-store';
import { useStoreSettings } from '@/stores/store-settings-store';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

function getHandleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (u.hostname.includes('tiktok') || u.hostname.includes('instagram') || u.hostname.includes('twitter') || u.hostname.includes('x.com')) {
      return pathname ? `@${pathname}` : '';
    }
    return pathname || '';
  } catch {
    return '';
  }
}

export function ContactPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToFaq = useUIStore((s) => s.navigateToFaq);
  const { settings, fetch } = useStoreSettings();

  useEffect(() => { fetch(); }, [fetch]);

  const contactInfo = useMemo(() => [
    {
      icon: Phone,
      label: 'WhatsApp',
      value: settings.whatsappNumber || settings.phoneNumber,
      href: settings.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}` : settings.phoneNumber ? `tel:${settings.phoneNumber.replace(/\s/g, '')}` : undefined,
      description: 'Chat with us anytime for quick assistance',
      highlight: true,
    },
    {
      icon: Phone,
      label: 'Phone',
      value: settings.phoneNumber,
      href: settings.phoneNumber ? `tel:${settings.phoneNumber.replace(/\s/g, '')}` : undefined,
      description: 'Call us for immediate support',
      highlight: false,
    },
    {
      icon: Mail,
      label: 'Email',
      value: settings.supportEmail,
      href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
      description: 'We respond within 24 hours on business days',
      highlight: false,
    },
    {
      icon: MapPin,
      label: 'Store Address',
      value: settings.storeAddress,
      description: 'Visit us by appointment for a personalized shopping experience',
      highlight: false,
    },
    {
      icon: Clock,
      label: 'Business Hours',
      value: settings.businessHours,
      description: 'Closed on Sundays and public holidays',
      highlight: false,
    },
  ], [settings.whatsappNumber, settings.phoneNumber, settings.supportEmail, settings.storeAddress, settings.businessHours]);

  const socialLinks = useMemo(() => {
    const links: Array<{ name: string; handle: string; url: string; description: string }> = [];
    if (settings.instagramUrl) {
      links.push({
        name: 'Instagram',
        handle: getHandleFromUrl(settings.instagramUrl) || '@burqahijab',
        url: settings.instagramUrl,
        description: 'Follow us for daily inspiration, styling tips, and behind-the-scenes content',
      });
    }
    if (settings.facebookUrl) {
      links.push({
        name: 'Facebook',
        handle: getHandleFromUrl(settings.facebookUrl) || 'BurqaHijab',
        url: settings.facebookUrl,
        description: 'Join our community for the latest updates, collections, and exclusive offers',
      });
    }
    if (settings.tiktokUrl) {
      links.push({
        name: 'TikTok',
        handle: getHandleFromUrl(settings.tiktokUrl) || '@burqahijab',
        url: settings.tiktokUrl,
        description: 'Watch styling tutorials, fashion hacks, and product showcases',
      });
    }
    return links;
  }, [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl]);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              We would love to hear from you. Whether you have a question about our
              products, need help with an order, or just want to say hello — our team
              is here and ready to help.
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

        {/* Contact Info Grid */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {contactInfo.map((info) => (
              <Card
                key={info.label}
                className={`border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A] ${
                  info.highlight ? 'border-[#d79c4a]/30 bg-[#d79c4a]/5' : ''
                }`}
              >
                <CardContent className="p-5">
                  {info.href ? (
                    <a href={info.href} target={info.href.startsWith('http') ? '_blank' : undefined} rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d79c4a]/10">
                        <info.icon className="h-5 w-5 text-[#d79c4a]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ">
                          {info.label}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#d79c4a] transition-colors">
                          {info.value}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 ">
                          {info.description}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d79c4a]/10">
                        <info.icon className="h-5 w-5 text-[#d79c4a]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ">
                          {info.label}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white ">
                          {info.value}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 ">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Contact Form */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Send Us a Message
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
                    Message Sent Successfully!
                  </h3>
                  <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400 ">
                    Thank you for reaching out. Our team will get back to you within 24
                    hours. We appreciate your patience.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm text-gray-900 dark:text-white ">
                        Full Name <span className="text-[#d79c4a]">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        required
                       placeholder="Your full name"
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] focus:border-[#d79c4a]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm text-gray-900 dark:text-white ">
                        Email Address <span className="text-[#d79c4a]">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        required
                       placeholder="your@email.com"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] focus:border-[#d79c4a]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject" className="text-sm text-gray-900 dark:text-white ">
                      Subject <span className="text-[#d79c4a]">*</span>
                    </Label>
                    <Input
                      id="contact-subject"
                      required
                     placeholder="How can we help?"
                      value={formState.subject}
                      onChange={(e) =>
                        setFormState({ ...formState, subject: e.target.value })
                      }
                      className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] focus:border-[#d79c4a]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm text-gray-900 dark:text-white ">
                      Message <span className="text-[#d79c4a]">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={6}
                     placeholder="Tell us more about your inquiry..."
                      value={formState.message}
                      onChange={(e) =>
                        setFormState({ ...formState, message: e.target.value })
                      }
                      className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0A0A0A] focus:border-[#d79c4a] resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#d79c4a] text-white dark:text-[#0A0A0A] hover:bg-[#d79c4a]/90 "
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 ">
                    We typically respond within 24 hours on business days.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Social Media */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Follow Us on Social Media
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {socialLinks.map((social) => (
              <Card key={social.name} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5 text-center">
                  <Badge variant="secondary" className="mb-3 bg-[#d79c4a]/10 text-[#d79c4a] border-[#d79c4a]/20">
                    {social.name}
                  </Badge>
                  <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                    {social.handle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ">
                    {social.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-xl border border-[#d79c4a]/20 bg-[#d79c4a]/5 p-8 text-center"
        >
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
            Looking for Quick Answers?
          </h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
            Check out our comprehensive FAQ section for instant answers to the most
            common questions about orders, shipping, returns, sizing, and more.
          </p>
          <Button
            onClick={navigateToFaq}
            variant="outline"
            className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
          >
            Visit FAQ
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
