"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { checkFit, fitLabel, fitColor, FitStatus } from "@/lib/fit-check";

interface OfficeArea {
  id: string;
  name: string;
  roomWidthCm: number | null;
  roomDepthCm: number | null;
}

interface Category {
  id: string;
  name: string;
}

interface FurnitureItem {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  price: number | null;
  widthCm: number | null;
  depthCm: number | null;
  heightCm: number | null;
  material: string | null;
  description: string | null;
  leadTimeDays: number | null;
  quantity: number;
  inCart: boolean;
  officeArea: OfficeArea | null;
  category: Category | null;
}

export default function GalleryPage() {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    fetch("/api/furniture")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleCart(id: string, currentlyInCart: boolean) {
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inCart: !currentlyInCart }),
    });
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inCart: !item.inCart } : item))
    );
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/furniture/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const uniqueCategories = Array.from(
    new Set(items.map((i) => i.category?.name).filter(Boolean) as string[])
  ).sort();

  const filteredItems = filterCategory
    ? items.filter((i) => i.category?.name === filterCategory)
    : items;

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
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title">Browse Furniture</h1>
          <p className="page-subtitle">
            {items.length} item{items.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          {uniqueCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-auto text-sm"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <Link href="/" className="btn-primary flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Item
          </Link>
        </div>
      </div>

      {filteredItems.length === 0 && items.length === 0 ? (
        <div className="card text-center py-16 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No furniture items yet</p>
          <p className="text-sm text-gray-400 mb-4">Get started by adding your first item.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add your first item
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center py-12 px-6">
          <p className="text-gray-600 font-medium mb-1">No items in this category</p>
          <button
            onClick={() => setFilterCategory("")}
            className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const fit: FitStatus = item.officeArea
              ? checkFit(
                  item.widthCm,
                  item.depthCm,
                  item.officeArea.roomWidthCm,
                  item.officeArea.roomDepthCm
                )
              : "unknown";

            return (
              <div key={item.id} className="card overflow-hidden flex flex-col">
                {item.imageUrl ? (
                  <div className="h-52 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="h-52 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-3 flex-1">
                    {item.price != null && (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-gray-400">x {item.quantity}</span>
                        )}
                      </div>
                    )}
                    {item.leadTimeDays != null && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {item.leadTimeDays} day lead time
                      </div>
                    )}
                    {(item.widthCm || item.depthCm || item.heightCm) && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                          />
                        </svg>
                        {item.widthCm || "?"}W x {item.depthCm || "?"}D x {item.heightCm || "?"}H cm
                      </div>
                    )}
                    {item.material && (
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 6h.008v.008H6V6z"
                          />
                        </svg>
                        {item.material}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.category && (
                      <span className="badge bg-purple-100 text-purple-700">
                        {item.category.name}
                      </span>
                    )}
                    {item.officeArea && (
                      <span className="badge bg-gray-100 text-gray-700">
                        {item.officeArea.name}
                      </span>
                    )}
                    {fit !== "unknown" && (
                      <span className={`badge ${fitColor(fit)}`}>{fitLabel(fit)}</span>
                    )}
                    {item.inCart && (
                      <span className="badge bg-indigo-100 text-indigo-700">In Order</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => toggleCart(item.id, item.inCart)}
                      className={`flex-1 ${
                        item.inCart ? "btn-secondary" : "btn-primary"
                      } text-xs py-2`}
                    >
                      {item.inCart ? "Remove from Order" : "Add to Order"}
                    </button>
                    <Link href={`/edit/${item.id}`} className="btn-secondary text-xs py-2 px-3">
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="btn-danger text-xs py-2 px-3"
                    >
                      Del
                    </button>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-2 text-xs text-indigo-500 hover:text-indigo-700 truncate transition-colors"
                    >
                      <svg
                        className="w-3 h-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                      View product page
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
