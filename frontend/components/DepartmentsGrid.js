"use client";

import { motion } from 'framer-motion';
import DepartmentCard from '@/components/DepartmentCard';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function DepartmentsGrid({ departments = [] }) {
  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {departments.map((dep, index) => (
        <motion.div
          key={dep._id}
          variants={cardVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.05 * index }}
          whileHover={{ y: -4, transition: { duration: 0.3, ease: 'easeOut' } }}
        >
          <DepartmentCard department={dep} />
        </motion.div>
      ))}
    </div>
  );
}
