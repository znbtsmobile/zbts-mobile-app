import React, { useState } from 'react';
import { EmergencyContact } from '../../types';

interface ContactEditCardProps {
 contact: EmergencyContact;
 onSave: (name: string, phone: string) => void;
}

export const ContactEditCard: React.FC<ContactEditCardProps> = ({ contact, onSave }) => {
 const [isEditing, setIsEditing] = useState(false);
 const [name, setName] = useState(contact.name);
 const [phone, setPhone] = useState(contact.phone);

 if (isEditing) {
 return (
 <div className="bg-slate-100 p-4 rounded-[1.25rem] shadow-sm space-y-3 transition-all border border-slate-200">
 <p className="text-xs font-semibold text-[#1976D2]">{contact.position}</p>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Name"
 className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-[#1976D2] p-3 rounded-xl text-sm font-semibold text-[#0B1E36] outline-none"
 />
 <input
 type="text"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="Phone"
 className="w-full bg-white border border-slate-300 focus:ring-2 focus:ring-[#1976D2] p-3 rounded-xl text-sm font-semibold text-[#0B1E36] outline-none"
 />
 <div className="flex space-x-2 pt-2">
 <button
 onClick={() => {
 onSave(name, phone);
 setIsEditing(false);
 }}
 className="flex-1 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-2.5 rounded-xl text-sm transition-transform active:scale-95 shadow-sm"
 >
 Save
 </button>
 <button
 onClick={() => setIsEditing(false)}
 className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-transform active:scale-95"
 >
 Cancel
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="bg-white p-4 rounded-[1.25rem] flex justify-between items-center border border-slate-200 shadow-sm">
 <div>
 <p className="text-xs font-semibold text-[#1976D2] mb-1">{contact.position}</p>
 <p className="font-bold text-[#0B1E36] text-lg leading-tight">{contact.name}</p>
 <p className="text-sm text-slate-700 font-medium mt-0.5">{contact.phone}</p>
 </div>
 <button
 onClick={() => setIsEditing(true)}
 className="bg-blue-50 hover:bg-blue-100 text-[#1976D2] px-5 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95 cursor-pointer"
 >
 Edit
 </button>
 </div>
 );
};
