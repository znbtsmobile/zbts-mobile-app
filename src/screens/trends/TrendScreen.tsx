import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from "recharts";
import { TrendingUp, Activity, Layers, Loader2 } from "lucide-react";
import { BLOOD_TYPES } from "../../config/constants";
import { useBloodRequests } from "../../hooks/useBloodRequests";
import { useInventory } from "../../hooks/useInventory";

const renderBarLabel = (props: any, color: string) => {
  const { x, y, width, height, value } = props;
  if (!value || Number(value) === 0) return null;
  const num = Number(value);
  const isTall = typeof height === "number" && height >= 22;
  return (
    <text
      x={x + width / 2}
      y={isTall ? y + 13 : y - 4}
      fill={isTall ? "#ffffff" : color}
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
      style={isTall ? { textShadow: "0 1px 2px rgba(0,0,0,0.5)" } : undefined}
    >
      {num}
    </text>
  );
};

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

  const totals = useMemo(() => {
    let adultStock = 0;
    let adultReq = 0;
    let pedStock = 0;
    let pedReq = 0;

    chartData.forEach((d) => {
      adultStock += d.adultPrcInventory;
      adultReq += d.adultPrcRequests;
      pedStock += d.pedPrcInventory;
      pedReq += d.pedPrcRequests;
    });

    return { adultStock, adultReq, pedStock, pedReq };
  }, [chartData]);

  // Synchronized unified scale for Adult PRC so Request height matches Stock height accurately
  const maxAdultVal = useMemo(() => {
    let max = 10;
    chartData.forEach((d) => {
      max = Math.max(max, d.adultPrcInventory, d.adultPrcRequests);
    });
    return Math.ceil((max * 1.15) / 20) * 20;
  }, [chartData]);

  // Synchronized unified scale for PedPRC so Request height matches Stock height accurately
  const maxPedVal = useMemo(() => {
    let max = 10;
    chartData.forEach((d) => {
      max = Math.max(max, d.pedPrcInventory, d.pedPrcRequests);
    });
    return Math.ceil((max * 1.15) / 20) * 20;
  }, [chartData]);

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
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 pt-2 border-b border-slate-300">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-xl text-[#1976D2]">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1976D2]">Trends & Analytics</h2>
            <p className="text-xs text-slate-500 font-medium">Accurate comparative inventory & demand tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-8">
        {/* Adult PRC: Combined Chart with Synchronized Accurate Scale */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2 text-[#0B1E36]">
              <div className="p-2 rounded-lg bg-blue-100 text-[#1976D2]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">Adult PRC - Demand vs Stock</h3>
                <p className="text-xs text-slate-500">Accurate scale • Stock (Left Axis) vs Requests (Right Axis)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1976D2] border border-blue-200">
                Stock: {totals.adultStock}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#E53935] border border-red-200">
                Requests: {totals.adultReq}
              </span>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 md:h-96 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                barGap={4}
                maxBarSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis
                  dataKey="bloodType"
                  tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                />
                {/* Synchronized Left Y-Axis for Stock (Blue) */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#1976D2"
                  tick={{ fill: "#1976D2", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#93c5fd" }}
                  allowDecimals={false}
                  domain={[0, maxAdultVal]}
                />
                {/* Synchronized Right Y-Axis for Requests (Red) matching Stock scale */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#E53935"
                  tick={{ fill: "#E53935", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#fca5a5" }}
                  allowDecimals={false}
                  domain={[0, maxAdultVal]}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "10px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                  formatter={(value: any, name: any) => [`${value} units`, name]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 12, fontSize: 12, fontWeight: 600 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="adultPrcInventory"
                  name="Units in Stock"
                  fill="#1976D2"
                  radius={[4, 4, 0, 0]}
                  minPointSize={3}
                >
                  <LabelList
                    dataKey="adultPrcInventory"
                    content={(props) => renderBarLabel(props, "#1976D2")}
                  />
                </Bar>
                <Bar
                  yAxisId="right"
                  dataKey="adultPrcRequests"
                  name="Units Requested"
                  fill="#E53935"
                  radius={[4, 4, 0, 0]}
                  minPointSize={3}
                >
                  <LabelList
                    dataKey="adultPrcRequests"
                    content={(props) => renderBarLabel(props, "#E53935")}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PedPRC: Combined Chart with Synchronized Accurate Scale */}
        <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 min-w-0 flex flex-col">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-2 text-[#0B1E36]">
              <div className="p-2 rounded-lg bg-sky-100 text-[#0284C7]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">PedPRC - Demand vs Stock</h3>
                <p className="text-xs text-slate-500">Accurate scale • Stock (Left Axis) vs Requests (Right Axis)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1976D2] border border-blue-200">
                Stock: {totals.pedStock}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-[#E53935] border border-red-200">
                Requests: {totals.pedReq}
              </span>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 md:h-96 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                barGap={4}
                maxBarSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} stroke="#cbd5e1" vertical={false} />
                <XAxis
                  dataKey="bloodType"
                  tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                />
                {/* Synchronized Left Y-Axis for Stock (Blue) */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#1976D2"
                  tick={{ fill: "#1976D2", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#93c5fd" }}
                  allowDecimals={false}
                  domain={[0, maxPedVal]}
                />
                {/* Synchronized Right Y-Axis for Requests (Red) matching Stock scale */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#E53935"
                  tick={{ fill: "#E53935", fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: "#fca5a5" }}
                  allowDecimals={false}
                  domain={[0, maxPedVal]}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "10px",
                    fontWeight: "bold",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "#ffffff",
                    color: "#0f172a"
                  }}
                  formatter={(value: any, name: any) => [`${value} units`, name]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 12, fontSize: 12, fontWeight: 600 }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="pedPrcInventory"
                  name="Units in Stock"
                  fill="#1976D2"
                  radius={[4, 4, 0, 0]}
                  minPointSize={3}
                >
                  <LabelList
                    dataKey="pedPrcInventory"
                    content={(props) => renderBarLabel(props, "#1976D2")}
                  />
                </Bar>
                <Bar
                  yAxisId="right"
                  dataKey="pedPrcRequests"
                  name="Units Requested"
                  fill="#E53935"
                  radius={[4, 4, 0, 0]}
                  minPointSize={3}
                >
                  <LabelList
                    dataKey="pedPrcRequests"
                    content={(props) => renderBarLabel(props, "#E53935")}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
