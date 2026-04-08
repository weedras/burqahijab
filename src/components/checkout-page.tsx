'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Package,
  Shield,
  Truck,
  CheckCircle2,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  FileText,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore, getCartSubtotal, getCartTotalItems } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useStoreSettings } from '@/stores/store-settings-store';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sargodha',
  'Bahawalpur', 'Sukkur', 'Larkana', 'Abbottabad', 'Mardan', 'Mingora',
  'Sahiwal', 'Dera Ghazi Khan', 'Rahim Yar Khan', 'Okara', 'Kasur',
  'Gujrat', 'Jhang', 'Sheikhupura', 'Chiniot', 'D I Khan', 'Kohat',
  'Bannu', 'Swabi', 'Nowshera', 'Turbat', 'Khuzdar', 'Hub',
];

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '💵',
  },
  {
    id: 'jazzcash',
    label: 'JazzCash',
    description: 'Send payment to 0300-XXXXXXX',
    icon: '📱',
  },
  {
    id: 'easypaisa',
    label: 'EasyPaisa',
    description: 'Send payment to 0345-XXXXXXX',
    icon: '📱',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Transfer to our bank account',
    icon: '🏦',
  },
];

type Step = 'information' | 'shipping' | 'payment' | 'confirmation';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigateToShop = useUIStore((s) => s.navigateToShop);
  const navigateHome = useUIStore((s) => s.navigateHome);
  const { settings } = useStoreSettings();

  const [step, setStep] = useState<Step>('information');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Form state
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    paymentMethod: 'cod',
    notes: '',
  });

  const currentSubtotal = useMemo(() => getCartSubtotal(items), [items]);
  const itemCount = useMemo(() => getCartTotalItems(items), [items]);
  const freeShippingThreshold = useMemo(() => Number(settings.freeShippingThreshold) || 3000, [settings.freeShippingThreshold]);
  const shippingCost = currentSubtotal >= freeShippingThreshold ? 0 : (Number(settings.shippingCostDomestic) || 250);
  const totalAmount = currentSubtotal + shippingCost;
  const qualifiesFreeShipping = currentSubtotal >= freeShippingThreshold;

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const canProceedInfo = form.customerName.trim() && form.customerEmail.trim() && form.customerPhone.trim();
  const canProceedShipping = form.address.trim() && form.city.trim();
  const canPlaceOrder = true;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.salePrice ?? item.product.price,
        quantity: item.quantity,
        color: item.selectedColor,
        size: item.selectedSize,
        image: item.product.images[0] || null,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: orderItems,
          totalAmount,
          currency: 'PKR',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setOrderNumber(data.order.orderNumber);
      clearCart();
      setStep('confirmation');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart state
  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your bag is empty</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add some items before checking out</p>
        </div>
        <Button onClick={() => navigateToShop()} className="rounded-lg bg-[#d79c4a] font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35]">
          Start Shopping
        </Button>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: typeof User }[] = [
    { id: 'information', label: 'Information', icon: User },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0A0A0A]">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 dark:bg-[#0A0A0A] dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <button
            onClick={() => (step === 'information' ? navigateToShop() : setStep(step === 'shipping' ? 'information' : 'shipping'))}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{step === 'information' ? 'Back to Shop' : 'Back'}</span>
          </button>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
          {/* Step indicator */}
          {step !== 'confirmation' && (
            <div className="mt-4 flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      step === s.id
                        ? 'bg-[#d79c4a] text-[#0A0A0A]'
                        : ['information', 'shipping', 'payment'].indexOf(step) > i
                          ? 'bg-[#d79c4a]/20 text-[#d79c4a]'
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    )}
                  >
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {/* ─── CONFIRMATION ─── */}
          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto text-center py-16"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Order Confirmed!
              </h2>
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Thank you for your order. We&apos;ll send a confirmation email to <span className="font-medium text-gray-700 dark:text-gray-300">{form.customerEmail}</span>
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 dark:bg-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Order Number</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{orderNumber}</span>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={navigateHome}
                  className="h-12 rounded-lg bg-[#d79c4a] px-8 font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35]"
                >
                  Continue Shopping
                </Button>
              </div>
              <div className="mt-10 flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Secure Checkout</div>
                <div className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Free Shipping over {formatPrice(freeShippingThreshold)}</div>
                <div className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> Easy Returns</div>
              </div>
            </motion.div>
          )}

          {/* ─── INFORMATION STEP ─── */}
          {step === 'information' && (
            <motion.div
              key="information"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form */}
              <div className="lg:col-span-3 space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#141414]">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Contact Information</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We&apos;ll use this to send your order updates</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="customerName"
                          placeholder="e.g. Ayesha Khan"
                          value={form.customerName}
                          onChange={(e) => updateForm('customerName', e.target.value)}
                          className="pl-10 h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm focus-visible:ring-[#d79c4a]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="e.g. ayesha@example.com"
                          value={form.customerEmail}
                          onChange={(e) => updateForm('customerEmail', e.target.value)}
                          className="pl-10 h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm focus-visible:ring-[#d79c4a]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="customerPhone"
                          type="tel"
                          placeholder="e.g. 0300-1234567"
                          value={form.customerPhone}
                          onChange={(e) => updateForm('customerPhone', e.target.value)}
                          className="pl-10 h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm focus-visible:ring-[#d79c4a]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep('shipping')}
                    disabled={!canProceedInfo}
                    className="h-12 rounded-lg bg-[#d79c4a] px-8 font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Shipping
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-2">
                <OrderSummaryCard
                  items={items}
                  subtotal={currentSubtotal}
                  shippingCost={shippingCost}
                  total={totalAmount}
                  qualifiesFreeShipping={qualifiesFreeShipping}
                  freeShippingThreshold={freeShippingThreshold}
                />
              </div>
            </motion.div>
          )}

          {/* ─── SHIPPING STEP ─── */}
          {step === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              <div className="lg:col-span-3 space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#141414]">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Shipping Address</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Where should we deliver your order?</p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Address *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="address"
                          placeholder="e.g. House 12, Block D, Gulshan-e-Iqbal"
                          value={form.address}
                          onChange={(e) => updateForm('address', e.target.value)}
                          rows={3}
                          className="pl-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm focus-visible:ring-[#d79c4a] resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        City *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          id="city"
                          value={form.city}
                          onChange={(e) => updateForm('city', e.target.value)}
                          className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#d79c4a] focus:border-[#d79c4a] appearance-none cursor-pointer"
                        >
                          <option value="">Select your city</option>
                          {CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order Notes (Optional)
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Textarea
                          id="notes"
                          placeholder="Any special instructions for delivery?"
                          value={form.notes}
                          onChange={(e) => updateForm('notes', e.target.value)}
                          rows={2}
                          className="pl-10 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0A0A0A] text-sm focus-visible:ring-[#d79c4a] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep('information')}
                    className="h-12 rounded-lg border-gray-300 font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep('payment')}
                    disabled={!canProceedShipping}
                    className="h-12 rounded-lg bg-[#d79c4a] px-8 font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-2">
                <OrderSummaryCard
                  items={items}
                  subtotal={currentSubtotal}
                  shippingCost={shippingCost}
                  total={totalAmount}
                  qualifiesFreeShipping={qualifiesFreeShipping}
                  freeShippingThreshold={freeShippingThreshold}
                />
              </div>
            </motion.div>
          )}

          {/* ─── PAYMENT STEP ─── */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              <div className="lg:col-span-3 space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#141414]">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Payment Method</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how you&apos;d like to pay</p>

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => updateForm('paymentMethod', method.id)}
                        className={cn(
                          'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                          form.paymentMethod === method.id
                            ? 'border-[#d79c4a] bg-[#d79c4a]/5 dark:bg-[#d79c4a]/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {method.label}
                            </span>
                            {form.paymentMethod === method.id && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d79c4a]">
                                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {method.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order summary preview on mobile */}
                <div className="lg:hidden rounded-2xl bg-white p-4 shadow-sm dark:bg-[#141414]">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>{formatPrice(currentSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep('shipping')}
                    className="h-12 rounded-lg border-gray-300 font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !canPlaceOrder}
                    className="h-12 rounded-lg bg-[#d79c4a] px-8 font-semibold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#c48a35] disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Place Order — {formatPrice(totalAmount)}
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>

              <div className="hidden lg:block lg:col-span-2">
                <OrderSummaryCard
                  items={items}
                  subtotal={currentSubtotal}
                  shippingCost={shippingCost}
                  total={totalAmount}
                  qualifiesFreeShipping={qualifiesFreeShipping}
                  freeShippingThreshold={freeShippingThreshold}
                  showPaymentBadge
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Order Summary Card (reused on each step) ─── */
function OrderSummaryCard({
  items,
  subtotal,
  shippingCost,
  total,
  qualifiesFreeShipping,
  freeShippingThreshold,
  showPaymentBadge = false,
}: {
  items: { product: { id: string; name: string; images: string[]; salePrice: number | null; price: number }; quantity: number; selectedColor: string; selectedSize: string }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  qualifiesFreeShipping: boolean;
  freeShippingThreshold: number;
  showPaymentBadge?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#141414] sticky top-28">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => {
          const price = item.product.salePrice ?? item.product.price;
          return (
            <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-3">
              <div
                className="h-14 w-11 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 bg-cover bg-center"
                style={{
                  backgroundImage: item.product.images[0] ? `url('${item.product.images[0]}')` : undefined,
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.quantity} x {formatPrice(price)}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white shrink-0">
                {formatPrice(price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      <Separator className="my-4 bg-gray-200 dark:bg-gray-700" />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500 dark:text-gray-400">
          <span>Shipping</span>
          <span className={qualifiesFreeShipping ? 'text-emerald-500 font-medium' : ''}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
        <Separator className="bg-gray-200 dark:bg-gray-700" />
        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {!qualifiesFreeShipping && (
        <div className="mt-4 rounded-lg bg-[#d79c4a]/10 px-3 py-2 text-xs text-[#d79c4a] text-center">
          Add {formatPrice(Math.max(0, freeShippingThreshold - subtotal))} more for free shipping!
        </div>
      )}

      {showPaymentBadge && (
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Lock className="h-3 w-3" />
          <span>Secure checkout</span>
        </div>
      )}
    </div>
  );
}
