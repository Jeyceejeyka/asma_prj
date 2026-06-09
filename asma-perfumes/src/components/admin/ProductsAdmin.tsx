import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, Edit, Plus, X } from "lucide-react";
import { useProductsStore } from "@/store/productsStore";
import { toast } from "sonner";
import adminData from "@/data/admin.json";

const ProductsAdmin = () => {
  const {
    products,
    fetchAll,
    getProduct,
    adminCreate,
    adminUpdate,
    adminDelete,
  } = useProductsStore();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const PAGE = 10;

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.collection.toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE));
  const view = filtered.slice((page - 1) * PAGE, page * PAGE);

  const remove = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await adminDelete(id);
      toast.success("Product deleted");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEdit = async (id: number) => {
    setLoadingEdit(true);
    try {
      const product = await getProduct(id);
      setEditing(product);
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingEdit(false);
    }
  };

  const onSave = async (form: any) => {
    try {
      if (editing?.id) {
        await adminUpdate(editing.id, form);
        toast.success("Product updated");
      } else {
        await adminCreate(form);
        toast.success("Product created");
      }
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg tracking-wider">Products</h2>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {products.length} · GET /products/products/
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className="w-full bg-card border border-border/40 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <button
            onClick={() => {
              setEditing({});
              setOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs tracking-wider whitespace-nowrap"
          >
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card border border-border/40 rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground text-[10px] tracking-wider uppercase">
              <th className="text-left py-3 px-4">Product</th>
              <th className="text-left py-3 px-4 hidden sm:table-cell">
                Collection
              </th>
              <th className="text-left py-3 px-4">Price</th>
              <th className="text-left py-3 px-4 hidden md:table-cell">
                Grade
              </th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {view.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border/20 hover:bg-background/40"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-11 rounded-lg bg-secondary overflow-hidden shrink-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {p.gender} · {p.season}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                  {p.collection}
                </td>
                <td className="py-3 px-4 text-primary">
                  KES {p.price.toLocaleString()}
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {p.grade}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="p-1.5 hover:text-primary rounded-lg hover:bg-primary/10"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="p-1.5 hover:text-destructive rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-xs text-muted-foreground"
                >
                  No products match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pager page={page} setPage={setPage} pageCount={pageCount} />

      {open && (
        <ProductFormModal
          initial={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={onSave}
        />
      )}
    </div>
  );
};

const Pager = ({
  page,
  setPage,
  pageCount,
}: {
  page: number;
  setPage: (n: number) => void;
  pageCount: number;
}) => (
  <div className="flex items-center justify-end gap-2 mt-4 text-xs">
    <button
      onClick={() => setPage(Math.max(1, page - 1))}
      disabled={page === 1}
      className="px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-40"
    >
      Prev
    </button>
    <span className="text-muted-foreground">
      Page {page} / {pageCount}
    </span>
    <button
      onClick={() => setPage(Math.min(pageCount, page + 1))}
      disabled={page >= pageCount}
      className="px-3 py-1.5 rounded-lg border border-border/40 disabled:opacity-40"
    >
      Next
    </button>
  </div>
);

const ProductFormModal = ({
  initial,
  onClose,
  onSave,
}: {
  initial: any;
  onClose: () => void;
  onSave: (f: any) => void;
}) => {
  const { collections } = useProductsStore();
  const [f, setF] = useState({
    name: initial?.name || "",
    categoryId: initial?.categoryId ?? "",
    collection: initial?.collection || "",
    price: initial?.price || "",
    stock_quantity: initial?.stock_quantity || 10,
    description: initial?.description || "",
    image: initial?.image || "",
    grade: initial?.grade || "Eau de Parfum",
    season: initial?.season || "All Seasons",
    gender: initial?.gender || "Unisex",
    sillage: initial?.sillage || "Moderate",
    longevity: initial?.longevity || "6-8 hours",
    sizes: initial?.sizes || ["50ml"],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initial?.image || "");

  useEffect(() => {
    setF({
      name: initial?.name || "",
      categoryId: initial?.categoryId ?? "",
      collection: initial?.collection || "",
      price: initial?.price || "",
      stock_quantity: initial?.stock_quantity || 10,
      description: initial?.description || "",
      image: initial?.image || "",
      grade: initial?.grade || "Eau de Parfum",
      season: initial?.season || "All Seasons",
      gender: initial?.gender || "Unisex",
      sillage: initial?.sillage || "Moderate",
      longevity: initial?.longevity || "6-8 hours",
      sizes: initial?.sizes || ["50ml"],
    });
    setPreview(initial?.image || "");
    setImageFile(null);
  }, [initial]);
  const fields = adminData.productFormFields;

  const onFile = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!f.categoryId) {
      toast.error("Category is required");
      return;
    }

    const payload: any = {
      ...f,
      price: Number(f.price),
      stock_quantity: Number(f.stock_quantity),
      categoryId: Number(f.categoryId),
    };
    delete payload.collection;

    if (imageFile) {
      payload.image = imageFile;
    } else if (f.image && !f.image.startsWith("http")) {
      delete payload.image;
    }

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border/40 rounded-2xl p-6 w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg">
            {initial?.id ? "Edit Product" : "New Product"}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <Field
            label="Name"
            required
            value={f.name}
            onChange={(v) => setF({ ...f, name: v })}
          />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block">
              Category
            </label>
            <select
              required
              value={String(f.categoryId)}
              onChange={(e) =>
                setF({
                  ...f,
                  categoryId: e.target.value ? Number(e.target.value) : "",
                })
              }
              className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="">Select category</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Price (KES)"
            type="number"
            required
            value={String(f.price)}
            onChange={(v) => setF({ ...f, price: v })}
          />
          <Field
            label="Stock"
            type="number"
            required
            value={String(f.stock_quantity)}
            onChange={(v) => setF({ ...f, stock_quantity: v })}
          />
          <Field
            label="Image URL (optional)"
            value={f.image}
            onChange={(v) => {
              setF({ ...f, image: v });
              if (v && !imageFile) setPreview(v);
            }}
            placeholder="https://..."
          />
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block">
              Or upload image
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-14 h-16 object-cover rounded-lg border border-border/40"
                />
              )}
            </div>
          </div>
          <Select
            label="Grade"
            options={fields.grades}
            value={f.grade}
            onChange={(v) => setF({ ...f, grade: v })}
          />
          <Select
            label="Season"
            options={fields.seasons}
            value={f.season}
            onChange={(v) => setF({ ...f, season: v })}
          />
          <Select
            label="Gender"
            options={fields.genders}
            value={f.gender}
            onChange={(v) => setF({ ...f, gender: v })}
          />
          <Select
            label="Sillage"
            options={fields.sillages}
            value={f.sillage}
            onChange={(v) => setF({ ...f, sillage: v })}
          />
          <Select
            label="Longevity"
            options={fields.longevities}
            value={f.longevity}
            onChange={(v) => setF({ ...f, longevity: v })}
          />
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block">
              Description
            </label>
            <textarea
              rows={3}
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
              className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border/40 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block">
      {label}
      {required && " *"}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
    />
  </div>
);
const Select = ({ label, options, value, onChange }: any) => (
  <div>
    <label className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5 block">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
    >
      {options.map((o: string) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default ProductsAdmin;
