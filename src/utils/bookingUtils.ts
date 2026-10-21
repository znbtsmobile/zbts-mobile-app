import { TIMEZONE } from "../config/constants";

/**
 * Regular 24hrs booking time window check in Zanzibar/Dar es Salaam timezone
 * Weekdays: 7:00 AM - 3:00 PM (15:00)
 * Weekends: 7:00 AM - 12:00 PM (12:00)
 */
export const isRegularBookingOpen = (): boolean => {
 try {
 const now = new Date();
 const tzDate = new Date(now.toLocaleString("en-US", { timeZone: TIMEZONE }));
 const day = tzDate.getDay(); // 0 = Sunday, 6 = Saturday
 const hours = tzDate.getHours();
 const minutes = tzDate.getMinutes();
 const totalMinutes = hours * 60 + minutes;

 const startMinutes = 7 * 60; // 7:00 AM
 const endMinutes = day === 0 || day === 6 ? 12 * 60 : 15 * 60; // 12:00 PM or 3:00 PM

 // If current time is within window, regular booking is open
 return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
 } catch (e) {
 // Fallback to true if timezone conversion has any environment issue
 return true;
 }
};
