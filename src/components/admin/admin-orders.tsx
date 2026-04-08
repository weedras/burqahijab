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
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Copy,
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  address: string;
  city: string;
  items: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const STATUS_UPDATE_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  processing: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  shipped: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', dot: 'bg-cyan-500' },
  delivered: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  returned: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const PAYMENT_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  cod: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <Banknote className="h-3.5 w-3.5" /> },
  jazzcash: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: <Smartphone className="h-3.5 w-3.5" /> },
  easypaisa: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <Smartphone className="h-3.5 w-3.5" /> },
  bank_transfer: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Building2 className="h-3.5 w-3.5" /> },
  card: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: <CreditCard className="h-3.5 w-3.5" /> },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'COD',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  card: 'Card',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <Badge variant="secondary" className={`${style.bg} ${style.text} border-0 gap-1.5 font-medium`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function PaymentBadge({ method }: { method: string }) {
  const style = PAYMENT_STYLES[method] || PAYMENT_STYLES.cod;
  return (
    <Badge variant="secondary" className={`${style.bg} ${style.text} border-0 gap-1 font-medium`}>
      {style.icon}
      {PAYMENT_LABELS[method] || method}
    </Badge>
  );
}

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeStatus !== 'all') params.set('status', activeStatus);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await adminFetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();

      setOrders(data.orders || []);
      setStatusCounts(data.statusCounts || null);
      setTotalPages(Math.ceil((data.total || 0) / 20));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await adminFetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}?`)) return;
    setDeleting(orderId);
    try {
      const res = await adminFetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete order');
      toast.success(`Order ${orderNumber} deleted`);
      setDetailOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error('Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const parseOrderItems = (itemsStr: string): OrderItem[] => {
    try {
      return JSON.parse(itemsStr);
    } catch {
      return [];
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.city.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsData = statusCounts
    ? [
        { label: 'Total Orders', value: statusCounts.total, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Pending', value: statusCounts.pending, icon: <Clock className="h-5 w-5" />, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        { label: 'Confirmed', value: statusCounts.confirmed, icon: <CheckCircle className="h-5 w-5" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Shipped', value: statusCounts.shipped, icon: <Truck className="h-5 w-5" />, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
        { label: 'Delivered', value: statusCounts.delivered, icon: <PackageCheck className="h-5 w-5" />, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        { label: 'Cancelled', value: statusCounts.cancelled, icon: <X className="h-5 w-5" />, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
        { label: 'Returned', value: statusCounts.returned, icon: <AlertTriangle className="h-5 w-5" />, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
        { label: 'Processing', value: statusCounts.processing, icon: <Package className="h-5 w-5" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {statsData.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={statVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                      {stat.label}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {ORDER_STATUSES.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setActiveStatus(tab.value); setPage(1); }}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                    activeStatus === tab.value
                      ? 'bg-[#d79c4a] text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {tab.label}
                  {statusCounts && tab.value !== 'all' && (
                    <span className="ml-1.5 opacity-70">
                      ({statusCounts[tab.value as keyof StatusCounts] ?? 0})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64 h-9 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-[#141414]">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">No orders found</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? 'Try a different search term' : 'Orders will appear here when customers place them'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Order #</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">Payment</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden lg:table-cell">Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const items = parseOrderItems(order.items);
                    return (
                      <TableRow key={order.id} className="border-gray-200 dark:border-gray-700 group">
                        <TableCell>
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[#d79c4a] hover:text-[#c48a35] transition-colors"
                          >
                            {order.orderNumber}
                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {items.length} item{items.length !== 1 ? 's' : ''}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{order.city}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <PaymentBadge method={order.paymentMethod} />
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            PKR {order.totalAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {updatingStatus === order.id ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-[#d79c4a]" />
                            </div>
                          ) : (
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleStatusChange(order.id, val)}
                            >
                              <SelectTrigger className={`h-8 w-[120px] border-0 ${STATUS_STYLES[order.status]?.bg || ''} ${STATUS_STYLES[order.status]?.text || ''} text-xs font-medium cursor-pointer`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_UPDATE_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <span className="flex items-center gap-1.5">
                                      <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[opt.value]?.dot || ''}`} />
                                      {opt.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-[#d79c4a] hover:bg-[#d79c4a]/10"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDelete(order.id, order.orderNumber)}
                              disabled={deleting === order.id}
                            >
                              {deleting === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-200 dark:border-gray-700"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page + i - 2;
                  if (pageNum > totalPages || pageNum < 1) return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="icon"
                      className={`h-8 w-8 ${page === pageNum ? 'bg-[#d79c4a] text-white border-[#d79c4a] hover:bg-[#c48a35]' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-gray-200 dark:border-gray-700"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#141414] border-gray-200 dark:border-gray-700">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d79c4a]/10">
                      <ShoppingCart className="h-5 w-5 text-[#d79c4a]" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusBadge status={selectedOrder.status} />
                        <PaymentBadge method={selectedOrder.paymentMethod} />
                      </div>
                    </div>
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(selectedOrder.id, selectedOrder.orderNumber)}
                    disabled={deleting === selectedOrder.id}
                  >
                    {deleting === selectedOrder.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-3.5 w-3.5" />
                        <button
                          onClick={() => copyToClipboard(selectedOrder.customerEmail)}
                          className="hover:text-[#d79c4a] transition-colors flex items-center gap-1"
                        >
                          {selectedOrder.customerEmail}
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          <button
                            onClick={() => copyToClipboard(selectedOrder.customerPhone)}
                            className="hover:text-[#d79c4a] transition-colors flex items-center gap-1"
                          >
                            {selectedOrder.customerPhone}
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Shipping Address</h4>
                    <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedOrder.address}, {selectedOrder.city}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Status Update */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Update Status</h4>
                  {updatingStatus === selectedOrder.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#d79c4a]" />
                  ) : (
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) => handleStatusChange(selectedOrder.id, val)}
                    >
                      <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_UPDATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[opt.value]?.dot || ''}`} />
                              {opt.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Tracking */}
                {selectedOrder.trackingNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                    <Truck className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-sm text-cyan-700 dark:text-cyan-300">
                      Tracking: <span className="font-mono font-medium">{selectedOrder.trackingNumber}</span>
                    </span>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Notes</p>
                    <p className="text-sm text-amber-600 dark:text-amber-300">{selectedOrder.notes}</p>
                  </div>
                )}

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                {/* Order Items */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {parseOrderItems(selectedOrder.items).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
                        {item.image ? (
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                            <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-[#1A1A1A]">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      PKR {selectedOrder.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Placed on</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
