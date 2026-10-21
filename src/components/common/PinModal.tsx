import React, { useState } from 'react';
import { SECURITY_PINS } from '../../config/constants';
import { playErrorSound } from '../../services/audio';

interface PinModalProps {
 isOpen: boolean;
 title?: string;
 description?: string;
 expectedPin?: string;
 confirmLabel?: string;
 isDestructive?: boolean;
 onConfirm: () => void | Promise<void>;
 onCancel: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
 isOpen,
 title = "Confirm Action",
 description = "Please enter the verification PIN to proceed.",
 expectedPin = SECURITY_PINS.VERIFICATION,
 confirmLabel = "Confirm",
 isDestructive = true,
 onConfirm,
 onCancel
}) => {
 const [pin, setPin] = useState("");
 const [error, setError] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 if (!isOpen) return null;

 const handleSubmit = async (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 if (pin === expectedPin || !expectedPin) {
 setError(false);
 setIsSubmitting(true);
 try {
 await onConfirm();
 setPin("");
 } finally {
 setIsSubmitting(false);
 }
 } else {
 setError(true);
 playErrorSound();
 }
 };

 const handleClose = () => {
 setPin("");
 setError(false);
 onCancel();
 };

 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 border border-[#1976D2] shadow-xl">
 <h3 className="font-bold text-lg text-center text-slate-800">{title}</h3>
 {description && <p className="text-sm text-center text-slate-600">{description}</p>}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <input
 type="password"
 inputMode="numeric"
 pattern="[0-9]*"
 placeholder="Enter PIN"
 value={pin}
 autoFocus
 onChange={(e) => {
 setPin(e.target.value);
 setError(false);
 }}
 className="w-full border-2 border-[#1976D2] bg-white p-3.5 rounded-xl text-center text-xl font-bold tracking-widest text-[#0B1E36] focus:outline-none focus:ring-2 focus:ring-[#1976D2]/30 shadow-inner"
 />
 {error && (
 <p className="text-xs text-red-600 text-center font-bold mt-2">
 Incorrect PIN. Please try again.
 </p>
 )}
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={handleClose}
 className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className={`flex-1 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all shadow-md ${
 isDestructive
 ? "bg-[#C62828] hover:bg-[#B71C1C]"
 : "bg-[#1976D2] hover:bg-[#1565C0]"
 }`}
 >
 {isSubmitting ? "Processing..." : confirmLabel}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};
