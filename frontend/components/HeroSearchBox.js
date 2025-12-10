"use client";

import { useState } from "react";
import AppDatePicker from "./ui/DatePicker";

export default function HeroSearchBox() {
  const [preferredDate, setPreferredDate] = useState(null);

  const inputClass =
    "w-full border border-neutral-300 rounded-lg px-4 py-3 text-base text-black bg-white outline-none focus:ring-2 focus:ring-primary-light";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-neutral-700 mb-1">
              Search Doctors
            </label>
            <input
              type="text"
              placeholder="e.g. Orthopedic"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-neutral-700 mb-1">
              Search Departments
            </label>
            <input
              type="text"
              placeholder="e.g. Physiotherapy"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-neutral-700 mb-1">
              Preferred Date
            </label>
            <div className="relative">
              <AppDatePicker
                selected={preferredDate}
                onChange={setPreferredDate}
                className={inputClass}
                calendarClassName="scale-110"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <button
              className="bg-primary-teal text-white font-semibold rounded-lg w-full h-[48px] hover:bg-primary-dark transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
