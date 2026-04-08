'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

export function FaqPage() {
  const navigateHome = useUIStore((s) => s.navigateHome);
  const navigateToContact = useUIStore((s) => s.navigateToContact);
  const navigateToSizeGuide = useUIStore((s) => s.navigateToSizeGuide);
  const navigateToShipping = useUIStore((s) => s.navigateToShipping);
  const navigateToReturns = useUIStore((s) => s.navigateToReturns);
  const { settings, fetch } = useStoreSettings();

  useEffect(() => { fetch(); }, [fetch]);

  const faqSections = useMemo(() => [
    {
      title: 'Ordering & Payment',
      items: [
        {
          question: 'How do I place an order on BurqaHijab?',
          answer:
            'Placing an order is simple and secure. Browse our collection, select your desired items, choose your size and color preferences, and add them to your cart. Once you are ready, proceed to checkout where you can enter your shipping details and choose from our multiple payment options including Visa, Mastercard, JazzCash, EasyPaisa, Apple Pay, and Google Pay. You will receive an order confirmation email immediately after placing your order with all the details and your order number for tracking purposes.',
        },
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept a wide range of payment methods to make your shopping experience as convenient as possible. For domestic orders in Pakistan, we accept JazzCash, EasyPaisa, and direct bank transfers. For all customers, we accept Visa, Mastercard, Apple Pay, and Google Pay. All online payments are processed through secure, encrypted channels to ensure your financial information remains protected. Cash on delivery is also available for select locations within Pakistan.',
        },
        {
          question: 'Can I modify or cancel my order after placing it?',
          answer:
            'We understand that sometimes you may need to make changes to your order. If your order has not yet been processed and shipped, you can contact our customer service team within 2 hours of placing your order to request modifications or cancellation. Once an order has been shipped, we are unable to cancel it, but you can initiate a return once the item is delivered. We recommend double-checking your size, color, and shipping address before completing your purchase to avoid any issues.',
        },
        {
          question: 'Is it safe to shop on your website?',
          answer:
            'Absolutely. Your security is our top priority. BurqaHijab uses industry-standard SSL encryption to protect all personal and payment information transmitted through our website. We partner with trusted payment processors that comply with PCI DSS standards. We never store your credit card details on our servers, and all transactions are processed through secure, PCI-compliant payment gateways. You can shop with complete confidence knowing that your data is fully protected.',
        },
      ],
    },
    {
      title: 'Shipping & Delivery',
      items: [
        {
          question: 'How long does shipping take within Pakistan?',
          answer:
            'For domestic orders within Pakistan, our standard delivery takes 3 to 5 business days. Orders placed before 2:00 PM PKT are processed and dispatched the same day, while orders placed after this time are processed the following business day. We use reputable courier services including TCS, Leopards Courier, and Trax to ensure your order reaches you safely and on time. You will receive a tracking number via email and SMS once your order has been dispatched so you can monitor its progress.',
        },
        {
          question: 'Do you offer free shipping?',
          answer:
            `Yes, we offer free shipping on all domestic orders within Pakistan that exceed PKR ${Number(settings.freeShippingThreshold).toLocaleString()} in value. For orders below this amount, a flat shipping fee of PKR ${settings.shippingCostDomestic} applies. For international orders, shipping rates vary by destination and are calculated at checkout. We frequently run promotional campaigns that include free shipping offers, so be sure to subscribe to our newsletter and follow us on social media to stay updated on our latest deals and shipping promotions.`,
        },
        {
          question: 'How can I track my order?',
          answer:
            `Once your order has been dispatched from our warehouse, you will receive an email and SMS notification containing your tracking number and a link to track your shipment. You can enter this tracking number on the courier company\'s website or use their mobile app for real-time updates. If you experience any issues with tracking or have not received your tracking information within 48 hours of placing your order, please contact our customer service team at ${settings.contactEmail} or WhatsApp us at ${settings.phoneNumber} for immediate assistance.`,
        },
        {
          question: 'Do you ship internationally?',
          answer:
            'Yes, we are proud to ship our luxury modest fashion to customers worldwide. International shipping typically takes 7 to 14 business days depending on your location. We ship to over 50 countries across North America, Europe, the Middle East, Southeast Asia, and Australia. International shipping rates are calculated based on the destination country and package weight at checkout. Please note that international customers may be responsible for customs duties and import taxes, which are not included in our shipping charges.',
        },
      ],
    },
    {
      title: 'Returns & Exchanges',
      items: [
        {
          question: 'What is your return policy?',
          answer:
            `We offer a ${settings.returnWindowDays}-day return policy from the date of delivery. If you are not completely satisfied with your purchase, you may return eligible items in their original condition — unworn, unwashed, with all tags attached, and in their original packaging. To initiate a return, simply contact our customer service team with your order number, and we will provide you with return instructions. Please note that sale items, accessories, and customized products are not eligible for returns. Refunds are processed within 5 to 7 business days after we receive and inspect the returned item.`,
        },
        {
          question: 'How do I exchange an item for a different size or color?',
          answer:
            `Exchanging an item is easy and hassle-free. Contact our customer service team within ${settings.returnWindowDays} days of receiving your order to request an exchange. Provide your order number along with the size or color you would like instead. If the desired item is in stock, we will arrange the exchange immediately. You will need to ship the original item back to us, and once received and inspected, we will dispatch the replacement at no additional shipping cost. If the replacement is not available, we will offer you a store credit or a full refund.`,
        },
        {
          question: 'What items are non-returnable?',
          answer:
            'For hygiene and quality assurance reasons, certain items cannot be returned. These include items purchased during sale events or at discounted prices, accessories such as pins, brooches, and underscarves, customized or made-to-order pieces, and items that have been worn, washed, altered, or damaged by the customer. Intimates and items marked as "Final Sale" at the time of purchase are also excluded from our return policy. We encourage you to carefully review product descriptions and size guides before making your purchase.',
        },
        {
          question: 'What should I do if I receive a damaged or defective item?',
          answer:
            'We sincerely apologize if you receive a damaged or defective item. Please contact us within 48 hours of receiving your order with photos of the damage or defect along with your order number. We will arrange a free return pickup and either send you a replacement at no additional cost or issue a full refund, whichever you prefer. We take quality very seriously and thoroughly inspect all items before dispatch, but in the rare event that something slips through, we are committed to making it right for you as quickly as possible.',
        },
      ],
    },
    {
      title: 'Products & Sizing',
      items: [
        {
          question: 'How do I choose the right size for abayas?',
          answer:
            'We provide a detailed size guide on our website to help you find your perfect fit. For abayas, we recommend measuring your bust, shoulder width, and desired length. Stand straight with your arms relaxed at your sides and use a soft measuring tape. Our abayas are designed with a relaxed, flowing fit, so if you are between sizes, we recommend going up one size for maximum comfort. Each product listing also includes specific measurements for that style. If you are still unsure, feel free to reach out to our customer service team who can provide personalized sizing recommendations based on your measurements.',
        },
        {
          question: 'What fabrics do you use for your abayas and hijabs?',
          answer:
            'We take immense pride in using only premium, carefully sourced fabrics for all our products. Our abayas are crafted from high-quality materials including Nida fabric (known for its luxurious drape and comfort), premium crepe (lightweight and wrinkle-resistant), chiffon (elegant and flowing), and jersey (soft and stretchy for everyday comfort). Our hijabs come in a variety of fabrics including premium cotton, chiffon, silk blends, and Jersey. Each fabric is chosen for its specific qualities, and we provide detailed fabric care instructions with every purchase to help you maintain the beauty and longevity of your garments.',
        },
        {
          question: 'How should I care for my abayas and hijabs?',
          answer:
            'Proper care ensures your garments remain beautiful for years to come. For most of our abayas, we recommend gentle hand washing or machine washing on a delicate cycle in cold water with a mild detergent. Avoid using bleach or harsh chemicals. For chiffon and silk items, dry cleaning is recommended. Always air dry your garments away from direct sunlight to prevent color fading. Iron on a low heat setting or use steam. For hijabs, follow the specific care label instructions — most can be hand washed and laid flat to dry. We include detailed care instructions with every order, and you can also find fabric-specific care guides on our website.',
        },
        {
          question: 'Do you offer custom sizing or bespoke orders?',
          answer:
            'While our standard size range from XS to XXL is designed to accommodate most body types, we understand that every woman is unique. We do offer custom sizing for select abaya styles upon request. Custom sizing involves providing us with your specific measurements, and our skilled artisans will tailor the garment to your exact specifications. Custom orders typically take 7 to 10 additional business days to complete. Please note that custom-sized items are made-to-order and are not eligible for returns or exchanges. Contact our customer service team to inquire about custom sizing availability for specific products.',
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          question: 'Where is BurqaHijab based?',
          answer:
            'BurqaHijab is proudly based in Karachi, Pakistan — the heart of South Asia\'s fashion industry. Our design studio and main warehouse are located in Karachi, where our team of talented designers and artisans work tirelessly to create beautiful, high-quality modest fashion pieces. We draw inspiration from Pakistan\'s rich textile heritage and combine it with contemporary design sensibilities. While our roots are in Pakistan, our reach is global, and we are honored to serve modest fashion enthusiasts in over 50 countries around the world.',
        },
        {
          question: 'How can I stay updated on new arrivals and promotions?',
          answer:
            'There are several ways to stay connected with BurqaHijab and be the first to know about new arrivals, exclusive offers, and special promotions. Subscribe to our newsletter at the bottom of our homepage to receive regular updates directly in your inbox. Follow us on Instagram (@burqahijab), Facebook, and TikTok for daily inspiration, styling tips, behind-the-scenes content, and flash sale announcements. You can also save our website to your bookmarks and check back regularly, as we update our collections frequently with new designs and limited-edition pieces.',
        },
        {
          question: 'Do you offer gift wrapping or special packaging?',
          answer:
            'Yes, we offer beautiful gift-ready packaging for all orders. Every BurqaHijab order arrives in our signature elegant packaging — a premium box wrapped with tissue paper and tied with a satin ribbon. This makes our products perfect for gifting on special occasions such as Eid, weddings, birthdays, or any celebration. We also offer a complimentary gift message service — simply include your message at checkout and we will include a handwritten card with your order. For corporate or bulk gifting inquiries, please contact our customer service team for special arrangements.',
        },
      ],
    },
  ], [settings.freeShippingThreshold, settings.contactEmail, settings.phoneNumber]);

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
            <HelpCircle className="mx-auto mb-4 h-12 w-12 text-[#d79c4a]" />
            <h1 className="page-title mb-3 text-4xl tracking-tight text-gray-900 dark:text-white md:text-5xl ">
              Help & FAQ
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-500 dark:text-gray-400 ">
              Find answers to the most commonly asked questions about our products,
              shipping, returns, and more. Can&apos;t find what you&apos;re looking for?
              We&apos;re always here to help.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Button
          variant="ghost"
          onClick={navigateHome}
          className="mb-4 gap-2 text-gray-500 dark:text-gray-400 hover:text-[#d79c4a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      {/* Quick Links */}
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Size Guide', action: navigateToSizeGuide },
            { label: 'Shipping Info', action: navigateToShipping },
            { label: 'Returns Policy', action: navigateToReturns },
            { label: 'Contact Us', action: navigateToContact },
          ].map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A] p-3 text-center text-sm text-gray-500 dark:text-gray-400 transition-all hover:border-[#d79c4a]/50 hover:text-[#d79c4a] "
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="mx-auto max-w-4xl" />

      {/* FAQ Sections */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-12">
          {faqSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              custom={sectionIndex}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white ">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {section.items.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${sectionIndex}-${index}`}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#1A1A1A] px-4 data-[state=open]:border-[#d79c4a]/30"
                  >
                    <AccordionTrigger className="text-left text-base font-medium text-gray-900 dark:text-white hover:no-underline hover:text-[#d79c4a]  py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-base leading-relaxed text-gray-500 dark:text-gray-400 ">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Still Need Help */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gradient-to-b from-background to-[#d79c4a]/5">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white ">
              Still Have Questions?
            </h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400 ">
              Our friendly customer service team is available to assist you. Reach out
              to us through any of the channels below and we&apos;ll get back to you
              promptly.
            </p>
            <Button
              onClick={navigateToContact}
              className="bg-[#d79c4a] text-white dark:text-[#0A0A0A] hover:bg-[#d79c4a]/90 "
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
