import { Computer, CartridgeModel, TonerTub, WeighingLog, AuditLog, User, UserRole, AlertSettings, TelemetryMetric } from "./types";

export const initialUsers: User[] = [
  { id: "u-1", name: "Алексей Смирнов (Сисадмин)", role: UserRole.ADMIN, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { id: "u-2", name: "Дмитрий Козлов (Руководитель IT)", role: UserRole.ADMIN, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: "u-3", name: "Елена Петрова (IT-Инженер)", role: UserRole.ADMIN, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: "u-4", name: "Михаил Иванов (Техподдержка)", role: UserRole.ADMIN, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" }
];

export const initialComputers: Computer[] = [
  {
    id: "pc-1",
    name: "PC-WAREHOUSE-01",
    assignedUserId: "u-1",
    assignedUserName: "Алексей Смирнов (Сисадмин)",
    os: "Windows 11 Pro 23H2",
    cpu: "Intel Core i5-12400 (6 Cores, 2.5 - 4.4 GHz)",
    ram: "16 GB DDR4 3200MHz",
    storage: "512 GB NVMe Kingston SSD",
    ipv4: "192.168.1.50",
    mac: "E4:54:E8:A9:12:F1",
    status: "OK",
    lastCheck: "13.07.2026 22:15",
    integrityHash: "SHA256: 4c89aef7b2d5d852cb7b87641d830eeefb3687c4a17926bdf3b8764b8ee76aef",
    services: [
      { name: "CartridgeScaleDriver", status: "running" },
      { name: "TonerTrackerAgent", status: "running" },
      { name: "Spooler (Print Spooler)", status: "running" }
    ],
    department: "Склад",
    subdepartment: "Приемка"
  },
  {
    id: "pc-2",
    name: "PC-ADMIN-DESK",
    assignedUserId: "u-2",
    assignedUserName: "Дмитрий Козлов (Руководитель IT)",
    os: "Ubuntu 24.04 LTS (Noble Numbat)",
    cpu: "AMD Ryzen 7 5700X (8 Cores, 3.4 - 4.6 GHz)",
    ram: "32 GB DDR4 3600MHz",
    storage: "1 TB NVMe Samsung 980 Pro",
    ipv4: "192.168.1.10",
    mac: "30:95:E3:42:C8:4B",
    status: "OK",
    lastCheck: "13.07.2026 22:30",
    integrityHash: "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    services: [
      { name: "GrafanaAgent", status: "running" },
      { name: "SSH Daemon", status: "running" },
      { name: "Nginx Server", status: "running" }
    ],
    department: "Администрация",
    subdepartment: "IT-служба"
  },
  {
    id: "pc-3",
    name: "PC-BARCODE-SCAN",
    assignedUserId: "u-3",
    assignedUserName: "Елена Петрова (IT-Инженер)",
    os: "Windows 10 IoT LTSC",
    cpu: "Intel Celeron J4125 (4 Cores, 2.0 GHz)",
    ram: "8 GB DDR4 SO-DIMM",
    storage: "128 GB SATA SSD Netac",
    ipv4: "192.168.1.62",
    mac: "00:E0:4C:68:0A:95",
    status: "WARNING",
    lastCheck: "13.07.2026 22:05",
    integrityHash: "SHA256: d852bdf3b87641d830eeefb3687c44c89aef7b2d517926764b8ee76aef722fa3b",
    services: [
      { name: "ScaleCOMBridge", status: "stopped" },
      { name: "BarcodeListener", status: "running" },
      { name: "LocalCacheSync", status: "running" }
    ],
    department: "Склад",
    subdepartment: "Упаковка и сканирование"
  },
  {
    id: "pc-4",
    name: "PC-LABEL-PRINTER",
    assignedUserId: "u-4",
    assignedUserName: "Михаил Иванов (Техподдержка)",
    os: "Debian 12 Bookworm",
    cpu: "Raspberry Pi 4 Model B (Broadcom BCM2711)",
    ram: "4 GB LPDDR4",
    storage: "64 GB MicroSD Sandisk Extreme",
    ipv4: "192.168.1.75",
    mac: "DC:A6:32:0C:55:1A",
    status: "CRITICAL",
    lastCheck: "13.07.2026 21:40",
    integrityHash: "SHA256: a126bdf3b8764c89aeef7b2d5d852bdf3c448ee76aef722764b8ee769911fa11",
    services: [
      { name: "CUPS Server", status: "stopped" },
      { name: "ZebraMQTTBridge", status: "stopped" }
    ],
    department: "Склад",
    subdepartment: "Маркировка"
  }
];

export const initialCartridgeModels: CartridgeModel[] = [
  { id: "m-1", name: "HP 85A (CE285A)", printerModel: "HP LaserJet P1102 / M1212", emptyWeight: 620, fullWeight: 700, tonerWeight: 80 },
  { id: "m-2", name: "Canon 725", printerModel: "Canon LBP-6000 / MF3010", emptyWeight: 615, fullWeight: 695, tonerWeight: 80 },
  { id: "m-3", name: "HP 83A (CF283A)", printerModel: "HP LaserJet M127fn / M225dw", emptyWeight: 640, fullWeight: 725, tonerWeight: 85 },
  { id: "m-4", name: "Samsung MLT-D101S", printerModel: "Samsung SCX-3400 / ML-2165", emptyWeight: 580, fullWeight: 665, tonerWeight: 85 },
  { id: "m-5", name: "Brother TN-2375", printerModel: "Brother HL-L2300D / DCP-L2500D", emptyWeight: 510, fullWeight: 590, tonerWeight: 80 }
];

export const initialTonerTubs: TonerTub[] = [
  { id: "t-1", name: "Универсальный тонер HP Premium", brand: "Static Control", capacityGrams: 1000, remainingGrams: 840, color: "black" },
  { id: "t-2", name: "Тонер Samsung ML-2160/101S", brand: "Tomogawa", capacityGrams: 750, remainingGrams: 350, color: "black" },
  { id: "t-3", name: "Тонер Brother TN-2300/2375", brand: "Hi-Black", capacityGrams: 1000, remainingGrams: 920, color: "black" }
];

export const initialWeighingLogs: WeighingLog[] = [
  {
    id: "log-1",
    modelId: "m-1",
    modelName: "HP 85A (CE285A)",
    measuredWeight: 698,
    fillPercentage: 97.5,
    date: "13.07.2026 22:01",
    operator: "Алексей Смирнов (Сисадмин)",
    status: "perfect",
    notes: "Отличная заправка, шестерня смазана"
  },
  {
    id: "log-2",
    modelId: "m-4",
    modelName: "Samsung MLT-D101S",
    measuredWeight: 630,
    fillPercentage: 58.8,
    date: "13.07.2026 21:14",
    operator: "Михаил Иванов (Техподдержка)",
    status: "underfilled",
    notes: "Остаток тонера в тумбе закончился, требует досыпки"
  },
  {
    id: "log-3",
    modelId: "m-2",
    modelName: "Canon 725",
    measuredWeight: 694,
    fillPercentage: 98.7,
    date: "13.07.2026 19:45",
    operator: "Алексей Смирнов (Сисадмин)",
    status: "perfect",
    notes: "Фотобарабан заменен на новый Hanp"
  },
  {
    id: "log-4",
    modelId: "m-3",
    modelName: "HP 83A (CF283A)",
    measuredWeight: 735,
    fillPercentage: 111.7,
    date: "13.07.2026 18:22",
    operator: "Елена Петрова (IT-Инженер)",
    status: "overfilled",
    notes: "Небольшой пересып тонера, защелки почищены"
  },
  {
    id: "log-5",
    modelId: "m-5",
    modelName: "Brother TN-2375",
    measuredWeight: 512,
    fillPercentage: 2.5,
    date: "13.07.2026 17:05",
    operator: "Михаил Иванов (Техподдержка)",
    status: "empty",
    notes: "Принят на заправку со склада брака"
  }
];

export const defaultAlertSettings: AlertSettings = {
  telegramBotToken: "7139048352:AAG8eXzO88_8vP9mS1z6mQ8-Uo2a77f3ZgI",
  telegramChatId: "-1002148425232",
  smsApiUrl: "https://sms.ru/sms/send",
  smsApiKey: "C3E2929B-4D2A-E2F4-72A5-883DEFA29B12",
  cpuThreshold: 85,
  tempThreshold: 75,
  tonerTubThreshold: 20
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    timestamp: "13.07.2026 22:30",
    user: "Дмитрий Козлов (Руководитель IT)",
    role: UserRole.ADMIN,
    action: "Вход в систему",
    type: "success",
    details: "Успешная авторизация администратора во внутренней сети",
    ip: "192.168.1.10"
  },
  {
    id: "audit-2",
    timestamp: "13.07.2026 22:15",
    user: "Алексей Смирнов (Сисадмин)",
    role: UserRole.ADMIN,
    action: "Добавление взвешивания",
    type: "info",
    details: "Зарегистрирован заправленный картридж HP 85A (CE285A), вес: 698г, заправка 97.5%",
    ip: "192.168.1.50"
  },
  {
    id: "audit-3",
    timestamp: "13.07.2026 22:05",
    user: "Система мониторинга",
    role: UserRole.ADMIN,
    action: "Сбой службы PC-BARCODE-SCAN",
    type: "warning",
    details: "Служба ScaleCOMBridge остановлена. Напряжение на весах в норме.",
    ip: "192.168.1.62"
  },
  {
    id: "audit-4",
    timestamp: "13.07.2026 21:40",
    user: "Система мониторинга",
    role: UserRole.ADMIN,
    action: "Критический сбой PC-LABEL-PRINTER",
    type: "error",
    details: "Служба CUPS Server остановлена, принтер этикеток Zebra недоступен. Отправлено оповещение технической команде.",
    ip: "192.168.1.75"
  },
  {
    id: "audit-5",
    timestamp: "13.07.2026 21:14",
    user: "Михаил Иванов (Техподдержка)",
    role: UserRole.ADMIN,
    action: "Обновление остатков",
    type: "warning",
    details: "Расход тонера Samsung ML-2160. В тумбе 't-2' осталось менее 350г тонера.",
    ip: "192.168.1.50"
  }
];

export const mockTelemetryHistory: TelemetryMetric[] = [
  { timestamp: "22:10", cpu: 42, ram: 58, disk: 15, bandwidth: 4.2 },
  { timestamp: "22:15", cpu: 48, ram: 59, disk: 18, bandwidth: 5.1 },
  { timestamp: "22:20", cpu: 55, ram: 60, disk: 12, bandwidth: 4.8 },
  { timestamp: "22:25", cpu: 65, ram: 61, disk: 25, bandwidth: 6.3 },
  { timestamp: "22:30", cpu: 52, ram: 60, disk: 14, bandwidth: 5.0 },
  { timestamp: "22:35", cpu: 58, ram: 62, disk: 19, bandwidth: 5.5 }
];
