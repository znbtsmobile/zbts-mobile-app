import React, { useState } from "react";
import {
  Truck,
  X,
  Plus,
  Building2,
  Calendar,
  User,
  Clock,
  Droplet,
  Save,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { BloodReception, BloodStock } from "../../types";
import { CENTERS } from "../../config/constants";
import { useDataAuth } from "../../hooks/useDataAuth";
import { auth } from "../../services/firebase";

interface NewReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<BloodReception, "id">) => Promise<void>;
  currentInventory: BloodStock[];
}

export const NewReceptionModal: React.FC<NewReceptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { authRow } = useDataAuth();
  const defaultFacility = authRow?.hospitalSite || "zanzibar";

  const getInitialDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const generateReceptionCode = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 7).replace("-", "");
    return `RCP-${dateStr}-${randomSuffix}`;
  };

  const [hospital, setHospital] = useState("");
  const [dateTimeReceived, setDateTimeReceived] = useState(getInitialDateTime());
  const [receiverName, setReceiverName] = useState(
    auth.currentUser?.email ? auth.currentUser.email.split("@")[0] : ""
  );
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hospital) {
      setError("Please select a hospital.");
      return;
    }

    if (!receiverName.trim()) {
      setError("Please enter receiver name.");
      return;
    }

    const unitsNum = parseInt(numberOfUnits, 10);
    if (!numberOfUnits || isNaN(unitsNum) || unitsNum <= 0) {
      setError("Please enter a valid number of blood units (at least 1).");
      return;
    }

    const selectedCenter = CENTERS.find((c) => c.route === hospital);
    const sourceSiteName = selectedCenter ? selectedCenter.title : hospital;

    const destObj = CENTERS.find((c) => c.route === defaultFacility);
    const receivingFacilityName = destObj?.title || "Zanzibar Main Depot (ZNBTS)";

    setIsSubmitting(true);
    try {
      await onSubmit({
        receptionNumber: generateReceptionCode(),
        sourceSite: hospital,
        sourceSiteName,
        receivingFacility: defaultFacility,
        receivingFacilityName,
        receivedDate: dateTimeReceived
          ? new Date(dateTimeReceived).getTime()
          : Date.now(),
        receivedBy: receiverName.trim(),
        courierName: transporterName.trim() || undefined,
        coldChainIntact: true,
        status: "Accepted",
        items: [
          {
            productType: "Whole Blood",
            bloodType: "Consignment",
            quantity: unitsNum
          }
        ],
        totalUnits: unitsNum,
        updatedInventory: false,
        timestamp: Date.now()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 my-6">
        {/* Top Header Banner */}
        <div className="bg-[#1976D2] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 stroke-[2.2]" />
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Record Blood Reception
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-900 mb-2">Form Details</h4>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Field 1: + Hospital */}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
              <Plus className="w-4 h-4 text-slate-700 stroke-[2.5]" />
              <span>Hospital</span>
            </label>
            <div className="relative flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]">
              <div className="px-3.5 py-3 border-r border-slate-300 bg-white text-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                required
                className="w-full px-3 py-3 bg-transparent text-sm font-medium text-slate-800 focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="">Select Hospital</option>
                {CENTERS.map((c) => (
                  <option key={c.route} value={c.route}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 pointer-events-none" />
            </div>
          </div>

          {/* Field 2: Date & Time Received */}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
              <Calendar className="w-4 h-4 text-slate-700" />
              <span>Date & Time Received</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]">
              <div className="px-3.5 py-3 border-r border-slate-300 bg-white text-slate-700 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="datetime-local"
                value={dateTimeReceived}
                onChange={(e) => setDateTimeReceived(e.target.value)}
                required
                className="w-full px-3 py-3 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
              />
              <div className="px-3.5 py-3 text-slate-500 flex items-center justify-center shrink-0 pointer-events-none">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Field 3: Receiver Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
              <User className="w-4 h-4 text-slate-700" />
              <span>Receiver Name</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]">
              <div className="px-3.5 py-3 border-r border-slate-300 bg-white text-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Enter receiver name"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Field 4: Number of Blood Units */}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Number of Blood Units</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]">
              <div className="px-3.5 py-3 border-r border-slate-300 bg-white text-slate-700 flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5" />
              </div>
              <input
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={numberOfUnits}
                onChange={(e) => setNumberOfUnits(e.target.value)}
                required
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Field 5: Transporter Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
              <User className="w-4 h-4 text-slate-700" />
              <span>Transporter Name</span>
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-[#1976D2] focus-within:ring-1 focus-within:ring-[#1976D2]">
              <div className="px-3.5 py-3 border-r border-slate-300 bg-white text-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Enter transporter name"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white py-3.5 px-4 rounded-xl font-bold text-base shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
