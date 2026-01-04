"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { apiGet, apiPatch } from "@/lib/api";
import { useRouter } from "next/navigation";

const statusColors = {
  paid: "bg-emerald-900/70 text-emerald-200",
  pending: "bg-amber-900/70 text-amber-200",
  cancelled: "bg-red-900/70 text-red-200",
  failed: "bg-red-900/70 text-red-200",
  refunded: "bg-slate-800 text-slate-200",
};

function activeFiltersCount(filters) {
  let count = 0;
  if (filters.status) count += 1;
  if (filters.bookingType) count += 1;
  if (filters.email) count += 1;
  if (filters.startDate || filters.endDate) count += 1;
  return count;
}

function shortId(id) {
  if (!id || typeof id !== "string") return "—";
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

const renderValue = (val) => (val === null || val === undefined || val === "" ? "—" : val);

const formatMoney = (val) => `$${Number(val || 0).toFixed(2)}`;
const formatDate = (d) => (d ? dayjs(d).format("MMM D, YYYY") : "—");
const typeLabel = (t) => {
  if (t === "health" || t === "package") return "Health Package";
  if (t === "retreat") return "Retreat Program";
  if (t === "health_program") return "Health Program";
  if (t === "course") return "Course";
  return "—";
};

const numberToWords = (num) => {
  if (num === undefined || num === null || isNaN(num)) return "—";
  const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  const toWords = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return `${tens[Math.floor(n/10)]}${n%10 ? "-" + ones[n%10] : ""}`;
    if (n < 1000) return `${ones[Math.floor(n/100)]} hundred${n%100 ? " " + toWords(n%100) : ""}`;
    if (n < 1000000) return `${toWords(Math.floor(n/1000))} thousand${n%1000 ? " " + toWords(n%1000) : ""}`;
    return `${n}`;
  };
  const integer = Math.floor(num);
  const cents = Math.round((num - integer) * 100);
  const main = toWords(integer) || "zero";
  const centPart = cents ? ` and ${toWords(cents)} cents` : "";
  return `${main} dollars${centPart}`;
};

function buildReceipt(payment, booking, product) {
  const rows = [];
  const firstNumber = (...vals) => {
    for (const v of vals) {
      const n = Number(v);
      if (!isNaN(n) && n > 0) return n;
    }
    return 0;
  };
  const qty =
    Number(
      booking?.numberOfPeople ||
        booking?.peopleCount ||
        booking?.participants ||
        payment?.metadata?.numberOfPeople ||
        1
    ) || 1;
  const rawType = payment?.bookingType;
  const type =
    rawType === "retreat_program"
      ? "retreat"
      : rawType === "health_program"
      ? "health_program"
      : rawType === "course"
      ? "course"
      : rawType === "health" || rawType === "package"
      ? "health"
      : rawType;
  const paymentTotal = Number(payment?.amount) || 0;
  const bookingTotal =
    Number(
      booking?.totalPriceUSD ||
        booking?.totalPrice ||
        payment?.metadata?.totalPriceUSD ||
        payment?.metadata?.totalPrice
    ) || 0;

  if (type === "retreat") {
    const programTitle =
      booking?.programTitle ||
      booking?.program?.title ||
      product?.title ||
      payment?.metadata?.programTitle ||
      payment?.metadata?.programName;
    const programUnit = firstNumber(
      product?.basePricePerPerson,
      product?.pricePerPersonUSD,
      product?.retreatPricePerPerson,
      booking?.program?.pricePerPerson,
      booking?.program?.pricePerPersonUSD,
      booking?.program?.basePricePerPerson,
      booking?.program?.basePrice,
      booking?.pricePerPersonUSD,
      booking?.retreatPricePerPerson,
      booking?.pricePerPerson,
      booking?.retreatPricePerPersonUSD,
      booking?.programPricePerPerson,
      payment?.metadata?.retreatPricePerPerson
    );
    if (programUnit) {
      rows.push({
        label: "Retreat Program",
        sub: programTitle || "—",
        qty,
        unit: programUnit,
        total: programUnit * qty,
      });
    }
    const accomKey = booking?.accommodationChoice || booking?.accommodationType || booking?.accommodation?.key;
    const accomLabel =
      booking?.accommodation?.label ||
      booking?.accommodationLabel ||
      accomKey ||
      product?.accommodationPricing?.find((a) => a.key === accomKey)?.label ||
      payment?.metadata?.accommodationLabel;
    const accomUnitPerNight =
      firstNumber(
        payment?.metadata?.accommodationPricePerNight,
        payment?.metadata?.accommodationPricePerPerson,
        payment?.metadata?.accommodationPricePerPersonUSD,
        booking?.hotelPricePerNight,
        booking?.accommodationPricePerNight,
        booking?.accommodationPricePerPerson,
        booking?.accommodationPricePerPersonUSD,
        accomKey && product?.accommodationPricing?.length
          ? product.accommodationPricing.find((a) => a.key === accomKey)?.pricePerPersonUSD
          : 0
      );
    const accomNights =
      Number(booking?.accommodationNights || booking?.hotelNights || payment?.metadata?.accommodationNights) ||
      Number(product?.durationDays || product?.duration) ||
      1;
    if (accomUnitPerNight) {
      rows.push({
        label: "Accommodation",
        sub: accomLabel || "Selected option",
        qty,
        unit: accomUnitPerNight,
        total: accomUnitPerNight * accomNights * qty,
      });
    }
  } else if (type === "health_program") {
    const programTitle =
      booking?.programTitle || booking?.program?.title || payment?.metadata?.programTitle || "Health Program";
    const unit = firstNumber(
      booking?.pricePerPerson,
      booking?.pricePerPersonUSD,
      payment?.metadata?.pricePerPerson,
      payment?.metadata?.pricePerPersonUSD
    );
    if (unit) {
      rows.push({
        label: "Health Program",
        sub: programTitle,
        qty,
        unit,
        total: unit * qty,
      });
    }
  } else if (type === "course") {
    const courseTitle =
      booking?.courseTitle || booking?.course?.title || payment?.metadata?.courseTitle || "Course";
    const unit = firstNumber(
      booking?.pricePerPerson,
      payment?.metadata?.pricePerPerson,
      booking?.pricePerPersonUSD,
      payment?.metadata?.pricePerPersonUSD
    );
    if (unit) {
      rows.push({
        label: "Course",
        sub: courseTitle,
        qty,
        unit,
        total: unit * qty,
      });
    }
  } else {
    const pkgName = booking?.packageName || product?.name;
    const unit =
      booking?.pricePerPerson ||
      booking?.pricePerPersonUSD ||
      product?.price ||
      product?.pricePerPersonUSD ||
      payment?.metadata?.pricePerPerson ||
      (payment?.metadata?.packageSubtotal && qty ? Number(payment.metadata.packageSubtotal) / qty : 0) ||
      (payment?.amount && qty ? payment.amount / qty : 0) ||
      0;
    if (unit) {
      rows.push({
        label: "Health Package",
        sub: pkgName || "—",
        qty,
        unit,
        total: unit * qty,
      });
    }
  }

  if (rows.length === 0 && (paymentTotal || bookingTotal)) {
    const fallbackTotal = paymentTotal || bookingTotal;
    rows.push({
      label: type === "retreat" ? "Retreat Program" : type === "health" ? "Health Package" : "Booking",
      sub: booking?.programTitle || product?.title || booking?.packageName || product?.name || "Booking",
      qty,
      unit: fallbackTotal / qty,
      total: fallbackTotal,
    });
  }

  const subtotal =
    rows.reduce((sum, r) => sum + (Number(r.total) || 0), 0) ||
    paymentTotal ||
    payment?.metadata?.subtotal ||
    bookingTotal ||
    0;

  return { rows, subtotal, qty };
}

