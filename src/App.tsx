import React, { useState, useEffect } from "react";
import {
  Monitor,
  Scale,
  Camera,
  Bell,
  ShieldAlert,
  Server,
  User as UserIcon,
  Layers,
  Activity,
  LogOut,
  ChevronRight,
  Wifi,
  Users,
  Settings,
  HelpCircle,
  Database
} from "lucide-react";
import {
  User,
  UserRole,
  Computer,
  CartridgeModel,
  TonerTub,
  WeighingLog,
  AuditLog,
  AlertSettings
} from "./types";
import {
  initialUsers,
  initialComputers,
  initialCartridgeModels,
  initialTonerTubs,
  initialWeighingLogs,
  defaultAlertSettings,
  initialAuditLogs,
  mockTelemetryHistory
} from "./data";

// Components
import PhotoStudio from "./components/PhotoStudio";
import ComputerInventory from "./components/ComputerInventory";
import GrafanaDashboard from "./components/GrafanaDashboard";
import TonerWarehouse from "./components/TonerWarehouse";
import AlertConfig from "./components/AlertConfig";
import AuditLogView from "./components/AuditLogView";
import DockerGuide from "./components/DockerGuide";
import DatabaseConsole from "./components/DatabaseConsole";

export default function App() {
  // --- Persistent State from LocalStorage ---
  const [computers, setComputers] = useState<Computer[]>(() => {
    const saved = localStorage.getItem("warehouse_computers");
    return saved ? JSON.parse(saved) : initialComputers;
  });

  const [cartridgeModels, setCartridgeModels] = useState<CartridgeModel[]>(() => {
    const saved = localStorage.getItem("warehouse_cartridge_models");
    return saved ? JSON.parse(saved) : initialCartridgeModels;
  });

  const [tonerTubs, setTonerTubs] = useState<TonerTub[]>(() => {
    const saved = localStorage.getItem("warehouse_toner_tubs");
    return saved ? JSON.parse(saved) : initialTonerTubs;
  });

  const [weighingLogs, setWeighingLogs] = useState<WeighingLog[]>(() => {
    const saved = localStorage.getItem("warehouse_weighing_logs");
    return saved ? JSON.parse(saved) : initialWeighingLogs;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem("warehouse_audit_logs");
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [alertSettings, setAlertSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem("warehouse_alert_settings");
    return saved ? JSON.parse(saved) : defaultAlertSettings;
  });

  // --- Active Operator and Role State ---
  const [currentOperatorId, setCurrentOperatorId] = useState<string>("u-2"); // Dmitry Kozlov (Admin) by default
  const [currentTab, setCurrentTab] = useState<string>("computers");

  // Sync state with LocalStorage
  useEffect(() => {
    localStorage.setItem("warehouse_computers", JSON.stringify(computers));
  }, [computers]);

  useEffect(() => {
    localStorage.setItem("warehouse_cartridge_models", JSON.stringify(cartridgeModels));
  }, [cartridgeModels]);

  useEffect(() => {
    localStorage.setItem("warehouse_toner_tubs", JSON.stringify(tonerTubs));
  }, [tonerTubs]);

  useEffect(() => {
    localStorage.setItem("warehouse_weighing_logs", JSON.stringify(weighingLogs));
  }, [weighingLogs]);

  useEffect(() => {
    localStorage.setItem("warehouse_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem("warehouse_alert_settings", JSON.stringify(alertSettings));
  }, [alertSettings]);

  // Find active operator specs
  const activeOperator = initialUsers.find((u) => u.id === currentOperatorId) || initialUsers[1];
  const currentUserRole = activeOperator.role;
  const currentUserName = activeOperator.name;

  // --- Helper state mutation callbacks ---
  const handleAddAuditLog = (action: string, type: "info" | "success" | "warning" | "error", details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleString("ru-RU"),
      user: currentUserName,
      role: currentUserRole,
      action: action,
      type: type,
      details: details,
      ip: currentUserRole === UserRole.ADMIN ? "192.168.1.10" : "192.168.1.50"
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Automated trigger of telemetry limits from Grafana dashboard
  const handleTriggerTelemetryAlert = (metricType: string, value: number) => {
    // Check if we already logged this critical alert in the last 15 seconds to avoid flooding
    const fifteenSecsAgo = Date.now() - 15000;
    const recentlyAlerted = auditLogs.some(
      (log) =>
        log.type === "error" &&
        log.action.includes("Критический сбой") &&
        log.details.includes(metricType) &&
        new Date(log.timestamp.replace(/(\d+)\.(\d+)\.(\d+)/, "$3/$2/$1")).getTime() > fifteenSecsAgo
    );

    if (recentlyAlerted) return;

    // Dispatch critical warning to the console & SMS simulated gateway
    const alertMsg = `ВНИМАНИЕ! Обнаружен критический пересып нагрузки на инфраструктуру. Метрика '${metricType}' составила ${value}%. Срочно проверьте резервное охлаждение!`;
    
    const newLog: AuditLog = {
      id: `audit-alert-${Date.now()}`,
      timestamp: new Date().toLocaleString("ru-RU"),
      user: "Система мониторинга (Агент)",
      role: UserRole.ADMIN,
      action: `Критический сбой (${metricType})`,
      type: "error",
      details: alertMsg,
      ip: "127.0.0.1"
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Administrative Header Bar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-6 py-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-400/20 font-bold">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight font-display">Archon IT-Склад и Серверный Центр</h1>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-mono font-bold tracking-widest uppercase">
                VER 2.4-STABLE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Комплексный рабочий стол управления и контроля целостности архитектуры</p>
          </div>
        </div>

        {/* Live Network & Metrics ribbon */}
        <div className="hidden lg:flex items-center gap-5 bg-slate-950/60 border border-slate-800 px-4 py-1.5 rounded-xl text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span>Локальный IP: <strong className="text-slate-200">192.168.1.100</strong></span>
          </div>
          <div className="h-3 w-px bg-slate-800"></div>
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
            <span>Пул датчиков весов: <strong className="text-emerald-400">АКТИВЕН</strong></span>
          </div>
        </div>

        {/* IT Department Role Indicator */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider font-mono">Служба:</span>
              <span className="text-xs font-bold text-white">IT-отдел</span>
            </div>
            <p className="text-[10px] text-slate-400">Административный доступ</p>
          </div>
          <div className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-400 whitespace-nowrap tracking-wider">
            ⚙️ АДМИН
          </div>
        </div>

      </header>



      {/* Main Grid Workspace Layout */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Modular Navigation (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span className="text-[10px] text-slate-500 font-mono block uppercase mb-4 tracking-widest font-bold">РАЗДЕЛЫ РАБОЧЕГО СТОЛА</span>
            
            <nav className="space-y-1">
              {[
                { id: "computers", label: "Контроль и Спецификации ПК", icon: Monitor, color: "text-indigo-400" },
                { id: "toner", label: "Заправка весов & Картриджи", icon: Scale, color: "text-emerald-400" },
                { id: "photostudio", label: "Фотостудия 3х4 (ОТК)", icon: Camera, color: "text-teal-400" },
                { id: "grafana", label: "Дашборд Grafana (CPU/RAM)", icon: Activity, color: "text-orange-500" },
                { id: "alerts", label: "Калибровка API Оповещений", icon: Bell, color: "text-rose-500" },
                { id: "audit", label: "Журнал аудита действий", icon: AuditLogView, color: "text-amber-400" },
                { id: "database", label: "Консоль Базы Данных (БД)", icon: Database, color: "text-indigo-400" },
                { id: "docker", label: "Контейнеры Docker", icon: Server, color: "text-cyan-400" }
              ].map((tab) => {
                const TabIcon = tab.id === "audit" ? ShieldAlert : tab.icon;
                const isActive = currentTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <TabIcon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className={`h-3 w-3 text-slate-600 group-hover:text-slate-400 transition-transform ${isActive ? "translate-x-1 text-indigo-400" : ""}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick status summary widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-widest font-bold">СВОДКА СОСТОЯНИЯ</span>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Компьютеров на мониторинге:</span>
                <span className="font-mono text-slate-200 font-bold">{computers.length} шт</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Исправны (ОК):</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {computers.filter((pc) => pc.status === "OK").length} шт
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Требуют внимания / Сбой:</span>
                <span className="text-rose-400 font-bold font-mono">
                  {computers.filter((pc) => pc.status !== "OK").length} шт
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Весовых замеров сегодня:</span>
                <span className="text-indigo-400 font-bold font-mono">{weighingLogs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Active Workspace Content (Col 9) */}
        <div className="lg:col-span-9 space-y-6">
          
          {currentTab === "computers" && (
            <ComputerInventory
              computers={computers}
              users={initialUsers}
              currentUserRole={currentUserRole}
              onUpdateComputers={setComputers}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === "toner" && (
            <TonerWarehouse
              cartridgeModels={cartridgeModels}
              tonerTubs={tonerTubs}
              weighingLogs={weighingLogs}
              users={initialUsers}
              currentUserRole={currentUserRole}
              currentUserName={currentUserName}
              onUpdateCartridges={setCartridgeModels}
              onUpdateTonerTubs={setTonerTubs}
              onUpdateWeighingLogs={setWeighingLogs}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === "photostudio" && (
            <PhotoStudio
              currentUserRole={currentUserRole}
              currentUserName={currentUserName}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === "grafana" && (
            <GrafanaDashboard
              telemetryHistory={mockTelemetryHistory}
              currentUserRole={currentUserRole}
              onAddAuditLog={handleAddAuditLog}
              onTriggerTelemetryAlert={handleTriggerTelemetryAlert}
            />
          )}

          {currentTab === "alerts" && (
            <AlertConfig
              alertSettings={alertSettings}
              currentUserRole={currentUserRole}
              onUpdateSettings={setAlertSettings}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === "audit" && (
            <AuditLogView
              logs={auditLogs}
              currentUserRole={currentUserRole}
              onClearLogs={() => setAuditLogs([])}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === "docker" && (
            <DockerGuide />
          )}

          {currentTab === "database" && (
            <DatabaseConsole
              computers={computers}
              cartridgeModels={cartridgeModels}
              tonerTubs={tonerTubs}
              weighingLogs={weighingLogs}
              auditLogs={auditLogs}
              alertSettings={alertSettings}
              currentUserRole={currentUserRole}
              onUpdateComputers={setComputers}
              onUpdateCartridges={setCartridgeModels}
              onUpdateTonerTubs={setTonerTubs}
              onUpdateWeighingLogs={setWeighingLogs}
              onUpdateAuditLogs={setAuditLogs}
              onUpdateAlertSettings={setAlertSettings}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

        </div>

      </main>

      {/* Decorative footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-[10px] text-slate-500 font-mono mt-auto tracking-wider uppercase">
        Archon OS • IT & Warehouse Integrity Management Dashboard © 2026 • Dockerized on Alpine Nginx.
      </footer>

    </div>
  );
}
