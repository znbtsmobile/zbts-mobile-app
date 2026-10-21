export type UrgencyLevel = "Regular 24hrs" | "Urgent";

export type RequestStatus = "Pending" | "Received" | "Processing" | "Ready to Collect";

export type NewsCategory = "Announcement" | "Urgent" | "Stock Alert" | "General" | "Internal memo";

export type ShiftType = "Morning" | "Evening" | "Weekend";

export type AdminTab = "LAB_TEAM" | "ADMINS";

export interface RequestedItem {
  bloodType: string;
  productType: string;
  quantity: number;
}

export interface BloodRequest {
  id: string;
  hospitalName: string;
  status: RequestStatus;
  urgency: UrgencyLevel;
  timestamp: number;
  items: RequestedItem[];
  notes?: string;
  requestedBy?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  author: string;
  timestamp: number;
}

export enum BookingNav {
  DASHBOARD = 0,
  TODAYS_REQUESTS = 1,
  REQUEST_BUCKET = 2,
  FORM = 3,
  DETAIL = 4,
  NEWS = 5,
  FORM_DOWNLOADS = 6,
  LIVE_SUPPORT = 7
}

export interface BloodStock {
  id?: string;
  centerRoute: string;
  productType: string;
  bloodType: string;
  quantity: number;
  lastUpdated?: number;
}

export interface UnitTransfer {
  id: string;
  transferFrom: string;
  transferTo: string;
  productType: string;
  bloodType?: string;
  unitIds: string[];
  timestamp: number;
  transferredBy?: string;
}

export type ReceptionStatus = "Accepted" | "Under Quarantine" | "Rejected";

export interface ReceptionItem {
  productType: string;
  bloodType: string;
  quantity: number;
  unitIds?: string[];
  expiryDate?: string;
}

export interface BloodReception {
  id: string;
  receptionNumber: string;
  sourceSite: string;
  sourceSiteName?: string;
  receivingFacility: string;
  receivingFacilityName?: string;
  receivedDate: number;
  receivedBy: string;
  courierName?: string;
  temperature?: string;
  coldChainIntact: boolean;
  status: ReceptionStatus;
  items: ReceptionItem[];
  totalUnits: number;
  storageLocation?: string;
  courierContact?: string;
  notes?: string;
  updatedInventory?: boolean;
  timestamp: number;
}

export interface Center {
  route: string;
  title: string;
  category?: string;
  district?: string;
}

export interface LabStaff {
  id: string;
  shift: ShiftType | string;
  name: string;
  phone: string;
  labId?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  position: string;
}

export interface AuthRow {
  id: string;
  email: string;
  category?: "lab_team" | "admin" | string;
  requestHistoryRead: "ALLOWED" | "DENIED" | null;
  znbtsReserveStockRead: "ALLOWED" | "DENIED" | null;
  postManagement: "ALLOWED" | "DENIED" | null;
  adminLogin: "ALLOWED" | "DENIED" | null;
  internalMemo: "ALLOWED" | "DENIED" | null;
  hospitalSite: string;
}

export interface DataAuthContextType {
  authRow: AuthRow | null;
  loading: boolean;
}
