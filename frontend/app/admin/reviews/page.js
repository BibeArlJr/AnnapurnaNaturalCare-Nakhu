"use client";

import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPatch } from "@/lib/api";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/patient-reviews?status=all&includeDrafts=true");
      setItems(res?.data || res || []);
      setError("");
    } catch (err) {
      setError("Failed to load reviews");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    await apiDelete(`/patient-reviews/${id}`);
    await load();
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    setUpdatingId(item._id);
    setItems((prev) =>
      prev.map((it) =>
        it._id === item._id
          ? { ...it, status: nextStatus, publishedAt: nextStatus === "published" ? new Date().toISOString() : it.publishedAt }
          : it
      )
    );
    try {
      await apiPatch(`/patient-reviews/${item._id}`, {
        status: nextStatus,
        publishedAt: nextStatus === "published" ? new Date() : undefined,
      });
    } catch (err) {
      setItems((prev) =>
        prev.map((it) => (it._id === item._id ? { ...it, status: item.status, publishedAt: item.publishedAt } : it))
      );
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    try {
      return new Date(val).toLocaleDateString();
    } catch (err) {
      return "—";
    }
  };

  const summarize = useMemo(
    () => (html) => {
      if (!html) return "";
      const plain = html.toString().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return plain.length > 140 ? `${plain.slice(0, 137)}...` : plain;
    },
    []
  );

  const StatusPill = ({ status }) => {
    const published = status === "published";
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          published
            ? "bg-emerald-600/20 text-emerald-200 border border-emerald-500/40"
            : "bg-slate-700/60 text-slate-200 border border-slate-600"
        }`}
      >
        {published ? "Published" : "Draft"}
      </span>
    );
  };

  const Toggle = ({ item }) => (
    <button
      onClick={() => toggleStatus(item)}
      disabled={updatingId === item._id}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border ${
        item.status === "published" ? "bg-emerald-600/30 border-emerald-400" : "bg-slate-700 border-slate-500"
      } transition`}
      aria-label="Toggle publish"
    >
      <span
        className={`absolute left-1 h-5 w-5 rounded-full bg-white transition-transform ${
          item.status === "published" ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Patient Reviews</h1>
          <p className="text-sm text-slate-400">Manage patient testimonials.</p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-500"
        >
          Add review
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-slate-400">No reviews yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-[#0f131a] border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-slate-900">
                {item.coverImage || item.photo ? (
                  <img
                    src={item.coverImage || item.photo}
                    alt={item.patientName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <StatusPill status={item.status} />
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.patientName}</p>
                    {item.country ? <p className="text-xs text-slate-400">{item.country}</p> : null}
                  </div>
                  <Toggle item={item} />
                </div>
                <p className="text-base font-semibold text-white line-clamp-2">{item.headline}</p>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  {item.rating ? (
                    <span className="text-amber-400">{`${item.rating}/5`}</span>
                  ) : (
                    <span className="text-slate-600">No rating</span>
                  )}
                  <span>• Created {formatDate(item.createdAt)}</span>
                  {item.updatedAt ? <span>• Updated {formatDate(item.updatedAt)}</span> : null}
                </div>
                {item.fullReview ? (
                  <p className="text-sm text-slate-300 line-clamp-3">{summarize(item.fullReview)}</p>
                ) : null}
                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/admin/reviews/${item._id}`}
                    className="px-3 py-2 text-xs rounded bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(item._id)}
                    className="px-3 py-2 text-xs rounded bg-rose-900/40 text-rose-200 hover:bg-rose-800/60 border border-rose-700/60"
                  >
                    Delete
                  </button>
                  {item.slug ? (
                    <Link
                      href={`/patient-reviews/${item.slug}`}
                      className="px-3 py-2 text-xs rounded bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60 border border-emerald-700/60"
                    >
                      View
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
