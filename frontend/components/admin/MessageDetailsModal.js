"use client";

import { Dialog } from "@headlessui/react";
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

export default function MessageDetailsModal({ open, onClose, message, onSetStatus }) {
  if (!open || !message) return null;

  const created = message.createdAt
    ? new Date(message.createdAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  const isUnread = message.status === "unread";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <Dialog.Panel className="w-full max-w-2xl bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <Dialog.Title className="text-lg font-semibold text-white">
                {message.subject || "Message details"}
              </Dialog.Title>
              <p className="text-xs text-slate-400 mt-1">
                {isUnread ? "Unread message" : "Marked as read"} · {created}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 rounded-full p-2 transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <UserIcon className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Name</p>
                  <p className="text-white">{message.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <EnvelopeIcon className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Email</p>
                  <p className="text-white break-all">{message.email}</p>
                </div>
              </div>

              {message.phone && (
                <div className="flex items-start gap-2">
                  <PhoneIcon className="h-5 w-5 text-teal-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-xs">Phone</p>
                    <p className="text-white">{message.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-teal-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs">Received</p>
                  <p className="text-white">{created}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 text-xs">Subject</p>
              <p className="text-white text-sm">
                {message.subject || "No subject"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 text-xs">Message</p>
              <div className="text-sm text-slate-100 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 whitespace-pre-wrap">
                {message.message}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#0b1017]">
            <p className="text-xs text-slate-500">
              Source: {message.source || "website"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  onSetStatus?.(isUnread ? "read" : "unread", message._id)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isUnread
                    ? "bg-teal-600 hover:bg-teal-500 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-100"
                }`}
              >
                {isUnread ? "Mark as read" : "Mark as unread"}
              </button>
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent(
                  message.subject || "Reply from Annapurna Hospital"
                )}`}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-900 hover:bg-white transition"
              >
                Reply via email
              </a>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
