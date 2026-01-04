"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { apiDelete, apiGet, apiPatch, apiPut } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";
import { PlusIcon, PencilSquareIcon, TrashIcon, BoltIcon } from "@heroicons/react/24/outline";
import { PublishToggle, StatusPill } from "@/components/admin/PublishToggle";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const PROGRAM_TYPES = [
  { value: "inside_valley", label: "Inside Valley" },
  { value: "outside_valley", label: "Outside Valley" },
];

const ACCOMMODATION_OPTIONS = [
  { value: "hospital_premium", label: "Hospital premium" },
  { value: "partner_hotel", label: "Partner hotel accommodation" },
  { value: "own_arrangement", label: "Own arrangement" },
];

const buildAccommodationPricing = (options = [], existing = []) =>
  options.map((opt) => {
    const match = existing.find((p) => p.key === opt);
    const label = ACCOMMODATION_OPTIONS.find((o) => o.value === opt)?.label || opt;
    return match
      ? { ...match, key: opt, label: match.label || label }
      : { key: opt, label, pricePerPersonUSD: "" };
  });

const emptyForm = {
  title: "",
  slug: "",
  descriptionShort: "",
  descriptionLong: "",
  programType: "inside_valley",
  durationDays: "",
  pricePerPersonUSD: "",
  selectedDestinationIds: [],
  allowAccommodationChoice: false,
  accommodationOptions: [],
  hospitalPremiumPrice: "",
  included: [""],
  alwaysIncludesAirportPickup: false,
  coverImage: "",
  coverFile: null,
  galleryList: [],
  isActive: true,
  promoVideo: "",
  videoFile: null,
  accommodationPricing: [],
};

