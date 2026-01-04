"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

const inputBase = "w-full rounded-xl border px-4 py-3 text-sm focus:outline-none transition";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  preferredStartDate: "",
  numberOfPeople: 1,
  additionalNotes: "",
};

export default function RetreatBookingModal({ program, open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [lastBookingId, setLastBookingId] = useState(null);
  const [partnerHotels, setPartnerHotels] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStarRating, setSelectedStarRating] = useState("");
  const [accommodationChoice, setAccommodationChoice] = useState("hospital_premium");

  const nights = useMemo(() => {
    return program?.durationDays || program?.duration || 1;
  }, [program?.duration, program?.durationDays]);

  const hospitalPremiumPrice =
    program?.accommodation?.hospitalPremiumPrice ||
    (program?.accommodationPricing || []).find((p) => p.key === "hospital_premium")?.pricePerPersonUSD ||
    0;
  const priceLabel = useMemo(() => {
    return program?.pricePerPersonUSD ? `$${program.pricePerPersonUSD} per person` : "Contact for pricing";
  }, [program]);

  const perPersonPrice = program?.pricePerPersonUSD ? Number(program.pricePerPersonUSD) : null;
  const retreatSubtotal = perPersonPrice ? perPersonPrice * (Number(form.numberOfPeople) || 1) : null;

  const locationOptions = useMemo(
    () => Array.from(new Set(partnerHotels.map((h) => h.location).filter(Boolean))),
    [partnerHotels]
  );
  const starOptions = useMemo(
    () => Array.from(new Set(partnerHotels.map((h) => h.starRating).filter(Boolean))).sort(),
    [partnerHotels]
  );

  const matchedHotel = useMemo(() => {
    if (accommodationChoice !== "partner_hotel") return null;
    const filtered = partnerHotels.filter(
      (h) =>
        (!selectedLocation || h.location === selectedLocation) &&
        (!selectedStarRating || Number(h.starRating) === Number(selectedStarRating))
    );
    if (!filtered.length) return null;
    return filtered.reduce((prev, curr) =>
      Number(curr.pricePerNight || 0) < Number(prev.pricePerNight || 0) ? curr : prev
    );
  }, [accommodationChoice, partnerHotels, selectedLocation, selectedStarRating]);

  const accommodationPricePerNight = matchedHotel ? Number(matchedHotel.pricePerNight) || 0 : 0;
  // Total = price per person per night * nights * people
  const partnerHotelTotal = accommodationPricePerNight * (nights || 1) * (Number(form.numberOfPeople) || 1);
  const hospitalTotal = (Number(hospitalPremiumPrice) || 0) * (nights || 1) * (Number(form.numberOfPeople) || 1);
  const accommodationTotalCost =
    accommodationChoice === "partner_hotel" ? partnerHotelTotal : accommodationChoice === "hospital_premium" ? hospitalTotal : 0;
  const totalPrice = retreatSubtotal !== null ? retreatSubtotal + accommodationTotalCost : null;
  const noPartnerMatch =
    accommodationChoice === "partner_hotel" &&
    Boolean(selectedLocation) &&
    Boolean(selectedStarRating) &&
    !matchedHotel;
  const accommodationLabel =
    accommodationChoice === "hospital_premium"
      ? "Hospital premium stay"
      : accommodationChoice === "partner_hotel"
      ? matchedHotel
        ? `${matchedHotel.location}${matchedHotel.starRating ? ` · ${matchedHotel.starRating}★` : ""}`
        : "Partner hotel"
      : "Own arrangement";

  useEffect(() => {
    if (!open) return;
    const loadHotels = async () => {
      try {
        const res = await apiGet("/partner-hotels/public");
        const list = res?.data || res || [];
        setPartnerHotels(list);
        if (list.length && accommodationChoice === "partner_hotel") {
          setSelectedLocation(list[0].location || "");
          setSelectedStarRating(list[0].starRating || "");
        }
      } catch (err) {
        console.error("Partner hotels load error:", err);
      }
    };
    loadHotels();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (accommodationChoice !== "partner_hotel") {
      setSelectedLocation("");
      setSelectedStarRating("");
    } else if (!selectedLocation && locationOptions.length) {
      setSelectedLocation(locationOptions[0]);
    } else if (!selectedStarRating && starOptions.length) {
      setSelectedStarRating(starOptions[0]);
    }
  }, [accommodationChoice, locationOptions, selectedLocation, selectedStarRating, starOptions]);

  if (!open || !program) return null;

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 7) next.phone = "Phone must be at least 7 digits";
    if (!form.country.trim()) next.country = "Country is required";
    if (!form.preferredStartDate) next.preferredStartDate = "Preferred start date is required";
    else {
      const sel = new Date(form.preferredStartDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(sel.getTime()) || sel < today) next.preferredStartDate = "Choose today or a future date";
    }
    const num = Number(form.numberOfPeople);
    if (!num || num < 1) next.numberOfPeople = "At least 1 person required";

    if (accommodationChoice === "partner_hotel") {
      if (!selectedLocation) next.accommodation = "Choose a location";
      else if (!selectedStarRating) next.accommodation = "Choose a hotel quality";
      else if (!matchedHotel) next.accommodation = "No partner hotel matches this selection";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextVal = value;
    if (name === "numberOfPeople") {
      const num = Math.max(1, Number(value) || 1);
      nextVal = num;
    }
    clearError(name);
    setForm((prev) => ({ ...prev, [name]: nextVal }));
  };

  const handleClose = () => {
    setErrors({});
    setForm(initialForm);
    setShowPaymentChoice(false);
    setLastBookingId(null);
    setSelectedLocation("");
    setSelectedStarRating("");
    setAccommodationChoice("hospital_premium");
    onClose?.();
  };

  const submit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    clearError("accommodation");
    setSubmitting(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${base}/api/retreat-bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program._id,
          programTitle: program.title,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          preferredStartDate: form.preferredStartDate,
          numberOfPeople: Number(form.numberOfPeople) || 1,
          additionalNotes: form.additionalNotes,
          accommodationChoice,
          hotelMode: accommodationChoice === "partner_hotel" ? "locationAndStar" : "none",
          hotelLocation: accommodationChoice === "partner_hotel" ? matchedHotel?.location : undefined,
          hotelStarRating: accommodationChoice === "partner_hotel" ? matchedHotel?.starRating : undefined,
          partnerHotelId: accommodationChoice === "partner_hotel" ? matchedHotel?._id : undefined,
          accommodationMode: accommodationChoice === "partner_hotel" ? "locationAndStar" : accommodationChoice,
          accommodationSelected: accommodationChoice !== "own_arrangement",
          accommodationPricePerNight:
            accommodationChoice === "partner_hotel" ? accommodationPricePerNight : hospitalPremiumPrice,
          accommodationNights: nights || 1,
          accommodationTotalCost: accommodationTotalCost,
          totalPriceUSD: totalPrice || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getApiErrorMessage({ data }, "Failed to book retreat"));
      }
      setLastBookingId(data?.data?._id || data?.bookingId || null);
      setErrors({});
      setShowPaymentChoice(true);
    } catch (err) {
      alert(err.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const payWithStripe = async () => {
    if (!lastBookingId) return;
    try {
      const res = await apiPost("/payments/stripe/checkout", { bookingId: lastBookingId, type: "retreat" });
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Unable to start Stripe checkout"));
    }
  };

  const handlePayLater = () => {
    alert("Booking placed successfully. Pay later to confirm.");
    handleClose();
  };

  const fieldError = (key) =>
    errors[key]
      ? `${inputBase} border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white`
      : `${inputBase} border-[#dfe8e2] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] bg-white`;

  const renderAccommodationPicker = () => {
    if (accommodationChoice !== "partner_hotel") return null;
    return (
      <div className="space-y-3 border border-[#dfe8e2] rounded-xl p-4 bg-[#f9fcf8]">
        {partnerHotels.length === 0 ? (
          <div className="text-sm text-[#4c5f68] bg-white border border-[#dfe8e2] rounded-lg px-3 py-2">
            No partner hotels available right now.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#10231a]">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    clearError("accommodation");
                    setSelectedLocation(e.target.value);
                  }}
                  className={`${inputBase} bg-white ${
                    noPartnerMatch ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-[#dfe8e2]"
                  }`}
                >
                  <option value="">Choose location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#10231a]">Hotel quality</label>
                <select
                  value={selectedStarRating}
                  onChange={(e) => {
                    clearError("accommodation");
                    setSelectedStarRating(e.target.value);
                  }}
                  className={`${inputBase} bg-white ${
                    noPartnerMatch ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-[#dfe8e2]"
                  }`}
                >
                  <option value="">Choose rating</option>
                  {starOptions.map((star) => (
                    <option key={star} value={star}>
                      {star} ★
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-[#10231a] bg-white border border-[#dfe8e2] rounded-lg px-3 py-2 space-y-1">
              {matchedHotel ? (
                <>
                  <p>
                    Price per night: <span className="font-semibold">USD {matchedHotel.pricePerNight}</span>
                  </p>
                  <p>
                    Nights: {nights} • Total: <span className="font-semibold">USD {partnerHotelTotal}</span>
                  </p>
                </>
              ) : noPartnerMatch ? (
                <p className="text-red-600">
                  No partner hotel found for the selected location and hotel category. Please choose another option.
                </p>
              ) : (
                <p className="text-[#4c5f68]">Select location and hotel quality to see pricing.</p>
              )}
            </div>
          </>
        )}
        {errors.accommodation && <p className="text-xs text-red-500">{errors.accommodation}</p>}
      </div>
    );
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-10" onClick={handleClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#dfe8e2] p-6 md:p-8 space-y-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-[#2F8D59] font-semibold">Book this retreat program</p>
            <h3 className="text-xl font-semibold text-[#10231a]">{program.title}</h3>
            <div className="text-sm text-[#4c5f68] space-y-0.5">
              <p>Type: {program.programType === "inside_valley" ? "Inside Valley" : "Outside Valley"}</p>
              {program.durationDays ? <p>Duration: {program.durationDays} days</p> : null}
              <p>Price: {priceLabel}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-sm text-[#2F8D59] font-semibold" aria-label="Close booking">
            ✕
          </button>
        </div>

        {showPaymentChoice ? (
          <div className="space-y-4 border-t border-[#e6f0eb] pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Retreat price / person</p>
                <p className="font-semibold text-[#10231a]">{perPersonPrice ? `$${perPersonPrice}` : "—"}</p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Accommodation</p>
                <p className="font-semibold text-[#10231a]">
                  {accommodationChoice === "hospital_premium"
                    ? hospitalPremiumPrice
                      ? `$${hospitalPremiumPrice} / night`
                      : "Hospital premium"
                    : accommodationChoice === "partner_hotel"
                    ? matchedHotel
                      ? `$${matchedHotel.pricePerNight} / night`
                      : "Partner hotel"
                    : "Own arrangement"}
                </p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Number of people</p>
                <p className="font-semibold text-[#10231a]">{form.numberOfPeople}</p>
              </div>
              <div className="rounded-xl border-2 border-[#2F8D59] bg-[#e6f2ea] px-4 py-3">
                <p className="text-[#2F8D59] font-semibold">Total amount</p>
                <p className="text-lg font-bold text-[#10231a]">{totalPrice !== null ? `$${totalPrice}` : "—"}</p>
              </div>
            </div>
            <div className="text-sm text-[#10231a] bg-white border border-[#dfe8e2] rounded-xl px-4 py-3 space-y-1">
              <p>Base program cost: {retreatSubtotal !== null ? `$${retreatSubtotal}` : "—"}</p>
              <p>
                Accommodation ({accommodationLabel}): {accommodationTotalCost ? `$${accommodationTotalCost}` : "No extra cost"}
              </p>
              <p className="font-semibold">Grand total: {totalPrice !== null ? `$${totalPrice}` : "—"}</p>
            </div>

            {accommodationChoice === "partner_hotel" && matchedHotel && (
              <div className="text-sm text-[#10231a] bg-[#f5f8f4] border border-[#dfe8e2] rounded-xl px-4 py-3">
                <p className="font-semibold text-[#2F8D59]">Partner hotel</p>
                <p>
                  {matchedHotel.location} {matchedHotel.starRating ? `· ${matchedHotel.starRating}★` : ""} — $
                  {matchedHotel.pricePerNight}/night × {nights} night{nights === 1 ? "" : "s"} = $
                  {accommodationTotalCost}
                </p>
              </div>
            )}
            {accommodationChoice === "hospital_premium" && (
              <div className="text-sm text-[#10231a] bg-[#f5f8f4] border border-[#dfe8e2] rounded-xl px-4 py-3">
                <p className="font-semibold text-[#2F8D59]">Hospital premium</p>
                <p>
                  ${hospitalPremiumPrice || 0} / night × {nights} night{nights === 1 ? "" : "s"} × {form.numberOfPeople} people = $
                  {hospitalTotal}
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
                <label className="text-sm text-[#10231a] font-semibold">Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} className={fieldError("fullName")} />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={fieldError("email")} />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} className={fieldError("phone")} />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Country *</label>
                <input name="country" value={form.country} onChange={handleChange} className={fieldError("country")} />
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Preferred Start Date *</label>
                <input
                  type="date"
                  name="preferredStartDate"
                  value={form.preferredStartDate}
                  onChange={handleChange}
                  className={fieldError("preferredStartDate")}
                />
                {errors.preferredStartDate && <p className="text-xs text-red-500">{errors.preferredStartDate}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[#10231a] font-semibold">Number of People *</label>
                <input
                  type="number"
                  min={1}
                  name="numberOfPeople"
                  value={form.numberOfPeople}
                  onChange={handleChange}
                  className={fieldError("numberOfPeople")}
                />
                {errors.numberOfPeople && <p className="text-xs text-red-500">{errors.numberOfPeople}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-[#10231a] font-semibold">Accommodation choice</p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 rounded-xl border border-[#dfe8e2] px-4 py-3 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="accommodationChoice"
                    value="hospital_premium"
                    checked={accommodationChoice === "hospital_premium"}
                    onChange={() => {
                      setAccommodationChoice("hospital_premium");
                      setSelectedLocation("");
                      setSelectedStarRating("");
                      clearError("accommodation");
                    }}
                    className="mt-1"
                  />
                  <div className="text-sm text-[#10231a]">
                    <p className="font-semibold">Hospital premium stay</p>
                    <p className="text-[#4c5f68]">
                      {hospitalPremiumPrice
                        ? `$${hospitalPremiumPrice} / night × ${nights} night${nights === 1 ? "" : "s"}`
                        : "Price not set"}
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-[#dfe8e2] px-4 py-3 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="accommodationChoice"
                    value="partner_hotel"
                    checked={accommodationChoice === "partner_hotel"}
                    onChange={() => {
                      setAccommodationChoice("partner_hotel");
                      clearError("accommodation");
                    }}
                    className="mt-1"
                  />
                  <div className="text-sm text-[#10231a]">
                    <p className="font-semibold">Partner hotel accommodation</p>
                    <p className="text-[#4c5f68]">
                  {matchedHotel
                    ? `USD ${matchedHotel.pricePerNight} / night × ${nights} night${nights === 1 ? "" : "s"} = USD ${partnerHotelTotal}`
                    : "Choose a partner hotel option"}
                </p>
              </div>
            </label>

                <label className="flex items-start gap-3 rounded-xl border border-[#dfe8e2] px-4 py-3 bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="accommodationChoice"
                    value="own_arrangement"
                    checked={accommodationChoice === "own_arrangement"}
                    onChange={() => {
                      setAccommodationChoice("own_arrangement");
                      setSelectedLocation("");
                      setSelectedStarRating("");
                      clearError("accommodation");
                    }}
                    className="mt-1"
                  />
                  <div className="text-sm text-[#10231a]">
                    <p className="font-semibold">Own arrangement</p>
                    <p className="text-[#4c5f68]">No additional accommodation charges.</p>
                  </div>
                </label>
              </div>

              {renderAccommodationPicker()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Retreat price / person</p>
                <p className="font-semibold text-[#10231a]">{perPersonPrice ? `$${perPersonPrice}` : "—"}</p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Accommodation</p>
                <p className="font-semibold text-[#10231a]">
                  {accommodationChoice === "hospital_premium"
                    ? hospitalPremiumPrice
                      ? `$${hospitalPremiumPrice} / night`
                      : "Hospital premium"
                    : accommodationChoice === "partner_hotel"
                    ? matchedHotel
                      ? `$${matchedHotel.pricePerNight} / night`
                      : "Partner hotel"
                    : "Own arrangement"}
                </p>
              </div>
              <div className="rounded-xl border border-[#dfe8e2] bg-[#f5f8f4] px-4 py-3">
                <p className="text-[#4c5f68]">Duration</p>
                <p className="font-semibold text-[#10231a]">{nights} night{nights === 1 ? "" : "s"}</p>
              </div>
              <div className="rounded-xl border-2 border-[#2F8D59] bg-[#e6f2ea] px-4 py-3">
                <p className="text-[#2F8D59] font-semibold">Total amount</p>
                <p className="text-lg font-bold text-[#10231a]">{totalPrice !== null ? `$${totalPrice}` : "—"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#10231a] font-semibold">Additional Notes</label>
              <textarea
                name="additionalNotes"
                rows={3}
                value={form.additionalNotes}
                onChange={handleChange}
                className={`${inputBase} border-[#dfe8e2] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] bg-white resize-none`}
                placeholder="Share any preferences or needs"
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
                disabled={submitting || noPartnerMatch}
                className="px-5 py-2 rounded-full bg-[#2F8D59] text-white text-sm font-semibold hover:bg-[#27784c] transition disabled:opacity-60"
              >
                {submitting ? "Booking..." : "Book Retreat"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
