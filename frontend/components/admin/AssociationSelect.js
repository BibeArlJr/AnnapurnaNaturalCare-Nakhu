"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";

const TYPE_LABEL = {
  retreat: "Retreat",
  health: "Health",
};

function formatLabel(type, title) {
  const typeText = TYPE_LABEL[type] || "Other";
  return `${typeText} • ${title || "Untitled"}`;
}

export default function AssociationSelect({ value, onChange, legacyLabel }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [programsRes, packagesRes] = await Promise.all([apiGet("/retreat-programs"), apiGet("/packages")]);
        const programs = (programsRes?.data || programsRes || []).map((p) => ({
          id: p._id,
          type: "retreat",
          title: p.title || p.name || "Untitled",
        }));
        const packages = (packagesRes?.data || packagesRes || []).map((p) => ({
          id: p._id,
          type: "health",
          title: p.name || p.title || "Untitled",
        }));
        setOptions([...programs, ...packages]);
      } catch (err) {
        console.error("Association options error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mergedOptions = useMemo(() => {
    if (value?.id && value?.type && !options.some((o) => o.id === value.id && o.type === value.type)) {
      return [...options, { id: value.id, type: value.type, title: legacyLabel || value.label || "Selected item" }];
    }
    return options;
  }, [legacyLabel, options, value]);

  const selectedKey = value?.id && value?.type ? `${value.type}:${value.id}` : "";

  const handleChange = (e) => {
    const next = e.target.value;
    if (!next) {
      onChange?.({ id: "", type: "", label: "" });
      return;
    }
    const [type, id] = next.split(":");
    const opt = mergedOptions.find((o) => o.id === id && o.type === type);
    onChange?.({ id, type, label: opt ? formatLabel(opt.type, opt.title) : "" });
  };

  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">Associated Program / Package</label>
      <select
        value={selectedKey}
        onChange={handleChange}
        disabled={loading && mergedOptions.length === 0}
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm"
      >
        <option value="">{loading ? "Loading options..." : "No association"}</option>
        {mergedOptions.map((opt) => (
          <option key={`${opt.type}-${opt.id}`} value={`${opt.type}:${opt.id}`}>
            {formatLabel(opt.type, opt.title)}
          </option>
        ))}
      </select>
      {legacyLabel && !selectedKey ? (
        <p className="text-xs text-slate-500">
          Existing association: <span className="text-slate-300">{legacyLabel}</span>
        </p>
      ) : null}
    </div>
  );
}
