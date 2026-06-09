import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Shield, ShieldOff } from "lucide-react";
import { useUsersStore } from "@/store/usersStore";
import { toast } from "sonner";

const UsersAdmin = () => {
  const { users, fetchAll, update, remove, loading } = useUsersStore();
  const [q, setQ] = useState("");
  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => users.filter((u) =>
    !q || (u.email || "").toLowerCase().includes(q.toLowerCase()) ||
    `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase().includes(q.toLowerCase())
  ), [users, q]);

  const toggleStaff = async (u: any) => {
    try { await update(u.id, { is_staff: !u.is_staff }); toast.success("Updated"); }
    catch (e: any) { toast.error(e.message); }
  };
  const onRemove = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try { await remove(id); toast.success("Deleted"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg tracking-wider">Users</h2>
          <p className="text-xs text-muted-foreground">GET /accounts/users/ · {users.length} total</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="w-full bg-card border border-border/40 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" />
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-border/40 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[10px] tracking-wider uppercase">
              <th className="text-left py-3 px-4">User</th>
              <th className="text-left py-3 px-4 hidden sm:table-cell">Joined</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4 hidden md:table-cell">Status</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && filtered.length === 0 && Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-border/20"><td colSpan={5} className="py-3 px-4"><div className="h-6 bg-muted/40 animate-pulse rounded" /></td></tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">No users.</td></tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/20 hover:bg-background/40">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-display text-primary">{(u.first_name || u.email || "?")[0].toUpperCase()}</div>
                    <div>
                      <p className="text-sm">{u.first_name} {u.last_name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_staff ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{u.is_staff ? "Admin" : "Customer"}</span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_active ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"}`}>{u.is_active ? "Active" : "Disabled"}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleStaff(u)} title={u.is_staff ? "Revoke admin" : "Grant admin"} className="p-1.5 hover:text-primary rounded-lg hover:bg-primary/10">{u.is_staff ? <ShieldOff size={14} /> : <Shield size={14} />}</button>
                    <button onClick={() => onRemove(u.id)} className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersAdmin;
