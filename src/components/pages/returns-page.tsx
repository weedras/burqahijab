'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  PackageX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ReturnsPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToContact = useUIStore((s) => s.navigateToContact);
  const navigateToShipping = useUIStore((s) => s.navigateToShipping);
  const { settings, fetch } = useStoreSettings();

  useEffect(() => { fetch(); }, [fetch]);

  const returnSteps = useMemo(() => [
    {
      step: 1,
      title: 'Contact Us',
      description:
        `Send an email to ${settings.contactEmail} or WhatsApp us at ${settings.phoneNumber} within ${settings.returnWindowDays} days of receiving your order. Include your order number and the reason for the return. Our team will respond within 24 hours with a return authorization and shipping instructions.`,
    },
    {
      step: 2,
      title: 'Prepare Your Package',
      description:
        'Carefully pack the item in its original packaging with all tags still attached. Include the return authorization slip (provided by our team) inside the package. Seal the package securely and affix the return shipping label provided by our customer service team.',
    },
    {
      step: 3,
      title: 'Ship the Item Back',
      description:
        'Drop off the package at the nearest courier service location specified in your return instructions. For domestic returns in Karachi, Lahore, Islamabad, and Rawalpindi, we offer complimentary return pickup. For other locations, you will need to ship the item at your own cost, which will be reimbursed once the return is approved.',
    },
    {
      step: 4,
      title: 'Inspection & Processing',
      description:
        'Once we receive your returned item, our quality team will inspect it to ensure it meets our return conditions. This process typically takes 1–2 business days. You will receive a confirmation email once the inspection is complete.',
    },
    {
      step: 5,
      title: 'Refund or Exchange',
      description:
        'If your return is approved, your refund will be processed within 5–7 business days. Refunds are issued to the original payment method. For exchanges, the replacement item will be dispatched within 2–3 business days after the return is approved.',
    },
  ], [settings.contactEmail, settings.phoneNumber, settings.returnWindowDays]);

  const nonReturnableItems = [
    {
      item: 'Sale & Discounted Items',
      reason: 'Products purchased during promotional sales, clearance events, or at any discounted price are final sale and cannot be returned or exchanged.',
    },
    {
      item: 'Accessories',
      reason: 'Pins, brooches, underscarves, and other small accessories are non-returnable for hygiene reasons. Please choose carefully when ordering accessories.',
    },
    {
      item: 'Custom & Made-to-Order',
      reason: 'Items that have been customized to your specifications or made-to-order specifically for you cannot be returned, as they cannot be resold.',
    },
    {
      item: 'Worn or Washed Items',
      reason: 'Items that show signs of wear, washing, alteration, perfume, or any damage caused by the customer are not eligible for return. All returned items must be in their original, unworn condition.',
    },
    {
      item: 'Items Without Original Packaging',
      reason: 'Returns must include all original packaging, tags, labels, and any complimentary items that came with the order. Items returned without these cannot be accepted.',
    },
  ];

  const returnConditions = [
    'Items must be unworn, unwashed, and in their original condition',
    'All original tags must still be attached to the garment',
    'Items must be returned in their original packaging',
    `Returns must be initiated within ${settings.returnWindowDays} days of delivery date`,
    'A valid proof of purchase (order number) is required',
    'Items must not have any perfume, makeup, or deodorant marks',
    'Items must not have been altered or tailored in any way',
  ];

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
            <RotateCcw className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Returns & Exchanges
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              Your satisfaction is our priority. We offer a hassle-free {settings.returnWindowDays}-day return
              and exchange policy so you can shop with complete confidence. If you are not
              entirely happy with your purchase, we are here to make it right.
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

        {/* Return Policy Overview */}
        <motion.div
          custom={0}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <Card className="border-[#d79c4a]/20 bg-gradient-to-br from-[#d79c4a]/5 to-elevated">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-[#d79c4a]" />
                <div>
                  <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white ">
                    {settings.returnWindowDays}-Day Return Policy
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                    We offer a generous {settings.returnWindowDays}-day return window from the date your order
                    is delivered. During this period, you can return any eligible item
                    that does not meet your expectations for a full refund or exchange.
                    We want you to love every purchase from BurqaHijab.shop, and if
                    something is not quite right, we will gladly help you find the
                    perfect alternative or process your return smoothly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Conditions for Returns */}
        <motion.div
          custom={1}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Conditions for Returns
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 ">
                To be eligible for a return, please ensure that your item meets all
                of the following conditions:
              </p>
              <ul className="space-y-2.5">
                {returnConditions.map((condition, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 ">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d79c4a]" />
                    {condition}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* How to Initiate a Return */}
        <motion.div
          custom={2}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            How to Initiate a Return
          </h2>
          <div className="space-y-4">
            {returnSteps.map((step) => (
              <Card key={step.step} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d79c4a] text-sm font-semibold text-white dark:text-[#0A0A0A] ">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 ">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Non-Returnable Items */}
        <motion.div
          custom={3}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <PackageX className="mr-2 inline-block h-5 w-5 text-gray-500 dark:text-gray-400" />
            Non-Returnable Items
          </h2>
          <div className="space-y-3">
            {nonReturnableItems.map((item) => (
              <Card key={item.item} className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
                <CardContent className="p-5">
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white ">
                    {item.item}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 ">
                    {item.reason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <Separator className="my-12" />

        {/* Refund Processing */}
        <motion.div
          custom={4}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            Refund Processing
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 ">
                <p className="leading-relaxed">
                  Once your return has been received and approved, your refund will be
                  processed within <span className="font-semibold text-gray-900 dark:text-white">5 to 7 business days</span>.
                  Refunds are always issued to the original payment method used for the
                  purchase.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { method: 'Credit/Debit Card', time: '5–7 business days' },
                    { method: 'JazzCash / EasyPaisa', time: `${settings.refundDaysJazzCash} business days` },
                    { method: 'Bank Transfer', time: `${settings.refundDaysBank} business days` },
                    { method: 'Apple Pay / Google Pay', time: '5–10 business days' },
                  ].map((item) => (
                    <div key={item.method} className="rounded-lg bg-white dark:bg-[#0A0A0A] p-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {item.method}
                      </span>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{item.time}</p>
                    </div>
                  ))}
                </div>
                <p className="leading-relaxed">
                  You will receive an email confirmation once your refund has been
                  processed. Please note that your bank or payment provider may take
                  an additional 2–3 business days to reflect the refund in your
                  account statement.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Exchange Process */}
        <motion.div
          custom={5}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <RefreshCw className="mr-2 inline-block h-5 w-5 text-[#d79c4a]" />
            Exchange Process
          </h2>
          <Card className="border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A]">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 ">
                <p className="leading-relaxed">
                  We are happy to exchange your item for a different size or color
                  within our {settings.returnWindowDays}-day return window. Exchanges are processed quickly
                  and efficiently to minimize any inconvenience.
                </p>
                <ul className="space-y-2">
                  {[
                    'Contact us with your order number and desired size or color',
                    'We will check availability and confirm the exchange within 24 hours',
                    'Ship the original item back using the provided return label',
                    'The replacement will be dispatched within 2–3 business days after we receive the return',
                    'If the requested exchange is not available, we will offer a store credit or full refund',
                    'Exchanges for a higher-priced item will require payment of the price difference',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d79c4a]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="leading-relaxed">
                  Shipping for the replacement item is completely free of charge. You
                  only need to cover the cost of returning the original item if you
                  are outside our free return pickup areas (Karachi, Lahore, Islamabad,
                  Rawalpindi).
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-12" />

        {/* Damaged / Defective Items */}
        <motion.div
          custom={6}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
            <AlertTriangle className="mr-2 inline-block h-5 w-5 text-amber-500" />
            Damaged or Defective Items
          </h2>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400 ">
                <p className="leading-relaxed">
                  If you receive a damaged or defective item, please contact us{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">within 48 hours</span> of
                  delivery. We take quality very seriously and want to resolve any issues
                  as quickly as possible.
                </p>
                <ul className="space-y-2">
                  {[
                    'Take clear photos of the damage or defect from multiple angles',
                    'Email the photos along with your order number to ' + settings.contactEmail,
                    'We will arrange a free return pickup at your earliest convenience',
                    'Choose between a full refund or a replacement at no additional cost',
                    'Replacements are given priority and shipped within 24 hours of return approval',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="leading-relaxed">
                  We sincerely apologize for any inconvenience caused by a damaged or
                  defective item. Our quality control team inspects every garment before
                  dispatch, but in the rare event that something slips through, we are
                  committed to making it right immediately.
                </p>
              </div>
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
            Need Help with a Return?
          </h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
            Our customer service team is ready to assist you with returns, exchanges,
            or any questions about our policy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={navigateToContact}
              className="bg-[#d79c4a] text-white dark:text-[#0A0A0A] hover:bg-[#d79c4a]/90 "
            >
              Contact Us
            </Button>
            <Button
              onClick={navigateToShipping}
              variant="outline"
              className="border-[#d79c4a] text-[#d79c4a] hover:bg-[#d79c4a]/10 "
            >
              Shipping Info
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
