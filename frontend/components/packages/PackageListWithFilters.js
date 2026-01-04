"use client";

import { useMemo, useState } from "react";
import PackageCardRow from "./PackageCardRow";
import PackageBookingModal from "./PackageBookingModal";

export default function PackageListWithFilters({ packages = [], departments = [], treatmentTypes = [] }) {
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [treatmentType, setTreatmentType] = useState("");
  const [department, setDepartment] = useState("");
  const [activePackage, setActivePackage] = useState(null);

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const price = Number(pkg.price) || 0;
      const duration = Number(pkg.durationDays ?? pkg.duration) || 0;

      if (priceMin && price < Number(priceMin)) return false;
      if (priceMax && price > Number(priceMax)) return false;
      if (durationMin && duration < Number(durationMin)) return false;
      if (durationMax && duration > Number(durationMax)) return false;

      if (treatmentType) {
        const pkgTreatment =
          pkg.treatmentType?._id || pkg.treatmentType?.id || pkg.treatmentType;
        if (!pkgTreatment || pkgTreatment.toString() !== treatmentType.toString()) {
          return false;
        }
      }

      if (department) {
        const depMatch =
          pkg.department?._id === department ||
          pkg.department === department ||
          (pkg.departments || []).some(
            (dep) => dep?._id === department || dep?.id === department || dep === department
          );
        if (!depMatch) return false;
      }

      return true;
    });
  }, [packages, priceMin, priceMax, durationMin, durationMax, treatmentType, department]);

  const resetFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setDurationMin("");
    setDurationMax("");
    setTreatmentType("");
    setDepartment("");
  };

  const toggleTreatment = (value) => {
    setTreatmentType((prev) => (prev === value ? "" : value));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <aside className="bg-white border border-[#dfe8e2] rounded-2xl p-5 space-y-4 h-fit">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#10231a]">Filters</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-[#2F8D59] font-semibold hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#10231a]">Price range</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#10231a]">Duration (days)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
            />
            <input
              type="number"
              placeholder="Max"
              value={durationMax}
              onChange={(e) => setDurationMax(e.target.value)}
              className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#10231a]">Treatment type</p>
          <div className="flex flex-wrap gap-2">
            {treatmentTypes.map((opt) => {
              const active =
                treatmentType === (opt?._id || opt?.id || opt?.value);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleTreatment(opt?._id || opt?.id || opt?.value)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    active
                      ? "bg-[#e6f2ea] border-[#2F8D59] text-[#2F8D59]"
                      : "bg-white border-[#dfe8e2] text-[#4c5f68]"
                  }`}
                >
                  {opt?.name || opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#10231a]">Department</p>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] bg-white"
          >
            <option value="">Any</option>
            {departments.map((dep) => (
              <option key={dep._id} value={dep._id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <section className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white border border-[#dfe8e2] rounded-2xl p-6 text-[#4c5f68]">
            No packages match these filters.
          </div>
        )}
        {filtered.map((pkg) => (
          <PackageCardRow key={pkg._id} pkg={pkg} onBook={(p) => setActivePackage(p)} />
        ))}
      </section>

      {activePackage && (
        <PackageBookingModal pkg={activePackage} onClose={() => setActivePackage(null)} />
      )}
    </div>
  );
}
