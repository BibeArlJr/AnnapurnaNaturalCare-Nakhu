"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import AssociationSelect from "@/components/admin/AssociationSelect";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function NewReviewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    patientName: "",
    country: "",
    headline: "",
    fullReview: "",
    rating: 5,
    associatedProgram: "",
    associatedId: "",
    associatedType: "",
    coverImage: "",
    images: [],
    videoUrl: "",
    videoCoverImage: "",
    status: "draft",
  });
  const [coverUpload, setCoverUpload] = useState(null);
  const [imageUploads, setImageUploads] = useState([]);
  const [videoUpload, setVideoUpload] = useState(null);
  const [videoCoverUpload, setVideoCoverUpload] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = async (files, folder) => {
    if (!files?.length) return [];
    const uploads = await Promise.all(
      files.map(async (file) => {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("folder", folder);
        const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await fetch(`${base}/api/upload`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.secure_url || data.url;
      })
    );
    return uploads.filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let coverImage = form.coverImage;
      if (coverUpload) {
        const [url] = await uploadFiles([coverUpload], "patient-reviews");
        if (url) coverImage = url;
      }

      // Upload new images if any
      let images = [...(form.images || [])];
      if (imageUploads.length) {
        const urls = await uploadFiles(imageUploads.map((i) => i.file), "patient-reviews");
        images = [...images, ...urls.map((url) => ({ url }))].slice(0, 10);
      }
      let videoCoverImage = form.videoCoverImage;
      if (videoCoverUpload) {
        const [url] = await uploadFiles([videoCoverUpload], "patient-reviews");
        if (url) videoCoverImage = url;
      }
      let videoUrl = form.videoUrl;
      if (videoUpload) {
        const [uploadedVideo] = await uploadFiles([videoUpload], "patient-reviews");
        if (uploadedVideo) videoUrl = uploadedVideo;
      }

      await apiPost("/patient-reviews", { ...form, coverImage, images, videoCoverImage, videoUrl });
      router.push("/admin/reviews");
    } catch (err) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleAssociationChange = (selection) => {
    setForm((prev) => ({
      ...prev,
      associatedId: selection.id || "",
      associatedType: selection.type || "",
      associatedProgram: selection.label || (selection.id ? prev.associatedProgram : ""),
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10 - ((form.images?.length || 0) + imageUploads.length));
    const mapped = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImageUploads((prev) => [...prev, ...mapped].slice(0, 10));
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">New Patient Review</h1>
            <p className="text-sm text-slate-400">Create a new testimonial.</p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Patient Name" name="patientName" value={form.patientName} onChange={handleChange} required />
          <Field label="Country" name="country" value={form.country} onChange={handleChange} />
          <Field label="Headline" name="headline" value={form.headline} onChange={handleChange} required />
          <AssociationSelect
            value={{ id: form.associatedId, type: form.associatedType }}
            onChange={handleAssociationChange}
            legacyLabel={form.associatedProgram}
          />
          <Field label="Rating (1-5)" name="rating" type="number" min="1" max="5" value={form.rating} onChange={handleChange} />
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Full Review</label>
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl">
            <ReactQuill
              theme="snow"
              value={form.fullReview}
              onChange={(val) => setForm((prev) => ({ ...prev, fullReview: val }))}
            />
          </div>
        </div>
        <div className="space-y-4 border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <div>
            <h3 className="text-base font-semibold text-white">Media</h3>
            <p className="text-xs text-slate-400">Add optional images or video to enhance the testimonial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cover image */}
            <MediaCard
              title="Cover image"
              helper="Single image shown as the hero thumbnail."
            >
              <UploadBox
                accept="image/png,image/jpeg,image/webp"
                onChange={(file) => setCoverUpload(file)}
                label="Click to upload or drop a file"
              />
              {(coverUpload || form.coverImage) && (
                <div className="mt-3 h-32 w-48 rounded-xl overflow-hidden border border-slate-700 relative">
                  <img
                    src={coverUpload ? URL.createObjectURL(coverUpload) : form.coverImage}
                    className="w-full h-full object-cover"
                    alt="Cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-0.5"
                    onClick={() => {
                      setCoverUpload(null);
                      setForm((p) => ({ ...p, coverImage: "" }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </MediaCard>

            {/* Video testimonial */}
            <MediaCard
              title="Video testimonial"
              helper="Paste a YouTube/Vimeo link or upload an MP4 (max 200MB)."
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Video URL (optional)</label>
                <input
                  name="videoUrl"
                  value={videoUpload ? "" : form.videoUrl}
                  onChange={handleChange}
                  placeholder="Paste video URL"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
              <UploadBox
                accept="video/mp4,video/quicktime"
                onChange={(file) => setVideoUpload(file)}
                label="Upload video file"
              />
              {(form.videoUrl || videoUpload) && (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-black">
                  <video
                    src={videoUpload ? URL.createObjectURL(videoUpload) : form.videoUrl}
                    controls
                    className="w-full"
                    poster={form.videoCoverImage || undefined}
                  />
                </div>
              )}
            </MediaCard>

            {/* Gallery */}
            <MediaCard
              title="Gallery images"
              helper="Upload up to 10 images. Drag to reorder is not required."
            >
              <UploadBox
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleImages}
                label="Upload images"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.images || []).map((img, idx) => (
                  <Thumb key={`saved-${idx}`} src={img.url || img} onRemove={() => setForm((p) => ({ ...p, images: (p.images || []).filter((_, i) => i !== idx) }))} />
                ))}
                {imageUploads.map((img, idx) => (
                  <Thumb key={img.preview} src={img.preview} onRemove={() => setImageUploads((prev) => prev.filter((_, i) => i !== idx))} />
                ))}
              </div>
              <p className="text-[11px] text-slate-500">Accepted: JPG/PNG/WEBP. Max 10 images.</p>
            </MediaCard>

            {/* Video cover */}
            {(form.videoUrl || videoUpload) && (
              <MediaCard
                title="Video cover image"
                helper="Shown as poster before playing the video."
              >
                <UploadBox
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(file) => setVideoCoverUpload(file)}
                  label="Upload cover image"
                />
                {(form.videoCoverImage || videoCoverUpload) && (
                  <div className="mt-3 h-32 w-48 rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={videoCoverUpload ? URL.createObjectURL(videoCoverUpload) : form.videoCoverImage}
                      className="w-full h-full object-cover"
                      alt="Video cover"
                    />
                  </div>
                )}
              </MediaCard>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create review"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/reviews")}
            className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, ...rest }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white text-sm"
        {...rest}
      />
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

function UploadBox({ accept, multiple, onChange, label }) {
  return (
    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-300 cursor-pointer hover:border-teal-500 hover:bg-slate-900">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (!onChange) return;
          if (multiple) {
            onChange(e);
          } else {
            const file = e.target.files?.[0] || null;
            onChange(file);
          }
        }}
      />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-[11px] text-slate-500">{accept || ""}</span>
    </label>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-700">
      <img src={src} className="h-full w-full object-cover" />
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
