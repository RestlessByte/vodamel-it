import React, { useState } from "react";
import { Database, Download, Upload, RotateCcw, ShieldAlert, CheckCircle2, AlertTriangle, Search, FileText, Settings, Key, Trash2 } from "lucide-react";
import { Computer, CartridgeModel, TonerTub, WeighingLog, AuditLog, AlertSettings, UserRole } from "../types";
import {
  initialComputers,
  initialCartridgeModels,
  initialTonerTubs,
  initialWeighingLogs,
  initialAuditLogs,
  defaultAlertSettings
} from "../data";

interface DatabaseConsoleProps {
  computers: Computer[];
  cartridgeModels: CartridgeModel[];
  tonerTubs: TonerTub[];
  weighingLogs: WeighingLog[];
  auditLogs: AuditLog[];
  alertSettings: AlertSettings;
  currentUserRole: UserRole;
  onUpdateComputers: (updated: Computer[]) => void;
  onUpdateCartridges: (updated: CartridgeModel[]) => void;
  onUpdateTonerTubs: (updated: TonerTub[]) => void;
  onUpdateWeighingLogs: (updated: WeighingLog[]) => void;
  onUpdateAuditLogs: (updated: AuditLog[]) => void;
  onUpdateAlertSettings: (updated: AlertSettings) => void;
  onAddAuditLog: (action: string, type: "info" | "success" | "warning" | "error", details: string) => void;
}

