"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OfficeArea {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AddItemPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState<OfficeArea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    title: "",
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
  const [error, setError] = useState("");
  const [scrapeMsg, setScrapeMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/areas").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([areasData, categoriesData]) => {
        setAreas(areasData);
        setCategories(categoriesData);
      })
      .catch(() => {});
  }, []);

  async function handleScrape() {
    if (!url) return;
    setScraping(true);
    setError("");
    setScrapeMsg("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scraping failed");
        return;
      }
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        imageUrl: data.imageUrl || prev.imageUrl,
        price: data.price || prev.price,
        widthCm: data.widthCm || prev.widthCm,
        depthCm: data.depthCm || prev.depthCm,
        heightCm: data.heightCm || prev.heightCm,
        material: data.material || prev.material,
        description: data.description || prev.description,
      }));
      setScrapeMsg("Details scraped successfully. Review and edit fields below.");
    } catch {
      setError("Failed to scrape URL");
    } finally {
      setScraping(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/furniture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, url }),
      });
      if (!res.ok) {
        setError("Failed to save item");
        return;
      }
      router.push("/gallery");
    } catch {
      setError("Failed to save item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="page-title">Add Furniture Item</h1>
        <p className="page-subtitle">
          Paste a product URL to auto-fill details, or enter them manually.
        </p>
      </div>

      {/* Scrape Section */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.342"
            />
          </svg>
          <h2 className="font-semibold text-gray-900">Import from URL</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.example.com/product..."
            className="input"
          />
          <button
            onClick={handleScrape}
            disabled={scraping || !url}
            className="btn-primary whitespace-nowrap"
          >
            {scraping ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                Scraping...
              </span>
            ) : (
              "Scrape Details"
            )}
          </button>
        </div>
        {scrapeMsg && (
          <div className="flex items-center gap-2 mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {scrapeMsg}
          </div>
        )}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-5 space-y-5">
        <div>
          <label className="label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            placeholder="e.g. Ergonomic Office Chair"
            required
          />
        </div>

        <div>
          <label className="label">Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="input"
            placeholder="https://..."
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

        <button type="submit" disabled={saving} className="w-full btn-success py-3">
          {saving ? "Saving..." : "Add Item"}
        </button>
      </form>
    </div>
  );
}