export default function BillingAdminPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    bookingType: "",
    email: "",
    startDate: "",
    endDate: "",
  });
  const [totals, setTotals] = useState({ paidAmount: 0, pendingAmount: 0, count: 0 });
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [bookingMissing, setBookingMissing] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [downloadChoiceOpen, setDownloadChoiceOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const bookingSectionRef = useRef(null);
  const productSectionRef = useRef(null);
  const router = useRouter();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet(`/admin/payments${queryString ? `?${queryString}` : ""}`);
      setPayments(res?.data || res || []);
      setTotals(res?.totals || { paidAmount: 0, pendingAmount: 0, count: 0 });
    } catch (err) {
      console.error("Payments load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [queryString]);

  const last30Revenue = useMemo(() => {
    const cutoff = dayjs().subtract(30, "day");
    return payments
      .filter((p) => p.status === "paid" && p.createdAt && dayjs(p.createdAt).isAfter(cutoff))
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const updateStatus = async (payment, status) => {
    setUpdating(true);
    try {
      await apiPatch(`/admin/payments/${payment._id}/status`, { status });
      await load();
    } catch (err) {
      alert(err?.message || "Failed to update payment");
    } finally {
      setUpdating(false);
    }
  };

  const openDetail = async (payment) => {
    setDetailLoading(true);
    setSelected(payment);
    setBookingData(null);
    setProductData(null);
    setBookingMissing(false);
    try {
      const res = await apiGet(`/admin/payments/${payment._id}`);
      const fullPayment = res?.data || res || payment;
      setSelected(fullPayment);

      if (fullPayment.bookingId) {
        try {
          if (fullPayment.bookingType === "health") {
            const list = await apiGet("/package-bookings");
            const found = (list?.data || list || []).find((b) => b._id === fullPayment.bookingId);
            if (found) {
              setBookingData(found);
            } else {
              setBookingMissing(true);
            }
            if (found?.packageId) {
              const pkg = await apiGet(`/packages/${found.packageId}`).catch(() => null);
              if (pkg?.data || pkg?.name) setProductData(pkg.data || pkg);
            }
          } else if (fullPayment.bookingType === "retreat") {
            const list = await apiGet("/retreat-bookings");
            const found = (list?.data || list || []).find((b) => b._id === fullPayment.bookingId);
            if (found) {
              setBookingData(found);
            } else {
              setBookingMissing(true);
            }
            const programId = found?.programId || fullPayment.metadata?.programId;
            if (programId) {
              const prog = await apiGet(`/retreat-programs/${programId}`).catch(() => null);
              if (prog?.data || prog?.title) setProductData(prog.data || prog);
            }
          } else if (fullPayment.bookingType === "health_program") {
            const list = await apiGet("/health-program-bookings");
            const found = (list?.data || list || []).find((b) => b._id === fullPayment.bookingId);
            if (found) {
              setBookingData(found);
            } else {
              setBookingMissing(true);
            }
            const programId = found?.programId || fullPayment.metadata?.programId;
            if (programId) {
              const prog = await apiGet(`/health-programs/${programId}`).catch(() => null);
              if (prog?.data || prog?.title) setProductData(prog.data || prog);
            }
          } else if (fullPayment.bookingType === "course") {
            const list = await apiGet("/course-bookings");
            const found = (list?.data || list || []).find((b) => b._id === fullPayment.bookingId);
            if (found) {
              setBookingData(found);
            } else {
              setBookingMissing(true);
            }
            const courseId = found?.courseId || fullPayment.metadata?.courseId;
            if (courseId) {
              const course = await apiGet(`/courses/${courseId}`).catch(() => null);
              if (course?.data || course?.title) setProductData(course.data || course);
            }
          }
        } catch (err) {
          setBookingMissing(true);
        }
      }
    } catch (err) {
      // fallback to current payment data
    } finally {
      setDetailLoading(false);
    }
  };

  const openBookingRecord = (payment) => {
    setShowBookingDetails(true);
    setTimeout(() => bookingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const openProgramOrPackage = (payment) => {
    setShowProductDetails(true);
    setTimeout(() => productSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (_) {
      // ignore
    }
  };

  const exportFile = (type) => {
    const qs = queryString ? `?${queryString}` : "";
    window.open(`/api/admin/payments/export/${type}${qs}`, "_blank");
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === payments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payments.map((p) => p._id));
    }
  };

  const cancelSelected = async () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(
      "Cancel selected payments? This will mark them cancelled and set linked bookings to unpaid."
    );
    if (!confirmed) return;
    setUpdating(true);
    try {
      await Promise.all(
        selectedIds.map((id) => apiPatch(`/admin/payments/${id}/cancel`))
      );
      // Optimistic UI update so rows disappear immediately
      setPayments((prev) => {
        const remaining = prev.filter((p) => !selectedIds.includes(p._id));
        // Recompute quick totals locally based on remaining list
        const paidAmount = remaining
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const pendingAmount = remaining
          .filter((p) => p.status === "pending")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        setTotals({ paidAmount, pendingAmount, count: remaining.length });
        return remaining;
      });
      setSelectedIds([]);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to cancel selected payments");
    } finally {
      setUpdating(false);
    }
  };

  const markSelectedPaid = async () => {
    if (!selectedIds.length) return;
    setUpdating(true);
    try {
      await Promise.all(selectedIds.map((id) => apiPatch(`/admin/payments/${id}/mark-paid`)));
      setSelectedIds([]);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to mark paid");
    } finally {
      setUpdating(false);
    }
  };

  const markCurrentPaid = async () => {
    if (!selected?._id) return;
    setUpdating(true);
    try {
      const res = await apiPatch(`/admin/payments/${selected._id}/mark-paid`);
      const updated = res?.data || res;
      if (updated) setSelected(updated);
      await load();
    } catch (err) {
      alert(err?.message || "Failed to mark paid");
    } finally {
      setUpdating(false);
    }
  };

  const printHtml = (innerHtml, title = "Receipt") => {
    const win = window.open("", "PRINT", "height=900,width=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page { margin: 14mm; }
            }
            body { margin: 0; padding: 0; background: #f7f8fa; color: #0f172a; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif; }
            .page { padding: 32px 28px; max-width: 880px; margin: 0 auto; }
            .card { background: #ffffff; border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            h1,h2,h3,h4 { margin: 0; color: #0f172a; }
            .muted { color: #6b7280; }
            .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .table th { text-align: left; font-size: 12px; letter-spacing: 0.08em; color: #6b7280; padding: 10px 8px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; }
            .table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .table tbody tr:nth-child(odd) { background: #fafafa; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
            .badge-green { background: rgba(16,185,129,0.12); color: #047857; }
            .badge-amber { background: rgba(251,191,36,0.18); color: #b45309; }
            .badge-red { background: rgba(248,113,113,0.15); color: #b91c1c; }
            .grid { display: grid; gap: 12px; }
            .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .flex { display: flex; align-items: center; }
            .space-between { justify-content: space-between; }
            .right { text-align: right; }
            .center { text-align: center; }
            .mt-2 { margin-top: 8px; }
            .mt-3 { margin-top: 12px; }
            .mb-1 { margin-bottom: 4px; }
            .title { font-size: 18px; font-weight: 700; }
            .subtitle { font-size: 13px; color: #6b7280; }
            .bordered { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
            .footer-note { font-size: 12px; color: #6b7280; margin-top: 10px; }
            .logo-box { width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #10b981, #14b8a6); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="page">
            ${innerHtml}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const buildPrintable = (payment, booking, product, includeDetails = false) => {
    const { rows, subtotal } = buildReceipt(payment || {}, booking || {}, product || {});
    const invoiceNumber = payment?._id ? `INV-${shortId(payment._id).toUpperCase()}` : "INV-—";
    const amountWords = numberToWords(payment?.amount || 0);
    const header = `
      <div class="card flex space-between">
        <div class="flex" style="gap:12px;">
          <div class="logo-box">AN</div>
          <div>
            <div class="title">Annapurna Nature Cure Hospital</div>
            <div class="subtitle">Healthy living for everyone</div>
            <div class="muted">info@example.com · +977-0000000000 · Kathmandu, Nepal</div>
          </div>
        </div>
        <div class="right">
          <div class="title">Invoice</div>
          <div class="muted">${invoiceNumber}</div>
          <div class="muted">Date: ${formatDate(payment?.createdAt)}</div>
          <div class="muted">Payment ID: ${payment?._id || "—"}</div>
        </div>
      </div>
    `;

    const statusBadge =
      payment?.status === "paid"
        ? '<span class="badge badge-green">Paid</span>'
        : '<span class="badge badge-amber">Pending</span>';
    const gatewayBadge =
      payment?.gateway === "stripe"
        ? '<span class="badge badge-green">Stripe</span>'
        : '<span class="badge badge-amber">Manual</span>';

    const customerBlock = `
      <div class="card grid grid-2">
        <div>
          <div class="subtitle mb-1">Customer</div>
          <div class="mb-1"><strong>Name:</strong> <span class="muted">${booking?.userName || payment?.userName || "—"}</span></div>
          <div class="mb-1"><strong>Email:</strong> <span class="muted">${booking?.email || payment?.userEmail || "—"}</span></div>
          <div class="mb-1"><strong>Phone:</strong> <span class="muted">${booking?.phone || payment?.userPhone || "—"}</span></div>
          <div class="mb-1"><strong>Country:</strong> <span class="muted">${booking?.country || payment?.userCountry || "—"}</span></div>
        </div>
        <div>
          <div class="subtitle mb-1">Booking</div>
          <div class="mb-1"><strong>Booking ID:</strong> <span class="muted">${payment?.bookingId || "—"}</span></div>
          <div class="mb-1"><strong>Program/Package:</strong> <span class="muted">${booking?.programTitle || booking?.packageName || product?.title || product?.name || "—"}</span></div>
          <div class="mb-1"><strong>Type:</strong> <span class="muted">${typeLabel(payment?.bookingType)}</span></div>
          <div class="mb-1"><strong>People:</strong> <span class="muted">${booking?.numberOfPeople || payment?.metadata?.numberOfPeople || "—"}</span></div>
          <div class="mb-1"><strong>Preferred start date:</strong> <span class="muted">${booking?.preferredStartDate ? formatDate(booking.preferredStartDate) : "—"}</span></div>
          <div class="mt-2" style="display:flex; gap:6px;">${statusBadge}${gatewayBadge}</div>
        </div>
      </div>
    `;

    const rowsHtml =
      rows.length === 0
        ? `<tr><td colspan="5" class="muted">No breakdown available.</td></tr>`
        : rows
            .map(
              (r, idx) => `
          <tr>
            <td class="center">${idx + 1}</td>
            <td>
              <div><strong>${r.label}</strong></div>
              ${r.sub ? `<div class="muted">${r.sub}</div>` : ""}
            </td>
            <td class="center">${r.qty}</td>
            <td class="right">${formatMoney(r.unit)}</td>
            <td class="right">${formatMoney(r.total)}</td>
          </tr>`
            )
            .join("");

    const receiptBlock = `
      <div class="card">
        <div class="title mb-1">Receipt</div>
        <table class="table">
          <thead>
            <tr>
              <th style="width:6%;">#</th>
              <th style="width:44%;">Description</th>
              <th style="width:15%;" class="center">People</th>
              <th style="width:17%;" class="right">Unit price</th>
              <th style="width:18%;" class="right">Line total</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="mt-3 bordered">
          <div class="flex space-between mb-1">
            <span class="muted">Subtotal</span>
            <strong>${formatMoney(subtotal)}</strong>
          </div>
          <div class="flex space-between">
            <span class="muted">Total paid</span>
            <div class="title">${formatMoney(payment?.amount || 0)}</div>
          </div>
          <div class="muted mt-2">Amount in words: ${amountWords}</div>
        </div>
      </div>
    `;

    const footer = `
      <div class="card grid grid-2">
        <div>
          <div class="muted">This is a system generated invoice.</div>
        </div>
        <div class="right">
          <div class="muted">Authorized Signature</div>
          <div style="border-bottom: 1px solid #d1d5db; height: 28px; margin-top: 8px;"></div>
        </div>
      </div>
    `;

    if (!includeDetails) {
      return header + receiptBlock + footer;
    }
    return header + customerBlock + receiptBlock + footer;
  };

  const downloadReceiptOnly = () => {
    printHtml(buildPrintable(selected, bookingData, productData, false), "Receipt");
  };

  const downloadFullInvoice = () => {
    printHtml(buildPrintable(selected, bookingData, productData, true), "Invoice");
  };

  const handleDownloadChoice = (choice) => {
    if (choice === "receipt") {
      downloadReceiptOnly();
    } else if (choice === "full") {
      downloadFullInvoice();
    }
    setDownloadChoiceOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Billing Dashboard</h1>
          <p className="text-sm text-slate-400">Manage payments for packages, retreats, health programs, and courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportFile("csv")}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportFile("pdf")}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total paid" value={`$${(totals.paidAmount || 0).toFixed(2)}`} accent="text-emerald-300" />
        <StatCard label="Total pending" value={`$${(totals.pendingAmount || 0).toFixed(2)}`} accent="text-amber-300" />
        <StatCard label="Payments" value={totals.count || 0} />
        <StatCard label="Net revenue" value={`$${(totals.paidAmount || 0).toFixed(2)}`} accent="text-emerald-200" />
        <StatCard label="Last 30 days revenue" value={`$${last30Revenue.toFixed(2)}`} accent="text-emerald-200" />
      </div>

      <div className="border border-slate-800 rounded-xl bg-slate-900 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filters.bookingType}
            onChange={(e) => setFilters((p) => ({ ...p, bookingType: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All types</option>
            <option value="health">Health Package</option>
            <option value="retreat">Retreat</option>
            <option value="health_program">Health Program</option>
            <option value="course">Course</option>
          </select>
          <input
            type="email"
            placeholder="Search by email"
            value={filters.email}
            onChange={(e) => setFilters((p) => ({ ...p, email: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : payments.length === 0 ? (
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-6 text-center text-slate-400">
          No payments found.
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-900">
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-slate-800 text-sm text-slate-200 bg-slate-900">
            <div>{selectedIds.length} selected</div>
            <div className="flex items-center gap-3">
              <button
                disabled={!selectedIds.length || updating}
                onClick={cancelSelected}
                className={`px-3 py-1.5 rounded-lg border ${
                  selectedIds.length
                    ? "border-red-500 text-red-200 hover:bg-red-500/10"
                    : "border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                Cancel selected
              </button>
            </div>
          </div>
          <div className="min-w-full overflow-x-auto">
            <div className="grid grid-cols-[40px_120px_180px_160px_1fr_120px_110px_110px_80px] min-w-[1100px] px-6 py-3 text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-800 items-center">
              <span className="flex items-center justify-center">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={selectedIds.length === payments.length && payments.length > 0}
                  className="h-4 w-4"
                />
              </span>
              <span className="text-left">Date</span>
              <span className="text-left">Type</span>
              <span className="text-left">Customer</span>
              <span className="text-left">Email</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
              <span className="text-center">Gateway</span>
              <span className="text-right">Action</span>
            </div>
            {payments.map((p) => {
              const programName =
                p.metadata?.programName ||
                p.metadata?.courseTitle ||
                p.metadata?.programTitle ||
                p.metadata?.packageName ||
                "—";
              const isSelected = selectedIds.includes(p._id);
              return (
                <div
                  key={p._id}
                  className={`grid grid-cols-[40px_120px_180px_160px_1fr_120px_110px_110px_80px] min-w-[1100px] px-6 py-4 text-sm text-white border-b border-slate-800 last:border-b-0 items-center transition-colors ${
                    isSelected ? "bg-slate-800/60" : "hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isSelected}
                      onChange={() => toggleSelect(p._id)}
                    />
                  </div>
                  <div className="truncate text-slate-200">
                    {p.createdAt ? dayjs(p.createdAt).format("MMM D, YYYY") : "—"}
                  </div>
                  <div className="space-y-1 truncate">
                    <p className="font-semibold" title={p.bookingType || "—"}>
                      {typeLabel(p.bookingType)}
                    </p>
                    <p className="text-xs text-slate-400 truncate" title={programName}>
                      {programName}
                    </p>
                  </div>
                  <div className="truncate">
                    <p className="font-semibold truncate" title={p.userName || "—"}>{p.userName || "—"}</p>
                  </div>
                  <div className="truncate text-slate-200" title={p.userEmail || "—"}>
                    {p.userEmail || "—"}
                  </div>
                  <div className="text-right font-semibold text-slate-100 whitespace-nowrap">
                    ${(p.amount || 0).toFixed(2)}
                  </div>
                  <div className="flex justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] ${
                        statusColors[p.status] || "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-center items-center gap-2 text-slate-200" title={p.gateway || "—"}>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        p.gateway === "stripe" ? "bg-emerald-400" : "bg-slate-400"
                      }`}
                    />
                    <span className="capitalize text-sm truncate">{p.gateway === "stripe" ? "Stripe" : "Manual"}</span>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => openDetail(p)}
                      className="text-xs text-slate-100 hover:text-white underline-offset-2 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 md:p-10">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#0f131a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#0f131a] border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Payment details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white text-xl">
                ×
              </button>
            </div>
      <div className="overflow-y-auto px-8 py-6 space-y-6 flex-1">
        {detailLoading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <>
                  <HeaderSummary
                    selected={selected}
                    booking={bookingData}
                    copyToClipboard={copyToClipboard}
                  />

                  {selected.status === "cancelled" ? (
                    <div className="border border-red-500/50 bg-red-900/30 text-red-100 rounded-xl px-4 py-3 text-sm">
                      <p className="font-semibold">Payment cancelled</p>
                      <p className="text-red-200">
                        Associated booking is now unpaid/cancelled. You can mark it paid again if this was a mistake.
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={markCurrentPaid}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-100 hover:bg-red-500/10 text-xs"
                        >
                          Mark as paid again
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <QuickActions
                    selected={selected}
                    productData={productData}
                    onShowBooking={() => openBookingRecord(selected)}
                    showBookingDetails={showBookingDetails}
                    onShowProduct={() => {
                      setShowProductDetails(true);
                      setTimeout(() => productSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                    }}
                    showProductDetails={showProductDetails}
                  />

                  <MiniInfoGrid
                    selected={selected}
                    booking={bookingData}
                    bookingMissing={bookingMissing}
                  />

                  {showBookingDetails && bookingData ? (
                    <Section title="Booking details">
                      <div ref={bookingSectionRef} className="space-y-2">
                        <Detail label="Name" value={renderValue(bookingData.userName || bookingData.name)} />
                        <Detail label="Email" value={renderValue(bookingData.email)} />
                        <Detail label="Phone" value={renderValue(bookingData.phone)} />
                        <Detail label="Country" value={renderValue(bookingData.country)} />
                        <Detail label="Start date" value={bookingData.preferredStartDate ? dayjs(bookingData.preferredStartDate).format("MMM D, YYYY") : "—"} />
                        <Detail label="People" value={renderValue(bookingData.numberOfPeople || bookingData.peopleCount)} />
                        <Detail label="Notes" value={renderValue(bookingData.additionalNotes || bookingData.notes)} />
                      </div>
                    </Section>
                  ) : null}

                  {showProductDetails && productData ? (
                    <Section title="Package / Program details">
                      <div ref={productSectionRef} className="space-y-2">
                        <Detail label="Title" value={renderValue(productData.title || productData.name)} />
                        <Detail label="Duration" value={renderValue(productData.durationDays || productData.duration)} />
                        <Detail label="Price / person" value={
                          renderValue(
                            productData.pricePerPersonUSD ||
                            productData.price ||
                            productData.retreatPricePerPerson
                          )
                        } />
                        <Detail label="Type" value={renderValue(productData.programType)} />
                      </div>
                    </Section>
                  ) : null}

                  <Section
                    title="Receipt"
                    action={
                      <button
                        onClick={() => setDownloadChoiceOpen(true)}
                        disabled={selected.status === "cancelled"}
                        className={`px-3 py-1.5 rounded-full border text-xs ${
                          selected.status === "cancelled"
                            ? "border-slate-700 text-slate-500 cursor-not-allowed"
                            : "border-slate-700 text-slate-100 hover:bg-slate-800"
                        }`}
                      >
                        Download
                      </button>
                    }
                  >
                    <div className="sm:col-span-2 w-full">
                      <ReceiptTable payment={selected} booking={bookingData} product={productData} />
                    </div>
                  </Section>

                  {showBookingDetails && bookingData ? (
                    <Section title="Booking details">
                      <div ref={bookingSectionRef} className="space-y-2">
                        <Detail label="Name" value={renderValue(bookingData.userName || bookingData.name)} />
                        <Detail label="Email" value={renderValue(bookingData.email)} />
                        <Detail label="Phone" value={renderValue(bookingData.phone)} />
                        <Detail label="Country" value={renderValue(bookingData.country)} />
                        <Detail label="Start date" value={bookingData.preferredStartDate ? dayjs(bookingData.preferredStartDate).format("MMM D, YYYY") : "—"} />
                        <Detail label="People" value={renderValue(bookingData.numberOfPeople || bookingData.peopleCount)} />
                        <Detail label="Notes" value={renderValue(bookingData.additionalNotes || bookingData.notes)} />
                      </div>
                    </Section>
                  ) : null}

                  {showProductDetails && productData ? (
                    <Section title="Package / Program details">
                      <div ref={productSectionRef} className="space-y-2">
                        <Detail label="Title" value={renderValue(productData.title || productData.name)} />
                        <Detail label="Duration" value={renderValue(productData.durationDays || productData.duration)} />
                        <Detail label="Price / person" value={
                          renderValue(
                            productData.pricePerPersonUSD ||
                            productData.price ||
                            productData.retreatPricePerPerson
                          )
                        } />
                        <Detail label="Type" value={renderValue(productData.programType)} />
                      </div>
                    </Section>
                  ) : null}

                  {selected.metadata && Object.keys(selected.metadata || {}).length ? (
                    <CollapsibleMetadata metadata={selected.metadata} />
                  ) : null}

                  {downloadChoiceOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
                      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-semibold text-white">Download options</p>
                          <button
                            onClick={() => setDownloadChoiceOpen(false)}
                            className="text-slate-400 hover:text-white text-lg"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-slate-400">Choose what you want to export.</p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleDownloadChoice("receipt")}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold"
                          >
                            Download receipt only
                          </button>
                          <button
                            onClick={() => handleDownloadChoice("full")}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-600 text-white text-sm font-semibold hover:bg-slate-800"
                          >
                            Download full invoice (details)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-xl font-semibold text-white ${accent || ""}`}>{value}</p>
    </div>
  );
}

function Detail({ label, value, mono, onClick }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-slate-400">{label}</p>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`text-base text-left ${mono ? "font-mono break-all" : "font-semibold"} text-slate-100 hover:text-teal-300`}
        >
          {value || "Not provided"}
        </button>
      ) : (
        <p className={`text-base ${mono ? "font-mono break-all" : "font-semibold"} text-slate-100`}>
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="space-y-3 border border-slate-800 rounded-xl p-4 bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function ReceiptRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`text-sm ${bold ? "font-semibold text-white" : "text-slate-100"}`}>{value}</span>
    </div>
  );
}

function HeaderSummary({ selected, booking, copyToClipboard }) {
  const cancelledOn = selected.cancelledAt ? dayjs(selected.cancelledAt).format("MMM D, YYYY HH:mm") : null;
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/80 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {booking?.userName || selected.userName || "Customer"}
          </p>
          <p className="text-3xl font-semibold text-white">${(selected.amount || 0).toFixed(2)}</p>
          <p className="text-sm text-slate-400">
            {selected.createdAt ? dayjs(selected.createdAt).format("MMM D, YYYY HH:mm") : "—"}
          </p>
          {cancelledOn ? (
            <p className="text-xs text-red-200">Cancelled on {cancelledOn}</p>
          ) : null}
          <button
            type="button"
            onClick={() => copyToClipboard(selected._id)}
            className="text-xs text-slate-500 hover:text-teal-300"
            title="Copy payment ID"
          >
            Reference: {selected._id || "—"}
          </button>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] ${statusColors[selected.status] || "bg-slate-800 text-slate-200"}`}
          >
            {selected.status}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[11px] ${selected.gateway === "stripe" ? "bg-emerald-900/60 text-emerald-200" : "bg-slate-800 text-slate-200"}`}
          >
            {selected.gateway === "stripe" ? "Stripe" : "Manual"}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuickActions({ selected, productData, onShowBooking, showBookingDetails, onShowProduct, showProductDetails }) {
  const productLabel =
    selected?.bookingType === "retreat"
      ? "View retreat program"
      : selected?.bookingType === "health"
      ? "View package details"
      : selected?.bookingType === "health_program"
      ? "View health program"
      : selected?.bookingType === "course"
      ? "View course"
      : "View product";
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {productData && !showProductDetails && (
        <button
          onClick={onShowProduct}
          className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 text-xs"
        >
          {productLabel}
        </button>
      )}
      {selected.bookingId && !showBookingDetails && (
        <button
          onClick={onShowBooking}
          className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 text-xs"
        >
          View booking details
        </button>
      )}
    </div>
  );
}

function MiniInfoGrid({ selected, booking, bookingMissing }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-800 rounded-xl bg-slate-900/70 p-4">
      <div className="space-y-2">
        <Detail label="Customer" value={renderValue(booking?.userName || selected.userName)} />
        <Detail label="Email" value={renderValue(booking?.email || selected.userEmail)} />
        <Detail label="Phone" value={renderValue(booking?.phone || selected.userPhone)} />
        <Detail label="Country" value={renderValue(booking?.country || selected.userCountry)} />
      </div>
      <div className="space-y-2">
        <Detail label="Payment method" value={selected.gateway === "stripe" ? "Stripe" : "Manual"} />
        <Detail label="Type" value={typeLabel(selected.bookingType)} />
        <Detail label="Booking ID" value={renderValue(selected.bookingId || (bookingMissing ? "record not found" : "—"))} />
        <Detail label="Booking date" value={booking?.preferredStartDate ? dayjs(booking.preferredStartDate).format("MMM D, YYYY") : "—"} />
      </div>
    </div>
  );
}

function ReceiptTable({ payment, booking, product }) {
  const { rows, subtotal } = buildReceipt(payment, booking, product);
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="grid grid-cols-[1fr_5fr_2fr_2fr_2fr] gap-x-4 px-6 py-3 text-xs uppercase tracking-wide text-slate-300 font-semibold border-b border-slate-800">
          <span className="text-left">#</span>
          <span className="text-left">Description</span>
          <span className="text-center">People</span>
          <span className="text-right">Unit price</span>
          <span className="text-right">Line total</span>
        </div>
        {rows.length === 0 ? (
          <div className="px-6 py-4 text-sm text-slate-300">No breakdown available.</div>
        ) : (
          rows.map((r, idx) => (
            <div
              key={`${r.label}-${idx}`}
              className="grid grid-cols-[1fr_5fr_2fr_2fr_2fr] gap-x-4 px-6 py-3 text-sm text-slate-100 border-b border-slate-800 last:border-b-0"
              style={{ minHeight: 48 }}
            >
              <span className="text-left font-mono text-slate-300">{idx + 1}</span>
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold leading-snug break-words">{r.label}</p>
                {r.sub ? <p className="text-xs text-slate-400 leading-snug break-words">{r.sub}</p> : null}
              </div>
              <span className="text-center font-mono">{r.qty}</span>
              <span className="text-right font-mono">${Number(r.unit || 0).toFixed(2)}</span>
              <span className="text-right font-mono">${Number(r.total || 0).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Subtotal</span>
          <span className="text-sm text-slate-100 font-mono">${Number(subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <span className="text-sm text-slate-300">Total paid</span>
          <span className="text-lg font-semibold text-white font-mono">${(payment?.amount || 0).toFixed(2)}</span>
        </div>
        <p className="text-xs italic text-slate-400 pt-1">
          Amount in words: {numberToWords(payment?.amount || 0)}
        </p>
      </div>
    </div>
  );
}

function CollapsibleMetadata({ metadata }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/70">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-200"
      >
        <span>Technical metadata</span>
        <span className="text-slate-400 text-xs">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 overflow-auto text-xs text-slate-100">
            <pre>{JSON.stringify(metadata, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function PrintReceipt({ payment, booking, product }) {
  const { rows, subtotal } = buildReceipt(payment || {}, booking || {}, product || {});
  const amountWords = numberToWords(payment?.amount || 0);
  return (
    <div className="invoice-print">
      <div className="card">
        <div className="title mb-1">Receipt</div>
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "6%" }}>#</th>
              <th style={{ width: "44%" }}>Description</th>
              <th style={{ width: "15%" }} className="center">People</th>
              <th style={{ width: "17%" }} className="right">Unit price</th>
              <th style={{ width: "18%" }} className="right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">No breakdown available.</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.label}-${idx}`}>
                  <td className="center">{idx + 1}</td>
                  <td>
                    <div><strong>{r.label}</strong></div>
                    {r.sub ? <div className="muted">{r.sub}</div> : null}
                  </td>
                  <td className="center">{r.qty}</td>
                  <td className="right">{formatMoney(r.unit)}</td>
                  <td className="right">{formatMoney(r.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-3 bordered">
          <div className="flex space-between mb-1">
            <span className="muted">Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div className="flex space-between">
            <span className="muted">Total paid</span>
            <div className="title">{formatMoney(payment?.amount || 0)}</div>
          </div>
          <div className="muted mt-2">Amount in words: {amountWords}</div>
        </div>
      </div>
    </div>
  );
}

function InvoicePrint({ payment, booking, product }) {
  const { rows, subtotal } = buildReceipt(payment || {}, booking || {}, product || {});
  const amountWords = numberToWords(payment?.amount || 0);
  const invoiceNumber = payment?._id
    ? `INV-${dayjs(payment.createdAt || new Date()).format("YYYY")}-${String(payment._id).slice(-4).toUpperCase()}`
    : "INV-—";
  const statusBadge =
    payment?.status === "paid"
      ? "badge badge-green"
      : payment?.status === "pending"
      ? "badge badge-amber"
      : "badge badge-red";
  const gatewayBadge =
    payment?.gateway === "stripe"
      ? "badge badge-green"
      : "badge badge-amber";

  const customerBlock = [
    { label: "Name", value: booking?.userName || payment?.userName || "—" },
    { label: "Email", value: booking?.email || payment?.userEmail || "—" },
    { label: "Phone", value: booking?.phone || payment?.userPhone || "—" },
    { label: "Country", value: booking?.country || payment?.userCountry || "—" },
  ];

  const bookingBlock = [
    { label: "Booking ID", value: payment?.bookingId || "—" },
    { label: "Program/Package", value: booking?.programTitle || booking?.packageName || product?.title || product?.name || "—" },
    { label: "Type", value: typeLabel(payment?.bookingType) },
    { label: "People", value: booking?.numberOfPeople || payment?.metadata?.numberOfPeople || "—" },
    { label: "Start date", value: booking?.preferredStartDate ? formatDate(booking.preferredStartDate) : "—" },
  ];

  return (
    <div className="invoice-print">
      <div className="card flex space-between">
        <div>
          <div className="title">Annapurna Nature Cure Hospital</div>
          <div className="subtitle">Healthy living for everyone</div>
        </div>
        <div className="right">
          <div className="title">Invoice</div>
          <div className="muted">{invoiceNumber}</div>
        </div>
      </div>

      <div className="card grid grid-2">
        <div>
          <div className="muted mb-1">Customer</div>
          {customerBlock.map((item) => (
            <div key={item.label} className="mb-1">
              <strong>{item.label}:</strong> <span className="muted">{item.value || "—"}</span>
            </div>
          ))}
        </div>
        <div>
          <div className="muted mb-1">Booking</div>
          {bookingBlock.map((item) => (
            <div key={item.label} className="mb-1">
              <strong>{item.label}:</strong> <span className="muted">{item.value || "—"}</span>
            </div>
          ))}
          <div className="mt-2">
            <span className={statusBadge} style={{ marginRight: 6 }}>
              {payment?.status || "pending"}
            </span>
            <span className={gatewayBadge}>{payment?.gateway || "manual"}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="title mb-1">Receipt</div>
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: "6%" }}>#</th>
              <th style={{ width: "44%" }}>Description</th>
              <th style={{ width: "15%" }} className="center">People</th>
              <th style={{ width: "17%" }} className="right">Unit price</th>
              <th style={{ width: "18%" }} className="right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">No breakdown available.</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.label}-${idx}`}>
                  <td className="center">{idx + 1}</td>
                  <td>
                    <div><strong>{r.label}</strong></div>
                    {r.sub ? <div className="muted">{r.sub}</div> : null}
                  </td>
                  <td className="center">{r.qty}</td>
                  <td className="right">{formatMoney(r.unit)}</td>
                  <td className="right">{formatMoney(r.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-3 bordered">
          <div className="flex space-between mb-1">
            <span className="muted">Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div className="flex space-between">
            <span className="muted">Total paid</span>
            <div className="title">{formatMoney(payment?.amount || 0)}</div>
          </div>
          <div className="muted mt-2">Amount in words: {amountWords}</div>
        </div>
      </div>

      <div className="card grid grid-2">
        <div>
          <div className="muted">This is a system generated invoice.</div>
        </div>
        <div className="right">
          <div className="muted">Authorized Signature</div>
          <div style={{ borderBottom: "1px solid #1f2937", height: 28, marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
}
