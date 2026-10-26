import React, { useMemo } from 'react';
import { User, Phone } from 'lucide-react';
import { LabStaff } from '../../types';
import { TIMEZONE } from '../../config/constants';

interface WeeklyRosterScreenProps {
  roster: LabStaff[];
}

export const WeeklyRosterScreen: React.FC<WeeklyRosterScreenProps> = ({ roster }) => {
  const { currentDayStr, dateRange } = useMemo(() => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + (curr.getDay() === 0 ? -6 : 1);
    const last = first + 6;

    const startDate = new Date(new Date().setDate(first));
    const endDate = new Date(new Date().setDate(last));

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };

    return {
      currentDayStr: new Date().toLocaleDateString('en-GB', {
        timeZone: TIMEZONE,
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      dateRange: `${startDate.toLocaleDateString('en-GB', formatOptions)} - ${endDate.toLocaleDateString('en-GB', formatOptions)}`
    };
  }, []);

  const { morningStaff, eveningStaff, weekendStaff } = useMemo(() => {
    const filterShift = (shiftName: string) =>
      roster.filter(
        (s) => s.shift === shiftName && ((s.name && s.name.trim() !== "") || (s.labId && s.phone && s.phone.trim() !== ""))
      );
    return {
      morningStaff: filterShift("Morning"),
      eveningStaff: filterShift("Evening"),
      weekendStaff: filterShift("Weekend")
    };
  }, [roster]);

  return (
    <div className="space-y-6">
      <div className="bg-blue-100 p-5 rounded-2xl shadow-sm">
        <p className="text-[#0D47A1] text-sm font-bold">Today</p>
        <p className="text-[#0B1E36] text-xl font-extrabold">{currentDayStr}</p>
        <div className="h-px bg-blue-200 my-4"></div>
        <p className="text-[#0D47A1] text-sm font-bold">Validity Period (Mon-Sun)</p>
        <p className="text-[#1E3A8A] font-bold">{dateRange}</p>
      </div>

      <RosterSection title="Morning Shift" staffs={morningStaff} />
      <RosterSection title="Evening Shift" staffs={eveningStaff} />
      <RosterSection title="Weekend Shift" staffs={weekendStaff} />
    </div>
  );
};

const RosterSection: React.FC<{ title: string; staffs: LabStaff[] }> = React.memo(({ title, staffs }) => (
  <div>
    <h3 className="text-lg font-bold text-[#0B1E36] mb-3">{title}</h3>
    {staffs.length === 0 ? (
      <p className="text-[#1E3A8A] text-sm font-medium">No staff assigned</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {staffs.map((staff) => (
          <a
            key={staff.id}
            href={`tel:${staff.phone}`}
            className="flex items-center bg-slate-100 p-4 rounded-[1.25rem] active:scale-95 transition-transform shadow-sm cursor-pointer"
          >
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-200">
              <User className="text-[#1976D2] w-6 h-6" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1565C0]">{staff.shift}</p>
              <p className="font-bold text-[#0B1E36] text-lg leading-tight truncate">{staff.labId || staff.id}</p>
              <p className="text-sm text-[#0D47A1] font-semibold flex items-center mt-1 truncate">
                <Phone className="w-3.5 h-3.5 text-[#1976D2] mr-1.5 shrink-0" /> {staff.phone}
              </p>
            </div>
          </a>
        ))}
      </div>
    )}
  </div>
));
