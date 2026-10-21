import React, { useState } from 'react';
import { User, Phone } from 'lucide-react';
import { EmergencyContact, LabStaff, ShiftType, StaffMember } from '../../types';
import { AdminPanel } from './AdminPanel';

interface EmergencyContactsScreenProps {
  contacts: EmergencyContact[];
  roster: LabStaff[];
  staffList?: StaffMember[];
  isAdminLoggedIn: boolean;
  onLogin: (pin: string) => boolean;
  onLogout: () => void;
  onUpdateContact: (id: number, name: string, phone: string, pos: string) => void;
  onBatchUpdateStaff: (shift: ShiftType, selectedNames: Set<string>, maxAllowed: number) => Promise<void>;
  onAddNewStaff?: (id: string, name: string, phone: string) => Promise<void>;
  onUpdateStaffMember?: (cardId: string, newId: string, newName: string, newPhone: string) => Promise<void>;
  onClearStaffSlot?: (cardId: string, staffName?: string) => Promise<void>;
  onDeleteStaffCard?: (cardId: string, staffName?: string) => Promise<void>;
  canAdminLogin?: boolean;
}

export const EmergencyContactsScreen: React.FC<EmergencyContactsScreenProps> = ({
  contacts,
  roster,
  staffList = [],
  isAdminLoggedIn,
  onLogin,
  onLogout,
  onUpdateContact,
  onBatchUpdateStaff,
  onAddNewStaff,
  onUpdateStaffMember,
  onClearStaffSlot,
  onDeleteStaffCard,
  canAdminLogin = true
}) => {
  const [adminPin, setAdminPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleWhatsApp = () => {
    try {
      window.open("https://wa.me/255777101065", "_blank");
    } catch (e) {
      alert("WhatsApp could not be opened.");
    }
  };

  if (isAdminLoggedIn) {
    return (
      <AdminPanel
        contacts={contacts}
        roster={roster}
        staffList={staffList}
        onLogout={onLogout}
        onUpdateContact={onUpdateContact}
        onBatchUpdateStaff={onBatchUpdateStaff}
        onAddNewStaff={onAddNewStaff}
        onUpdateStaffMember={onUpdateStaffMember}
        onClearStaffSlot={onClearStaffSlot}
        onDeleteStaffCard={onDeleteStaffCard}
      />
    );
  }

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onLogin(adminPin)) {
      setError("Incorrect PIN");
    } else {
      setAdminPin("");
      setError(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-100 p-6 rounded-2xl shadow-sm">
        <p className="text-[#0D47A1] font-bold text-sm">Blood Bank</p>
        <h2 className="text-2xl font-bold text-[#0B1E36]">Admins & Contacts</h2>
        <p className="text-[#1E3A8A] text-sm mt-2 font-semibold">
          For emergency coordination and operational support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {contacts.map((c) => (
          <a
            key={c.position}
            href={`tel:${c.phone}`}
            className="flex items-center bg-white p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] active:scale-[0.98] transition-all border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgb(0,0,0,0.06)] cursor-pointer"
          >
            <div className="bg-[#EBF3FC] w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-[#D5E6FA]">
              <User className="text-[#1976D2] w-6 h-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-[#1976D2]">{c.position}</p>
              <p className="font-bold text-[#0B1E36] text-lg sm:text-[19px] leading-tight mt-0.5">{c.name}</p>
              <p className="text-sm text-[#1976D2] font-semibold flex items-center mt-1">
                <Phone className="w-3.5 h-3.5 text-[#1976D2] mr-1.5" /> {c.phone}
              </p>
            </div>
          </a>
        ))}
      </div>

      <div className="flex flex-col items-center py-6">
        <button
          onClick={handleWhatsApp}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:bg-[#1DA851] transition-all active:scale-95 border-none cursor-pointer"
          title="Contact via WhatsApp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
        <p className="text-[#0D47A1] font-bold mt-2">System Help</p>
      </div>

      {canAdminLogin && (
        <form
          onSubmit={handleLoginSubmit}
          className="bg-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm mt-8"
        >
          <h3 className="font-bold text-lg mb-3 text-[#0B1E36]">Admin Login</h3>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={adminPin}
            onChange={(e) => {
              setAdminPin(e.target.value);
              setError(null);
            }}
            placeholder="Verification PIN"
            className="w-full border-2 border-[#1976D2] bg-white p-3 rounded-xl mb-2 text-[#0B1E36] font-bold placeholder-[#1E3A8A]/70 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
          />
          {error && <p className="text-[#B71C1C] text-sm mb-3 font-bold">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-3 rounded-xl shadow-sm active:scale-98 transition-transform cursor-pointer"
          >
            Login
          </button>
        </form>
      )}
    </div>
  );
};
