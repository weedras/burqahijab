'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Target,
  Clock,
  Package,
  AlertTriangle,
  RotateCcw,
  Plus,
  Eye,
  Database,
  Loader2,
  RefreshCw,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  MapPin,
  Layers,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  revenue: {
    total: number;
    thisMonth: number;
    thisWeek: number;
    today: number;
    averageOrderValue: number;
    byPaymentMethod: {
      cod: number;
      jazzcash: number;
      easypaisa: number;
      bank_transfer: number;
      card: number;
    };
    returnedValue: number;
  };
  orders: {
    total: number;
    byStatus: {
      pending: number;
      confirmed: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
      returned: number;
    };
    averageDaily: number;
    recent: Array<{
      id: string;
      orderNumber: string;
      customerName: string;
      totalAmount: number;
      status: string;
      paymentMethod: string;
      city: string;
      createdAt: string;
    }>;
  };
  products: {
    total: number;
    inventoryValue: number;
    lowStock: Array<{
      id: string;
      name: string;
      slug: string;
      stockCount: number;
      price: number;
      images: string;
    }>;
    outOfStock: number;
    topSellers: Array<{
      id: string;
      name: string;
      reviewCount: number;
      rating: number;
      price: number;
      images: string;
    }>;
    averageRating: number;
    onSale: number;
  };
  customers: {
    totalUnique: number;
    repeatRate: number;
    topCities: Array<{ city: string; count: number }>;
    recentEmails: string[];
  };
  returns: {
    total: number;
    totalValue: number;
    returnRate: number;
    cancelled: { count: number; value: number };
  };
  newsletter: {
    total: number;
    thisMonth: number;
  };
  performance: {
    catalogEfficiency: number;
    averageItemsPerOrder: number;
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  confirmed: {
    bg: 'bg-blue-100 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  processing: {
    bg: 'bg-purple-100 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  shipped: {
    bg: 'bg-cyan-100 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-400',
    dot: 'bg-cyan-500',
  },
  delivered: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  returned: {
    bg: 'bg-orange-100 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  card: 'Card Payment',
};

const PAYMENT_COLORS: Record<string, string> = {
  cod: 'bg-emerald-500',
  jazzcash: 'bg-red-500',
  easypaisa: 'bg-green-600',
  bank_transfer: 'bg-blue-500',
  card: 'bg-purple-500',
};

const DONUT_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#a855f7',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  returned: '#f97316',
};

