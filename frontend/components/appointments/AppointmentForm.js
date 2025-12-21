"use client";

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import Container from '@/components/Container';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function AppointmentForm() {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    departmentId: '',
    doctorId: '',
    date: '',
    message: '',
  });
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadDeps() {
      try {
        const res = await apiGet('/departments');
        setDepartments(res?.data || res || []);
      } catch (_) {
        setDepartments([]);
        setError('Failed to load departments');
      } finally {
        setLoadingDeps(false);
      }
    }
    loadDeps();
  }, []);

  useEffect(() => {
    async function loadDoctors() {
      if (!formState.departmentId) {
        setDoctors([]);
        return;
      }
      setLoadingDocs(true);
      try {
        const res = await apiGet('/doctors');
        const all = res?.data || res || [];
        const filtered = all.filter(
          (d) => (d.departmentId?._id || d.departmentId) === formState.departmentId
        );
        setDoctors(filtered);
      } catch (_) {
        setDoctors([]);
      } finally {
        setLoadingDocs(false);
      }
    }
    loadDoctors();
  }, [formState.departmentId]);

  const isDoctorDisabled = !formState.departmentId || loadingDocs || doctors.length === 0;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');

    if (!formState.name || !formState.phone || !formState.departmentId || !formState.date) {
      setSubmitError('Please complete required fields.');
      return;
    }

    const department = departments.find((d) => d._id === formState.departmentId);
    const doctor = doctors.find((d) => d._id === formState.doctorId);

    const payload = {
      patientName: formState.name,
      patientEmail: formState.email,
      patientPhone: formState.phone,
      departmentId: formState.departmentId,
      departmentName: department?.name,
      service: department?.name,
      doctorId: formState.doctorId || undefined,
      doctor: doctor?.name || undefined,
      doctorName: doctor?.name || undefined,
      date: formState.date,
      time: formState.time,
      message: formState.message,
    };

    setSubmitting(true);
    try {
      await apiPost('/appointments', payload);
      setSuccess('Your appointment request has been sent. We will contact you shortly.');
      setFormState({
        name: '',
        phone: '',
        email: '',
        departmentId: '',
        doctorId: '',
        date: '',
        time: '',
        message: '',
      });
      setDoctors([]);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Could not submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="pb-12 md:pb-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#cfe8d6] shadow-sm rounded-2xl p-6 md:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                value={formState.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                required
                value={formState.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="email">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="departmentId">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formState.departmentId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
                required
                disabled={loadingDeps}
              >
                <option value="">{loadingDeps ? 'Loading departments...' : 'Select department'}</option>
                {(departments || []).map((dep) => (
                  <option key={dep._id} value={dep._id}>
                    {dep.name}
                  </option>
                ))}
              </select>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="doctorId">
                Doctor (optional)
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={formState.doctorId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none disabled:bg-slate-100"
                disabled={isDoctorDisabled}
              >
                <option value="">Any available doctor</option>
                {(doctors || []).map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {isDoctorDisabled && formState.departmentId && doctors.length === 0 && !loadingDocs ? (
                <p className="text-xs text-[#5a695e]">No doctors available for this department</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="date">
                Preferred Date <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={formState.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#10231a]" htmlFor="time">
                Preferred Time
              </label>
              <input
                id="time"
                name="time"
                type="time"
                value={formState.time}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#10231a]" htmlFor="message">
              Message / Health concern
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={formState.message}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#d7e7dc] bg-white px-4 py-3 text-sm text-[#10231a] focus:border-[#2F8D59] focus:ring-2 focus:ring-[#cfe8d6] outline-none resize-none"
              placeholder="Briefly describe your concern"
            />
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          {success && <p className="text-sm text-[#2F8D59] font-medium">{success}</p>}

          <motion.button
            whileHover={{ scale: submitting ? 1 : 1.02, transition: { duration: 0.2, ease: 'easeOut' } }}
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto inline-flex justify-center rounded-full bg-[#2F8D59] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#27784c] disabled:opacity-60"
          >
            {submitting ? 'Sending...' : 'Request Appointment'}
          </motion.button>
        </form>
      </motion.div>
    </Container>
  );
}
