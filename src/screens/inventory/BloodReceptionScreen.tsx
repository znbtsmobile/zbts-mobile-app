import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Calendar,
  ChevronDown,
  MoreVertical,
  Activity,
  BarChart3,
  Droplet
} from "lucide-react";
import { BloodReception, BloodStock } from "../../types";
import { PinModal } from "../../components/common/PinModal";
import { NewReceptionModal } from "./NewReceptionModal";
import { useBloodReceptions } from "../../hooks/useBloodReceptions";

interface BloodReceptionScreenProps {
  inventory: BloodStock[];
  onBack: () => void;
}

type DateFilterType = "ALL" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL" | "CUSTOM";

export const BloodReceptionScreen: React.FC<BloodReceptionScreenProps> = ({
  inventory,
  onBack
}) => {
  const { receptions, loading, addReception, deleteReception } =
    useBloodReceptions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Search & Date Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("ALL");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  // Format Date & Time as YYYY-MM-DD HH:mm (e.g. 2026-10-13 10:30)
  const formatCardDateTime = (ts: number) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "N/A";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Calculate Dashboard Summary Metrics
  const dashboard = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    ).getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    const daily = receptions
      .filter((r) => (r.receivedDate || r.timestamp) >= startOfToday)
      .reduce((sum, r) => sum + (r.totalUnits || 0), 0);

    const weekly = receptions
      .filter((r) => (r.receivedDate || r.timestamp) >= startOfWeek)
      .reduce((sum, r) => sum + (r.totalUnits || 0), 0);

    const monthly = receptions
      .filter((r) => (r.receivedDate || r.timestamp) >= startOfMonth)
      .reduce((sum, r) => sum + (r.totalUnits || 0), 0);

    const annual = receptions
      .filter((r) => (r.receivedDate || r.timestamp) >= startOfYear)
      .reduce((sum, r) => sum + (r.totalUnits || 0), 0);

    return { daily, weekly, monthly, annual };
  }, [receptions]);

  // Filtered & Sorted Receptions List (Sorted newest first)
  const filteredReceptions = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - diffToMonday
    ).getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    // First sort by date & time descending
    const sorted = [...receptions].sort(
      (a, b) => (b.receivedDate || b.timestamp) - (a.receivedDate || a.timestamp)
    );

    return sorted.filter((r) => {
      const rTime = r.receivedDate || r.timestamp || 0;

      // Date Range Filter
      if (dateFilter === "DAILY" && rTime < startOfToday) {
        return false;
      }
      if (dateFilter === "WEEKLY" && rTime < startOfWeek) {
        return false;
      }
      if (dateFilter === "MONTHLY" && rTime < startOfMonth) {
        return false;
      }
      if (dateFilter === "ANNUAL" && rTime < startOfYear) {
        return false;
      }
      if (dateFilter === "CUSTOM") {
        if (startDateStr) {
          const startMs = new Date(startDateStr).getTime();
          if (rTime < startMs) return false;
        }
        if (endDateStr) {
          const endMs = new Date(endDateStr).setHours(23, 59, 59, 999);
          if (rTime > endMs) return false;
        }
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHospital = (
          r.sourceSiteName ||
          r.sourceSite ||
          ""
        ).toLowerCase().includes(q);
        const matchReceiver = (r.receivedBy || "").toLowerCase().includes(q);
        const matchTransporter = (r.courierName || "").toLowerCase().includes(q);
        const matchCode = (r.receptionNumber || "").toLowerCase().includes(q);
        if (!matchHospital && !matchReceiver && !matchTransporter && !matchCode) {
          return false;
        }
      }

      return true;
    });
  }, [receptions, dateFilter, startDateStr, endDateStr, searchQuery]);

  // Total collected units in current filtered view
  const currentFilteredUnitsTotal = useMemo(() => {
    return filteredReceptions.reduce((sum, r) => sum + (r.totalUnits || 0), 0);
  }, [filteredReceptions]);

  return (
    <div
      className="space-y-5"
      onClick={() => {
        if (openMenuId) setOpenMenuId(null);
      }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1 cursor-pointer"
            title="Back to Stock Modules"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <div>
            <h2 className="text-[20px] font-bold text-[#0D47A1]">Blood Reception</h2>
            <p className="text-xs text-[#1E3A8A] font-semibold">
              Manage blood receiving records from different sites
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Received Blood</span>
        </button>
      </div>

      {/* Dashboard Section: View Total Number of Blood Collections */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-[#0D47A1] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1976D2]" />
            <span>Blood Collections Dashboard</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Daily */}
          <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0D47A1]">
              <span>Daily (Today)</span>
              <Droplet className="w-4 h-4 text-[#1976D2]" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0B1E36]">
              {dashboard.daily}{" "}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
          </div>

          {/* Weekly */}
          <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-100 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
              <span>Weekly (This Week)</span>
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0B1E36]">
              {dashboard.weekly}{" "}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-100 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Monthly (This Month)</span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              {dashboard.monthly}{" "}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
          </div>

          {/* Annual */}
          <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-100 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Annual (This Year)</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800">
              {dashboard.annual}{" "}
              <span className="text-xs font-normal text-slate-500">units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Title */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Blood Collection History
        </h2>

        {/* Controls Bar: Search & Date Range Dropdown */}
        <div className="space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1976D2] shadow-xs"
            />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="pl-3.5 pr-2 py-2.5 text-slate-500 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                className="w-full py-2.5 pr-8 bg-transparent text-sm font-semibold text-slate-800 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL">All Dates</option>
                <option value="DAILY">Daily (Today)</option>
                <option value="WEEKLY">Weekly (This Week)</option>
                <option value="MONTHLY">Monthly (This Month)</option>
                <option value="ANNUAL">Annual (This Year)</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Custom Date Range Pickers (Visible when 'Custom Date Range' selected) */}
          {dateFilter === "CUSTOM" && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-[#0D47A1] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0D47A1] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Total Collections indicator for current filter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>
              Showing {filteredReceptions.length}{" "}
              {filteredReceptions.length === 1 ? "record" : "records"}
            </span>
            <span className="font-bold text-[#0D47A1] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Total Units Collected: {currentFilteredUnitsTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Reception Cards List */}
      {loading ? (
        <p className="text-center py-12 text-[#1E3A8A] font-medium">
          Loading blood reception records...
        </p>
      ) : filteredReceptions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-[#1E3A8A] font-bold text-base">
            No blood reception records found.
          </p>
          <p className="text-xs text-slate-500">
            {searchQuery || dateFilter !== "ALL"
              ? "No records matched your search or date filter. Try selecting 'All Dates' or resetting your search."
              : "Click '+ Record Received Blood' to log a new receiving record."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReceptions.map((r, index) => (
            <div
              key={r.id}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 relative space-y-1.5 hover:border-blue-300 transition-colors"
            >
              {/* Card Header: Index Number, Hospital Name, Action Dots Button */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                  <span className="text-slate-900 font-extrabold">{index + 1}</span>
                  <span>{r.sourceSiteName || r.sourceSite || "Hospital"}</span>
                </h3>

                {/* Action Three Dots Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === r.id ? null : r.id);
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Action menu"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === r.id && (
                    <div className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          setDeleteId(r.id);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span>Delete Record</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details: Exact format from screenshot */}
              <div className="text-xs sm:text-sm text-slate-800 space-y-1 font-medium pt-0.5">
                <p>
                  <span className="font-bold text-slate-900">Units:</span>{" "}
                  <span>{r.totalUnits || 0}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-900">Date & Time:</span>{" "}
                  <span>{formatCardDateTime(r.receivedDate || r.timestamp)}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-900">Transporter:</span>{" "}
                  <span>{r.courierName || "Direct Delivery"}</span>
                </p>
                <p>
                  <span className="font-bold text-slate-900">Receiver:</span>{" "}
                  <span>{r.receivedBy || "Lab Officer"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Reception Modal */}
      <NewReceptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await addReception(data, inventory);
        }}
        currentInventory={inventory}
      />

      {/* Delete Pin Confirmation Modal */}
      <PinModal
        isOpen={!!deleteId}
        title="Delete Blood Reception Record"
        description="Please enter the verification PIN to permanently delete this reception record."
        onConfirm={async () => {
          if (deleteId) {
            await deleteReception(deleteId);
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
