"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import RetreatBookingModal from "@/components/retreats/RetreatBookingModal";
import RetreatCardRow from "@/components/retreats/RetreatCardRow";
import Link from "next/link";
import { apiGet } from "@/lib/api";

const TABS = [
  { key: "inside_valley", label: "Inside Valley Retreats" },
  { key: "outside_valley", label: "Outside Valley Retreats" },
];

export default function RetreatProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [bookingProgram, setBookingProgram] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiGet("/retreat-programs");
        const list = res?.data || res || [];
        const normalized = list.map((p) => ({
          ...p,
          programType: p.programType || "inside_valley",
        }));
        setPrograms(normalized);
      } catch (err) {
        console.error("Retreat programs load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => programs.filter((p) => (p.programType || "inside_valley") === activeTab), [programs, activeTab]);

  return (
    <div className="bg-[#f5f8f4] min-h-screen">
      <Container className="py-14 md:py-18 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#10231a]">Retreat Programs</h1>
          <p className="text-base md:text-lg text-[#4c5f68] max-w-3xl">
            Immersive retreats inside and outside the valley designed for deeper healing, mindfulness, and restorative care.
          </p>
        </header>

        <div className="flex flex-wrap gap-3 bg-white border border-[#dfe8e2] rounded-full p-2 shadow-sm w-fit">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  active ? "bg-[#2F8D59] text-white shadow" : "bg-transparent text-[#2F8D59] hover:bg-[#e6f2ea]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-sm text-[#4c5f68]">Loading retreats...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#dfe8e2] rounded-2xl p-8 text-[#4c5f68]">
            No retreats available in this category right now.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((program) => (
              <RetreatCardRow key={program._id || program.slug} program={program} onBook={setBookingProgram} />
            ))}
          </div>
        )}
      </Container>
      {bookingProgram ? (
        <RetreatBookingModal
          program={bookingProgram}
          open={Boolean(bookingProgram)}
          onClose={() => setBookingProgram(null)}
        />
      ) : null}
    </div>
  );
}
