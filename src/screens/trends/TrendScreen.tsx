import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Droplet, Loader2 } from "lucide-react";
import { BLOOD_TYPES } from "../../config/constants";
import { useBloodRequests } from "../../hooks/useBloodRequests";
import { useInventory } from "../../hooks/useInventory";

export default function TrendScreen() {
  const { requests, loading: requestsLoading } = useBloodRequests();
  const { inventory, loading: inventoryLoading } = useInventory();

  const loading = requestsLoading || inventoryLoading;

  // Compute Data for Charts in a single pass O(N + M) for high performance
  const chartData = useMemo(() => {
    const dataMap = new Map<string, {
      bloodType: string;
      adultPrcInventory: number;
      pedPrcInventory: number;
      adultPrcRequests: number;
      pedPrcRequests: number;
    }>();

    BLOOD_TYPES.forEach((bt) => {
      dataMap.set(bt, {
        bloodType: bt,
        adultPrcInventory: 0,
        pedPrcInventory: 0,
        adultPrcRequests: 0,
        pedPrcRequests: 0
      });
    });

    inventory.forEach((item) => {
      const entry = dataMap.get(item.bloodType);
      if (!entry) return;
      const qty = Number(item.quantity || 0);
      if (item.productType === "Adult PRC") {
        entry.adultPrcInventory += qty;
      } else if (item.productType === "PedPRC") {
        entry.pedPrcInventory += qty;
      }
    });

    requests.forEach((req) => {
      if (req.status === "Ready to Collect") return;
      req.items?.forEach((item) => {
        const entry = dataMap.get(item.bloodType);
        if (!entry) return;
        const qty = Number(item.quantity || 0);
        if (item.productType === "Adult PRC") {
          entry.adultPrcRequests += qty;
        } else if (item.productType === "PedPRC") {
          entry.pedPrcRequests += qty;
        }
      });
    });

    return Array.from(dataMap.values());
  }, [inventory, requests]);

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full min-h-[400px] justify-center items-center py-20">
        <Loader2 className="text-[#1976D2] w-12 h-12 animate-spin mb-4" />
        <p className="text-[#0D47A1] font-medium">Loading Trends & Analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-slate-800 p-3 sm:p-4 font-sans w-full min-h-full flex flex-col space-y-6 sm:space-y-8">
      <div className="flex items-center space-x-3 pb-2 pt-2 border-b border-slate-300">
        <div className="bg-blue-100 p-2 rounded-xl text-[#1976D2]">
          <TrendingUp className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1976D2]">Trends & Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-8">
        {/* Adult PRC Demand */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 text-[#0D47A1]">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">Adult PRC - Request Demands</h3>
          </div>
          <div className="w-full h-64 sm:h-72 md:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={34}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="bloodType" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} interval={0} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 6, fontSize: 12 }} />
                <Bar dataKey="adultPrcRequests" name="Units Requested" fill="#E53935" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adult PRC Inventory */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 text-[#1565C0]">
            <Droplet className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">Adult PRC - Inventory Stock</h3>
          </div>
          <div className="w-full h-64 sm:h-72 md:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={34}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="bloodType" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} interval={0} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 6, fontSize: 12 }} />
                <Bar dataKey="adultPrcInventory" name="Units in Stock" fill="#1976D2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PedPRC Demand */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 text-[#0D47A1]">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">PedPRC - Request Demands</h3>
          </div>
          <div className="w-full h-64 sm:h-72 md:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={34}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="bloodType" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} interval={0} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 6, fontSize: 12 }} />
                <Bar dataKey="pedPrcRequests" name="Units Requested" fill="#F06292" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PedPRC Inventory */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 text-[#1565C0]">
            <Droplet className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">PedPRC - Inventory Stock</h3>
          </div>
          <div className="w-full h-64 sm:h-72 md:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} maxBarSize={34}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="bloodType" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} interval={0} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 6, fontSize: 12 }} />
                <Bar dataKey="pedPrcInventory" name="Units in Stock" fill="#4FC3F7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
