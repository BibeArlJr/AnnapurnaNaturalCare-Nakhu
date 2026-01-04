"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  preferredStartDate: "",
  people: 1,
  notes: "",
};

const modeLabels = {
  none: "No accommodation",
  location: "Choose by location",
  star: "Choose by hotel rating",
  locationAndStar: "Choose by location & rating",
};

export default function PackageBookingModal({ pkg, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [partnerHotels, setPartnerHotels] = useState([]);
  const [accommodationMode, setAccommodationMode] = useState("none");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStarRating, setSelectedStarRating] = useState("");
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  const durationNights = useMemo(() => pkg?.duration || pkg?.durationDays || 1, [pkg?.duration, pkg?.durationDays]);
  const perPersonPrice = pkg?.price && Number(pkg.price) > 0 ? Number(pkg.price) : null;
  const baseTotal = perPersonPrice ? perPersonPrice * (Number(form.people) || 1) : null;

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await apiGet("/partner-hotels/public");
        const list = res?.data || res || [];
        setPartnerHotels(list);
        if (list.length && accommodationMode !== "none") {
          setSelectedLocation(list[0].location || "");
          setSelectedStarRating(list[0].starRating || "");
          setSelectedHotelId(list[0]._id);
        }
      } catch (err) {
        console.error("Partner hotels load error:", err);
      }
    };
    loadHotels();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const locationOptions = useMemo(
    () => Array.from(new Set((partnerHotels || []).map((h) => h.location).filter(Boolean))),
    [partnerHotels]
  );
  const starOptions = useMemo(
    () => Array.from(new Set((partnerHotels || []).map((h) => h.starRating).filter(Boolean))).sort(),
    [partnerHotels]
  );

  const filteredHotels = useMemo(() => {
    if (accommodationMode === "location") {
      return partnerHotels.filter((h) => (selectedLocation ? h.location === selectedLocation : true));
    }
    if (accommodationMode === "star") {
      return partnerHotels.filter((h) => (selectedStarRating ? Number(h.starRating) === Number(selectedStarRating) : true));
    }
    if (accommodationMode === "locationAndStar") {
      return partnerHotels.filter(
        (h) =>
          (selectedLocation ? h.location === selectedLocation : true) &&
          (selectedStarRating ? Number(h.starRating) === Number(selectedStarRating) : true)
      );
    }
    return [];
  }, [accommodationMode, partnerHotels, selectedLocation, selectedStarRating]);

  useEffect(() => {
    if (accommodationMode === "none") {
      setSelectedHotelId(null);
      return;
    }
    if (filteredHotels.length && !selectedHotelId) {
      setSelectedHotelId(filteredHotels[0]._id);
      if (!selectedLocation && filteredHotels[0].location) setSelectedLocation(filteredHotels[0].location);
      if (!selectedStarRating && filteredHotels[0].starRating) setSelectedStarRating(filteredHotels[0].starRating);
    }
    if (!filteredHotels.length) {
      setSelectedHotelId(null);
    }
  }, [filteredHotels, accommodationMode, selectedHotelId, selectedLocation, selectedStarRating]);

  const selectedHotel =
    accommodationMode === "none" ? null : filteredHotels.find((h) => h._id === selectedHotelId) || filteredHotels[0];
  const accommodationPricePerNight = selectedHotel ? Number(selectedHotel.pricePerNight) || 0 : 0;
  const accommodationTotalCost = accommodationPricePerNight * (durationNights || 1);
  const totalPrice = baseTotal !== null ? baseTotal + accommodationTotalCost : null;
  const priceLabel = perPersonPrice && perPersonPrice > 0 ? `$${perPersonPrice}` : "Contact for pricing";

  const updateField = (e) => {
    const { name, value } = e.target;
    if (name === "people") {
      const numeric = Math.max(1, Number(value) || 1);
      setForm((prev) => ({ ...prev, [name]: numeric }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setShowPaymentChoice(false);
    setLastBookingId(null);
    setForm(initialForm);
    setAccommodationMode("none");
    setSelectedLocation("");
    setSelectedStarRating("");
    setSelectedHotelId(null);
    onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.people || Number(form.people) < 1) {
      alert("Please fill name, email, phone, and at least 1 person.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost("/package-bookings", {
        packageId: pkg._id,
        packageName: pkg.name,
        name: form.name,
        email: form.email,
        phone: form.phone,
        preferredStartDate: form.preferredStartDate,
        people: Number(form.people) || 1,
        notes: form.notes,
        accommodationMode,
        selectedLocation,
        selectedStarRating,
        partnerHotelId: selectedHotel?._id,
        accommodationPricePerNight,
        accommodationNights: durationNights || 1,
        accommodationTotalCost,
        totalAmount: totalPrice || undefined,
      });
      setLastBookingId(res?.data?._id || res?._id || null);
      setShowPaymentChoice(true);
    } catch (err) {
      alert(err?.message || "Failed to submit booking.");
    }
    setLoading(false);
  };

  const payWithStripe = async () => {
    if (!lastBookingId) return;
    try {
      const res = await apiPost("/payments/stripe/checkout", { bookingId: lastBookingId, type: "package" });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      alert(err?.message || "Unable to start Stripe checkout.");
    }
  };

  const handlePayLater = () => {
    alert("Booking placed successfully. Pay later to confirm.");
    handleClose();
  };

  const renderAccommodation = () => (
    <div className="space-y-3 border border-[#dfe8e2] rounded-xl p-4 bg-[#f9fcf8]">
      <div className="flex flex-wrap gap-2">
        {["none", "location", "star", "locationAndStar"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAccommodationMode(mode)}
            className={`px-3 py-2 rounded-full text-sm border ${
              accommodationMode === mode
                ? "bg-[#2F8D59] text-white border-[#2F8D59]"
                : "bg-white text-[#10231a] border-[#dfe8e2]"
            }`}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      {accommodationMode !== "none" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(accommodationMode === "location" || accommodationMode === "locationAndStar") && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#10231a]">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setSelectedHotelId(null);
                  }}
                  className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm"
                >
                  <option value="">Choose location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(accommodationMode === "star" || accommodationMode === "locationAndStar") && (
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#10231a]">Hotel quality</label>
                <select
                  value={selectedStarRating}
                  onChange={(e) => {
                    setSelectedStarRating(e.target.value);
                    setSelectedHotelId(null);
                  }}
                  className="w-full rounded-xl border border-[#dfe8e2] px-3 py-2 text-sm"
                >
                  <option value="">Choose rating</option>
                  {starOptions.map((star) => (
                    <option key={star} value={star}>
                      {star} ★
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredHotels.length === 0 ? (
            <div className="text-sm text-[#4c5f68] bg-white border border-[#dfe8e2] rounded-lg px-3 py-2">
              No partner hotels match this selection yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredHotels.map((hotel) => {
                const active = selectedHotelId === hotel._id;
                return (
                  <button
                    key={hotel._id}
                    type="button"
                    onClick={() => setSelectedHotelId(hotel._id)}
                    className={`w-full text-left border rounded-lg px-4 py-3 transition ${
                      active ? "border-[#2F8D59] bg-[#e6f2ea]" : "border-[#dfe8e2] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[#10231a]">
                          {hotel.location} {hotel.starRating ? `· ${hotel.starRating}★` : ""}
                        </p>
                        <p className="text-sm text-[#4c5f68]">USD {hotel.pricePerNight} / night</p>
                      </div>
                      <span
                        className={`h-4 w-4 rounded-full border ${
                          active ? "border-[#2F8D59] bg-[#2F8D59]" : "border-[#dfe8e2]"
                        }`}
                        aria-hidden
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

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

  if (!pkg) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-10" onClick={handleClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#dfe8e2] p-6 md:p-8 space-y-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#2F8D59] font-semibold">Package Booking</p>
            <h3 className="text-xl font-semibold text-[#10231a]">{pkg?.name}</h3>
            <p className="text-sm text-[#4c5f68]">
              {pkg?.duration ? `${pkg.duration} days` : ""} · {priceLabel}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-sm text-[#2F8D59] font-semibold"
            aria-label="Close booking"
          >
            ✕
          </button>
        </div>

        {showPaymentChoice ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Price per person</p>
                <p className="font-semibold text-[#10231a]">{perPersonPrice ? `$${perPersonPrice}` : "—"}</p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Accommodation</p>
                <p className="font-semibold text-[#10231a]">
                  {accommodationMode === "none" ? "No accommodation" : `$${accommodationPricePerNight} / night`}
                </p>
              </div>
              <div className="rounded-xl border-2 border-[#2F8D59] bg-[#e6f2ea] px-4 py-3">
                <p className="text-[#2F8D59] font-semibold">Total amount</p>
                <p className="text-lg font-bold text-[#10231a]">
                  {totalPrice ? `$${totalPrice}` : "—"}
                </p>
              </div>
            </div>

            {accommodationMode !== "none" && selectedHotel && (
              <div className="text-sm text-[#10231a] bg-[#f5f8f4] border border-[#dfe8e2] rounded-xl px-4 py-3">
                <p className="font-semibold text-[#2F8D59]">Partner hotel</p>
                <p>
                  {selectedHotel.location} {selectedHotel.starRating ? `· ${selectedHotel.starRating}★` : ""} — $
                  {selectedHotel.pricePerNight}/night × {durationNights} night{durationNights === 1 ? "" : "s"} = $
                  {accommodationTotalCost}
                </p>
              </div>
            )}

            {disclaimer}

            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#10231a]">Choose how you want to pay</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={payWithStripe}
                  className="flex-1 inline-flex justify-center items-center rounded-full bg-[#2F8D59] text-white text-sm font-semibold px-4 py-3 hover:bg-[#27784c] transition"
                >
                  Pay now with Stripe
                </button>
                <button
                  onClick={handlePayLater}
                  className="flex-1 inline-flex justify-center items-center rounded-full border border-[#dfe8e2] text-[#10231a] text-sm font-semibold px-4 py-3 hover:bg-[#f5f8f4] transition"
                >
                  Pay later
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Full Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={updateField}
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={updateField}
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8e2]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Phone Number</label>
                <input
                  name="phone"
                  required
                  value={form.phone}
                  onChange={updateField}
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Selected Package</label>
                <input
                  value={pkg?.name || "Health Package"}
                  readOnly
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] bg-[#f5f8f4]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Preferred Start Date</label>
                <input
                  type="date"
                  name="preferredStartDate"
                  value={form.preferredStartDate}
                  onChange={updateField}
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Number of persons *</label>
                <input
                  type="number"
                  min={1}
                  name="people"
                  value={form.people}
                  onChange={updateField}
                  required
                  className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[#10231a] font-semibold">Partner hotel accommodation</label>
              {renderAccommodation()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Price per person</p>
                <p className="font-semibold text-[#10231a]">{perPersonPrice ? `$${perPersonPrice}` : "—"}</p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Duration</p>
                <p className="font-semibold text-[#10231a]">{durationNights} night{durationNights === 1 ? "" : "s"}</p>
              </div>
              <div className="rounded-xl border-2 border-[#2F8D59] bg-[#e6f2ea] px-4 py-3">
                <p className="text-[#2F8D59] font-semibold">Total amount</p>
                <p className="text-lg font-bold text-[#10231a]">
                  {totalPrice ? `$${totalPrice}` : "—"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#10231a] font-semibold">Additional Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={updateField}
                className="w-full rounded-xl border border-[#dfe8e2] px-4 py-3 text-sm text-[#10231a] focus:outline-none focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] resize-none"
                placeholder="Share any preferences or health goals"
              />
            </div>

            {disclaimer}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-full border border-[#dfe8e2] text-[#10231a] hover:bg-[#f5f8f4] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-full bg-[#2F8D59] text-white text-sm font-semibold hover:bg-[#27784c] transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Book Package"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
