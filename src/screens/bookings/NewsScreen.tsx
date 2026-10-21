import React, { useState } from "react";
import { ArrowLeft, Megaphone, Plus, Trash2, Search } from "lucide-react";
import { NewsItem, NewsCategory } from "../../types";
import { formatDateTime } from "../../utils/dateFormatter";
import { PinModal } from "../../components/common/PinModal";

interface NewsScreenProps {
 newsItems: NewsItem[];
 onBack: () => void;
 onPost: (
 title: string,
 content: string,
 category: NewsCategory,
 author: string
 ) => Promise<string | null>;
 onDelete: (id: string) => Promise<void>;
 canManagePost: boolean;
}

export const NewsScreen: React.FC<NewsScreenProps> = ({
 newsItems,
 onBack,
 onPost,
 onDelete,
 canManagePost
}) => {
 const [isPublishing, setIsPublishing] = useState(false);
 const [title, setTitle] = useState("");
 const [content, setContent] = useState("");
 const [category, setCategory] = useState<NewsCategory>("Announcement");
 const [author, setAuthor] = useState("ZNBTS Admin");
 const [isPosting, setIsPosting] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

 const handlePostSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!content.trim()) return;
 setIsPosting(true);
 try {
 await onPost(title, content, category, author);
 setTitle("");
 setContent("");
 setIsPublishing(false);
 } catch (err) {
 console.error("Post news error:", err);
 } finally {
 setIsPosting(false);
 }
 };

 const filteredItems = newsItems.filter(
 (item) =>
 item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.author.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getCategoryBadgeClass = (cat: NewsCategory) => {
 switch (cat) {
 case "Urgent":
 return "bg-red-100 text-red-800 border-red-200";
 case "Stock Alert":
 return "bg-amber-100 text-amber-800 border-amber-200";
 case "Internal memo":
 return "bg-purple-100 text-purple-800 border-purple-200";
 case "Announcement":
 return "bg-blue-100 text-blue-800 border-blue-200";
 default:
 return "bg-slate-100 text-slate-700 border-slate-200";
 }
 };

 if (isPublishing) {
 return (
 <div className="space-y-6 flex-1 max-w-4xl mx-auto w-full pb-8 font-sans">
 <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
 <div className="flex items-center space-x-3">
 <button
 onClick={() => setIsPublishing(false)}
 className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0B57D0] transition-transform active:scale-95"
 title="Go back"
 >
 <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
 </button>
 <div>
 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
 <Megaphone className="w-6 h-6 text-[#0B57D0]" />
 <span>Publish Post</span>
 </h2>
 <p className="text-xs text-slate-500 font-medium">Create a new announcement</p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
 <form onSubmit={handlePostSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
 Category / Aina ya Taarifa
 </label>
 <div className="flex flex-wrap gap-2">
 {(["Announcement", "Urgent", "Stock Alert", "General", "Internal memo"] as const).map(
 (cat) => {
 const isSelected = category === cat;
 return (
 <button
 type="button"
 key={cat}
 onClick={() => setCategory(cat)}
 className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
 isSelected
 ? "bg-[#0B57D0] text-white shadow-sm ring-2 ring-[#0B57D0]/30"
 : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
 }`}
 >
 {cat}
 </button>
 );
 }
 )}
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
 Headline / Kichwa cha Habari
 </label>
 <input
 type="text"
 placeholder="e.g. Taarifa ya Uhaba wa Damu Kundi O+"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
 Post Content / Maelezo *
 </label>
 <textarea
 rows={5}
 required
 placeholder="Andika maelezo ya taarifa hapa..."
 value={content}
 onChange={(e) => setContent(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
 Author / Mtoa Taarifa
 </label>
 <input
 type="text"
 value={author}
 onChange={(e) => setAuthor(e.target.value)}
 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B57D0]"
 />
 </div>

 <div className="flex gap-3 pt-3">
 <button
 type="button"
 onClick={() => setIsPublishing(false)}
 className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-all"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isPosting || !content.trim()}
 className="flex-1 bg-[#0B57D0] hover:bg-[#0842A0] text-white py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-md disabled:opacity-50"
 >
 {isPosting ? "Publishing..." : "Publish Post"}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6 flex-1 max-w-4xl mx-auto w-full pb-10">
 <div className="flex items-center justify-between pb-2 pt-2">
 <div className="flex items-center space-x-3">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#1976D2]">News & Updates</h2>
 </div>

 {canManagePost && (
 <button
 onClick={() => setIsPublishing(true)}
 className="flex items-center gap-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-95"
 >
 <Plus className="w-4 h-4" />
 <span>Publish Post</span>
 </button>
 )}
 </div>

 <div className="relative">
 <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search announcements..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-sm font-medium shadow-sm"
 />
 </div>

 {filteredItems.length === 0 ? (
 <div className="text-center py-16 text-slate-500 font-medium">
 No announcements found.
 </div>
 ) : (
 <div className="space-y-4">
 {filteredItems.map((item) => (
 <div
 key={item.id}
 className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 relative group"
 >
 <div className="flex justify-between items-start gap-3">
 <div className="flex items-center gap-2">
 <span
 className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(
 item.category
 )}`}
 >
 {item.category}
 </span>
 <span className="text-xs text-slate-500 font-medium">
 {formatDateTime(item.timestamp)}
 </span>
 </div>

 {canManagePost && (
 <button
 onClick={() => setDeleteTargetId(item.id)}
 title="Delete Post"
 className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 )}
 </div>

 <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
 <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
 {item.content}
 </p>

 <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
 <span>Author: <strong className="text-slate-700">{item.author}</strong></span>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Reusable Pin Modal to delete post */}
 <PinModal
 isOpen={!!deleteTargetId}
 title="Delete Announcement"
 description="Please enter the verification PIN to permanently delete this post."
 onConfirm={async () => {
 if (deleteTargetId) {
 await onDelete(deleteTargetId);
 setDeleteTargetId(null);
 }
 }}
 onCancel={() => setDeleteTargetId(null)}
 />
 </div>
 );
};
