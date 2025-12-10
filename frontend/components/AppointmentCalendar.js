"use client";

import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function AppointmentCalendar({ events, onDateSelect }) {
  const calendarRef = useRef(null);

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
          eventDisplay="block"
          eventClassNames="bg-teal-600 text-white text-xs p-1 rounded"
        />
      )}
    </div>
  );
}
