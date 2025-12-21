"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", message: "" });
    try {
      await apiPost("/contact", form);
      setStatus({ type: "success", message: "Message sent successfully. We will get back to you soon." });
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Failed to send message. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#cfe8d6] shadow-sm rounded-2xl p-6 md:p-8 space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Full Name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Enter your full name"
        />
        <Field
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Phone (optional)"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="Enter your phone"
        />
        <Field
          label="Subject"
          required
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="How can we help?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#10231a]">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none resize-none"
          placeholder="Share your concern or question"
          required
        />
      </div>

      {status.message && (
        <div
          className={`text-sm rounded-lg px-3 py-2 ${
            status.type === "success" ? "bg-[#e8f5ef] text-[#1f6b45]" : "bg-[#fdecec] text-[#b42318]"
          }`}
        >
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full md:w-auto inline-flex items-center justify-center rounded-full bg-[#2F8D59] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#27784c] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

function Field({ label, required, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#10231a]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        required={required}
        className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
        {...props}
      />
    </div>
  );
}
