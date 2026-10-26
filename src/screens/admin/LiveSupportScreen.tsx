import React, { useState } from "react";
import { Loader2, ArrowLeft, Headphones, User, Phone, ShieldCheck, Users } from "lucide-react";
import { SECURITY_PINS, TIMEZONE } from "../../config/constants";
import { useAdminRoster } from "../../hooks/useAdminRoster";
import { useDataAuth } from "../../hooks/useDataAuth";
import { WeeklyRosterScreen } from "./WeeklyRosterScreen";
import { AdminPanel } from "./AdminPanel";

interface LiveSupportScreenProps {
  onBack?: () => void;
}

export const LiveSupportScreen: React.FC<LiveSupportScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<"ALL" | "LAB_TEAM" | "ADMINS">("ALL");
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const { authRow, loading: authLoading } = useDataAuth();
  const {
    contacts,
    roster,
    staffList,
    loading: rosterLoading,
    updateContact,
    batchUpdateStaffShift,
    addNewStaff,
    updateStaffMember,
    clearStaffSlot,
    deleteStaffCard
  } = useAdminRoster();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem("is_admin_logged_in") === "true"
  );

  const handleAdminLogin = (pin: string): boolean => {
    if (pin === SECURITY_PINS.ADMIN_LOGIN) {
      setIsAdminLoggedIn(true);
      localStorage.setItem("is_admin_logged_in", "true");
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("is_admin_logged_in");
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!handleAdminLogin(adminPin)) {
      setPinError("Incorrect PIN");
    } else {
      setAdminPin("");
      setPinError(null);
    }
  };

  const handleWhatsApp = () => {
    try {
      window.open("https://wa.me/255777101065", "_blank");
    } catch {
      // ignore
    }
  };

  const loading = authLoading || rosterLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full min-h-[400px] justify-center items-center py-20 bg-transparent font-sans">
        <Loader2 className="text-[#1976D2] w-12 h-12 animate-spin mb-4" />
        <p className="text-[#0D47A1] font-medium">Loading Live Support Data...</p>
      </div>
    );
  }

  if (isAdminLoggedIn) {
    return (
      <div className="space-y-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm bg-white hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm w-fit transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <AdminPanel
          contacts={contacts}
          roster={roster}
          staffList={staffList}
          onLogout={handleAdminLogout}
          onUpdateContact={updateContact}
          onBatchUpdateStaff={batchUpdateStaffShift}
          onAddNewStaff={addNewStaff}
          onUpdateStaffMember={updateStaffMember}
          onClearStaffSlot={clearStaffSlot}
          onDeleteStaffCard={deleteStaffCard}
        />
      </div>
    );
  }

  const canAdminLogin = authRow ? authRow.adminLogin !== "DENIED" : true;

  return (
    <div className="space-y-6 text-[#0B1E36] font-sans w-full flex flex-col pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#0D47A1] font-bold text-sm bg-white hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Bookings
          </button>
        )}
      </div>

      {/* Main Hero Card */}
      <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-6 rounded-2xl shadow-sm border border-blue-200/60">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1976D2] text-white flex items-center justify-center shadow-sm">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0B1E36]">Live Support</h1>
            <p className="text-xs sm:text-sm text-[#0D47A1] font-bold">
              Zanzibar Blood Transfusion Service • Emergency & Technical Support
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-200 p-1.5 rounded-2xl max-w-md">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            filter === "ALL"
              ? "bg-white text-[#0D47A1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Support
        </button>
        <button
          onClick={() => setFilter("LAB_TEAM")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            filter === "LAB_TEAM"
              ? "bg-white text-[#0D47A1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Lab Team
        </button>
        <button
          onClick={() => setFilter("ADMINS")}
          className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            filter === "ADMINS"
              ? "bg-white text-[#0D47A1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Admins
        </button>
      </div>

      {/* Section 1: Lab Team Assistance (Weekly Roster) */}
      {(filter === "ALL" || filter === "LAB_TEAM") && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
            <Users className="w-5 h-5 text-[#1976D2]" />
            <h2 className="text-xl font-bold text-[#0B1E36]">Laboratory Duty Team</h2>
          </div>
          <WeeklyRosterScreen roster={roster} />
        </div>
      )}

      {/* Section 2: Admins & Emergency Contacts */}
      {(filter === "ALL" || filter === "ADMINS") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-2">
            <Phone className="w-5 h-5 text-[#1976D2]" />
            <h2 className="text-xl font-bold text-[#0B1E36]">Administrative & Emergency Contacts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {contacts.map((c) => (
              <a
                key={c.position}
                href={`tel:${c.phone}`}
                className="flex items-center bg-white p-4 sm:p-5 rounded-[1.25rem] active:scale-[0.98] transition-all border border-slate-200 shadow-xs hover:shadow-sm cursor-pointer"
              >
                <div className="bg-[#EBF3FC] w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-[#D5E6FA]">
                  <User className="text-[#1976D2] w-6 h-6" />
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[#1976D2] truncate">{c.position}</p>
                  <p className="font-bold text-[#0B1E36] text-base sm:text-lg leading-tight mt-0.5 truncate">{c.name}</p>
                  <p className="text-sm text-[#1976D2] font-semibold flex items-center mt-1 truncate">
                    <Phone className="w-3.5 h-3.5 text-[#1976D2] mr-1.5 shrink-0" /> {c.phone}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* WhatsApp Support Button */}
          <div className="flex flex-col items-center py-6 bg-white/70 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={handleWhatsApp}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:bg-[#1DA851] transition-all active:scale-95 border-none cursor-pointer"
              title="Contact via WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
            <p className="text-[#0D47A1] font-bold text-sm mt-2">WhatsApp Live Chat</p>
          </div>

          {/* Admin Login Box */}
          {canAdminLogin && (
            <form
              onSubmit={handleLoginSubmit}
              className="bg-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm mt-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#1976D2]" />
                <h3 className="font-bold text-base text-[#0B1E36]">Admin System Management</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Enter verification PIN to manage roster shifts and update emergency contacts.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="Verification PIN"
                  className="flex-1 border-2 border-[#1976D2] bg-white p-3 rounded-xl text-[#0B1E36] font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
                />
                <button
                  type="submit"
                  className="bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold px-6 py-3 rounded-xl shadow-sm active:scale-98 transition-transform cursor-pointer"
                >
                  Admin Login
                </button>
              </div>
              {pinError && <p className="text-[#B71C1C] text-sm mt-2 font-bold">{pinError}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSupportScreen;
