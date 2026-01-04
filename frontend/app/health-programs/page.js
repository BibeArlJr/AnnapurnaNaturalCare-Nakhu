"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

export default function HealthProgramsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet("/health-programs/public");
        setItems(res?.data || res || []);
      } catch (err) {
        console.error("Health programs load error:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-teal-600 font-semibold">Health Programs</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Curated programs for holistic healing</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Explore online, residential, and day-visit programs crafted by Annapurna Nature Cure Hospital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((p) => (
          <Link
            key={p._id}
            href={`/health-programs/${p.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition overflow-hidden"
          >
            <div className="h-52 bg-slate-100 overflow-hidden">
              {p.coverImage ? (
                <img
                  src={p.coverImage}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
              )}
            </div>
            <div className="p-5 space-y-3">
              <div className="flex gap-2 text-xs uppercase tracking-wide text-teal-600">
                {(p.modesAvailable || []).map((m) => (
                  <span key={m} className="px-2 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700">
                    {m}
                  </span>
                ))}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-teal-700 transition">{p.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3">{p.shortDescription}</p>
              <div className="flex items-center justify-between text-sm text-slate-700 pt-2">
                <span>{p.durationInDays ? `${p.durationInDays} days` : "Flexible duration"}</span>
                <span className="font-semibold text-teal-700">From ${p.pricing?.online || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