// ─── Animation Variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPKR(amount: number): string {
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function formatDateLong(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top bar skeleton */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </motion.div>

      {/* Primary KPIs skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Skeleton className="h-36 rounded-xl" />
          </motion.div>
        ))}
      </div>

      {/* Secondary KPIs skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Skeleton className="h-28 rounded-xl" />
          </motion.div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-80 rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-80 rounded-xl" />
        </motion.div>
      </div>

      {/* Table skeleton */}
      <motion.div variants={itemVariants}>
        <Skeleton className="h-[400px] rounded-xl" />
      </motion.div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-72 rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-72 rounded-xl" />
        </motion.div>
      </div>

      {/* Customer insights skeleton */}
      <motion.div variants={itemVariants}>
        <Skeleton className="h-72 rounded-xl" />
      </motion.div>

      {/* Quick actions skeleton */}
      <motion.div variants={itemVariants}>
        <Skeleton className="h-20 rounded-xl" />
      </motion.div>
    </motion.div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  large = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  large?: boolean;
}) {
  return (
    <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md dark:hover:shadow-none dark:hover:border-gray-700 transition-shadow duration-200">
      <CardContent className={large ? 'p-5 md:p-6' : 'p-4 md:p-5'}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {value}
            </p>
            {trend && trendLabel && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                ) : null}
                <span
                  className={`text-xs font-medium ${
                    trend === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : trend === 'down'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <span className={iconColor}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SmallKPICard({
  label,
  value,
  subValue,
  icon,
  iconBg,
  iconColor,
  alert,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  alert?: boolean;
}) {
  return (
    <Card
      className={`bg-white dark:bg-[#141414] border rounded-xl transition-shadow duration-200 hover:shadow-md dark:hover:shadow-none ${
        alert
          ? 'border-red-200 dark:border-red-900/50'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}
          >
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {subValue}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No order data
        </p>
      </div>
    );
  }

  let accumulated = 0;
  const stops = entries.map(([key, value]) => {
    const start = accumulated;
    const pct = (value / total) * 100;
    accumulated += pct;
    return `${DONUT_COLORS[key] || '#6b7280'} ${start}% ${accumulated}%`;
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <div
          className="h-44 w-44 rounded-full"
          style={{
            background: `conic-gradient(${stops.join(', ')})`,
          }}
        />
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#141414]">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {total}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: DONUT_COLORS[key] || '#6b7280' }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {key}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { setAdminSection, navigateHome } = useUIStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminFetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await adminFetch('/api/admin/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed');
      toast.success('Database seeded successfully!');
      fetchDashboard();
    } catch {
      toast.error('Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  // ─── Computed values ───────────────────────────────────────────────────

  const paymentEntries = useMemo(() => {
    if (!data) return [];
    return (
      Object.entries(data.revenue.byPaymentMethod)
        .filter(([_key, val]) => val > 0)
        .sort(([, a], [, b]) => b - a)
    );
  }, [data]);

  const maxPaymentVal = useMemo(() => {
    if (paymentEntries.length === 0) return 1;
    return Math.max(...paymentEntries.map(([, v]) => v));
  }, [paymentEntries]);

  const lowStockItems = useMemo(() => {
    if (!data) return [];
    return data.products.lowStock.slice(0, 8);
  }, [data]);

  const topSellers = useMemo(() => {
    if (!data) return [];
    return data.products.topSellers.slice(0, 5);
  }, [data]);

  const topCities = useMemo(() => {
    if (!data) return [];
    return data.customers.topCities.slice(0, 5);
  }, [data]);

  const maxCityCount = useMemo(() => {
    if (topCities.length === 0) return 1;
    return Math.max(...topCities.map((c) => c.count));
  }, [topCities]);

  const conversionRate = useMemo(() => {
    if (!data) return 0;
    return data.performance.catalogEfficiency;
  }, [data]);

  // ─── Loading state ─────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton />;

  if (!data) return null;

  const d = data;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        className="space-y-5 md:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Top Bar ────────────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDateLong()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="gap-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-fit"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </motion.div>

        {/* ─── Primary KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <KPICard
              label="Total Revenue"
              value={formatPKR(d.revenue.total)}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-emerald-100 dark:bg-emerald-950/50"
              iconColor="text-emerald-600 dark:text-emerald-400"
              trend="up"
              trendLabel={`PKR ${d.revenue.thisMonth.toLocaleString()} this month`}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              label="Total Orders"
              value={d.orders.total.toLocaleString()}
              icon={<ShoppingCart className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-950/50"
              iconColor="text-blue-600 dark:text-blue-400"
              trend="neutral"
              trendLabel={`${d.orders.averageDaily.toFixed(1)} avg/day`}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              label="Avg. Order Value"
              value={formatPKR(d.revenue.averageOrderValue)}
              icon={<BarChart3 className="h-5 w-5" />}
              iconBg="bg-amber-100 dark:bg-amber-950/50"
              iconColor="text-amber-600 dark:text-amber-400"
              large
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              label="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              icon={<Target className="h-5 w-5" />}
              iconBg="bg-purple-100 dark:bg-purple-950/50"
              iconColor="text-purple-600 dark:text-purple-400"
              trend={conversionRate > 0 ? 'up' : 'neutral'}
              trendLabel="Catalog efficiency"
            />
          </motion.div>
        </div>

        {/* ─── Secondary KPI Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Pending Orders"
              value={d.orders.byStatus.pending.toLocaleString()}
              icon={<Clock className="h-4 w-4" />}
              iconBg="bg-amber-100 dark:bg-amber-950/50"
              iconColor="text-amber-600 dark:text-amber-400"
              alert={d.orders.byStatus.pending > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Products"
              value={d.products.total.toLocaleString()}
              subValue={`${d.products.onSale} on sale`}
              icon={<Package className="h-4 w-4" />}
              iconBg="bg-slate-100 dark:bg-slate-800"
              iconColor="text-slate-600 dark:text-slate-400"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Low Stock"
              value={lowStockItems.length.toLocaleString()}
              subValue={
                d.products.outOfStock > 0
                  ? `${d.products.outOfStock} out of stock`
                  : undefined
              }
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBg={
                lowStockItems.length > 0
                  ? 'bg-red-100 dark:bg-red-950/50'
                  : 'bg-gray-100 dark:bg-gray-800'
              }
              iconColor={
                lowStockItems.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
              }
              alert={lowStockItems.length > 0}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Returns"
              value={d.returns.total.toLocaleString()}
              subValue={formatPKR(d.returns.totalValue)}
              icon={<RotateCcw className="h-4 w-4" />}
              iconBg="bg-orange-100 dark:bg-orange-950/50"
              iconColor="text-orange-600 dark:text-orange-400"
              alert={d.returns.total > 0}
            />
          </motion.div>
        </div>

        {/* ─── Charts Section ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Revenue by Payment Method */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Revenue by Payment Method
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-6 text-center">
                    No revenue data yet
                  </p>
                ) : (
                  paymentEntries.map(([method, amount]) => (
                    <div key={method} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-sm ${PAYMENT_COLORS[method] || 'bg-gray-400'}`}
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {PAYMENT_LABELS[method] || method}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                          {formatPKR(amount)}
                        </span>
                      </div>
                      <Progress
                        value={(amount / maxPaymentVal) * 100}
                        className={`h-2 ${
                          method === 'cod'
                            ? '[&>div]:bg-emerald-500'
                            : method === 'jazzcash'
                              ? '[&>div]:bg-red-500'
                              : method === 'easypaisa'
                                ? '[&>div]:bg-green-600'
                                : method === 'bank_transfer'
                                  ? '[&>div]:bg-blue-500'
                                  : '[&>div]:bg-purple-500'
                        }`}
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Order Status Distribution
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <DonutChart data={d.orders.byStatus} total={d.orders.total} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Recent Orders Table ────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Recent Orders
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAdminSection('orders')}
                  className="text-xs text-[#d79c4a] hover:text-[#c48a35] hover:bg-[#d79c4a]/10 gap-1"
                >
                  View All
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {d.orders.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-200 dark:text-gray-700 mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    No orders yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                    Orders will appear here once customers start purchasing
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 dark:border-gray-800 hover:bg-transparent">
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                          Order #
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                          Customer
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold hidden md:table-cell">
                          City
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold hidden sm:table-cell">
                          Payment
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                          Amount
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                          Status
                        </TableHead>
                        <TableHead className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold text-right">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {d.orders.recent.slice(0, 5).map((order) => {
                        const statusStyle =
                          STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                        return (
                          <TableRow
                            key={order.id}
                            className="border-gray-100 dark:border-gray-800/80"
                          >
                            <TableCell>
                              <span className="text-sm font-mono font-semibold text-[#d79c4a]">
                                {order.orderNumber}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-900 dark:text-white font-medium">
                                {order.customerName}
                              </span>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {order.city || '—'}
                              </span>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant="secondary"
                                className="text-[11px] bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium"
                              >
                                {PAYMENT_LABELS[order.paymentMethod] ||
                                  order.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                PKR {order.totalAmount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`${statusStyle.bg} ${statusStyle.text} border-0 gap-1.5 text-[11px] font-semibold`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                />
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                                {formatDateShort(order.createdAt)}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Inventory Alerts + Top Products ────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Inventory Alerts */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Inventory Alerts
                    </p>
                    {lowStockItems.length > 0 && (
                      <Badge className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-0 text-[10px] px-1.5 py-0">
                        {lowStockItems.length}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdminSection('products')}
                    className="text-xs text-[#d79c4a] hover:text-[#c48a35] hover:bg-[#d79c4a]/10 gap-1"
                  >
                    Manage
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All stocked up
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      No low stock alerts right now
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[320px]">
                    <div className="space-y-3 pr-2">
                      {lowStockItems.map((item) => {
                        const pct = Math.min((item.stockCount / 50) * 100, 100);
                        const stockColor =
                          item.stockCount <= 3
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400';
                        const barClass =
                          item.stockCount <= 3
                            ? '[&>div]:bg-red-500'
                            : '[&>div]:bg-amber-500';

                        return (
                          <div
                            key={item.id}
                            className="space-y-1.5 p-2.5 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate pr-2">
                                {item.name}
                              </span>
                              <span
                                className={`text-xs font-bold tabular-nums flex-shrink-0 ${stockColor}`}
                              >
                                {item.stockCount} left
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress
                                value={pct}
                                className={`h-1.5 flex-1 ${barClass}`}
                              />
                              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">
                                PKR {item.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Top Products
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdminSection('products')}
                    className="text-xs text-[#d79c4a] hover:text-[#c48a35] hover:bg-[#d79c4a]/10 gap-1"
                  >
                    View All
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {topSellers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No products yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Top sellers will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topSellers.map((product, idx) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                      >
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <RatingStars rating={product.rating} />
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                              ({product.reviewCount})
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums flex-shrink-0">
                          PKR {product.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Customer Insights ──────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Customer Insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Cities */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    Top Cities by Orders
                  </p>
                  {topCities.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-4">
                      No city data yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topCities.map((city, idx) => (
                        <div key={city.city} className="flex items-center gap-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate flex-shrink-0">
                                {city.city}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {city.city}: {city.count} orders
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <div className="flex-1">
                            <Progress
                              value={(city.count / maxCityCount) * 100}
                              className={`h-2 ${
                                idx === 0
                                  ? '[&>div]:bg-[#d79c4a]'
                                  : '[&>div]:bg-gray-300 dark:[&>div]:bg-gray-600'
                              }`}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums w-8 text-right flex-shrink-0">
                            {city.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator
                  orientation="vertical"
                  className="hidden lg:block h-auto"
                />
                <Separator className="lg:hidden" />

                {/* Key Metrics */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                    Key Metrics
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {d.customers.totalUnique}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-0.5">
                        Total Customers
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {d.customers.repeatRate.toFixed(1)}%
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-0.5">
                        Repeat Rate
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                          <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {d.performance.averageItemsPerOrder.toFixed(1)}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-0.5">
                        Avg Items/Order
                      </p>
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Newsletter Subscribers
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {d.newsletter.total} total · {d.newsletter.thisMonth} this
                        month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Quick Actions ──────────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setAdminSection('products')}
                  className="gap-2 bg-[#d79c4a] text-white hover:bg-[#c48a35] shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdminSection('orders')}
                  className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Manage Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAdminSection('collections')}
                  className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Layers className="h-4 w-4" />
                  Add Collection
                </Button>
                <Button
                  variant="outline"
                  onClick={navigateHome}
                  className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Eye className="h-4 w-4" />
                  View Shop
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSeed}
                  disabled={seeding}
                  className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {seeding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {seeding ? 'Seeding...' : 'Seed Database'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
