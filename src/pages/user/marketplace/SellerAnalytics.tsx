import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { PageContainer } from '../../../components/shared/PageContainer';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatCard } from '../../../components/shared/StatCard';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  price: number;
  order_id: string;
  created_at: string;
  status: string;
}

interface ProductStat {
  title: string;
  total_sold: number;
  total_revenue: number;
}

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const SellerAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('marketplace_order_items')
        .select(`
          id, quantity, price, product_id, created_at,
          marketplace_orders!inner(status, seller_id)
        `)
        .eq('marketplace_orders.seller_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: OrderItem[] = data.map((d: any) => ({
          id: d.id,
          product_id: d.product_id,
          product_title: '',
          quantity: d.quantity,
          price: d.price,
          order_id: d.order_id,
          created_at: d.created_at,
          status: d.marketplace_orders.status,
        }));
        setItems(mapped);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const filteredItems = useMemo(() => {
    if (dateRange === 'all') return items;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
    return items.filter(i => new Date(i.created_at) >= cutoff);
  }, [items, dateRange]);

  const stats = useMemo(() => {
    const completed = filteredItems.filter(i => i.status === 'Delivered');
    const pending = filteredItems.filter(i => i.status === 'Pending');
    const shipped = filteredItems.filter(i => i.status === 'Shipped');
    const cancelled = filteredItems.filter(i => i.status === 'Cancelled');

    const totalRevenue = completed.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalSold = completed.reduce((sum, i) => sum + i.quantity, 0);
    const totalOrders = new Set(completed.map(i => i.order_id)).size;

    return { totalRevenue, totalSold, totalOrders, pending: pending.length, shipped: shipped.length, cancelled: cancelled.length };
  }, [filteredItems]);

  const productStats: ProductStat[] = useMemo(() => {
    const map = new Map<string, { title: string; total_sold: number; total_revenue: number }>();
    for (const item of filteredItems) {
      if (item.status !== 'Delivered') continue;
      const existing = map.get(item.product_id);
      if (existing) {
        existing.total_sold += item.quantity;
        existing.total_revenue += item.price * item.quantity;
      } else {
        map.set(item.product_id, { title: item.product_title || `منتج #${item.product_id.slice(0, 8)}`, total_sold: item.quantity, total_revenue: item.price * item.quantity });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 10);
  }, [filteredItems]);

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of filteredItems) {
      if (item.status !== 'Delivered') continue;
      const d = new Date(item.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, (map.get(key) || 0) + item.price * item.quantity);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return { label: monthNames[parseInt(month)], value };
      });
  }, [filteredItems]);

  if (loading) return <LoadingSpinner />;

  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.value), 1);

  return (
    <PageContainer>
      <PageHeader
        title="تحليلات المبيعات"
        description="إحصائيات وأداء متجرك"
        actions={
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-4 py-2 bg-surface-primary border border-border-subtle rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
            <option value="all">كل الوقت</option>
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="إجمالي الإيرادات" value={`${stats.totalRevenue.toFixed(0)} ج.م`} icon={DollarSign} />
        <StatCard label="المنتجات المباعة" value={stats.totalSold} icon={ShoppingBag} />
        <StatCard label="الطلبات المكتملة" value={stats.totalOrders} icon={Package} />
        <StatCard label="قيد الانتظار" value={stats.pending} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-surface-card p-6 rounded-[var(--radius-card)] border border-border-default">
          <h3 className="text-lg font-black text-text-primary mb-6">الإيرادات الشهرية</h3>
          {monthlyRevenue.length === 0 ? (
            <p className="text-text-muted text-sm">لا توجد بيانات مبيعات بعد</p>
          ) : (
            <div className="flex items-end gap-3 h-48">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-text-muted">{m.value.toFixed(0)}</span>
                  <div
                    className="w-full bg-brand-primary/20 rounded-t-lg relative overflow-hidden transition-all duration-500"
                    style={{ height: `${(m.value / maxMonthly) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-primary to-brand-primary/60 rounded-t-lg" />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-surface-card p-6 rounded-[var(--radius-card)] border border-border-default">
            <h3 className="text-lg font-black text-text-primary mb-4">حالة الطلبات</h3>
            <div className="space-y-3">
              {[
                { label: 'مكتمل', value: stats.totalOrders, color: 'bg-emerald-500' },
                { label: 'قيد الشحن', value: stats.shipped, color: 'bg-amber-500' },
                { label: 'قيد الانتظار', value: stats.pending, color: 'bg-blue-500' },
                { label: 'ملغي', value: stats.cancelled, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-sm font-bold text-text-muted">{s.label}</span>
                  </div>
                  <span className="text-sm font-black">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-card p-6 rounded-[var(--radius-card)] border border-border-default">
            <h3 className="text-lg font-black text-text-primary mb-4">متوسط الطلب</h3>
            <p className="text-3xl font-black text-brand-primary">
              {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'}
              <span className="text-sm mr-1">ج.م</span>
            </p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="mt-8 bg-surface-card p-6 rounded-[var(--radius-card)] border border-border-default">
        <h3 className="text-lg font-black text-text-primary mb-6">أفضل المنتجات مبيعاً</h3>
        {productStats.length === 0 ? (
          <p className="text-text-muted text-sm">لا توجد منتجات مباعة بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-right py-3 font-bold text-text-muted">المنتج</th>
                  <th className="text-right py-3 font-bold text-text-muted">الكمية المباعة</th>
                  <th className="text-right py-3 font-bold text-text-muted">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map((p, i) => (
                  <tr key={i} className="border-b border-border-subtle/50 last:border-0">
                    <td className="py-3 font-bold">{p.title}</td>
                    <td className="py-3">{p.total_sold}</td>
                    <td className="py-3 font-black text-brand-primary">{p.total_revenue.toFixed(0)} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default SellerAnalytics;
