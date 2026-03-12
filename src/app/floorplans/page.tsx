"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OfficeArea {
  id: string;
  name: string;
  roomWidthCm: number | null;
  roomDepthCm: number | null;
  floorPlanPath: string | null;
}

export default function FloorPlansPage() {
  const [areas, setAreas] = useState<OfficeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => r.json())
      .then((data) => {
        setAreas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleUpload(areaId: string, file: File) {
    setUploading(areaId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/areas/${areaId}/floorplan`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setAreas((prev) =>
          prev.map((a) => (a.id === areaId ? { ...a, floorPlanPath: updated.floorPlanPath } : a))
        );
      }
    } catch {
      // ignore
    } finally {
      setUploading(null);
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
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title">Floor Plans</h1>
          <p className="page-subtitle">Upload and view floor plans for each office area.</p>
        </div>
        <Link href="/settings" className="btn-secondary flex items-center gap-2 text-sm">
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
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Manage Areas
        </Link>
      </div>

      {areas.length === 0 ? (
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
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1">No office areas configured</p>
          <p className="text-sm text-gray-400 mb-4">Add areas in Settings to upload floor plans.</p>
          <Link href="/settings" className="btn-primary inline-flex items-center gap-2">
            Go to Settings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {areas.map((area) => (
            <div key={area.id} className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">{area.name}</h2>
                {area.roomWidthCm && area.roomDepthCm && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {area.roomWidthCm} x {area.roomDepthCm} cm
                  </p>
                )}
              </div>

              {area.floorPlanPath ? (
                <div className="p-4">
                  {area.floorPlanPath.toLowerCase().endsWith(".pdf") ? (
                    <a
                      href={area.floorPlanPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
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
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      View PDF Floor Plan
                    </a>
                  ) : (
                    <img
                      src={area.floorPlanPath}
                      alt={`${area.name} floor plan`}
                      className="w-full rounded-lg border border-gray-200"
                    />
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <div className="h-44 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="text-sm">No floor plan uploaded</span>
                  </div>
                </div>
              )}

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-xs text-gray-600 whitespace-nowrap">Upload:</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(area.id, file);
                    }}
                    disabled={uploading === area.id}
                    className="block w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer file:transition-colors"
                  />
                </label>
                {uploading === area.id && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 mt-2">
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
