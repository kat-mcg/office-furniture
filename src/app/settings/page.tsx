"use client";

import { useState, useEffect } from "react";

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

export default function SettingsPage() {
  const [areas, setAreas] = useState<OfficeArea[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [moveInDate, setMoveInDate] = useState("");
  const [newArea, setNewArea] = useState({ name: "", roomWidthCm: "", roomDepthCm: "" });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", roomWidthCm: "", roomDepthCm: "" });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/areas").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([areasData, settings, categoriesData]) => {
        setAreas(areasData);
        setMoveInDate(settings.moveInDate || "");
        setCategories(categoriesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveMoveInDate(date: string) {
    setMoveInDate(date);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moveInDate: date }),
    });
  }

  async function addArea() {
    if (!newArea.name.trim()) return;
    const res = await fetch("/api/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newArea),
    });
    if (res.ok) {
      const area = await res.json();
      setAreas((prev) => [...prev, area].sort((a, b) => a.name.localeCompare(b.name)));
      setNewArea({ name: "", roomWidthCm: "", roomDepthCm: "" });
    }
  }

  function startEdit(area: OfficeArea) {
    setEditingId(area.id);
    setEditForm({
      name: area.name,
      roomWidthCm: area.roomWidthCm?.toString() || "",
      roomDepthCm: area.roomDepthCm?.toString() || "",
    });
  }

  async function saveEdit() {
    if (!editingId || !editForm.name.trim()) return;
    const res = await fetch(`/api/areas/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setAreas((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      setEditingId(null);
    }
  }

  async function deleteArea(id: string) {
    if (!confirm("Delete this area? Furniture items will be unassigned.")) return;
    await fetch(`/api/areas/${id}`, { method: "DELETE" });
    setAreas((prev) => prev.filter((a) => a.id !== id));
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });
    if (res.ok) {
      const cat = await res.json();
      setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
    }
  }

  async function saveCatEdit() {
    if (!editingCatId || !editCatName.trim()) return;
    const res = await fetch(`/api/categories/${editingCatId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editCatName }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories((prev) => prev.map((c) => (c.id === editingCatId ? updated : c)));
      setEditingCatId(null);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Delete this category? Furniture items will be uncategorized.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
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
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure categories, office areas, and move-in date.</p>
      </div>

      {/* Move-in Date */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Move-in Date</h2>
            <p className="text-xs text-gray-500">Used to calculate order deadlines</p>
          </div>
        </div>
        <input
          type="date"
          value={moveInDate}
          onChange={(e) => saveMoveInDate(e.target.value)}
          className="input w-auto"
        />
      </div>

      {/* Categories */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Categories</h2>
            <p className="text-xs text-gray-500">
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"} configured
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-5 pb-5 border-b border-gray-100">
          <input
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            className="input flex-1"
          />
          <button onClick={addCategory} className="btn-success whitespace-nowrap">
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No categories configured yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1"
              >
                {editingCatId === cat.id ? (
                  <>
                    <input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveCatEdit()}
                      className="input flex-1"
                    />
                    <button onClick={saveCatEdit} className="btn-primary text-xs py-2">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCatId(null)}
                      className="btn-secondary text-xs py-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-purple-500"
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
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900">{cat.name}</span>
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditCatName(cat.name);
                      }}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="btn-danger text-xs py-1.5 px-3"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Office Areas */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Office Areas</h2>
            <p className="text-xs text-gray-500">
              {areas.length} area{areas.length !== 1 ? "s" : ""} configured
            </p>
          </div>
        </div>

        {/* Add new */}
        <div className="flex gap-2 mb-5 pb-5 border-b border-gray-100">
          <input
            placeholder="Area name"
            value={newArea.name}
            onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
            className="input flex-1"
          />
          <input
            type="number"
            placeholder="Width (cm)"
            value={newArea.roomWidthCm}
            onChange={(e) => setNewArea({ ...newArea, roomWidthCm: e.target.value })}
            className="input w-28"
          />
          <input
            type="number"
            placeholder="Depth (cm)"
            value={newArea.roomDepthCm}
            onChange={(e) => setNewArea({ ...newArea, roomDepthCm: e.target.value })}
            className="input w-28"
          />
          <button onClick={addArea} className="btn-success whitespace-nowrap">
            Add Area
          </button>
        </div>

        {/* List */}
        {areas.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No areas configured yet.</p>
        ) : (
          <div className="space-y-2">
            {areas.map((area) => (
              <div
                key={area.id}
                className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors -mx-1"
              >
                {editingId === area.id ? (
                  <>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input flex-1"
                    />
                    <input
                      type="number"
                      placeholder="Width"
                      value={editForm.roomWidthCm}
                      onChange={(e) => setEditForm({ ...editForm, roomWidthCm: e.target.value })}
                      className="input w-24"
                    />
                    <input
                      type="number"
                      placeholder="Depth"
                      value={editForm.roomDepthCm}
                      onChange={(e) => setEditForm({ ...editForm, roomDepthCm: e.target.value })}
                      className="input w-24"
                    />
                    <button onClick={saveEdit} className="btn-primary text-xs py-2">
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary text-xs py-2"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                        />
                      </svg>
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-900">{area.name}</span>
                    <span className="text-xs text-gray-400">
                      {area.roomWidthCm && area.roomDepthCm
                        ? `${area.roomWidthCm} x ${area.roomDepthCm} cm`
                        : "No dimensions"}
                    </span>
                    <button
                      onClick={() => startEdit(area)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteArea(area.id)}
                      className="btn-danger text-xs py-1.5 px-3"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
