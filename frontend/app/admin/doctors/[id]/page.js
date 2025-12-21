"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import { apiGet, apiPut } from "@/lib/api";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const inputClasses =
  "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function EditDoctorPage({ params }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageData, setImageData] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    departmentId: "",
    experience: "",
    degree: "",
    description: "",
    photo: "",
    medicalQualifications: [],
  });

  useEffect(() => {
    loadDoctor();
  }, [params?.id]);

  async function loadDoctor() {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet(`/doctors/${params.id}`);
      const data = res?.data || res || {};
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        departmentId: data.departmentId?._id || data.departmentId || "",
        experience: data.experienceYears ?? "",
        degree: data.degree || "",
        description: data.description || data.bio || "",
        photo: data.photo || "",
        medicalQualifications: data.medicalQualifications || [],
      });
      setPreview(data.photo || "");
      await loadDepartments();
    } catch (err) {
      setError("Doctor not found");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const res = await apiGet("/departments");
      const data = res?.data || res || [];
      setDepartments(data);
    } catch (err) {
      console.error("Department fetch error:", err);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result.toString());
      setPreview(reader.result.toString());
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function updateQualification(index, field, value) {
    setForm((prev) => {
      const next = [...(prev.medicalQualifications || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, medicalQualifications: next };
    });
  }

  function addQualification() {
    setForm((prev) => ({
      ...prev,
      medicalQualifications: [...(prev.medicalQualifications || []), { degree: "", institution: "", year: "" }],
    }));
  }

  function removeQualification(index) {
    setForm((prev) => ({
      ...prev,
      medicalQualifications: (prev.medicalQualifications || []).filter((_, i) => i !== index),
    }));
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.departmentId) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        experience: form.experience,
        degree: form.degree,
        imageData: imageData || undefined,
        bio: form.description,
        medicalQualifications: (form.medicalQualifications || []).filter((q) => q && q.degree),
      };
      await apiPut(`/doctors/${params.id}`, payload);
      router.push("/admin/doctors");
    } catch (err) {
      setError(err.message || "Failed to update doctor");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <button
          onClick={() => router.push("/admin/doctors")}
          className="absolute top-4 right-4 text-gray-300 hover:text-white bg-slate-700/40 hover:bg-slate-700 rounded-full p-2 transition"
        >
          ✕
        </button>

        <div className="px-6 pt-6 pb-3 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Doctor</h2>
          <p className="text-sm text-slate-400">Update doctor profile, department, and photo.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-6">
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-800 rounded-lg" />
              <div className="h-24 bg-slate-800 rounded-lg" />
              <div className="h-32 bg-slate-800 rounded-lg" />
            </div>
          ) : (
            <>
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

                <div className="space-y-2">
              <label className="text-sm text-slate-300">About / Description</label>
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                    placeholder="Add rich details about the doctor"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Medical Qualifications</p>
                  <button
                    type="button"
                    onClick={addQualification}
                    className="px-3 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-3">
                  {(form.medicalQualifications || []).map((q, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-400">Degree (required)</label>
                        <input
                          className={inputClasses}
                          value={q.degree}
                          onChange={(e) => updateQualification(idx, "degree", e.target.value)}
                          placeholder="e.g., MD, MBBS"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-400">Institution</label>
                        <input
                          className={inputClasses}
                          value={q.institution || ""}
                          onChange={(e) => updateQualification(idx, "institution", e.target.value)}
                          placeholder="e.g., Johns Hopkins"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs text-slate-400">Year</label>
                        <div className="flex gap-2">
                          <input
                            className={inputClasses}
                            value={q.year || ""}
                            onChange={(e) => updateQualification(idx, "year", e.target.value)}
                            placeholder="e.g., 2015"
                          />
                          <button
                            type="button"
                            onClick={() => removeQualification(idx)}
                            className="px-3 py-2 text-xs rounded bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/30 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">Photo</p>
                  <p className="text-xs text-slate-500">Drag & drop or click to upload.</p>
                </div>

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
                  {preview && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-[180px] h-32 object-cover rounded-lg border border-slate-700"
                      />
                      <p className="text-sm text-slate-400">
                        This preview will be uploaded to Cloudinary and saved with the doctor.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </form>

        <div className="mt-auto border-t border-slate-800 bg-[#0b1017] px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/doctors")}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || loading}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition disabled:opacity-70"
          >
            {submitting ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