export default function DatabaseConsole({
  computers,
  cartridgeModels,
  tonerTubs,
  weighingLogs,
  auditLogs,
  alertSettings,
  currentUserRole,
  onUpdateComputers,
  onUpdateCartridges,
  onUpdateTonerTubs,
  onUpdateWeighingLogs,
  onUpdateAuditLogs,
  onUpdateAlertSettings,
  onAddAuditLog
}: DatabaseConsoleProps) {
  const [selectedTable, setSelectedTable] = useState<string>("computers");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>("");
  const [isEditingJson, setIsEditingJson] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Calculate size in bytes in localStorage
  const calculateStorageSize = () => {
    let totalBytes = 0;
    const keys = ["warehouse_computers", "warehouse_cartridge_models", "warehouse_toner_tubs", "warehouse_weighing_logs", "warehouse_audit_logs", "warehouse_alert_settings"];
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) totalBytes += val.length * 2; // UTF-16 characters take 2 bytes
    });
    return totalBytes;
  };

  const totalBytes = calculateStorageSize();
  const storageSizeFormatted = totalBytes > 1024 * 1024
    ? `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(totalBytes / 1024).toFixed(1)} KB`;

  // Export full DB backup
  const handleExportAll = () => {
    const fullBackup = {
      computers,
      cartridgeModels,
      tonerTubs,
      weighingLogs,
      auditLogs,
      alertSettings,
      exportedAt: new Date().toISOString(),
      version: "2.4"
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `archon_db_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onAddAuditLog("Экспорт БД", "success", "Выгружена полная резервная копия базы данных системы.");
    showFeedback("success", "Резервная копия базы данных успешно создана и скачана!");
  };

  // Process full DB import
  const processImportData = (rawText: string) => {
    try {
      const parsed = JSON.parse(rawText);
      
      if (!parsed.computers && !parsed.cartridgeModels && !parsed.tonerTubs) {
        throw new Error("Неверная структура файла резервной копии. Отсутствуют обязательные коллекции.");
      }

      if (parsed.computers) onUpdateComputers(parsed.computers);
      if (parsed.cartridgeModels) onUpdateCartridges(parsed.cartridgeModels);
      if (parsed.tonerTubs) onUpdateTonerTubs(parsed.tonerTubs);
      if (parsed.weighingLogs) onUpdateWeighingLogs(parsed.weighingLogs);
      if (parsed.auditLogs) onUpdateAuditLogs(parsed.auditLogs);
      if (parsed.alertSettings) onUpdateAlertSettings(parsed.alertSettings);

      onAddAuditLog("Импорт БД", "success", "База данных успешно восстановлена из резервной копии.");
      showFeedback("success", "Все коллекции базы данных успешно восстановлены из файла!");
    } catch (err: any) {
      showFeedback("error", `Ошибка парсинга JSON: ${err.message}`);
    }
  };

  const showFeedback = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(msg);
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 6000);
    }
  };

  // Drag-and-drop backup handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImportData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImportData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset entire database to default
  const handleResetToDefaults = () => {
    if (window.confirm("Вы уверены, что хотите сбросить ВСЮ базу данных к заводским значениям? Все ваши изменения, весовые замеры и добавленные ПК будут удалены!")) {
      onUpdateComputers(initialComputers);
      onUpdateCartridges(initialCartridgeModels);
      onUpdateTonerTubs(initialTonerTubs);
      onUpdateWeighingLogs(initialWeighingLogs);
      onUpdateAuditLogs(initialAuditLogs);
      onUpdateAlertSettings(defaultAlertSettings);

      localStorage.removeItem("warehouse_computers");
      localStorage.removeItem("warehouse_cartridge_models");
      localStorage.removeItem("warehouse_toner_tubs");
      localStorage.removeItem("warehouse_weighing_logs");
      localStorage.removeItem("warehouse_audit_logs");
      localStorage.removeItem("warehouse_alert_settings");

      onAddAuditLog("Сброс БД", "warning", "Выполнен полный сброс базы данных к начальным демонстрационным значениям.");
      showFeedback("success", "База данных успешно сброшена к начальному демонстрационному состоянию!");
    }
  };

  // Delete row handler
  const handleDeleteRow = (id: string) => {
    if (!window.confirm("Удалить выбранную запись из этой таблицы?")) return;

    if (selectedTable === "computers") {
      onUpdateComputers(computers.filter(c => c.id !== id));
    } else if (selectedTable === "cartridgeModels") {
      onUpdateCartridges(cartridgeModels.filter(c => c.id !== id));
    } else if (selectedTable === "tonerTubs") {
      onUpdateTonerTubs(tonerTubs.filter(t => t.id !== id));
    } else if (selectedTable === "weighingLogs") {
      onUpdateWeighingLogs(weighingLogs.filter(w => w.id !== id));
    } else if (selectedTable === "auditLogs") {
      onUpdateAuditLogs(auditLogs.filter(a => a.id !== id));
    }
    
    onAddAuditLog("Удаление записи БД", "warning", `Запись с ID ${id} удалена из таблицы ${selectedTable}.`);
    showFeedback("success", "Запись успешно удалена!");
  };

  // Get data of selected table
  const getSelectedTableData = () => {
    switch (selectedTable) {
      case "computers": return computers;
      case "cartridgeModels": return cartridgeModels;
      case "tonerTubs": return tonerTubs;
      case "weighingLogs": return weighingLogs;
      case "auditLogs": return auditLogs;
      case "alertSettings": return [alertSettings];
      default: return [];
    }
  };

  const rawData = getSelectedTableData();

  // Search filter
  const filteredData = rawData.filter((item: any) => {
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  // Handle manual JSON update
  const handleStartEditingJson = () => {
    setJsonText(JSON.stringify(rawData, null, 2));
    setIsEditingJson(true);
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) && selectedTable !== "alertSettings") {
        throw new Error("Данные для этой таблицы должны быть массивом объектов.");
      }

      if (selectedTable === "computers") onUpdateComputers(parsed);
      else if (selectedTable === "cartridgeModels") onUpdateCartridges(parsed);
      else if (selectedTable === "tonerTubs") onUpdateTonerTubs(parsed);
      else if (selectedTable === "weighingLogs") onUpdateWeighingLogs(parsed);
      else if (selectedTable === "auditLogs") onUpdateAuditLogs(parsed);
      else if (selectedTable === "alertSettings") onUpdateAlertSettings(Array.isArray(parsed) ? parsed[0] : parsed);

      setIsEditingJson(false);
      onAddAuditLog("Ручное редактирование БД", "info", `Таблица ${selectedTable} обновлена через консоль JSON.`);
      showFeedback("success", `Таблица ${selectedTable} успешно обновлена!`);
    } catch (err: any) {
      setErrorMsg(`Ошибка сохранения JSON: ${err.message}`);
    }
  };

  return (
    <div id="database_section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5.5 w-5.5 text-indigo-400" />
            <h2 className="text-lg font-bold tracking-tight text-white font-display">Консоль Управления Базой Данных</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Прямой доступ к хранилищу LocalStorage, резервное копирование (JSON), восстановление, сброс коллекций и инспекция таблиц.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0 font-mono text-xs bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="text-slate-500">Занято в LocalStorage:</span>
          <strong className="text-indigo-400">{storageSizeFormatted}</strong>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Bento Grid: Control Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Export Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400">
              <Download className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Экспорт бэкапа (.json)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Выгрузить все 6 связанных коллекций системы (компьютеры, весы, картриджи, аудит и настройки) в единый текстовый файл JSON.
            </p>
          </div>
          <button
            onClick={handleExportAll}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
          >
            <Download className="h-4 w-4" /> Скачать полную копию БД
          </button>
        </div>

        {/* Import / Recovery Card */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-850 bg-slate-950"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Upload className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Восстановление из файла</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Перетащите резервный JSON-файл в эту область или выберите его на ПК, чтобы мгновенно перезаписать или импортировать данные.
            </p>
          </div>

          <div>
            <input
              type="file"
              id="db-backup-upload"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="db-backup-upload"
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="h-4 w-4 text-emerald-400" /> Выбрать файл бэкапа
            </label>
          </div>
        </div>

        {/* Safe Operations Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-500">
              <RotateCcw className="h-4 w-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Заводской сброс БД</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Полный сброс LocalStorage до изначальных фабричных демонстрационных значений. Все ваши добавленные записи будут стерты!
            </p>
          </div>

          {currentUserRole === UserRole.ADMIN ? (
            <button
              onClick={handleResetToDefaults}
              className="w-full py-2 bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Очистить и вернуть по умолчанию
            </button>
          ) : (
            <div className="text-[10px] text-rose-400 bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 text-center uppercase tracking-wide font-mono font-bold">
              🔒 Доступно только Администратору
            </div>
          )}
        </div>

      </div>

      {/* Database Tables Inspector */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-850 pb-3">
          
          {/* Table select tabs */}
          <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            {[
              { id: "computers", label: "ПК", count: computers.length },
              { id: "cartridgeModels", label: "Картриджи", count: cartridgeModels.length },
              { id: "tonerTubs", label: "Тубы", count: tonerTubs.length },
              { id: "weighingLogs", label: "Замеры веса", count: weighingLogs.length },
              { id: "auditLogs", label: "Логи аудита", count: auditLogs.length },
              { id: "alertSettings", label: "Настройки API", count: 1 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTable(tab.id);
                  setIsEditingJson(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTable === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${selectedTable === tab.id ? "bg-indigo-700 text-white" : "bg-slate-950 text-slate-500"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Table search & Raw JSON toggle */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {!isEditingJson && (
              <div className="relative w-full lg:w-48">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Фильтр таблицы..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {currentUserRole === UserRole.ADMIN && (
              <button
                onClick={isEditingJson ? () => setIsEditingJson(false) : handleStartEditingJson}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  isEditingJson
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-slate-900 text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                {isEditingJson ? "Режим просмотра" : "Редактор JSON"}
              </button>
            )}
          </div>

        </div>

        {/* Content Renderers */}
        {isEditingJson ? (
          /* JSON Raw Editor Mode */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Режим Прямого Редактирования JSON. Некорректный синтаксис сломает приложение!
              </span>
            </div>
            <textarea
              rows={16}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed scrollbar-thin"
              placeholder="Вставьте JSON массив..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditingJson(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveJson}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Сохранить JSON в Базу
              </button>
            </div>
          </div>
        ) : (
          /* Custom Table Grid / Lists Mode */
          <div className="max-h-[400px] overflow-y-auto pr-1 scrollbar-thin space-y-2.5">
            {filteredData.map((item: any, idx) => (
              <div key={item.id || idx} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850/80 hover:border-slate-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs relative group">
                
                {/* Information blocks based on selectedTable */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  <span className="font-mono text-[10px] text-slate-500 uppercase shrink-0">#{idx + 1}</span>
                  
                  {selectedTable === "computers" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-mono">{item.name}</strong>
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-indigo-400 border border-indigo-500/10 font-bold uppercase font-mono">
                          {item.department || "Без группы"} {item.subdepartment ? `/ ${item.subdepartment}` : ""}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 font-mono">
                        <span>IP: <strong className="text-slate-300">{item.ipv4}</strong></span>
                        <span>MAC: <strong className="text-slate-300">{item.mac}</strong></span>
                        <span>ЦП: <strong className="text-slate-300">{item.cpu.split(" (")[0]}</strong></span>
                        <span>ОС: <strong className="text-slate-300">{item.os}</strong></span>
                        <span>Специалист: <strong className="text-indigo-300">{item.assignedUserName}</strong></span>
                      </div>
                    </div>
                  )}

                  {selectedTable === "cartridgeModels" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{item.name}</strong>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-mono">
                          Подходит к: {item.printerModel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex gap-4 font-mono">
                        <span>Пустой: <strong className="text-slate-300">{item.emptyWeight} г</strong></span>
                        <span>Полный: <strong className="text-slate-300">{item.fullWeight} г</strong></span>
                        <span>Номинал тонера: <strong className="text-emerald-400">+{item.tonerWeight} г</strong></span>
                      </div>
                    </div>
                  )}

                  {selectedTable === "tonerTubs" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{item.name}</strong>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-mono">
                          Производитель: {item.brand}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex gap-4 font-mono">
                        <span>Общая емкость: <strong className="text-slate-300">{item.capacityGrams} г</strong></span>
                        <span>Остаток: <strong className="text-emerald-400">{item.remainingGrams} г</strong></span>
                        <span>Заполненность: <strong className="text-indigo-400">{Math.round((item.remainingGrams / item.capacityGrams) * 100)}%</strong></span>
                      </div>
                    </div>
                  )}

                  {selectedTable === "weighingLogs" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">Замер: {item.modelName}</strong>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold font-mono ${
                          item.status === "perfect" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          item.status === "underfilled" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {item.status === "perfect" ? "НОРМА" : item.status === "underfilled" ? "НЕДОСЫП" : "ПЕРЕСЫП"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                        <span>Измеренный вес: <strong className="text-slate-300">{item.measuredWeight} г</strong></span>
                        <span>Процент засыпки: <strong className="text-indigo-400">{item.fillPercentage}%</strong></span>
                        <span>Дата: <strong className="text-slate-400">{item.date}</strong></span>
                        <span>Оператор: <strong className="text-slate-400">{item.operator}</strong></span>
                      </div>
                    </div>
                  )}

                  {selectedTable === "auditLogs" && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-white">{item.action}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                          item.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
                          item.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                          item.type === "error" ? "bg-rose-500/10 text-rose-400" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">Сделал: {item.user} ({item.role}) • IP: {item.ip}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono text-[10px] max-w-xl">{item.details}</p>
                    </div>
                  )}

                  {selectedTable === "alertSettings" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-slate-500 block">Bot Token:</span>
                        <span className="font-mono text-slate-200 block truncate">{item.telegramBotToken || "Не задан"}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-slate-500 block">Chat ID:</span>
                        <span className="font-mono text-slate-200 block truncate">{item.telegramChatId || "Не задан"}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-slate-500 block">Порог CPU:</span>
                        <strong className="font-mono text-indigo-400 block">{item.cpuThreshold}%</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-900">
                        <span className="text-[10px] text-slate-500 block">Порог весов тубы:</span>
                        <strong className="font-mono text-emerald-400 block">{item.tonerTubThreshold}%</strong>
                      </div>
                    </div>
                  )}

                </div>

                {/* Operations */}
                {currentUserRole === UserRole.ADMIN && selectedTable !== "alertSettings" && (
                  <button
                    onClick={() => handleDeleteRow(item.id)}
                    className="p-1.5 bg-slate-950 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 border border-slate-900 hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer self-start md:self-center"
                    title="Удалить запись из БД"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}

              </div>
            ))}

            {filteredData.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p>Нет записей, удовлетворяющих критериям поиска</p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
