"use client";

import { useEffect, useRef, useState } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { apiGet, apiPost } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errorMessage";

export default function AddDoctorModal({ open, onClose, onSaved }) {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [videoData, setVideoData] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    departmentId: "",
    experience: "",
    degree: "",
    about: "",
    galleryImages: [],
    videoUrl: "",
    imageData: "",
  });
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  useEffect(() => {
    if (open) {
      fetchDepartments();
      setSubmitting(false);
      setToast("");
      setPreview(null);
      setFileName("");
      setVideoPreview("");
      setVideoData("");
      setGalleryUrlInput("");
      setForm({
        name: "",
        email: "",
        phone: "",
        departmentId: "",
        experience: "",
        degree: "",
        about: "",
        galleryImages: [],
        videoUrl: "",
        imageData: "",
        videoData: "",
      });
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchDepartments() {
    try {
      const res = await apiGet("/departments");
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (err) {
      console.error("Department fetch error:", err);
    }
  }

  if (!open) return null;

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, imageData: reader.result }));
      setPreview(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  function handleGalleryFiles(e) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), reader.result.toString()],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  function addGalleryUrl() {
    const clean = galleryUrlInput.trim();
    if (!clean) return;
    setForm((prev) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), clean] }));
    setGalleryUrlInput("");
  }

  function removeGalleryImage(idx) {
    setForm((prev) => ({
      ...prev,
      galleryImages: (prev.galleryImages || []).filter((_, i) => i !== idx),
    }));
  }

  function handleVideoFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result.toString();
      setVideoData(dataUrl);
      setVideoPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, videoUrl: "" }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.departmentId) {
      alert("Name and department are required.");
      return;
    }

    const galleryList = Array.isArray(form.galleryImages) ? form.galleryImages : [];
    const galleryImages = galleryList.filter((img) => img && !img.startsWith("data:"));
    const galleryImageData = galleryList.filter((img) => img && img.startsWith("data:"));

    setSubmitting(true);
    try {
      await apiPost("/doctors", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        departmentId: form.departmentId,
        experience: form.experience,
        degree: form.degree,
        bio: form.about,
        imageData: form.imageData,
        galleryImages,
        galleryImageData,
        videoUrl: form.videoUrl?.trim(),
        videoData: videoData || undefined,
      });
      setToast("Doctor added");
      onSaved?.();
      setTimeout(() => onClose?.(), 400);
    } catch (err) {
      console.error(err);
      alert(getApiErrorMessage(err, "Failed to save doctor"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
        {toast && (
          <div className="absolute left-5 top-4 bg-teal-600/15 border border-teal-500/50 text-teal-200 px-3 py-2 rounded-lg text-sm shadow">
            {toast}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Add Doctor</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create a profile, assign a department, and upload media.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Department</label>
                <Listbox
                  value={form.departmentId}
                  onChange={(v) => setForm((prev) => ({ ...prev, departmentId: v }))}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <span>
                        {departments.find((d) => d._id === form.departmentId)?.name ||
                          "Select department"}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900 shadow-xl border border-slate-700 text-white focus:outline-none z-30">
                      {departments.map((dept) => (
                        <Listbox.Option
                          key={dept._id}
                          value={dept._id}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${
                              active ? "bg-teal-700/70 text-white" : "text-gray-200"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <div className="flex items-center justify-between">
                              <span className={selected ? "font-semibold" : ""}>{dept.name}</span>
                              {selected && <CheckIcon className="h-5 w-5 text-teal-300" />}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                      {departments.length === 0 && (
                        <div className="px-4 py-2 text-sm text-slate-400">No departments</div>
                      )}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="doctor@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="+977-98xxxxxxx"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Experience (years)</label>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="10"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Degree</label>
                <input
                  name="degree"
                  value={form.degree}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="e.g., MD, MBBS"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-slate-300">About</label>
              <textarea
                name="about"
                value={form.about}
                onChange={handleInputChange}
                rows={4}
                className={`${inputClasses} resize-none`}
                placeholder="Short biography and specialties."
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Media</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MediaCard title="Profile photo" helper="Drag/drop or click to upload.">
                <div
                  className="border-2 border-dashed border-slate-700 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 items-center justify-center text-slate-300 cursor-pointer hover:border-teal-500 transition"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="text-center space-y-1">
                    <p className="font-medium">Drop an image here or click to upload</p>
                    <p className="text-xs text-slate-500">Recommended: square, under 5MB. JPG or PNG.</p>
                  </div>
                  {fileName && <p className="text-xs text-teal-300">Selected: {fileName}</p>}
                </div>
                {preview && (
                  <div className="w-full grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-w-[140px] h-28 object-cover rounded-lg border border-slate-700"
                    />
                    <p className="text-xs text-slate-400">This preview will be uploaded and saved.</p>
                  </div>
                )}
              </MediaCard>

              <MediaCard title="Gallery images" helper="Upload additional images.">
                <UploadBox
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleGalleryFiles}
                  label="Upload images"
                  inputRef={galleryInputRef}
                />
                {/* URL paste removed per request; uploads only */}
                {(form.galleryImages || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.galleryImages.map((img, idx) => (
                      <Thumb key={img + idx} src={img} onRemove={() => removeGalleryImage(idx)} />
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-500">Accepted: JPG/PNG/WEBP. Max 10 images.</p>
              </MediaCard>

              <MediaCard title="Profile video" helper="Upload a video or paste a link.">
                <UploadBox
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoFileChange}
                  label="Upload video file"
                />
                <input
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="https://youtube.com/embed/..."
                />
                {videoPreview || form.videoUrl ? (
                  <div className="overflow-hidden rounded-lg border border-slate-700 bg-black">
                    <iframe
                      src={videoPreview || form.videoUrl}
                      className="w-full aspect-video"
                      title="Doctor video preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </MediaCard>
            </div>
          </div>
        </form>

        <div className="mt-auto border-t border-slate-800 bg-[#0b1017] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {submitting ? "Saving..." : "Save Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaCard({ title, helper, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function UploadBox({ accept, multiple, onChange, label, inputRef }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          if (!onChange) return;
          onChange(e);
        }}
      />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-[11px] text-slate-500">{accept || ""}</span>
    </label>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
      <img src={src} className="h-full w-full object-cover" alt="Gallery" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/70 text-white rounded-full text-xs px-1"
      >
        ×
      </button>
    </div>
  );
}
