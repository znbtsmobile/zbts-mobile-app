import React, { useState, useMemo } from "react";
import { ArrowLeft, Trash2, Info, Plus } from "lucide-react";
import { BloodRequest } from "../../types";
import { formatDate, formatTime } from "../../utils/dateFormatter";
import { UrgencyBadge, RequestStatusBadge } from "../../components/common/StatusBadge";
import { PinModal } from "../../components/common/PinModal";

interface TodaysRequestsScreenProps {
 requests: BloodRequest[];
 isConnected: boolean;
 onBack: () => void;
 onAdd: () => void;
 onView: (req: BloodRequest) => void;
 onDelete: (id: string) => void;
 onUpdateStatus: (id: string, status: string) => void;
}

export const TodaysRequestsScreen: React.FC<TodaysRequestsScreenProps> = ({
 requests,
 onBack,
 onAdd,
 onView,
 onDelete
}) => {
 const [deleteId, setDeleteId] = useState<string | null>(null);

 const todaysRequests = useMemo(() => {
 const todayStart = new Date().setHours(0, 0, 0, 0);
 return requests.filter((r) => r.timestamp >= todayStart);
 }, [requests]);

 return (
 <div className="space-y-4 flex-1 flex flex-col relative">
 <div className="flex items-center justify-between pb-2 pt-2">
 <div className="flex items-center space-x-3">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#0D47A1]">Today's Active Requests</h2>
 </div>
 <button
 onClick={onAdd}
 className="flex items-center gap-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95"
 >
 <Plus className="w-4 h-4" />
 <span>New Request</span>
 </button>
 </div>

 <div className="bg-[#EAE4EA] rounded-2xl p-4 flex items-start space-x-3 shadow-sm border border-[#D0C8D0]">
 <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#0B1E36]" />
 <p className="text-sm font-medium leading-relaxed text-[#0B1E36]">
 Online booking does not replace the official blood request process. Please bring the blood request form when collecting blood.
 </p>
 </div>

 {todaysRequests.length === 0 ? (
 <div className="text-center py-12 text-[#1E3A8A] flex-1 font-bold">
 No blood requests for today.
 </div>
 ) : (
 <div className="space-y-4 flex-1">
 {todaysRequests.map((req, idx) => {
 const dateString = formatDate(req.timestamp);
 const timeString = formatTime(req.timestamp);

 return (
 <div
 key={req.id}
 onClick={() => onView(req)}
 className="bg-[#EAE4EA] p-4 rounded-[1.25rem] shadow-sm cursor-pointer space-y-3 transition-transform active:scale-[0.99] border border-white/60"
 >
 <div className="flex justify-between items-start gap-2">
 <div className="flex items-start gap-3">
 {/* Number Icon Badge */}
 <div className="relative flex items-center justify-center shrink-0 mt-0.5">
 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2196F3] via-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center font-black text-lg shadow-sm border border-blue-200/50">
 {idx + 1}
 </div>
 </div>

 <div>
 <div className="flex items-center flex-wrap gap-2 mt-0.5">
 <span className="uppercase text-lg font-bold text-[#0B1E36]">
 {req.hospitalName}
 </span>
 </div>

 <div className="mt-2">
 <UrgencyBadge urgency={req.urgency} />
 </div>
 </div>
 </div>

 <div className="flex items-center space-x-3 mt-1">
 <span className="text-xs sm:text-sm text-[#1E3A8A] font-bold">
 {dateString} {timeString}
 </span>

 <button
 onClick={(e) => {
 e.stopPropagation();
 setDeleteId(req.id);
 }}
 title="Delete Request"
 className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF5350] via-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-sm border border-red-200/40 transition-transform active:scale-90"
 >
 <Trash2 className="w-5 h-5 text-white fill-white/20 stroke-[2.2]" />
 </button>
 </div>
 </div>

 <div className="flex justify-between items-center pt-2 border-t border-slate-300/60">
 <RequestStatusBadge status={req.status} />
 <span className="text-xs font-semibold text-slate-600">
 {req.items.reduce((acc, item) => acc + Number(item.quantity || 0), 0)} units requested
 </span>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Reusable Pin Modal for Deletions */}
 <PinModal
 isOpen={!!deleteId}
 title="Delete Blood Request"
 description="Please enter the verification PIN to delete this request record."
 onConfirm={() => {
 if (deleteId) {
 onDelete(deleteId);
 setDeleteId(null);
 }
 }}
 onCancel={() => setDeleteId(null)}
 />
 </div>
 );
};
