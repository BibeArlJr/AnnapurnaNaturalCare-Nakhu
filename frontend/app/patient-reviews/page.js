"use client";

import { useEffect, useState } from "react";
import ReviewCard from "@/components/reviews/ReviewCard";
import { apiGet } from "@/lib/api";

export default function PatientReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiGet("/patient-reviews?status=published");
        setReviews(res?.data || res || []);
      } catch (err) {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10 space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">Patient Reviews</p>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Stories from our patients</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Hear directly from patients about their healing journey with Annapurna Nature Cure Hospital.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-slate-500">No reviews available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
