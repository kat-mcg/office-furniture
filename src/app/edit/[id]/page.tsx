"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

interface OfficeArea {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = params instanceof Promise ? use(params) : params;
  const router = useRouter();
  const [areas, setAreas] = useState<OfficeArea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    url: "",
    imageUrl: "",
    price: "",
    widthCm: "",
    depthCm: "",
    heightCm: "",
    material: "",
    description: "",
    leadTimeDays: "",
    quantity: "1",
    officeAreaId: "",
    categoryId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/furniture/${id}`).then((r) => r.json()),
      fetch("/api/areas").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([item, areasData, categoriesData]) => {
        setForm({
          title: item.title || "",
          url: item.url || "",
          imageUrl: item.imageUrl || "",
          price: item.price?.toString() || "",
          widthCm: item.widthCm?.toString() || "",
          depthCm: item.depthCm?.toString() || "",
          heightCm: item.heightCm?.toString() || "",
          material: item.material || "",
          description: item.description || "",
          leadTimeDays: item.leadTimeDays?.toString() || "",
          quantity: item.quantity?.toString() || "1",
          officeAreaId: item.officeAreaId || "",
          categoryId: item.categoryId || "",
        });
        setAreas(areasData);
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load item");
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/furniture/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setError("Failed to save");
        return;
      }
      router.push("/gallery");
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="w-6 h-6 text-indigo-600 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/gallery"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <div>
          <h1 className="page-title">Edit Item</h1>
          <p className="page-subtitle">Update the item details below.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 space-y-5">
        <div>
          <label className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Product URL</label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="input"
          />
          {form.imageUrl && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <img src={form.imageUrl} alt="Preview" className="h-36 object-contain rounded" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label">Lead Time (days)</label>
            <input
              type="number"
              value={form.leadTimeDays}
              onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
              className="input"
              placeholder="e.g. 14"
            />
          </div>
        </div>

        <div>
          <label className="label">Dimensions (cm)</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Width</div>
              <input
                type="number"
                step="0.1"
                value={form.widthCm}
                onChange={(e) => setForm({ ...form, widthCm: e.target.value })}
                className="input"
                placeholder="W"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Depth</div>
              <input
                type="number"
                step="0.1"
                value={form.depthCm}
                onChange={(e) => setForm({ ...form, depthCm: e.target.value })}
                className="input"
                placeholder="D"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Height</div>
              <input
                type="number"
                step="0.1"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                className="input"
                placeholder="H"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Material</label>
          <input
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            className="input"
            placeholder="e.g. Mesh, Wood, Steel"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input"
            placeholder="Brief product description..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="input"
            >
              <option value="">-- Select category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Office Area</label>
            <select
              value={form.officeAreaId}
              onChange={(e) => setForm({ ...form, officeAreaId: e.target.value })}
              className="input"
            >
              <option value="">-- Select area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex-1 btn-primary py-3">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            className="btn-secondary py-3 px-6"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
