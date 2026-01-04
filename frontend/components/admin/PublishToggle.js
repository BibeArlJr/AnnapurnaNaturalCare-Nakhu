"use client";

export function StatusPill({ status }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ${
        published
          ? "bg-emerald-600/20 text-emerald-200 border border-emerald-500/40"
          : "bg-slate-700/60 text-slate-200 border border-slate-600"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function PublishToggle({ status, onToggle, disabled }) {
  const published = status === "published";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border ${
        published ? "bg-emerald-600/30 border-emerald-400" : "bg-slate-700 border-slate-500"
      } transition disabled:opacity-60`}
      aria-label="Toggle publish"
    >
      <span
        className={`absolute left-1 h-5 w-5 rounded-full bg-white transition-transform ${
          published ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
