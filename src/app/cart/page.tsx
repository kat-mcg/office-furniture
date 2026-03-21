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

interface FurnitureItem {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  price: number | null;
  widthCm: number | null;
  depthCm: number | null;
  heightCm: number | null;
  leadTimeDays: number | null;
  quantity: number;
  officeArea: OfficeArea | null;
}

export default function CartPage() {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [moveInDate, setMoveInDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/cart").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([cartItems, settings]) => {
        setItems(cartItems);
        setMoveInDate(settings.moveInDate || "");
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

  async function removeFromCart(id: string) {
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inCart: false }),
    });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function updateQuantity(id: string, quantity: number) {
    const q = Math.max(1, quantity);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: q } : item)));
    await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: q }),
    });
  }

  function getOrderDeadline(leadTimeDays: number | null): Date | null {
    if (!moveInDate || !leadTimeDays) return null;
    const d = new Date(moveInDate + "T00:00:00");
    d.setDate(d.getDate() - leadTimeDays);
    return d;
  }

  function isOverdue(deadline: Date | null): boolean {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  }

  function daysUntil(deadline: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  const sorted = [...items].sort((a, b) => {
    const da = getOrderDeadline(a.leadTimeDays);
    const db = getOrderDeadline(b.leadTimeDays);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });

  const totalCost = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const overdueCount = sorted.filter((item) =>
    isOverdue(getOrderDeadline(item.leadTimeDays))
  ).length;

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
          <h1 className="page-title">Order Cart</h1>
          <p className="page-subtitle">
            {items.length} item{items.length !== 1 ? "s" : ""} selected for order
          </p>
        </div>
        <Link href="/gallery" className="btn-secondary flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
          Browse More
        </Link>
      </div>

      {/* Move-in Date Banner */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <label className="text-sm font-medium text-gray-900">Move-in Date</label>
              <p className="text-xs text-gray-500">Order deadlines are calculated from this date</p>
            </div>
          </div>
          <input
            type="date"
            value={moveInDate}
            onChange={(e) => saveMoveInDate(e.target.value)}
            className="input w-auto"
          />
        </div>
      </div>

      {/* Overdue Warning */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-700 font-medium">
            {overdueCount} item{overdueCount > 1 ? "s have" : " has"} overdue order deadlines!
          </p>
        </div>
      )}

      {sorted.length === 0 ? (
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No items in the order cart</p>
          <p className="text-sm text-gray-400 mb-4">
            Browse furniture and add items to your order.
          </p>
          <Link href="/gallery" className="btn-primary inline-flex items-center gap-2">
            Browse Furniture
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {sorted.map((item) => {
              const deadline = getOrderDeadline(item.leadTimeDays);
              const overdue = isOverdue(deadline);
              const subtotal = (item.price || 0) * item.quantity;
              const fit: FitStatus = item.officeArea
                ? checkFit(
                    item.widthCm,
                    item.depthCm,
                    item.officeArea.roomWidthCm,
                    item.officeArea.roomDepthCm
                  )
                : "unknown";

              return (
                <div
                  key={item.id}
                  className={`card p-4 flex gap-4 items-start ${
                    overdue ? "!border-red-300 !bg-red-50/50 ring-1 ring-red-200" : ""
                  }`}
                >
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white p-1 hover:border-indigo-300 transition-colors"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center hover:border-indigo-300 transition-colors">
                          <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  ) : item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white flex-shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-gray-300"
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
                  <div className="flex-1 min-w-0">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-gray-900 hover:text-indigo-600 transition-colors">
                        {item.title}
                      </a>
                    ) : (
                      <h3 className="font-semibold text-sm text-gray-900">{item.title}</h3>
                    )}
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">${(item.price || 0).toFixed(2)}</span>
                        <span className="text-gray-400">×</span>
                        <div className="inline-flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="px-2 py-0.5 text-gray-900 font-medium min-w-[2rem] text-center border-x border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gray-400">=</span>
                        <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                      </div>

                      {deadline && (
                        <div
                          className={`flex items-center gap-1.5 text-sm font-medium ${
                            overdue ? "text-red-600" : "text-gray-700"
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
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
                          Order by {deadline.toLocaleDateString()}
                          {overdue && (
                            <span className="badge bg-red-100 text-red-700 ml-1">OVERDUE</span>
                          )}
                          {!overdue && deadline && (
                            <span className="text-xs text-gray-400 font-normal ml-1">
                              ({daysUntil(deadline)} days left)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.officeArea && (
                          <span className="badge bg-gray-100 text-gray-700">
                            {item.officeArea.name}
                          </span>
                        )}
                        {fit !== "unknown" && (
                          <span className={`badge ${fitColor(fit)}`}>{fitLabel(fit)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn-danger text-xs py-1.5 px-3 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="card p-5 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-bold text-gray-900">Order Total</span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {items.length} item{items.length !== 1 ? "s" : ""} &middot;{" "}
                  {items.reduce((s, i) => s + i.quantity, 0)} units
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
