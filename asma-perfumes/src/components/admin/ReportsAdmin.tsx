import { useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useOrdersStore } from "@/store/ordersStore";
import { useProductsStore } from "@/store/productsStore";
import { usePaymentsStore } from "@/store/paymentsStore";

const PRIMARY = "hsl(var(--primary))";
const GRID = "hsl(var(--border))";
const AXIS = "hsl(var(--muted-foreground))";
const TIP = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const ReportsAdmin = () => {
  const orders = useOrdersStore((s) => s.adminOrders);
  const products = useProductsStore((s) => s.products);
  const payments = usePaymentsStore((s) => s.payments);

  useEffect(() => {
    useOrdersStore.getState().fetchAdminOrders();
    useProductsStore.getState().fetchAll();
    usePaymentsStore.getState().fetchAdmin();
  }, []);

  // Top products by units sold (from order items)
  const topProducts = useMemo(() => {
    const counts = new Map<string, { name: string; units: number; revenue: number }>();
    orders.forEach((o) => {
      (o.items || []).forEach((it: any) => {
        const name = it.product?.name || it.name || `#${it.product_id}`;
        const cur = counts.get(name) || { name, units: 0, revenue: 0 };
        cur.units += Number(it.quantity || 0);
        cur.revenue += Number(it.price || 0) * Number(it.quantity || 0);
        counts.set(name, cur);
      });
    });
    return [...counts.values()].sort((a, b) => b.units - a.units).slice(0, 8);
  }, [orders]);

  // Daily revenue (last 30 days)
  const dailyRevenue = useMemo(() => {
    const out: { day: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      out.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, revenue: 0 });
    }
    orders.forEach((o) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (days >= 0 && days < 30) {
        out[29 - days].revenue += Number(o.total || o.total_price || 0);
      }
    });
    return out;
  }, [orders]);

  const exportFullReport = () => {
    const rows = [
      ["Section", "Metric", "Value"],
      ["Summary", "Total orders", orders.length],
      ["Summary", "Total products", products.length],
      ["Summary", "Total payments", payments.length],
      ["Summary", "Gross revenue (KES)", orders.reduce((s, o) => s + Number(o.total || o.total_price || 0), 0)],
      ...topProducts.map((p) => ["Top Products", p.name, `${p.units} units / KES ${p.revenue}`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `asma-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg tracking-wider">Reports</h2>
          <p className="text-xs text-muted-foreground">Aggregated insights from orders, products and payments</p>
        </div>
        <button onClick={exportFullReport} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-xs hover:bg-card/60">
          <Download size={13} /> Export full report
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Daily Revenue (Last 30 Days)</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenue}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke={AXIS} fontSize={10} tickLine={false} interval={3} />
              <YAxis stroke={AXIS} fontSize={10} tickLine={false} />
              <Tooltip contentStyle={TIP} />
              <Line type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Top Products (Units Sold)</h3>
        <div className="h-[280px]">
          {topProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50">No sales yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={AXIS} fontSize={10} />
                <YAxis type="category" dataKey="name" stroke={AXIS} fontSize={10} width={140} />
                <Tooltip contentStyle={TIP} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="units" fill={PRIMARY} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsAdmin;
