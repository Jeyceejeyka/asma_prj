import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminCartsStore } from "@/store/adminCartsStore";
import { toast } from "sonner";

const CartsAdmin = () => {
  const { carts, fetchAll, removeCart, loading } = useAdminCartsStore();
  useEffect(() => { fetchAll(); }, []);

  const remove = async (id: number) => {
    if (!confirm("Delete this cart?")) return;
    try { await removeCart(id); toast.success("Cart deleted"); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-lg tracking-wider">Active Carts</h2>
        <p className="text-xs text-muted-foreground">GET /cart/admin/carts/ · {carts.length} active</p>
      </div>

      <div className="overflow-x-auto bg-card border border-border/40 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[10px] tracking-wider uppercase">
              <th className="text-left py-3 px-4">Cart</th>
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4">Items</th>
              <th className="text-left py-3 px-4">Total</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && carts.length === 0 && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-border/20"><td colSpan={5} className="py-3 px-4"><div className="h-6 bg-muted/40 animate-pulse rounded" /></td></tr>
            ))}
            {!loading && carts.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">No active carts.</td></tr>
            )}
            {carts.map((c) => (
              <tr key={c.id} className="border-b border-border/20 hover:bg-background/40">
                <td className="py-3 px-4 font-mono text-xs">#{c.id}</td>
                <td className="py-3 px-4 text-sm">{c.user?.email || `User ${c.user || "—"}`}</td>
                <td className="py-3 px-4 text-muted-foreground">{c.items?.length || 0}</td>
                <td className="py-3 px-4 text-primary">KES {Number(c.total || 0).toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => remove(c.id)} className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CartsAdmin;
