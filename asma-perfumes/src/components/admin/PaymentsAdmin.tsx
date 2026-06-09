// 



import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, RefreshCw, Download } from "lucide-react";
import { usePaymentsStore } from "@/store/paymentsStore";
import { toast } from "sonner";
import { StatusBadge } from "./Dashboard";

const PaymentsAdmin = () => {
  const { payments, fetchAdmin, removeAdmin, loading } =
    usePaymentsStore();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAdmin();
  }, []);

  // Updated to use backend serializer status field
  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          payments
            .map((p) => p.status)
            .filter(Boolean)
        )
      ),
    [payments]
  );

  // Updated search logic for new serializer fields
  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const query = q.toLowerCase();

      const matchQ =
        !q ||
        String(p.id).includes(query) ||
        String(p.order_id || "").includes(query) ||
        (p.mpesa_receipt_number || "")
          .toLowerCase()
          .includes(query) ||
        (p.phone_number || "").includes(query) ||
        (p.user_email || "")
          .toLowerCase()
          .includes(query) ||
        (p.checkout_request_id || "")
          .toLowerCase()
          .includes(query);

      const matchS =
        !statusFilter || p.status === statusFilter;

      return matchQ && matchS;
    });
  }, [payments, q, statusFilter]);

  const remove = async (id: number) => {
    if (!confirm("Delete payment record?")) return;

    try {
      await removeAdmin(id);
      toast.success("Payment deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Updated export fields to match serializer
  const exportCsv = () => {
    const rows = [
      [
        "id",
        "receipt",
        "user_email",
        "order_id",
        "phone_number",
        "amount",
        "status",
        "processed",
        "result_code",
        "result_desc",
        "created_at",
      ],

      ...filtered.map((p) => [
        p.id,
        p.mpesa_receipt_number || "",
        p.user_email || "",
        p.order_id || "",
        p.phone_number || "",
        p.amount || "",
        p.status || "",
        p.processed ? "Yes" : "No",
        p.result_code || "",
        p.result_desc || "",
        p.created_at || "",
      ]),
    ];

    const csv = rows
      .map((r) =>
        r
          .map((c) =>
            `"${String(c).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  // Updated amount calculation
  const totalAmount = filtered.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg tracking-wider">
            Payments
          </h2>

          <p className="text-xs text-muted-foreground">
            GET /payments/admin/payments/ · KES{" "}
            {totalAmount.toLocaleString()} total
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search payment..."
              className="w-full bg-card border border-border/40 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="bg-card border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">
              All statuses
            </option>

            {statuses.map((s) => (
              <option key={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => fetchAdmin()}
            className="px-3 py-2 rounded-xl border border-border/40 text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Refresh
          </button>

          {/* Export */}
          <button
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl border border-border/40 text-xs inline-flex items-center gap-1.5"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-card border border-border/40 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[10px] tracking-wider uppercase">
              <th className="text-left py-3 px-4">
                Receipt
              </th>

              <th className="text-left py-3 px-4">
                User
              </th>

              <th className="text-left py-3 px-4">
                Order
              </th>

              <th className="text-left py-3 px-4 hidden sm:table-cell">
                Phone
              </th>

              <th className="text-left py-3 px-4">
                Amount
              </th>

              <th className="text-left py-3 px-4">
                Status
              </th>

              <th className="text-left py-3 px-4 hidden md:table-cell">
                Processed
              </th>

              <th className="text-left py-3 px-4 hidden lg:table-cell">
                Result
              </th>

              <th className="text-left py-3 px-4 hidden md:table-cell">
                Date
              </th>

              <th className="text-right py-3 px-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {loading &&
              filtered.length === 0 &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr
                  key={i}
                  className="border-b border-border/20"
                >
                  <td
                    colSpan={10}
                    className="py-3 px-4"
                  >
                    <div className="h-6 bg-muted/40 animate-pulse rounded" />
                  </td>
                </tr>
              ))}

            {/* Empty */}
            {!loading &&
              filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-xs text-muted-foreground"
                  >
                    No payments.
                  </td>
                </tr>
              )}

            {/* Rows */}
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/20 hover:bg-background/40"
              >
                {/* Receipt */}
                <td className="py-3 px-4 font-mono text-xs">
                  {p.mpesa_receipt_number ||
                    "Pending"}
                </td>

                {/* User */}
                <td className="py-3 px-4 text-xs">
                  {p.user_email || "Guest"}
                </td>

                {/* Order */}
                <td className="py-3 px-4 font-mono text-xs">
                  #{p.order_id || "—"}
                </td>

                {/* Phone */}
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell text-xs">
                  {p.phone_number || "—"}
                </td>

                {/* Amount */}
                <td className="py-3 px-4 text-primary font-medium">
                  KES{" "}
                  {Number(
                    p.amount || 0
                  ).toLocaleString()}
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <StatusBadge status={p.status} />
                </td>

                {/* Processed */}
                <td className="py-3 px-4 hidden md:table-cell">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      p.processed
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {p.processed
                      ? "Processed"
                      : "Pending"}
                  </span>
                </td>

                {/* Result */}
                <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                  {p.result_desc || "—"}
                </td>

                {/* Date */}
                <td className="py-3 px-4 text-muted-foreground hidden md:table-cell text-xs">
                  {p.created_at
                    ? new Date(
                        p.created_at
                      ).toLocaleDateString()
                    : "—"}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => remove(p.id)}
                    className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsAdmin;