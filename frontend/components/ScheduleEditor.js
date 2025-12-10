'use client';

export default function ScheduleEditor({ schedule, onChange }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  function addSlot(day) {
    const newSlot = prompt('Enter time slot (HH:mm)');
    if (!newSlot) return;

    const updated = schedule.map((d) =>
      d.day === day ? { ...d, slots: [...d.slots, newSlot] } : d
    );

    onChange(updated);
  }

  function removeSlot(day, slot) {
    const updated = schedule.map((d) =>
      d.day === day ? { ...d, slots: d.slots.filter((s) => s !== slot) } : d
    );

    onChange(updated);
  }

  return (
    <div className="border p-4 rounded space-y-4">
      <h3 className="font-semibold text-lg mb-2">Weekly Schedule</h3>

      {days.map((day) => {
        const dayData = schedule.find((d) => d.day === day) || { day, slots: [] };

        return (
          <div key={day}>
            <p className="capitalize font-medium">{day}</p>

            <div className="flex gap-2 flex-wrap">
              {dayData.slots.map((slot) => (
                <span
                  key={slot}
                  className="bg-gray-200 px-2 py-1 rounded text-sm cursor-pointer"
                  onClick={() => removeSlot(day, slot)}
                >
                  {slot} ✕
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSlot(day)}
              className="text-blue-600 text-sm mt-1"
            >
              + Add Slot
            </button>

            <hr className="my-3" />
          </div>
        );
      })}
    </div>
  );
}
