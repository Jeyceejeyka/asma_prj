import { Fragment, useEffect, useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useOrdersStore } from "@/store/ordersStore";
import { toast } from "sonner";
import { StatusBadge } from "./Dashboard";

const STATUSES = ["Pending", "Processing", "Paid", "Shipped", "Delivered", "Cancelled", "Failed"];

const OrdersAdmin = () => {
  const { adminOrders, fetchAdminOrders, updateAdminStatus, loading } = useOrdersStore();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE = 10;

  useEffect(() => { fetchAdminOrders(); }, []);

  const filtered = useMemo(() => adminOrders.filter((o) => {
    const matchQ = !q || String(o.id).includes(q) || (o.customer?.email || "").toLowerCase().includes(q.toLowerCase());
    const matchS = !statusFilter || (o.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchS;
  }), [adminOrders, q, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice((page - 1) * PAGE, page * PAGE);

  const setStatus = async (id: number, s: string) => {
    try { await updateAdminStatus(id, s); toast.success(`Order #${id} → ${s}`); }
    catch (e: any) { toast.error(e.message); }
  };

  const exportCsv = () => {
    const rows = [["id", "customer", "status", "total", "created_at"], ...filtered.map((o) =>
      [o.id, o.customer?.email || "", o.status || "", o.total || o.total_price || "", o.created_at || ""])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg tracking-wider">Orders</h2>
          <p className="text-xs text-muted-foreground">GET /orders/admin/orders/ · POST /…/update-status/</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…" className="w-full bg-card border border-border/40 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-card border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={exportCsv} className="px-3 py-2 rounded-xl border border-border/40 text-xs">Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-border/40 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[10px] tracking-wider uppercase">
              <th className="text-left py-3 px-4">Order</th>
              <th className="text-left py-3 px-4">Customer</th>
              <th className="text-left py-3 px-4 hidden sm:table-cell">Date</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && view.length === 0 && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border/20"><td colSpan={6} className="py-3 px-4"><div className="h-6 bg-muted/40 animate-pulse rounded" /></td></tr>
            ))}
            {!loading && view.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">No orders.</td></tr>
            )}
            {view.map((o) => (
              <Fragment key={o.id}>
                <tr className="border-b border-border/20 hover:bg-background/40 cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <td className="py-3 px-4 font-mono text-xs">#{o.id}</td>
                  <td className="py-3 px-4 text-foreground/80 text-sm">{o.customer?.email || `User ${o.user || "—"}`}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">{o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-4 text-primary">KES {Number(o.total || o.total_price || 0).toLocaleString()}</td>
                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <select value={o.status || ""} onClick={(e) => e.stopPropagation()} onChange={(e) => setStatus(o.id, e.target.value)}
                      className="bg-background border border-border/40 rounded-lg px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className={`inline ml-2 transition-transform ${expanded === o.id ? "rotate-180" : ""} text-muted-foreground`} />
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr><td colSpan={6} className="px-4 pb-4 bg-background/40">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-3">
                      <div>
                        <p className="uppercase tracking-wider text-muted-foreground/60 mb-1">Items</p>
                        {(o.items || []).map((it: any, idx: number) => (
                          <p key={idx} className="text-foreground/80">{it.product?.name || it.name || `#${it.product_id}`} × {it.quantity} — KES {Number(it.price).toLocaleString()}</p>
                        ))}
                      </div>
                      <div>
                        <p className="uppercase tracking-wider text-muted-foreground/60 mb-1">Address</p>
                        <p className="text-foreground/80 whitespace-pre-line">{o.address || "—"}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-wider text-muted-foreground/60 mb-1">Payment</p>
                        <p className="text-foreground/80 font-mono">{o.payment_ref || o.checkout_request_id || "—"}</p>
                      </div>
                    </div>
                  </td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 text-xs">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-40">Prev</button>
        <span className="text-muted-foreground">Page {page} / {pageCount}</span>
        <button onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page >= pageCount} className="px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-40">Next</button>
      </div>
    </div>
  );
};

export default OrdersAdmin;
