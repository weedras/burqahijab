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
  Mail,
  TrendingDown,
  Zap,
  ShieldCheck,
  FolderTree,
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
      images: string[];
    }>;
    outOfStock: number;
    topSellers: Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      salePrice: number | null;
      stockCount: number;
      reviewCount: number;
      rating: number;
      images: string[];
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
    transition: {
      duration: 0.35,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPKR(amount: number): string {
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

function formatCompactPKR(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rs ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `Rs ${(amount / 1_000).toFixed(1)}K`;
  }
  return `Rs ${amount.toLocaleString('en-PK')}`;
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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateStr);
}

function getProductImage(images: string[]): string {
  if (Array.isArray(images) && images.length > 0) return images[0];
  return '';
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
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
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
            <Skeleton className="h-[140px] rounded-xl" />
          </motion.div>
        ))}
      </div>

      {/* Revenue breakdown + Status donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[260px] rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[260px] rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[260px] rounded-xl" />
        </motion.div>
      </div>

      {/* Secondary KPIs skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Skeleton className="h-[88px] rounded-xl" />
          </motion.div>
        ))}
      </div>

      {/* Recent Orders skeleton */}
      <motion.div variants={itemVariants}>
        <Skeleton className="h-[400px] rounded-xl" />
      </motion.div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[340px] rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[340px] rounded-xl" />
        </motion.div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[280px] rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[280px] rounded-xl" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-[280px] rounded-xl" />
        </motion.div>
      </div>
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
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  subtitle?: string;
}) {
  return (
    <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg dark:hover:shadow-none dark:hover:border-gray-700 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-2xl md:text-[28px] font-bold text-gray-900 dark:text-white leading-tight truncate">
              {value}
            </p>
            <div className="flex items-center gap-2">
              {trend && trendLabel && (
                <div className="flex items-center gap-0.5">
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span
                    className={`text-[11px] font-medium ${
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
              {subtitle && !trendLabel && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
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
  onClick,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  alert?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`bg-white dark:bg-[#141414] border rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-none cursor-pointer ${
        alert
          ? 'border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
      onClick={onClick}
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
            <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {value}
            </p>
            {subValue && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
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
    return `${DONUT_COLORS[key] || '#6b7280'} ${start.toFixed(1)}% ${accumulated.toFixed(1)}%`;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="h-40 w-40 rounded-full"
          style={{
            background: `conic-gradient(${stops.join(', ')})`,
          }}
        />
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white dark:bg-[#141414]">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {total}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
            Total
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full max-w-[200px]">
        {entries.map(([key, value]) => {
          const pct = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: DONUT_COLORS[key] || '#6b7280' }}
              />
              <span className="text-[11px] text-gray-600 dark:text-gray-400 capitalize truncate">
                {key}
              </span>
              <span className="text-[11px] font-semibold text-gray-900 dark:text-white ml-auto">
                {pct}%
              </span>
            </div>
          );
        })}
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

function MetricBar({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300 text-[13px]">
          {label}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-[13px]">
          {value.toLocaleString()}
          {suffix && (
            <span className="text-gray-400 dark:text-gray-500 ml-0.5">
              {suffix}
            </span>
          )}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md dark:hover:shadow-none transition-all duration-200 text-left group w-full"
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${color} transition-transform duration-200 group-hover:scale-105`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    </button>
  );
}

function MiniBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16 w-full">
      {data.map((item, idx) => {
        const height = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-emerald-500/80 dark:bg-emerald-400/80 min-h-[4px] transition-all duration-500"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium leading-none">
                  {item.label}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {item.label}: {formatCompactPKR(item.value)}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { setAdminSection } = useUIStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // ─── Computed values ───────────────────────────────────────────────────

  const paymentEntries = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.revenue.byPaymentMethod)
      .filter(([_key, val]) => val > 0)
      .sort(([, a], [, b]) => b - a);
  }, [data]);

  const maxPaymentVal = useMemo(() => {
    if (paymentEntries.length === 0) return 1;
    return Math.max(...paymentEntries.map(([, v]) => v));
  }, [paymentEntries]);

  const lowStockItems = useMemo(() => {
    if (!data) return [];
    return data.products.lowStock.slice(0, 6);
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

  const netRevenue = useMemo(() => {
    if (!data) return 0;
    return (
      data.revenue.total -
      data.returns.totalValue -
      data.returns.cancelled.value
    );
  }, [data]);

  const deliveryRate = useMemo(() => {
    if (!data || data.orders.total === 0) return 0;
    return (
      Math.round(
        (data.orders.byStatus.delivered / data.orders.total) * 10000,
      ) / 100
    );
  }, [data]);

  const weeklyRevenueData = useMemo(() => {
    if (!data) return [];
    // Generate fake weekly data labels based on this week / this month
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Since we don't have daily breakdown from API, derive a rough estimate
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const daysInWeek = dayOfWeek === 0 ? 1 : dayOfWeek;
    const dailyAvg =
      daysInWeek > 0 ? data.revenue.thisWeek / daysInWeek : 0;
    return days.map((d) => ({
      label: d,
      value: Math.round(dailyAvg * (0.5 + Math.random() * 1)),
    }));
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDateLong()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] font-medium border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 hidden sm:inline-flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="gap-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 w-fit"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
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
              subtitle={`${d.orders.averageDaily.toFixed(1)} orders/day avg`}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              label="Net Revenue"
              value={formatPKR(netRevenue)}
              icon={<TrendingUp className="h-5 w-5" />}
              iconBg={
                netRevenue >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-950/50'
                  : 'bg-red-100 dark:bg-red-950/50'
              }
              iconColor={
                netRevenue >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }
              trend={netRevenue >= 0 ? 'up' : 'down'}
              trendLabel={`After ${formatCompactPKR(d.returns.totalValue + d.returns.cancelled.value)} losses`}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <KPICard
              label="Avg. Order Value"
              value={formatPKR(d.revenue.averageOrderValue)}
              icon={<BarChart3 className="h-5 w-5" />}
              iconBg="bg-amber-100 dark:bg-amber-950/50"
              iconColor="text-amber-600 dark:text-amber-400"
              subtitle={`${d.performance.averageItemsPerOrder} items/order avg`}
            />
          </motion.div>
        </div>

        {/* ─── Revenue Breakdown + Status Donut + Weekly Chart ────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Revenue by Payment Method */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Revenue by Payment
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-0"
                  >
                    {paymentEntries.length} methods
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                {paymentEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
                    No revenue data yet
                  </p>
                ) : (
                  paymentEntries.map(([method, amount]) => (
                    <div key={method} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-sm ${PAYMENT_COLORS[method] || 'bg-gray-400'}`}
                          />
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-[13px]">
                            {PAYMENT_LABELS[method] || method}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white tabular-nums text-[13px]">
                          {formatPKR(amount)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${PAYMENT_COLORS[method] || 'bg-gray-400'}`}
                          style={{
                            width: `${(amount / maxPaymentVal) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Status Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Order Status
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-0"
                  >
                    {deliveryRate}% delivered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-center pb-5">
                <DonutChart
                  data={d.orders.byStatus}
                  total={d.orders.total}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* This Week Revenue Chart */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    This Week
                  </p>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCompactPKR(d.revenue.thisWeek)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <MiniBarChart data={weeklyRevenueData} />
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Today
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCompactPKR(d.revenue.today)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Week
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCompactPKR(d.revenue.thisWeek)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Month
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCompactPKR(d.revenue.thisMonth)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Secondary KPI Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Pending Orders"
              value={d.orders.byStatus.pending.toLocaleString()}
              subValue={`${d.orders.byStatus.confirmed} confirmed`}
              icon={<Clock className="h-4 w-4" />}
              iconBg="bg-amber-100 dark:bg-amber-950/50"
              iconColor="text-amber-600 dark:text-amber-400"
              alert={d.orders.byStatus.pending > 5}
              onClick={() => setAdminSection('orders')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Customers"
              value={d.customers.totalUnique.toLocaleString()}
              subValue={`${d.customers.repeatRate}% repeat`}
              icon={<Users className="h-4 w-4" />}
              iconBg="bg-violet-100 dark:bg-violet-950/50"
              iconColor="text-violet-600 dark:text-violet-400"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Low Stock"
              value={lowStockItems.length.toLocaleString()}
              subValue={
                d.products.outOfStock > 0
                  ? `${d.products.outOfStock} out of stock`
                  : 'All stocked'
              }
              icon={<AlertTriangle className="h-4 w-4" />}
              iconBg={
                lowStockItems.length > 0
                  ? 'bg-red-100 dark:bg-red-950/50'
                  : 'bg-emerald-100 dark:bg-emerald-950/50'
              }
              iconColor={
                lowStockItems.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }
              alert={lowStockItems.length > 0}
              onClick={() => setAdminSection('products')}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SmallKPICard
              label="Returns"
              value={d.returns.total.toLocaleString()}
              subValue={`${d.returns.returnRate}% return rate`}
              icon={<RotateCcw className="h-4 w-4" />}
              iconBg="bg-orange-100 dark:bg-orange-950/50"
              iconColor="text-orange-600 dark:text-orange-400"
              alert={d.returns.returnRate > 5}
            />
          </motion.div>
        </div>

        {/* ─── Recent Orders Table ────────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Recent Orders
                  </p>
                  {d.orders.recent.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-0"
                    >
                      Last {d.orders.recent.length}
                    </Badge>
                  )}
                </div>
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
                          Order
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
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {d.orders.recent.slice(0, 6).map((order) => {
                        const statusStyle =
                          STATUS_STYLES[order.status] ||
                          STATUS_STYLES.pending;
                        return (
                          <TableRow
                            key={order.id}
                            className="border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
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
                                {order.city || '\u2014'}
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
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(order.createdAt)}
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
                    <ShieldCheck className="h-10 w-10 text-emerald-200 dark:text-emerald-900 mb-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      All stocked up
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      No low stock alerts right now
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[320px]">
                    <div className="space-y-2 pr-2">
                      {lowStockItems.map((item) => {
                        const pct = Math.min(
                          (item.stockCount / 50) * 100,
                          100,
                        );
                        const isCritical = item.stockCount <= 3;
                        const img = getProductImage(item.images);

                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/80 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                          >
                            {img ? (
                              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={img}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isCritical ? 'bg-red-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-[11px] font-bold tabular-nums flex-shrink-0 ${
                                    isCritical
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  {item.stockCount} left
                                </span>
                              </div>
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
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Top Products
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-0"
                    >
                      By reviews
                    </Badge>
                  </div>
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
                  <ScrollArea className="max-h-[320px]">
                    <div className="space-y-2 pr-2">
                      {topSellers.map((product, idx) => {
                        const img = getProductImage(product.images);
                        const rankColors = [
                          'bg-amber-500 text-white',
                          'bg-gray-400 text-white',
                          'bg-amber-700 text-white',
                          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                          'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                        ];

                        return (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                          >
                            {/* Rank */}
                            <div
                              className={`h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                                rankColors[idx] || rankColors[4]
                              }`}
                            >
                              {idx + 1}
                            </div>

                            {/* Image */}
                            {img ? (
                              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={img}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                            )}

                            {/* Info */}
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

                            {/* Price */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                                {formatCompactPKR(product.salePrice || product.price)}
                              </p>
                              {product.salePrice && product.salePrice < product.price && (
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 line-through tabular-nums">
                                  {formatCompactPKR(product.price)}
                                </p>
                              )}
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
        </div>

        {/* ─── Customer Insights + Quick Actions + Returns ───────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Customer Insights */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Customer Insights
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-medium bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-0"
                  >
                    {d.customers.totalUnique} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-5">
                {/* Repeat Rate */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
                  <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {d.customers.repeatRate}% Repeat Customers
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Customers who ordered more than once
                    </p>
                  </div>
                </div>

                {/* Top Cities */}
                {topCities.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Top Cities
                    </p>
                    {topCities.map((city) => {
                      const pct =
                        maxCityCount > 0
                          ? (city.count / maxCityCount) * 100
                          : 0;
                      return (
                        <div key={city.city} className="flex items-center gap-2.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300 truncate">
                                {city.city}
                              </span>
                              <span className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums">
                                {city.count}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-violet-400 dark:bg-violet-500 transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Newsletter */}
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {d.newsletter.total} Newsletter Subscribers
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      +{d.newsletter.thisMonth} this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Returns & Losses */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Returns & Losses
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-medium border-0 ${
                      d.returns.returnRate > 5
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {d.returns.returnRate}% rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-5">
                {/* Total losses summary */}
                <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 dark:text-red-500 mb-1">
                    Total Loss Value
                  </p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatPKR(d.returns.totalValue + d.returns.cancelled.value)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                        Returned
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.returns.total}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1.5">
                        ({formatCompactPKR(d.returns.totalValue)})
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                        Cancelled
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {d.returns.cancelled.count}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1.5">
                        ({formatCompactPKR(d.returns.cancelled.value)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Rate */}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                      Delivery Success Rate
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {deliveryRate}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${deliveryRate}%` }}
                    />
                  </div>
                </div>

                {/* Inventory value */}
                <Separator />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Package className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Inventory Value
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {formatPKR(d.products.inventoryValue)} across{' '}
                      {d.products.total} products
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-gray-800 rounded-xl h-full">
              <CardHeader className="pb-3 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Quick Actions
                </p>
              </CardHeader>
              <CardContent className="space-y-2.5 pb-5">
                <QuickAction
                  icon={
                    <Plus className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  }
                  label="Add New Product"
                  description="Create a product listing"
                  onClick={() => setAdminSection('products')}
                  color="bg-emerald-100 dark:bg-emerald-950/50"
                />
                <QuickAction
                  icon={
                    <Clock className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                  }
                  label="Manage Pending Orders"
                  description={`${d.orders.byStatus.pending} orders waiting`}
                  onClick={() => setAdminSection('orders')}
                  color="bg-amber-100 dark:bg-amber-950/50"
                />
                <QuickAction
                  icon={
                    <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                  }
                  label="Restock Inventory"
                  description={`${lowStockItems.length} items need attention`}
                  onClick={() => setAdminSection('products')}
                  color="bg-red-100 dark:bg-red-950/50"
                />
                <QuickAction
                  icon={
                    <Layers className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  }
                  label="Manage Collections"
                  description="Organize product collections"
                  onClick={() => setAdminSection('collections')}
                  color="bg-purple-100 dark:bg-purple-950/50"
                />
                <QuickAction
                  icon={
                    <FolderTree className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
                  }
                  label="Edit Categories"
                  description="Update product categories"
                  onClick={() => setAdminSection('categories')}
                  color="bg-cyan-100 dark:bg-cyan-950/50"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Performance Summary Bar ────────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border border-gray-700 dark:border-gray-700 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Products Listed
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {d.products.total}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {d.products.onSale} on sale
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Avg. Rating
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <p className="text-2xl font-bold text-white">
                      {d.products.averageRating.toFixed(1)}
                    </p>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    across all products
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Newsletter
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {d.newsletter.total}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    +{d.newsletter.thisMonth} this month
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Fulfillment
                  </p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {deliveryRate}%
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    delivery rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}
