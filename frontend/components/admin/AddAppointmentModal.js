"use client";

import { useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { apiGet, apiPost } from "@/lib/api";
import AppDatePicker from "@/components/ui/DatePicker";

function Dropdown({ label, value, onChange, options = [], placeholder }) {
  const buttonStyles =
    "relative w-full cursor-pointer rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative mt-1">
          <Listbox.Button className={buttonStyles}>
            <span>{value || placeholder || `Select ${label}`}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>

          <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-slate-900 shadow-xl border border-slate-700 text-white focus:outline-none z-30">
            {options.map((option, idx) => (
              <Listbox.Option
                key={idx}
                value={option}
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-2 ${
                    active ? "bg-teal-700/70 text-white" : "text-gray-200"
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span className={selected ? "font-semibold" : ""}>{option}</span>
                    {selected && <CheckIcon className="h-5 w-5 text-teal-300" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2 text-sm text-slate-400">No options</div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

export default function AddAppointmentModal({ open, onClose, onSaved }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    service: "",
    doctor: "",
    time: "",
    ampm: "AM",
    message: "",
  });
  const [date, setDate] = useState(null);
  const [toast, setToast] = useState("");

  const inputClasses =
    "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500";

  useEffect(() => {
    if (open) {
      fetchDoctors();
      fetchDepartments();
      setToast("");
    }
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchDoctors() {
    try {
      const res = await apiGet("/doctors");
      const data = res?.data || res || [];
      setDoctors(data);
    } catch (err) {
      console.error("Doctor fetch error:", err);
    }
  }

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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
    if (!formattedDate) {
      alert("Please select a date.");
      return;
    }

    const finalTime = form.time ? `${form.time} ${form.ampm}` : "";

    try {
      await apiPost("/appointments", {
        patientName: form.patientName,
        patientEmail: form.patientEmail,
        patientPhone: form.patientPhone,
        service: form.service,
        doctor: form.doctor,
        date: formattedDate,
        time: finalTime,
        message: form.message,
      });

      setToast("Appointment saved");
      onSaved();
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error(err);
      alert("Error saving appointment");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0d1218] border border-slate-800 rounded-2xl shadow-2xl flex flex-col">
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
          <h2 className="text-xl font-semibold text-white">Add Appointment</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create a new booking with patient and schedule details.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 space-y-5">
          <form
            id="add-appointment-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Patient
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Patient Name</label>
                  <input
                    name="patientName"
                    required
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Email</label>
                  <input
                    type="email"
                    name="patientEmail"
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Phone</label>
                  <input
                    name="patientPhone"
                    required
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-1">
                  <Dropdown
                    label="Department"
                    value={form.service}
                    onChange={(v) => setForm({ ...form, service: v })}
                    options={departments.map((d) => d.name)}
                    placeholder="Choose department"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Appointment
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dropdown
                  label="Doctor"
                  value={form.doctor}
                  onChange={(v) => setForm({ ...form, doctor: v })}
                  options={doctors.map((d) => d.name)}
                  placeholder="Select doctor"
                />

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Preferred Date</label>
                  <div className="relative">
                    <AppDatePicker
                      selected={date}
                      onChange={(d) => setDate(d)}
                      className={inputClasses}
                      calendarClassName="custom-datepicker"
                      popperClassName="date-popper"
                      shouldCloseOnSelect
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Preferred Time</label>
                  <div className="flex gap-3">
                    <input
                      type="time"
                      name="time"
                      required
                      onChange={handleChange}
                      className={`${inputClasses} flex-1`}
                    />
                    <div className="flex rounded-xl border border-slate-700 overflow-hidden">
                      {["AM", "PM"].map((period) => (
                        <button
                          type="button"
                          key={period}
                          onClick={() => setForm({ ...form, ampm: period })}
                          className={`px-4 py-3 text-sm font-medium transition ${
                            form.ampm === period
                              ? "bg-teal-600 text-white"
                              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-slate-300">Message / Notes</label>
                <textarea
                  name="message"
                  rows={3}
                  onChange={handleChange}
                  className={`${inputClasses} resize-none`}
                  placeholder="Additional details, symptoms, or notes"
                />
              </div>
            </div>
          </form>
        </div>

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
            form="add-appointment-form"
            className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition"
          >
            Save Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
