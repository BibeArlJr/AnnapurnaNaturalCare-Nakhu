"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUpDownIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function MultiSelect({ label, options = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(id) {
    if (!onChange) return;
    const exists = selected.includes(id);
    const next = exists ? selected.filter((v) => v !== id) : [...selected, id];
    onChange(next);
  }

  const selectedOptions = options.filter((o) => selected.includes(o._id));

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label && <label className="text-sm text-slate-300">{label}</label>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-white focus:outline-none"
        >
          <span className="text-sm text-slate-200">
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : "Select departments"}
          </span>
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
        </button>

        {selectedOptions.length > 0 && (
          <div className="px-3 pb-3 flex flex-wrap gap-2">
            {selectedOptions.map((opt) => (
              <span
                key={opt._id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-teal-600/30 text-teal-100 border border-teal-500/40"
              >
                {opt.name}
                <button
                  type="button"
                  onClick={() => toggle(opt._id)}
                  className="hover:text-white text-teal-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        {open && (
          <div className="max-h-52 overflow-y-auto border-t border-slate-700 bg-slate-900 rounded-b-xl">
            {options.length === 0 && (
              <div className="px-4 py-2 text-sm text-slate-400">No options available</div>
            )}
            {options.map((opt) => {
              const active = selected.includes(opt._id);
              return (
                <button
                  key={opt._id}
                  type="button"
                  onClick={() => toggle(opt._id)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                    active ? "bg-teal-700/30 text-white" : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>{opt.name}</span>
                  {active && <CheckIcon className="h-4 w-4 text-teal-300" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
