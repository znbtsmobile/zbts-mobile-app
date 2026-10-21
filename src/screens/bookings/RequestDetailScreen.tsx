import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BloodRequest, RequestStatus } from "../../types";
import { formatDateTime } from "../../utils/dateFormatter";
import { RequestStatusBadge, UrgencyBadge } from "../../components/common/StatusBadge";
import { PinModal } from "../../components/common/PinModal";

interface RequestDetailScreenProps {
 request: BloodRequest;
 onBack: () => void;
 onUpdateStatus: (id: string, status: string) => Promise<void> | void;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
 request,
 onBack,
 onUpdateStatus
}) => {
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);
 const [showPinModal, setShowPinModal] = useState(false);

 const handleStatusProceed = () => {
 setShowStatusModal(false);
 setShowPinModal(true);
 };

 const handleStatusConfirmed = async () => {
 await onUpdateStatus(request.id, selectedStatus);
 setShowPinModal(false);
 };

 // Group items by product type
 const groupedItems = request.items.reduce((acc, item) => {
 if (!acc[item.productType]) acc[item.productType] = [];
 acc[item.productType].push(item);
 return acc;
 }, {} as Record<string, typeof request.items>);

 const productTypes = Object.keys(groupedItems).sort();

 return (
 <div className="space-y-4 flex-1">
 <div className="flex items-center space-x-3 pb-2 pt-2">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#1976D2]">Request Details</h2>
 </div>

 <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
 <div className="flex justify-between items-center border-b border-slate-200 pb-3">
 <span className="text-slate-500 text-sm font-medium">Hospital Name:</span>
 <span className="font-bold text-slate-800 text-lg">{request.hospitalName}</span>
 </div>

 <div className="flex justify-between items-center border-b border-slate-200 pb-3">
 <span className="text-slate-500 text-sm font-medium">Status:</span>
 <RequestStatusBadge
 status={request.status}
 editable
 onClick={() => {
 setSelectedStatus(request.status);
 setShowStatusModal(true);
 }}
 />
 </div>

 <div className="flex justify-between items-center border-b border-slate-200 pb-3">
 <span className="text-slate-500 text-sm font-medium">Urgency:</span>
 <UrgencyBadge urgency={request.urgency} />
 </div>

 <div className="flex justify-between items-center border-b border-slate-200 pb-3">
 <span className="text-slate-500 text-sm font-medium">Submitted Time:</span>
 <span className="font-semibold text-slate-800 text-sm">
 {formatDateTime(request.timestamp)}
 </span>
 </div>

 <div className="bg-[#EAE4EA] rounded-xl p-4 mt-4 space-y-3 border border-[#D0C8D0]">
 <h4 className="font-bold text-[#1e2b4d] text-sm border-b border-[#D0C8D0] pb-2">
 Requested Blood Units
 </h4>
 <div className="space-y-4 text-sm mt-3">
 {productTypes.map((type) => (
 <div key={type} className="space-y-2">
 <h5 className="font-bold text-[#1976D2] text-sm">{type}</h5>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {groupedItems[type].map((item, idx) => (
 <div
 key={idx}
 className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
 >
 <span className="font-bold text-slate-800 text-base">{item.bloodType}</span>
 <span className="font-bold bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
 {item.quantity} {item.quantity === 1 ? "unit" : "units"}
 </span>
 </div>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Select Status Dialog */}
 {showStatusModal && (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-2xl p-6 w-full max-w-xs space-y-4 shadow-2xl border border-slate-200">
 <h3 className="font-bold text-lg text-slate-900 text-center">Change Request Status</h3>

 <div className="space-y-2 py-2">
 {(["Pending", "Received", "Processing", "Ready to Collect"] as const).map((s) => (
 <label
 key={s}
 className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-colors ${
 selectedStatus === s ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"
 }`}
 >
 <input
 type="radio"
 name="status"
 checked={selectedStatus === s}
 onChange={() => setSelectedStatus(s)}
 className="w-4 h-4 accent-[#1976D2]"
 />
 <span className="font-semibold text-sm text-slate-800">{s}</span>
 </label>
 ))}
 </div>

 <div className="flex space-x-2 pt-2">
 <button
 onClick={() => setShowStatusModal(false)}
 className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
 >
 Cancel
 </button>
 <button
 onClick={handleStatusProceed}
 className="flex-1 bg-[#1976D2] hover:bg-[#1565C0] text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-sm"
 >
 Next
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Reusable Pin Modal to confirm status update */}
 <PinModal
 isOpen={showPinModal}
 title="Authorize Status Update"
 description={`Enter PIN to update status to "${selectedStatus}".`}
 confirmLabel="Update Status"
 isDestructive={false}
 onConfirm={handleStatusConfirmed}
 onCancel={() => setShowPinModal(false)}
 />
 </div>
 );
};
