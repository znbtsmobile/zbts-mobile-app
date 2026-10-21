import { TIMEZONE } from "../config/constants";

export const formatDate = (timestamp: number): string => {
 if (!timestamp) return "";
 const d = new Date(timestamp);
 return d.toLocaleDateString("en-GB", {
 timeZone: TIMEZONE,
 day: "2-digit",
 month: "short",
 year: "numeric"
 });
};

export const formatTime = (timestamp: number): string => {
 if (!timestamp) return "";
 const d = new Date(timestamp);
 return d.toLocaleTimeString("en-US", {
 timeZone: TIMEZONE,
 hour: "2-digit",
 minute: "2-digit",
 hour12: true
 });
};

export const formatDateTime = (timestamp: number): string => {
 if (!timestamp) return "";
 return `${formatDate(timestamp)} • ${formatTime(timestamp)}`;
};
