'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  Database,
  Loader2,
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
import { useUIStore } from '@/stores/ui-store';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
  recentProducts: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    stockCount: number;
    isNew: boolean;
    isFeatured: boolean;
    images: string;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  processing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  shipped: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  delivered: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  returned: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'COD',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export function AdminDashboard() {
  const { setAdminSection, navigateHome } = useUIStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      const apiStats = data.stats ?? {};
      const apiLowStock = data.lowStockAlerts ?? [];

      // Fetch recent products for the table
      const productsRes = await adminFetch('/api/admin/products?limit=5');
      const productsData = await productsRes.json();
      const recentProducts = (productsData.products ?? productsData ?? []).slice(0, 5);

      // Fetch orders for dashboard stats
      let totalOrders = 0;
      let pendingOrders = 0;
      let confirmedOrders = 0;
      let shippedOrders = 0;
      let deliveredOrders = 0;
      let totalRevenue = 0;
      let recentOrders: DashboardStats['recentOrders'] = [];

      try {
        const ordersRes = await adminFetch('/api/admin/orders?limit=5');
        const ordersData = await ordersRes.json();
        const allOrdersList = ordersData.orders ?? [];
        recentOrders = allOrdersList.map((o: { id: string; orderNumber: string; customerName: string; totalAmount: number; status: string; paymentMethod: string; createdAt: string }) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          totalAmount: o.totalAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
        }));

        const counts = ordersData.statusCounts ?? {};
        totalOrders = counts.total ?? 0;
        pendingOrders = counts.pending ?? 0;
        confirmedOrders = counts.confirmed ?? 0;
        shippedOrders = counts.shipped ?? 0;
        deliveredOrders = counts.delivered ?? 0;

        // Calculate total revenue from delivered/paid orders
        totalRevenue = allOrdersList.reduce((sum: number, o: { totalAmount: number; paymentStatus: string }) => {
          if (o.paymentStatus === 'paid' || o.status === 'delivered') {
            return sum + (o.totalAmount ?? 0);
          }
          return sum;
        }, 0);
      } catch {
        // Orders fetch failed silently - dashboard still works without orders
      }

      setStats({
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        totalRevenue,
        totalProducts: apiStats.totalProducts ?? 0,
        lowStockItems: Array.isArray(apiLowStock) ? apiLowStock.length : 0,
        recentProducts,
        recentOrders,
      });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Pending',
      value: stats?.pendingOrders ?? 0,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Confirmed',
      value: stats?.confirmedOrders ?? 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Shipped',
      value: stats?.shippedOrders ?? 0,
      icon: <Truck className="h-5 w-5" />,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
    {
      label: 'Delivered',
      value: stats?.deliveredOrders ?? 0,
      icon: <PackageCheck className="h-5 w-5" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Total Revenue',
      value: `PKR ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      isText: true,
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: <Package className="h-5 w-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Low Stock',
      value: stats?.lowStockItems ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: stats && stats.lowStockItems > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400',
      bg: stats && stats.lowStockItems > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800',
    },
  ];

  const recentProducts = stats?.recentProducts ?? [];
  const recentOrders = stats?.recentOrders ?? [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={statVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
                    <span className={card.color}>{card.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                      {card.label}
                    </p>
                    <p className={`text-lg sm:text-xl font-bold text-gray-900 dark:text-white ${card.isText ? 'text-sm sm:text-base' : ''}`}>
                      {card.isText ? card.value : card.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => setAdminSection('products')}
              className="gap-2 bg-[#d79c4a] text-white hover:bg-[#c48a35]"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdminSection('orders')}
              className="gap-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShoppingCart className="h-4 w-4" />
              Manage Orders
            </Button>
            <Button
              variant="outline"
              onClick={() => setAdminSection('collections')}
              className="gap-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add Collection
            </Button>
            <Button
              variant="outline"
              onClick={navigateHome}
              className="gap-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Eye className="h-4 w-4" />
              View Shop
            </Button>
            <Button
              variant="outline"
              onClick={handleSeed}
              disabled={seeding}
              className="gap-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {seeding ? 'Seeding...' : 'Seed Database'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdminSection('orders')}
                className="text-[#d79c4a] hover:text-[#c48a35]"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Orders will appear here when customers place them
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-500 dark:text-gray-400">Order #</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Customer</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Payment</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Total</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400 text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                      return (
                        <TableRow key={order.id} className="border-gray-200 dark:border-gray-700">
                          <TableCell>
                            <span className="text-sm font-mono font-semibold text-[#d79c4a]">
                              {order.orderNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900 dark:text-white">{order.customerName}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-0">
                              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              PKR {order.totalAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${statusStyle.bg} ${statusStyle.text} border-0 gap-1.5 text-xs font-medium`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                              })}
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

      {/* Recent Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recent Products
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAdminSection('products')}
                className="text-[#d79c4a] hover:text-[#c48a35]"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No products yet</p>
                <Button
                  variant="link"
                  onClick={() => setAdminSection('products')}
                  className="mt-1 text-[#d79c4a]"
                >
                  Add your first product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-500 dark:text-gray-400">Product</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Price</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400">Stock</TableHead>
                      <TableHead className="text-gray-500 dark:text-gray-400 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts.map((product) => {
                      const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? product.images.split(',') : []);
                      return (
                        <TableRow key={product.id} className="border-gray-200 dark:border-gray-700">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {images[0] ? (
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                  <img
                                    src={images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                  <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-900 dark:text-white">
                                PKR {product.price.toLocaleString()}
                              </span>
                              {product.salePrice && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                  PKR {product.salePrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.stockCount <= 5
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-0"
                            >
                              {product.stockCount} in stock
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {product.isNew && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-xs">
                                  New
                                </Badge>
                              )}
                              {product.isFeatured && (
                                <Badge className="bg-[#d79c4a]/10 text-[#d79c4a] border-0 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
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
    </div>
  );
}
