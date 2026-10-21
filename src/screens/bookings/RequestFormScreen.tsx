import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { RequestedItem, AuthRow, UrgencyLevel } from "../../types";
import { BLOOD_TYPES, PRODUCT_TYPES, MAX_URGENT_UNITS_PER_BLOOD_TYPE } from "../../config/constants";
import { isRegularBookingOpen } from "../../utils/bookingUtils";

interface RequestFormScreenProps {
 onBack: () => void;
 onSubmit: (hospitalName: string, items: RequestedItem[], urgency: string) => Promise<void> | void;
 authRow: AuthRow | null;
}

export const RequestFormScreen: React.FC<RequestFormScreenProps> = ({
 onBack,
 onSubmit,
 authRow
}) => {
 const lockedSite = authRow?.hospitalSite || "";
 const [hospitalName, setHospitalName] = useState(lockedSite);
 const [urgency, setUrgency] = useState<UrgencyLevel>(
 isRegularBookingOpen() ? "Regular 24hrs" : "Urgent"
 );
 const [quantities, setQuantities] = useState<Record<string, number>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 if (lockedSite) {
 setHospitalName(lockedSite);
 }
 }, [lockedSite]);

 const handleUrgencyChange = (opt: UrgencyLevel) => {
 if (opt === "Regular 24hrs" && !isRegularBookingOpen()) {
 alert("Booking closed for Regular 24hrs.");
 return;
 }
 setUrgency(opt);
 if (opt === "Urgent") {
 setQuantities((prev) => {
 const next = { ...prev };
 Object.keys(next).forEach((key) => {
 const pType = key.split("_")[1];
 if (
 (pType === "Adult PRC" || pType === "PedPRC") &&
 next[key] > MAX_URGENT_UNITS_PER_BLOOD_TYPE
 ) {
 next[key] = MAX_URGENT_UNITS_PER_BLOOD_TYPE;
 }
 });
 return next;
 });
 }
 };

 const handleQtyChange = (bType: string, pType: string, qtyStr: string) => {
 let qty = parseInt(qtyStr) || 0;
 if (
 urgency === "Urgent" &&
 (pType === "Adult PRC" || pType === "PedPRC") &&
 qty > MAX_URGENT_UNITS_PER_BLOOD_TYPE
 ) {
 qty = MAX_URGENT_UNITS_PER_BLOOD_TYPE;
 alert(`Maximum ${MAX_URGENT_UNITS_PER_BLOOD_TYPE} units of ${pType} per blood type allowed for Urgent requests.`);
 }
 setQuantities((prev) => ({ ...prev, [`${bType}_${pType}`]: qty }));
 };

 const handleSubmit = async () => {
 const items: RequestedItem[] = [];
 Object.entries(quantities).forEach(([key, qty]) => {
 const quantity = qty as number;
 if (quantity > 0) {
 const [bloodType, productType] = key.split("_");
 items.push({ bloodType, productType, quantity });
 }
 });

 if (hospitalName.trim() && items.length > 0) {
 setIsSubmitting(true);
 try {
 await onSubmit(hospitalName, items, urgency);
 } finally {
 setIsSubmitting(false);
 }
 } else {
 alert("Please fill in hospital name and at least one blood unit quantity.");
 }
 };

 return (
 <div className="space-y-4 flex-1 flex flex-col">
 <div className="flex items-center space-x-3 pb-2 pt-2">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#1976D2]">New Blood Request</h2>
 </div>

 <div className="flex-1 pb-4">
 <div className="mb-6">
 <label className="block text-sm font-bold text-[#0D47A1] mb-2">
 Hospital Name *
 </label>
 <input
 type="text"
 placeholder="Enter Hospital Name..."
 value={hospitalName}
 disabled={!!lockedSite}
 onChange={(e) => setHospitalName(e.target.value)}
 className="w-full border-2 border-[#1976D2] bg-white p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2]/30 text-[#0B1E36] font-bold text-lg placeholder-[#1E3A8A]/50 shadow-sm disabled:opacity-70 disabled:bg-slate-100"
 />
 </div>

 <div className="space-y-3 mb-6 bg-blue-50/60 p-4 rounded-xl border-2 border-[#1976D2]/60">
 <label className="text-sm font-bold text-[#0D47A1]">Urgency Level</label>
 <div className="flex gap-3">
 <button
 type="button"
 onClick={() => handleUrgencyChange("Regular 24hrs")}
 className={`flex-1 py-3.5 px-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
 urgency === "Regular 24hrs"
 ? "bg-[#1976D2] border-[#1976D2] text-white shadow-sm"
 : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
 }`}
 >
 <Clock className="w-5 h-5" />
 <span>Regular 24hrs</span>
 </button>

 <button
 type="button"
 onClick={() => handleUrgencyChange("Urgent")}
 className={`flex-1 py-3.5 px-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
 urgency === "Urgent"
 ? "bg-[#C62828] border-[#C62828] text-white shadow-sm"
 : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
 }`}
 >
 <AlertTriangle className="w-5 h-5" />
 <span>Urgent</span>
 </button>
 </div>
 {urgency === "Urgent" && (
 <p className="text-xs text-[#C62828] font-semibold mt-1">
 * Urgent requests are limited to maximum 2 units per blood type for Adult PRC and PedPRC.
 </p>
 )}
 </div>

 <div className="space-y-6">
 {PRODUCT_TYPES.map((pType) => (
 <div key={pType} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
 <h3 className="font-bold text-[#0D47A1] mb-3 text-base">{pType}</h3>
 <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
 {BLOOD_TYPES.map((bType) => {
 const key = `${bType}_${pType}`;
 return (
 <div key={bType} className="flex flex-col items-center">
 <label className="text-xs font-bold text-slate-700 mb-1">{bType}</label>
 <input
 type="number"
 min="0"
 max={
 urgency === "Urgent" && (pType === "Adult PRC" || pType === "PedPRC")
 ? MAX_URGENT_UNITS_PER_BLOOD_TYPE
 : 99
 }
 value={quantities[key] || ""}
 onChange={(e) => handleQtyChange(bType, pType, e.target.value)}
 placeholder="0"
 className="w-full bg-white border border-slate-300 rounded-lg p-2 text-center text-sm font-bold text-[#0B1E36] focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
 />
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 <div className="pt-6">
 <button
 onClick={handleSubmit}
 disabled={isSubmitting}
 className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-4 rounded-xl shadow-md active:scale-98 transition-all text-base disabled:opacity-50"
 >
 {isSubmitting ? "Submitting..." : "Submit Blood Request"}
 </button>
 </div>
 </div>
 </div>
 );
};
