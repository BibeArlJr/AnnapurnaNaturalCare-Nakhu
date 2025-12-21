"use client";

import { motion } from 'framer-motion';
import DoctorCard from './DoctorCard';

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function DoctorsGrid({ doctors = [] }) {
  if (!doctors.length) {
    return (
      <p className="text-center text-sm text-[#5a695e]">
        Doctors will appear here once added.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {doctors.map((doctor, index) => (
        <motion.div
          key={doctor._id || doctor.slug || index}
          variants={itemVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
          transition={{ delay: 0.05 * index }}
        >
          <DoctorCard doctor={doctor} />
        </motion.div>
      ))}
    </div>
  );
}
