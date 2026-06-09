import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useOrdersStore } from "@/store/ordersStore";
import { useUsersStore } from "@/store/usersStore";
import { usePaymentsStore } from "@/store/paymentsStore";
import { useProductsStore } from "@/store/productsStore";

const palette = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.85)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
];
const CHART_GRID = "hsl(var(--border))";
const CHART_AXIS = "hsl(var(--muted-foreground))";
const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const monthLabel = (d: Date) =>
  d.toLocaleDateString("en", { month: "short" });

const Dashboard = () => {
  const orders = useOrdersStore((s) => s.adminOrders);
  const users = useUsersStore((s) => s.users);
  const products = useProductsStore((s) => s.products);
  const payments = usePaymentsStore((s) => s.payments);

  const kpi = useMemo(() => {
    const revenue = orders
      .filter((o) => /paid|delivered|shipped|completed/i.test(o.status || ""))
      .reduce((s, o) => s + Number(o.total || o.total_price || 0), 0);
    const completed = orders.filter((o) => !/pending|cancelled|failed/i.test(o.status || "")).length;
    const conv = orders.length ? Math.round((completed / orders.length) * 100) : 0;
    const aov = completed ? Math.round(revenue / completed) : 0;
    return { revenue, completed, conv, aov };
  }, [orders]);

  // Revenue by month (last 6 months) — derived from orders.created_at
  const revenueSeries = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; label: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), revenue: 0, orders: 0 });
    }
    orders.forEach((o) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) {
        b.revenue += Number(o.total || o.total_price || 0);
        b.orders += 1;
      }
    });
    return buckets;
  }, [orders]);

  const statusData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const s = (o.status || "Pending").toString();
      map.set(s, (map.get(s) || 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Revenue", value: `KES ${kpi.revenue.toLocaleString()}`, sub: `${kpi.completed} completed orders` },
          { label: "Total Orders", value: orders.length.toString(), sub: `${statusData.find((s) => /pending/i.test(s.name))?.value || 0} pending` },
          { label: "Conversion", value: `${kpi.conv}%`, sub: "Completed vs total" },
          { label: "Avg Order Value", value: `KES ${kpi.aov.toLocaleString()}`, sub: "Per completed order" },
        ].map((c) => (
          <div key={c.label} className="bg-card border border-border/40 rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{c.label}</p>
            <p className="font-display text-xl sm:text-2xl text-primary mt-1">{c.value}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-5">
          <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-4">Revenue (Last 6 Months)</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette[0]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={palette[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="revenue" stroke={palette[0]} strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5">
          <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-4">Order Status</h3>
          <div className="h-[260px]">
            {statusData.length === 0 ? (
              <EmptyMini label="No orders yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {statusData.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-2xl p-5">
          <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-4">Orders by Month</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                <YAxis stroke={CHART_AXIS} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="orders" fill={palette[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl p-5">
          <h3 className="text-xs tracking-wider uppercase text-muted-foreground mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Products" value={products.length} />
            <Stat label="Customers" value={users.length} />
            <Stat label="Payments" value={payments.length} />
            <Stat label="Order Statuses" value={statusData.length} />
          </div>
          <div className="mt-5">
            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Recent Orders</h4>
            <div className="space-y-2">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground/60">#{o.id}</span>
                  <span className="text-foreground/80 truncate mx-3">{o.customer?.email || `Customer ${o.user || "—"}`}</span>
                  <StatusBadge status={o.status} />
                </div>
              ))}
              {orders.length === 0 && <p className="text-xs text-muted-foreground">No orders yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-background/50 border border-border/30 rounded-xl p-3">
    <p className="font-display text-lg text-primary">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{label}</p>
  </div>
);

const EmptyMini = ({ label }: { label: string }) => (
  <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50">{label}</div>
);

export const StatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "—").toLowerCase();
  const cls =
    /paid|completed|delivered/.test(s) ? "bg-green-500/15 text-green-500" :
    /shipped/.test(s) ? "bg-blue-500/15 text-blue-500" :
    /pending|processing/.test(s) ? "bg-yellow-500/15 text-yellow-500" :
    /cancel|failed/.test(s) ? "bg-red-500/15 text-red-500" :
    "bg-muted text-muted-foreground";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${cls}`}>{status || "—"}</span>;
};

export default Dashboard;
