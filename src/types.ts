export enum UserRole {
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type ComputerStatus = "OK" | "WARNING" | "CRITICAL";

export interface Computer {
  id: string;
  name: string;
  assignedUserId: string;
  assignedUserName: string;
  os: string;
  cpu: string;
  ram: string;
  storage: string;
  ipv4: string;
  mac: string;
  status: ComputerStatus;
  lastCheck: string;
  integrityHash: string;
  services: { name: string; status: "running" | "stopped" }[];
  department?: string;
  subdepartment?: string;
}

export interface CartridgeModel {
  id: string;
  name: string;          // e.g., "HP 85A (CE285A)"
  printerModel: string;  // e.g., "HP LaserJet P1102"
  emptyWeight: number;   // grams, e.g. 620
  fullWeight: number;    // grams, e.g. 700
  tonerWeight: number;   // grams (fullWeight - emptyWeight)
}

export interface WeighingLog {
  id: string;
  modelId: string;
  modelName: string;
  measuredWeight: number;
  fillPercentage: number;
  date: string;
  operator: string;
  status: "perfect" | "underfilled" | "overfilled" | "empty";
  notes?: string;
}

export interface TonerTub {
  id: string;
  name: string;          // e.g., "Универсальный тонер HP"
  brand: string;         // e.g., "Static Control"
  capacityGrams: number; // e.g., 1000
  remainingGrams: number;// e.g., 850
  color: string;         // e.g., "black"
}

export type LogType = "info" | "success" | "warning" | "error";

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  type: LogType;
  details: string;
  ip: string;
}

export interface AlertSettings {
  telegramBotToken: string;
  telegramChatId: string;
  smsApiUrl: string;
  smsApiKey: string;
  cpuThreshold: number;
  tempThreshold: number;
  tonerTubThreshold: number; // percent
}

export interface TelemetryMetric {
  timestamp: string;
  cpu: number;
  ram: number;
  disk: number;
  bandwidth: number;
}