function toSlug(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function RetreatProgramsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/retreat-programs?includeDrafts=true");
      const data = res?.data || res || [];
      setItems(data);
    } catch (err) {
      console.error("Retreat programs load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await apiGet(`/retreat-destinations?type=${form.programType}`);
        setDestinationOptions(res?.data || res || []);
        setDestDropdownOpen(false);
      } catch (err) {
        console.error("Retreat destinations options error:", err);
      }
    };
    fetchDestinations();
  }, [form.programType]);

  const startCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setHasEditedSlug(false);
    setOpen(true);
  };

  const startEdit = (item) => {
    setEditing(item);
    setHasEditedSlug(true);
    const optList = item.accommodation?.options || item.accommodationOptions || [];
    const pricingMerged = buildAccommodationPricing(optList, item.accommodationPricing || []);
    const hospitalPrice =
      item?.accommodation?.hospitalPremiumPrice ??
      pricingMerged.find((p) => p.key === "hospital_premium")?.pricePerPersonUSD ??
      "";
    setForm({
      ...emptyForm,
      ...item,
      durationDays: item.durationDays || "",
      pricePerPersonUSD: item.pricePerPersonUSD || "",
      selectedDestinationIds: (item.destinations || []).map((d) => d?._id || d),
      accommodationOptions: optList,
      accommodationPricing: pricingMerged,
      hospitalPremiumPrice: hospitalPrice === undefined ? "" : hospitalPrice,
      allowAccommodationChoice: item.accommodation?.allowAccommodationChoice ?? item.allowAccommodationChoice ?? false,
      included: item.included?.length ? item.included : [""],
      galleryList: (item.galleryImages || []).map((url) => ({ url, file: null })),
      coverImage: item.coverImage || "",
      coverFile: null,
      promoVideo: item.promoVideo || "",
      videoFile: null,
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "programType") {
      setForm((prev) => ({
        ...prev,
        programType: value,
        selectedDestinationIds: [],
      }));
      setDestDropdownOpen(false);
      return;
    }

    if (name === "title" && !hasEditedSlug) {
      const generated = toSlug(value);
      setForm((prev) => ({ ...prev, title: value, slug: generated }));
      return;
    }

    if (name === "slug") {
      setHasEditedSlug(true);
      setForm((prev) => ({ ...prev, slug: toSlug(value) }));
      return;
    }

    if (name === "promoVideo") {
      setForm((prev) => ({ ...prev, promoVideo: value, videoFile: null }));
      return;
    }

    const next = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const toggleDestinationSelection = (id) => {
    setForm((prev) => {
      const exists = prev.selectedDestinationIds.includes(id);
      return {
        ...prev,
        selectedDestinationIds: exists
          ? prev.selectedDestinationIds.filter((d) => d !== id)
          : [...prev.selectedDestinationIds, id],
      };
    });
  };

  const handleCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, coverFile: file, coverImage: URL.createObjectURL(file) }));
  };

  const removeCover = () => {
    setForm((prev) => ({ ...prev, coverFile: null, coverImage: "" }));
  };

  const handleGalleryFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setForm((prev) => ({
      ...prev,
      galleryList: [
        ...prev.galleryList,
        ...files.map((file) => ({ url: URL.createObjectURL(file), file })),
      ],
    }));
  };

  const removeGalleryImage = (idx) => {
    setForm((prev) => {
      const next = [...prev.galleryList];
      const [removed] = next.splice(idx, 1);
      if (removed?.file && removed.url?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url);
      }
      return { ...prev, galleryList: next };
    });
  };

  const toggleAccommodationOption = (value) => {
    setForm((prev) => {
      const exists = prev.accommodationOptions.includes(value);
      let updatedPricing = prev.accommodationPricing || [];
      if (exists) {
        updatedPricing = updatedPricing.filter((p) => p.key !== value);
      } else {
        const label = ACCOMMODATION_OPTIONS.find((o) => o.value === value)?.label || value;
        updatedPricing = [...updatedPricing, { key: value, label, pricePerPersonUSD: 0 }];
      }
      return {
        ...prev,
        accommodationOptions: exists
          ? prev.accommodationOptions.filter((v) => v !== value)
          : [...prev.accommodationOptions, value],
        accommodationPricing: updatedPricing,
      };
    });
  };

  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => {
      if (prev.videoFile && prev.promoVideo?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.promoVideo);
      }
      return { ...prev, videoFile: file, promoVideo: URL.createObjectURL(file) };
    });
  };

  const removeVideo = () => {
    setForm((prev) => {
      if (prev.promoVideo?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.promoVideo);
      }
      return { ...prev, videoFile: null, promoVideo: "" };
    });
  };

  const updateIncluded = (idx, val) => {
    setForm((prev) => {
      const next = [...prev.included];
      next[idx] = val;
      return { ...prev, included: next };
    });
  };

  const addIncluded = () => {
    setForm((prev) => ({ ...prev, included: [...prev.included, ""] }));
  };

  const removeIncluded = (idx) => {
    setForm((prev) => ({ ...prev, included: prev.included.filter((_, i) => i !== idx) }));
  };

  const payload = useMemo(() => {
    const existingGallery = form.galleryList.filter((i) => !i.file).map((i) => i.url);
    const hospitalPrice =
      form.hospitalPremiumPrice === "" || form.hospitalPremiumPrice === null
        ? 0
        : Number(form.hospitalPremiumPrice);
    const accommodationPricing = [
      { key: "hospital_premium", label: "Hospital premium", pricePerPersonUSD: hospitalPrice },
    ];

    return {
      title: form.title,
      slug: form.slug,
      descriptionShort: form.descriptionShort,
      descriptionLong: form.descriptionLong,
      programType: form.programType,
      durationDays: form.durationDays ? Number(form.durationDays) : undefined,
      pricePerPersonUSD:
        form.pricePerPersonUSD === "" || form.pricePerPersonUSD === null
          ? undefined
          : Number(form.pricePerPersonUSD),
      allowAccommodationChoice: form.allowAccommodationChoice,
      accommodationOptions: form.accommodationOptions,
      hospitalPremiumPrice: hospitalPrice,
      accommodationPricing,
      destinations: form.selectedDestinationIds,
      included: form.included.filter((i) => i && i.trim()),
      alwaysIncludesAirportPickup: form.alwaysIncludesAirportPickup,
      coverImage: form.coverImage,
      galleryImages: existingGallery,
      promoVideo: form.videoFile ? "" : form.promoVideo,
      isActive: form.isActive,
    };
  }, [form]);

  const save = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();

      fd.append("title", payload.title || "");

      if (payload.slug) fd.append("slug", payload.slug);
      if (payload.descriptionShort) fd.append("descriptionShort", payload.descriptionShort);
      if (payload.descriptionLong) fd.append("descriptionLong", payload.descriptionLong);
      if (payload.programType) fd.append("programType", payload.programType);
      if (payload.durationDays) fd.append("durationDays", payload.durationDays);
      if (payload.pricePerPersonUSD !== undefined) fd.append("pricePerPersonUSD", payload.pricePerPersonUSD);

      fd.append("allowAccommodationChoice", payload.allowAccommodationChoice ? "true" : "false");
      fd.append("alwaysIncludesAirportPickup", payload.alwaysIncludesAirportPickup ? "true" : "false");
      fd.append("isActive", payload.isActive ? "true" : "false");

      payload.accommodationOptions.forEach((opt) => fd.append("accommodationOptions", opt));
      if (payload.hospitalPremiumPrice !== undefined) {
        fd.append("hospitalPremiumPrice", payload.hospitalPremiumPrice);
      }
      payload.destinations.forEach((d) => fd.append("destinations", d));
      payload.included.forEach((inc) => fd.append("included", inc));
      payload.accommodationPricing.forEach((p) => {
        fd.append("accommodationPricing", JSON.stringify(p));
      });

      if (form.coverFile) {
        fd.append("coverImage", form.coverFile);
      } else if (payload.coverImage) {
        fd.append("coverImage", payload.coverImage);
      }

      if (form.videoFile) {
        fd.append("promoVideo", form.videoFile);
      } else if (payload.promoVideo !== undefined) {
        fd.append("promoVideo", payload.promoVideo || "");
      }

      payload.galleryImages.forEach((g) => fd.append("galleryImages", g));

      form.galleryList
        .filter((g) => g.file)
        .forEach((g) => fd.append("galleryImages", g.file));

      const url = `${process.env.NEXT_PUBLIC_API_URL}/retreat-programs${editing ? `/${editing._id}` : ""}`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        body: fd,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(getApiErrorMessage({ data }, "Failed to save program"));

      await load();
      closeModal();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save program"));
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this retreat program?")) return;

    try {
      await apiDelete(`/retreat-programs/${id}`);
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete program"));
    }
  };

  const toggleActive = async (item) => {
    try {
      await apiPut(`/retreat-programs/${item._id}`, { isActive: !item.isActive });
      await load();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update status"));
    }
  };

  const updateItemStatus = (id, status) => {
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, status } : it)));
  };

  const toggleStatus = async (item) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    updateItemStatus(item._id, nextStatus);
    setStatusUpdatingId(item._id);
    try {
      await apiPatch(`/retreat-programs/${item._id}/status`, { status: nextStatus });
    } catch (err) {
      updateItemStatus(item._id, item.status);
      alert(getApiErrorMessage(err, "Failed to update publish status"));
    } finally {
      setStatusUpdatingId(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Retreat Programs</h1>
          <p className="text-sm text-slate-400">
            Create and manage retreat programs separately from health packages.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Program
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <div className="text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-lg p-6">
          No retreat programs yet. Add your first program.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const typeLabel = PROGRAM_TYPES.find((t) => t.value === item.programType)?.label || item.programType;
            const destinations = (item.destinations || [])
              .map((d) => (typeof d === "string" ? d : d?.name))
              .filter(Boolean)
              .join(", ");
            return (
              <div
                key={item._id}
                className="rounded-xl border border-white/10 bg-[#0f131a] p-4 space-y-3 shadow-sm"
              >
                <div className="rounded-lg overflow-hidden bg-slate-800 h-32 border border-slate-800">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-white font-semibold line-clamp-2">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.slug}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill status={item.status} />
                    <PublishToggle
                      status={item.status}
                      onToggle={() => toggleStatus(item)}
                      disabled={statusUpdatingId === item._id}
                    />
                    <button
                      onClick={() => toggleActive(item)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        item.isActive ? "bg-green-900/60 text-green-300" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <BoltIcon className="h-4 w-4" />
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-200">
                  <p className="text-teal-200 font-semibold">{typeLabel}</p>
                  <p className="text-slate-400 line-clamp-2">{destinations || "No destinations set"}</p>
                  <p className="text-slate-200">{item.durationDays ? `${item.durationDays} days` : "Duration —"}</p>
                  <p className="text-slate-100 font-semibold">
                    {item.pricePerPersonUSD ? `$${item.pricePerPersonUSD} / person` : "Price —"}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-100 text-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editing ? "Edit Retreat Program" : "Add Retreat Program"}
                </h2>
                <p className="text-sm text-slate-400">
                  Separate from health packages; customize every detail.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

              {/* BASIC INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Slug</label>
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Auto generated, but you can edit.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Short description</label>
                  <input
                    name="descriptionShort"
                    value={form.descriptionShort}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Program type</label>
                  <select
                    name="programType"
                    value={form.programType}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                    {PROGRAM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* LONG DESCRIPTION */}
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Long description</label>
                <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-inner">
                  <ReactQuill
                    theme="snow"
                    value={form.descriptionLong}
                    onChange={(val) =>
                      setForm((prev) => ({ ...prev, descriptionLong: val }))
                    }
                  />
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Duration (days)</label>
                  <input
                    name="durationDays"
                    type="number"
                    value={form.durationDays}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Price per person (USD)</label>
                  <input
                    name="pricePerPersonUSD"
                    type="number"
                    value={form.pricePerPersonUSD}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">
                    Always include airport pickup
                  </label>

                  <div className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      name="alwaysIncludesAirportPickup"
                      checked={form.alwaysIncludesAirportPickup}
                      onChange={handleBasicChange}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-slate-300">Yes</span>
                  </div>
                </div>

              </div>

              {/* DESTINATIONS */}
              <div className="space-y-2 relative">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Select destinations</label>
                  <span className="text-xs text-slate-500">
                    {destinationOptions.length ? "Choose any that apply" : "No destinations for this type yet"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setDestDropdownOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm hover:border-teal-600 transition"
                >
                  <span>
                    {form.selectedDestinationIds.length
                      ? `${form.selectedDestinationIds.length} selected`
                      : "Choose destinations"}
                  </span>
                  <span className="text-xs text-slate-400">{destDropdownOpen ? "▲" : "▼"}</span>
                </button>

                {destDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
                    {destinationOptions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-slate-400">No destinations for this type yet.</div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {destinationOptions.map((dest) => {
                          const checked = form.selectedDestinationIds.includes(dest._id);
                          return (
                            <label
                              key={dest._id}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-800 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleDestinationSelection(dest._id)}
                                className="h-4 w-4 text-teal-500"
                              />
                              <span className="text-sm text-slate-200">{dest.name}</span>
                              {!dest.isActive && <span className="text-xs text-slate-500">(inactive)</span>}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {form.selectedDestinationIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {destinationOptions
                      .filter((d) => form.selectedDestinationIds.includes(d._id))
                      .map((dest) => (
                        <span
                          key={dest._id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-100 text-sm"
                        >
                          {dest.name}
                          <button
                            type="button"
                            onClick={() => toggleDestinationSelection(dest._id)}
                            className="text-slate-400 hover:text-white"
                            aria-label={`Remove ${dest.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* ACCOMMODATION TOGGLE */}
              <div className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    name="allowAccommodationChoice"
                    checked={form.allowAccommodationChoice}
                    onChange={handleBasicChange}
                  />
                  <label className="text-sm text-slate-300">Allow accommodation choice</label>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ACCOMMODATION_OPTIONS.map((opt) => {
                    const active = form.accommodationOptions.includes(opt.value);

                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleAccommodationOption(opt.value)}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-xs ${
                          active
                            ? "bg-teal-900/40 border-teal-500 text-teal-200"
                            : "bg-slate-900 border-slate-700 text-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-slate-300 font-semibold">Hospital premium price (per person, USD)</p>
                  <input
                    type="number"
                    min="0"
                    name="hospitalPremiumPrice"
                    value={form.hospitalPremiumPrice}
                    onChange={handleBasicChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    placeholder="Enter price"
                  />
                  <p className="text-xs text-slate-500">
                    Partner hotel accommodation prices are managed globally. Only set hospital premium price here.
                  </p>
                </div>
              </div>

              {/* INCLUDED SERVICES */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-300">Included services</label>

                  <button
                    type="button"
                    onClick={addIncluded}
                    className="text-xs text-teal-300"
                  >
                    + Add item
                  </button>
                </div>

                <div className="space-y-2">
                  {form.included.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={val}
                        onChange={(e) => updateIncluded(idx, e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Example: Daily yoga sessions"
                      />

                      {form.included.length > 1 && (
                        <button
                          onClick={() => removeIncluded(idx)}
                          type="button"
                          className="px-3 py-2 rounded-lg bg-red-900/50 text-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MEDIA SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* COVER IMAGE */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Cover image</label>
                  <label
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFile}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-400">Click to upload or drop a file</span>
                    <span className="text-xs text-slate-500">PNG/JPG</span>
                  </label>

                  {form.coverImage && (
                    <div className="mt-2 h-32 w-56 rounded-xl overflow-hidden border border-slate-700 relative">
                      <img
                        src={form.coverImage}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCover}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* GALLERY */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Gallery images</label>
                  <label
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryFiles}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-400">Click to upload or drop files</span>
                    <span className="text-xs text-slate-500">PNG/JPG</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {form.galleryList.map((g, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-700">
                        <img src={g.url} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full text-xs px-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PROMO VIDEO */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-slate-300">Promo video (optional)</label>
                    {form.promoVideo && (
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    name="promoVideo"
                    value={form.videoFile ? "" : form.promoVideo}
                    onChange={handleBasicChange}
                    placeholder="Paste video URL"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500"
                  />

                  <label
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900"
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFile}
                      className="hidden"
                    />
                    <span className="text-xs text-slate-400">Click to upload a promo video</span>
                    <span className="text-xs text-slate-500">MP4/MOV</span>
                  </label>

                  {form.promoVideo && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                      <video src={form.promoVideo} className="w-full" controls />
                    </div>
                  )}
                </div>
              </div>

              {/* ACTIVE TOGGLE */}
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleBasicChange}
                />
                <label className="text-sm text-slate-300">Active</label>
              </div>

            </div>

            {/* FOOTER BUTTONS */}
            <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">

              <button
                onClick={closeModal}
                type="button"
                className="px-4 py-2 rounded-lg bg-slate-800 text-white"
              >
                Cancel
              </button>

              <button
                onClick={save}
                disabled={saving}
                type="button"
                className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Program"}
              </button>

            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        .ql-container {
          min-height: 200px;
          max-height: 350px;
          overflow: auto;
          background: #0f172a;
          color: #e2e8f0;
          border-color: #1e293b;
        }
        .ql-editor {
          min-height: 200px;
          color: #e2e8f0;
        }
        .ql-toolbar {
          background: #0b1017;
          border-color: #1e293b;
        }
        .ql-toolbar .ql-picker,
        .ql-toolbar button {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
