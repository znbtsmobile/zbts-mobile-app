import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Clock, Eye, Trash2 } from "lucide-react";
import { BloodRequest, RequestStatus } from "../../types";
import { formatDate } from "../../utils/dateFormatter";
import { PinModal } from "../../components/common/PinModal";

interface RequestBucketScreenProps {
 requests: BloodRequest[];
 onBack: () => void;
 onView: (req: BloodRequest) => void;
 onDelete: (id: string) => void;
 onBatchDelete?: (ids: string[]) => Promise<void>;
}

export const RequestBucketScreen: React.FC<RequestBucketScreenProps> = ({
 requests,
 onBack,
 onView,
 onDelete,
 onBatchDelete
}) => {
 const [selectedCategory, setSelectedCategory] = useState<RequestStatus>("Pending");
 const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
 const [showDeleteModal, setShowDeleteModal] = useState(false);

 const pastRequests = useMemo(() => {
 const todayStart = new Date().setHours(0, 0, 0, 0);
 return requests.filter(
 (r) => r.timestamp < todayStart && r.status === selectedCategory
 );
 }, [requests, selectedCategory]);

 useEffect(() => {
 setCheckedIds(new Set());
 }, [selectedCategory]);

 const toggleCheck = (id: string, e: React.MouseEvent) => {
 e.stopPropagation();
 const next = new Set(checkedIds);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 setCheckedIds(next);
 };

 const handleExecuteDelete = async () => {
 if (onBatchDelete && checkedIds.size > 0) {
 await onBatchDelete(Array.from(checkedIds));
 } else {
 for (const id of checkedIds) {
 onDelete(id);
 }
 }
 setCheckedIds(new Set());
 setShowDeleteModal(false);
 };

 return (
 <div className="space-y-5 flex-1 flex flex-col relative">
 <div className="flex items-center space-x-3 pb-2 pt-2">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#1976D2]">Request History</h2>
 </div>

 <div className="flex bg-[#EAE4EA] p-1.5 rounded-2xl overflow-x-auto gap-1">
 {["Pending", "Received", "Processing", "Ready to Collect"].map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat as RequestStatus)}
 className={`flex-1 py-2.5 px-3 whitespace-nowrap rounded-xl font-bold text-sm transition-all ${
 selectedCategory === cat
 ? "bg-[#D9E6F6] text-[#0D47A1] shadow-sm"
 : "text-[#1E3A8A] hover:text-[#0B1E36]"
 }`}
 >
 {cat}
 </button>
 ))}
 </div>

 {pastRequests.length === 0 ? (
 <div className="text-center py-12 text-[#1E3A8A] flex-1 font-bold">
 No past requests in this category.
 </div>
 ) : (
 <div className="space-y-4 flex-1">
 {pastRequests.map((req, idx) => (
 <div
 key={req.id}
 className="bg-[#EAE4EA] p-4 rounded-[1.25rem] shadow-sm flex items-center gap-3 border border-white/60"
 >
 <div
 className="shrink-0 cursor-pointer p-1"
 onClick={(e) => toggleCheck(req.id, e)}
 >
 <input
 type="checkbox"
 checked={checkedIds.has(req.id)}
 readOnly
 className="w-5 h-5 rounded border-slate-300 text-[#1976D2] focus:ring-[#1976D2] pointer-events-none"
 />
 </div>
 <div className="flex-1 flex items-center gap-3">
 {/* Number Badge */}
 <div className="relative flex items-center justify-center shrink-0">
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2196F3] via-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center font-black text-base shadow-sm border border-blue-200/50">
 {idx + 1}
 </div>
 </div>

 <div>
 <div className="font-bold text-[#0B1E36] text-lg uppercase">{req.hospitalName}</div>
 <div className="text-sm text-[#1E3A8A] font-bold flex items-center gap-1.5 mt-0.5">
 <Clock className="w-4 h-4 text-[#1976D2]" />
 {formatDate(req.timestamp)}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <button
 onClick={() => onView(req)}
 className="bg-[#D9E6F6] hover:bg-[#C2D7F2] text-[#1976D2] p-2.5 rounded-xl transition-transform active:scale-95 flex items-center justify-center shadow-sm"
 title="View Request"
 >
 <Eye className="w-5 h-5" />
 </button>

 <button
 onClick={() => {
 const next = new Set(checkedIds);
 next.add(req.id);
 setCheckedIds(next);
 setShowDeleteModal(true);
 }}
 title="Delete Request"
 className="w-10 h-10 rounded-full bg-gradient-to-br from-[#EF5350] via-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-sm border border-red-200/40 transition-transform active:scale-90"
 >
 <Trash2 className="w-5 h-5 text-white fill-white/20 stroke-[2.2]" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}

 {checkedIds.size > 0 && (
 <div className="fixed bottom-6 inset-x-0 mx-auto w-max z-10 animate-in fade-in slide-in-from-bottom-4">
 <button
 onClick={() => setShowDeleteModal(true)}
 className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-6 py-3 rounded-[1.25rem] font-bold shadow-sm flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
 >
 <Trash2 className="w-5 h-5" />
 Delete Selected ({checkedIds.size})
 </button>
 </div>
 )}

 {/* Pin Modal for batch or single item deletion */}
 <PinModal
 isOpen={showDeleteModal}
 title="Confirm Deletion"
 description={`Please enter the verification PIN to delete ${checkedIds.size} request${
 checkedIds.size > 1 ? "s" : ""
 }.`}
 onConfirm={handleExecuteDelete}
 onCancel={() => setShowDeleteModal(false)}
 />
 </div>
 );
};
