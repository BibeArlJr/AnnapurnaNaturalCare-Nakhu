"use client";

import { useEffect, useState } from "react";
import {
  EnvelopeIcon,
  InboxStackIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import MessageDetailsModal from "@/components/admin/MessageDetailsModal";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    if (msg) {
      setTimeout(() => setToast(""), 2200);
    }
  }

  async function loadMessages() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet("/messages");
      const data = res?.data?.items || res?.items || res || [];
      setMessages(data);
      setFiltered(applyFilters(data, search, statusFilter));
    } catch (err) {
      console.error("Messages fetch error:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  function applyFilters(list, searchText, status) {
    let result = [...list];
    const q = (searchText || "").toLowerCase();

    if (q) {
      result = result.filter((m) => {
        const name = (m.name || "").toLowerCase();
        const email = (m.email || "").toLowerCase();
        const subject = (m.subject || "").toLowerCase();
        const msg = (m.message || "").toLowerCase();
        return name.includes(q) || email.includes(q) || subject.includes(q) || msg.includes(q);
      });
    }

    if (status !== "all") {
      result = result.filter((m) => m.status === status);
    }

    return result;
  }

  function handleSearch(text) {
    setSearch(text);
    setFiltered(applyFilters(messages, text, statusFilter));
  }

  function handleStatusFilter(status) {
    setStatusFilter(status);
    setFiltered(applyFilters(messages, search, status));
  }

  function openDetails(msg) {
    setSelected(msg);
    setOpenModal(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      await apiDelete(`/messages/${id}`);
      const next = messages.filter((m) => m._id !== id);
      setMessages(next);
      setFiltered(applyFilters(next, search, statusFilter));
      showToast("Message deleted");
      if (selected?._id === id) {
        setOpenModal(false);
        setSelected(null);
      }
    } catch (err) {
      console.error("Delete message error:", err);
      showToast(err.message || "Failed to delete message");
    }
  }

  async function handleSetStatus(status, id) {
    try {
      const res = await apiPost(`/messages/${id}/read`, { status });
      const updated = res?.data || res;

      const next = messages.map((m) => (m._id === updated._id ? { ...m, status: updated.status } : m));
      setMessages(next);
      setFiltered(applyFilters(next, search, statusFilter));

      if (selected && selected._id === updated._id) {
        setSelected({ ...selected, status: updated.status });
      }

      showToast(updated.status === "read" ? "Marked as read" : "Marked as unread");
    } catch (err) {
      console.error("Set status error:", err);
      showToast(err.message || "Failed to update status");
    }
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const totalCount = messages.length;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-white/10 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl text-white font-semibold flex items-center gap-2">
            <InboxStackIcon className="h-7 w-7 text-teal-400" />
            Messages
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inbox for contact form submissions from the website.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-200">Total: {totalCount}</span>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Unread: {unreadCount}
          </span>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative w-full lg:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, email, subject..."
            className="bg-[#11151c] border border-white/10 text-white rounded-lg py-3 pl-10 pr-3 w-full outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            onClick={() => handleStatusFilter("all")}
            className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${
              statusFilter === "all"
                ? "bg-teal-600 border-teal-500 text-white"
                : "bg-slate-900 border-white/10 text-slate-300 hover:border-teal-500/60"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusFilter("unread")}
            className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${
              statusFilter === "unread"
                ? "bg-amber-500 border-amber-400 text-slate-900"
                : "bg-slate-900 border-white/10 text-slate-300 hover:border-amber-400/60"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => handleStatusFilter("read")}
            className={`px-3 py-1 rounded-full border text-xs sm:text-sm ${
              statusFilter === "read"
                ? "bg-slate-700 border-slate-500 text-white"
                : "bg-slate-900 border-white/10 text-slate-300 hover:border-slate-500/60"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <EnvelopeIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p>No messages found.</p>
          <p className="text-xs text-slate-500 mt-1">
            Once patients use the contact form, their messages will appear here.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((msg) => {
            const created = msg.createdAt
              ? new Date(msg.createdAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "";

            return (
              <div
                key={msg._id}
                className="rounded-xl border border-white/10 bg-[#11151c] p-4 hover:border-teal-500/60 transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{msg.name}</p>
                      {msg.status === "unread" && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-900 font-semibold">
                          UNREAD
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 break-all">{msg.email}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 text-right">{created}</p>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {msg.subject || "No subject"}
                  </span>
                  <p className="mt-1 line-clamp-2 text-slate-300">{msg.message}</p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-800/70">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(msg.status === "unread" ? "read" : "unread", msg._id)}
                    className="text-[11px] px-2 py-1 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700 transition"
                  >
                    {msg.status === "unread" ? "Mark read" : "Mark unread"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(msg)}
                      className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-500 transition"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(msg._id)}
                      className="flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-rose-700/80 text-rose-50 hover:bg-rose-600 transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MessageDetailsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        message={selected}
        onSetStatus={handleSetStatus}
      />
    </div>
  );
}
