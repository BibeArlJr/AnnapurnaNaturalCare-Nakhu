"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

const inputBase = "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition";

export default function HealthProgramBookingModal({ program, open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    preferredStartDate: "",
    mode: "online",
    people: 1,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  const disclaimer = (
    <div className="space-y-2 text-sm text-[#10231a]">
      <div className="rounded-lg bg-[#fff7ed] border border-[#f2d5b1] px-3 py-2">
        <p className="font-semibold text-[#c2410c]">Important</p>
        <p>Extra charges apply for any activities or services not listed in the program description.</p>
      </div>
      <div className="rounded-lg bg-[#fef2f2] border border-[#fecdd3] px-3 py-2">
        <p className="font-semibold text-[#be123c]">Refund Policy</p>
        <p>After payment, booking cancellations will incur a 10% deduction of the total booking cost.</p>
      </div>
    </div>
  );

  if (!open || !program) return null;

  const price = Number(program.pricing?.[form.mode]) || 0;
  const people = Number(form.people) || 1;
  const total = price * people;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "people") {
      const n = Math.max(1, Number(value) || 1);
      setForm((prev) => ({ ...prev, people: n }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const close = () => {
    setShowPaymentChoice(false);
    setBookingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      country: "",
      preferredStartDate: "",
      mode: "online",
      people: 1,
      notes: "",
    });
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.mode) {
      alert("Please fill required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost("/health-program-bookings", {
        programId: program._id,
        programTitle: program.title,
        userName: form.name,
        email: form.email,
        phone: form.phone,
        country: form.country,
        preferredStartDate: form.preferredStartDate,
        mode: form.mode,
        numberOfPeople: Number(form.people) || 1,
        notes: form.notes,
      });
      setBookingId(res?.data?._id || res?._id || null);
      setShowPaymentChoice(true);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to place booking"));
    }
    setSubmitting(false);
  };

  const startStripe = async () => {
    if (!bookingId) return;
    try {
      const res = await apiPost("/payments/stripe/checkout", { bookingId, type: "health_program" });
      if (res?.url) window.location.href = res.url;
    } catch (err) {
      alert(getApiErrorMessage(err, "Unable to start payment"));
    }
  };

  const handlePayLater = () => {
    alert("Booking placed successfully. Pay later to confirm.");
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center px-4 py-10" onClick={close}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-y-auto p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-600 font-semibold">Book this program</p>
            <h3 className="text-xl font-semibold text-slate-900">{program.title}</h3>
            <p className="text-sm text-slate-600">{program.durationInDays ? `${program.durationInDays} days` : ""}</p>
          </div>
          <button onClick={close} className="text-slate-500 hover:text-slate-900 font-semibold">
            ✕
          </button>
        </div>

        {showPaymentChoice ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-slate-600">Mode</p>
                <p className="font-semibold text-slate-900 capitalize">{form.mode}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-slate-600">People</p>
                <p className="font-semibold text-slate-900">{form.people}</p>
              </div>
              <div className="rounded-xl border-2 border-teal-600 bg-teal-50 px-4 py-3">
                <p className="text-teal-700 font-semibold">Total amount</p>
                <p className="text-lg font-bold text-slate-900">${total}</p>
              </div>
            </div>
            {disclaimer}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={startStripe}
                className="flex-1 inline-flex justify-center items-center rounded-full bg-teal-600 text-white text-sm font-semibold px-4 py-3 hover:bg-teal-700 transition"
              >
                Pay now with Stripe
              </button>
              <button
                onClick={handlePayLater}
                className="flex-1 inline-flex justify-center items-center rounded-full border border-slate-300 text-slate-900 text-sm font-semibold px-4 py-3 hover:bg-slate-50 transition"
              >
                Pay later
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className={`${inputBase} border-slate-200`} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={`${inputBase} border-slate-200`} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={`${inputBase} border-slate-200`} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Country</label>
                <input name="country" value={form.country} onChange={handleChange} className={`${inputBase} border-slate-200`} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Preferred Start Date</label>
                <input name="preferredStartDate" type="date" value={form.preferredStartDate} onChange={handleChange} className={`${inputBase} border-slate-200`} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Number of People</label>
                <input name="people" type="number" min={1} value={form.people} onChange={handleChange} className={`${inputBase} border-slate-200`} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Joining mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["online", "residential", "dayVisitor"].map((mode) => (
                  <label
                    key={mode}
                    className={`rounded-xl border px-4 py-3 cursor-pointer transition ${
                      form.mode === mode ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={form.mode === mode}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <p className="font-semibold text-slate-900 capitalize">{mode}</p>
                    <p className="text-sm text-slate-600">${program.pricing?.[mode] || 0} / person</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-800">Additional Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                className={`${inputBase} border-slate-200 resize-none`}
                placeholder="Share any preferences"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-slate-600">Price per person</p>
                <p className="font-semibold text-slate-900">${price}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-slate-600">People</p>
                <p className="font-semibold text-slate-900">{people}</p>
              </div>
              <div className="rounded-xl border-2 border-teal-600 bg-teal-50 px-4 py-3">
                <p className="text-teal-700 font-semibold">Total amount</p>
                <p className="text-lg font-bold text-slate-900">${total}</p>
              </div>
            </div>
            {disclaimer}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-900 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60"
              >
                {submitting ? "Booking..." : "Book Program"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
