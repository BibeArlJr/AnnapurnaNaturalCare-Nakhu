"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";

export default function AppDatePicker({
  selected,
  onChange,
  className = "",
  calendarClassName = "",
  popperClassName = "",
  ...props
}) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className={className}
      popperPlacement="top"
      popperClassName={`date-popper z-50 ${popperClassName}`}
      calendarClassName={`custom-datepicker rounded-xl shadow-xl border border-neutral-300 p-3 text-black bg-white ${calendarClassName}`}
      {...props}
    />
  );
}
