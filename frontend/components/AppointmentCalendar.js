"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@/styles/fullcalendar.css";

export default function AppointmentCalendar({ events, onDateSelect, onEventClick }) {
  const calendarRef = useRef(null);

  const statusClasses = (status) => {
    switch (status) {
      case "cancelled":
        return "bg-[#7f2d38] border-[#b55460] text-white";
      case "confirmed":
        return "bg-[#0d5047] border-[#31b8a4] text-white";
      case "pending":
        return "bg-[#725d27] border-[#d1b84a] text-white";
      case "completed":
      case "rescheduled":
        return "bg-[#234d7f] border-[#4b8fd1] text-white";
      default:
        return "bg-[#2a2e35] border-[#3b3f46] text-white";
    }
  };

  useEffect(() => {
    return () => {
      const api = calendarRef.current?.getApi?.();
      api?.destroy();
    };
  }, []);

  return (
    <div className="border border-white/5 bg-[#0e1217] rounded-xl p-4">
      {typeof window !== "undefined" && (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={650}
          events={events}
          dateClick={(info) => onDateSelect(info.dateStr)}
          eventClick={(info) => onEventClick?.(info)}
          eventContent={(arg) => ({
            html: `<span class="truncate block">${arg.event.title}</span>`,
          })}
          eventClassNames={(arg) =>
            `px-2 py-1 rounded-md text-xs truncate border cursor-pointer ${statusClasses(
              arg.event.extendedProps?.status
            )}`
          }
        />
      )}
    </div>
  );
}
