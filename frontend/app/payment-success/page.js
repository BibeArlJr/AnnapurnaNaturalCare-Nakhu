"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const type = searchParams.get("type") || "package";
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");
  const typeLabel =
    type === "retreat"
      ? "Retreat booking"
      : type === "health_program"
      ? "Health program booking"
      : type === "course"
      ? "Course booking"
      : "Health package";

  useEffect(() => {
    if (!bookingId) {
      setStatus("error");
      setError("Missing booking reference.");
      return;
    }
    apiPost("/payments/mark-status", { bookingId, type, status: "paid" })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err?.message || "Failed to confirm payment.");
      });
  }, [bookingId, type]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9f7] px-4">
      <div className="max-w-lg w-full bg-white border border-[#e1ebe4] rounded-2xl shadow-sm p-6 space-y-3 text-center">
        <h1 className="text-2xl font-semibold text-[#10231a]">Payment successful</h1>
        {status === "processing" && <p className="text-[#4c5f68]">Confirming your booking...</p>}
        {status === "success" && (
          <p className="text-[#2F8D59] font-medium">Payment confirmed — your booking is now confirmed.</p>
        )}
        {status === "error" && <p className="text-red-500 text-sm">{error}</p>}
        <div className="text-sm text-[#4c5f68]">
          {typeLabel} reference: {bookingId || "N/A"}
        </div>
      </div>
    </div>
  );
}
