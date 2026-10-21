import React, { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { BloodRequest, BookingNav, NewsCategory } from "../../types";
import { useBloodRequests } from "../../hooks/useBloodRequests";
import { useNews } from "../../hooks/useNews";
import { useDataAuth } from "../../hooks/useDataAuth";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";

import { BookingMainDashboard } from "./BookingMainDashboard";
import { TodaysRequestsScreen } from "./TodaysRequestsScreen";
import { RequestBucketScreen } from "./RequestBucketScreen";
import { RequestFormScreen } from "./RequestFormScreen";
import { RequestDetailScreen } from "./RequestDetailScreen";
import { NewsScreen } from "./NewsScreen";
import { FormDownloadsScreen } from "./FormDownloadsScreen";
import { LiveSupportScreen } from "../admin/LiveSupportScreen";

export default function BookingsScreen() {
 const [currentNav, setCurrentNav] = useState<BookingNav>(BookingNav.DASHBOARD);
 const [listNav, setListNav] = useState<BookingNav>(BookingNav.TODAYS_REQUESTS);
 const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

 const { isOnline } = useNetworkStatus();
 const { authRow, loading: authLoading } = useDataAuth();
 const {
 requests,
 loading: requestsLoading,
 createBloodRequest,
 deleteBloodRequest,
 batchDeleteBloodRequests,
 updateBloodRequestStatus
 } = useBloodRequests();

 const { newsItems, postNews, deleteNews } = useNews();

 const loading = requestsLoading || authLoading;

 // Filter news for internal memo permissions
 const accessibleNews = useMemo(() => {
 return newsItems.filter((item) =>
 item.category === "Internal memo"
 ? authRow ? authRow.internalMemo !== "DENIED" : true
 : true
 );
 }, [newsItems, authRow]);

 return (
 <div className="bg-transparent text-slate-800 p-4 font-sans w-full min-h-full flex flex-col">
 {loading ? (
 <div className="flex flex-col h-full w-full min-h-[400px] justify-center items-center py-20">
 <Loader2 className="text-[#1976D2] w-12 h-12 animate-spin mb-4" />
 <p className="text-[#0D47A1] font-medium">Loading Bookings...</p>
 </div>
 ) : (
 <>
 {currentNav === BookingNav.DASHBOARD && (
 <BookingMainDashboard
 isConnected={isOnline}
 onNavigate={setCurrentNav}
 newsCount={accessibleNews.length}
 />
 )}

 {currentNav === BookingNav.TODAYS_REQUESTS && (
 <TodaysRequestsScreen
 requests={requests}
 isConnected={isOnline}
 onBack={() => setCurrentNav(BookingNav.DASHBOARD)}
 onAdd={() => setCurrentNav(BookingNav.FORM)}
 onView={(req) => {
 setSelectedRequest(req);
 setListNav(BookingNav.TODAYS_REQUESTS);
 setCurrentNav(BookingNav.DETAIL);
 }}
 onDelete={deleteBloodRequest}
 onUpdateStatus={updateBloodRequestStatus}
 />
 )}

 {currentNav === BookingNav.REQUEST_BUCKET && (
 <RequestBucketScreen
 requests={requests}
 onBack={() => setCurrentNav(BookingNav.DASHBOARD)}
 onView={(req) => {
 setSelectedRequest(req);
 setListNav(BookingNav.REQUEST_BUCKET);
 setCurrentNav(BookingNav.DETAIL);
 }}
 onDelete={deleteBloodRequest}
 onBatchDelete={batchDeleteBloodRequests}
 />
 )}

 {currentNav === BookingNav.FORM && (
 <RequestFormScreen
 authRow={authRow}
 onBack={() => setCurrentNav(BookingNav.TODAYS_REQUESTS)}
 onSubmit={async (name, items, urgency) => {
 await createBloodRequest(name, items, urgency);
 setCurrentNav(BookingNav.TODAYS_REQUESTS);
 }}
 />
 )}

 {currentNav === BookingNav.DETAIL && selectedRequest && (
 <RequestDetailScreen
 request={selectedRequest}
 onBack={() => setCurrentNav(listNav)}
 onUpdateStatus={async (id, newStatus) => {
 await updateBloodRequestStatus(id, newStatus);
 setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus as any } : null));
 }}
 />
 )}

 {currentNav === BookingNav.NEWS && (
 <NewsScreen
 newsItems={accessibleNews}
 onBack={() => setCurrentNav(BookingNav.DASHBOARD)}
 onPost={async (title, content, category, author) => {
 return await postNews(title, content, category as NewsCategory, author);
 }}
 onDelete={deleteNews}
 canManagePost={authRow ? authRow.postManagement !== "DENIED" : true}
 />
 )}

 {currentNav === BookingNav.FORM_DOWNLOADS && (
 <FormDownloadsScreen onBack={() => setCurrentNav(BookingNav.DASHBOARD)} />
 )}

 {currentNav === BookingNav.LIVE_SUPPORT && (
 <LiveSupportScreen onBack={() => setCurrentNav(BookingNav.DASHBOARD)} />
 )}
 </>
 )}
 </div>
 );
}
