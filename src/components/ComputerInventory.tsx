import React, { useState } from "react";
import { Monitor, User as UserIcon, Shield, Search, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Cpu, Database, Network, Key, PlusCircle, Check } from "lucide-react";
import { Computer, User, UserRole, ComputerStatus } from "../types";

interface ComputerInventoryProps {
  computers: Computer[];
  users: User[];
  currentUserRole: UserRole;
  onUpdateComputers: (updated: Computer[]) => void;
  onAddAuditLog: (action: string, type: "info" | "success" | "warning" | "error", details: string) => void;
}

export default function ComputerInventory({
  computers,
  users,
  currentUserRole,
  onUpdateComputers,
  onAddAuditLog,
}: ComputerInventoryProps) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedServices, setSelectedServices] = useState<{ name: string; status: "running" | "stopped" }[]>([
    { name: "CartridgeScaleDriver", status: "running" },
    { name: "TonerTrackerAgent", status: "running" }
  ]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [formUserName, setFormUserName] = useState("");
  const [formOs, setFormOs] = useState("Windows 11 Pro");
  const [formCpu, setFormCpu] = useState("Intel Core i5-12400");
  const [formRam, setFormRam] = useState("16 GB DDR4");
  const [formStorage, setFormStorage] = useState("512 GB SSD");
  const [formIpv4, setFormIpv4] = useState("192.168.1.51");
  const [formMac, setFormMac] = useState("00:1A:2B:3C:4D:5E");
  const [formStatus, setFormStatus] = useState<ComputerStatus>("OK");

  // Filter computers
  const filteredComputers = computers.filter((pc) => {
    const matchesSearch =
      pc.name.toLowerCase().includes(search.toLowerCase()) ||
      pc.assignedUserName.toLowerCase().includes(search.toLowerCase()) ||
      pc.ipv4.includes(search) ||
      pc.cpu.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || pc.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (pc: Computer) => {
    if (currentUserRole !== UserRole.ADMIN) return;
    setEditingComputer(pc);
    setFormName(pc.name);
    setFormUserId(pc.assignedUserId);
    setFormUserName(pc.assignedUserName);
    setFormOs(pc.os);
    setFormCpu(pc.cpu);
    setFormRam(pc.ram);
    setFormStorage(pc.storage);
    setFormIpv4(pc.ipv4);
    setFormMac(pc.mac);
    setFormStatus(pc.status);
    setIsAdding(false);
  };

  const handleAddClick = () => {
    if (currentUserRole !== UserRole.ADMIN) return;
    setIsAdding(true);
    setEditingComputer(null);
    setFormName(`PC-WAREHOUSE-0${computers.length + 1}`);
    setFormUserId("");
    setFormUserName("");
    setFormOs("Windows 11 Pro");
    setFormCpu("Intel Core i5-12400");
    setFormRam("16 GB DDR4");
    setFormStorage("512 GB SSD");
    setFormIpv4(`192.168.1.${100 + computers.length}`);
    setFormMac("00:1A:2B:3C:4D:5E");
    setFormStatus("OK");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== UserRole.ADMIN) return;

    const assignedName = formUserName.trim() || "Не назначен";
    // Generate/Reuse a dummy ID or find a matching user if any
    const foundUser = users.find((u) => u.name.toLowerCase() === assignedName.toLowerCase());
    const assignedId = foundUser ? foundUser.id : (formUserId || `u-custom-${Date.now()}`);

    if (isAdding) {
      const newPc: Computer = {
        id: `pc-${Date.now()}`,
        name: formName,
        assignedUserId: assignedId,
        assignedUserName: assignedName,
        os: formOs,
        cpu: formCpu,
        ram: formRam,
        storage: formStorage,
        ipv4: formIpv4,
        mac: formMac,
        status: formStatus,
        lastCheck: new Date().toLocaleString("ru-RU"),
        integrityHash: `SHA256: ${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}f82b7`,
        services: [
          { name: "CartridgeScaleDriver", status: "running" },
          { name: "TonerTrackerAgent", status: "running" }
        ]
      };

      const updated = [...computers, newPc];
      onUpdateComputers(updated);
      onAddAuditLog(
        "Добавлен компьютер",
        "success",
        `Зарегистрирован новый ПК '${newPc.name}' под управлением сотрудника ${newPc.assignedUserName}.`
      );
      setIsAdding(false);
    } else if (editingComputer) {
      const updated = computers.map((pc) => {
        if (pc.id === editingComputer.id) {
          return {
            ...pc,
            name: formName,
            assignedUserId: assignedId,
            assignedUserName: assignedName,
            os: formOs,
            cpu: formCpu,
            ram: formRam,
            storage: formStorage,
            ipv4: formIpv4,
            mac: formMac,
            status: formStatus,
            lastCheck: new Date().toLocaleString("ru-RU"),
          };
        }
        return pc;
      });

      onUpdateComputers(updated);
      onAddAuditLog(
        "Изменены параметры ПК",
        "info",
        `Обновлена аппаратная конфигурация и ответственный пользователь для '${formName}'.`
      );
      setEditingComputer(null);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (currentUserRole !== UserRole.ADMIN) return;
    if (window.confirm(`Вы действительно хотите удалить компьютер ${name}?`)) {
      const updated = computers.filter((pc) => pc.id !== id);
      onUpdateComputers(updated);
      onAddAuditLog(
        "Удален компьютер",
        "warning",
        `Удален узел ПК '${name}' из реестра контроля инфраструктуры.`
      );
    }
  };

  const triggerIntegrityCheck = (id: string, name: string) => {
    const updated = computers.map((pc) => {
      if (pc.id === id) {
        // Generate new check-in timestamp and random SHA hash
        return {
          ...pc,
          lastCheck: new Date().toLocaleString("ru-RU"),
          integrityHash: `SHA256: ${Math.random().toString(16).substring(2, 18)}c8996fb${Math.random().toString(16).substring(2, 10)}d3`,
          status: "OK" as ComputerStatus,
          services: pc.services.map(s => ({ ...s, status: "running" as const }))
        };
      }
      return pc;
    });
    onUpdateComputers(updated);
    onAddAuditLog(
      "Контроль целостности ПК",
      "success",
      `Выполнена удаленная проверка целостности архитектуры на '${name}'. Изменения ФС не обнаружены, службы перезапущены.`
    );
  };

  return (
    <div id="computers_section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="h-5.5 w-5.5 text-indigo-400" />
            <h2 className="text-lg font-bold tracking-tight text-white font-display">Инвентаризация и Контроль ПК</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Мониторинг целостности архитектуры, сетевых адресов и закрепленных за компьютерами специалистов IT-отдела.
          </p>
        </div>

        {currentUserRole === UserRole.ADMIN && (
          <button
            id="btn_add_pc"
            onClick={handleAddClick}
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" /> Добавить компьютер
          </button>
        )}
      </div>

      {/* Editor / Addition Modal-like drawer overlay inside dashboard */}
      {(isAdding || editingComputer) && (
        <div className="mb-6 p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            {isAdding ? "Регистрация Нового Компьютера" : `Редактирование параметров: ${formName}`}
          </h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Имя компьютера (Сетевой Hostname):</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="PC-WAREHOUSE-XX"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Ответственный IT-специалист (ФИО):</label>
              <input
                type="text"
                required
                value={formUserName}
                onChange={(e) => setFormUserName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Иванов И. И."
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Статус устройства:</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as ComputerStatus)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="OK">OK (Исправен / Стабилен)</option>
                <option value="WARNING">WARNING (Требуется внимание)</option>
                <option value="CRITICAL">CRITICAL (Аппаратный сбой!)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Операционная система:</label>
              <input
                type="text"
                required
                value={formOs}
                onChange={(e) => setFormOs(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                placeholder="например: Windows 11 Pro / Ubuntu 24.04"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Центральный процессор (CPU):</label>
              <input
                type="text"
                required
                value={formCpu}
                onChange={(e) => setFormCpu(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Объем памяти (RAM + Диск):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="ОЗУ, например: 16 GB"
                  value={formRam}
                  onChange={(e) => setFormRam(e.target.value)}
                  className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="SSD, например: 512 GB"
                  value={formStorage}
                  onChange={(e) => setFormStorage(e.target.value)}
                  className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Сетевой IPv4 адрес:</label>
              <input
                type="text"
                required
                value={formIpv4}
                onChange={(e) => setFormIpv4(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                placeholder="192.168.1.XX"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Физический MAC адрес:</label>
              <input
                type="text"
                required
                value={formMac}
                onChange={(e) => setFormMac(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                placeholder="00:1A:2B:..."
              />
            </div>

            <div className="flex items-end justify-end gap-2 mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => {
                  setEditingComputer(null);
                  setIsAdding(false);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-slate-300 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-colors cursor-pointer shadow-md shadow-indigo-500/20"
              >
                {isAdding ? "Зарегистрировать" : "Сохранить изменения"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="input_search_pc"
            type="text"
            placeholder="Поиск по хосту, IP, процессору, сотруднику..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-end overflow-x-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Статус:</span>
          {[
            { id: "ALL", label: "Все" },
            { id: "OK", label: "OK" },
            { id: "WARNING", label: "Warning" },
            { id: "CRITICAL", label: "Critical" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === btn.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-850"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of computer assets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredComputers.map((pc) => {
          // Find user avatar
          const u = users.find((user) => user.id === pc.assignedUserId);

          return (
            <div
              key={pc.id}
              className={`relative border rounded-2xl p-5 transition-all hover:shadow-xl ${
                pc.status === "OK"
                  ? "bg-slate-950/40 border-slate-800/80 hover:border-indigo-500/30"
                  : pc.status === "WARNING"
                  ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                  : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
              }`}
            >
              {/* Top Row: Server Name & Health Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${
                    pc.status === "OK" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                    pc.status === "WARNING" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{pc.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono text-indigo-400">{pc.ipv4}</span>
                      <span>•</span>
                      <span>{pc.os}</span>
                    </div>
                  </div>
                </div>

                {/* Health indicator */}
                <div className="flex items-center gap-1.5">
                  {pc.status === "OK" && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> СТАБИЛЕН
                    </span>
                  )}
                  {pc.status === "WARNING" && (
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> ВНИМАНИЕ
                    </span>
                  )}
                  {pc.status === "CRITICAL" && (
                    <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <XCircle className="h-3 w-3 animate-pulse" /> СБОЙ
                    </span>
                  )}
                </div>
              </div>

              {/* Hardware specifications details */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs mb-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono">Оборудование:</span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate" title={pc.cpu}>{pc.cpu.split(" (")[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Database className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span>{pc.ram} / {pc.storage}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono">Сеть и Безопасность:</span>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Network className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="font-mono text-[10px]">{pc.mac}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <Key className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="font-mono text-[10px] text-emerald-400 truncate animate-pulse" title={pc.integrityHash}>
                      {pc.integrityHash.substring(0, 15)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Running Services & Drivers list */}
              <div className="mb-4">
                <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono mb-1.5">Статус локальных служб:</span>
                <div className="flex flex-wrap gap-2">
                  {pc.services.map((service, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1.5 ${
                        service.status === "running"
                          ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/5 border border-rose-500/20 text-rose-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${service.status === "running" ? "bg-emerald-400" : "bg-rose-500 animate-pulse"}`}></span>
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Assigned User & Admin Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3">
                
                {/* Employee assignment */}
                <div className="flex items-center gap-2">
                  <img
                    src={u?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                    alt={pc.assignedUserName}
                    className="h-7 w-7 rounded-full border border-slate-800 object-cover"
                  />
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Ответственный:</span>
                    <span className="text-xs font-bold text-slate-200">{pc.assignedUserName}</span>
                  </div>
                </div>

                {/* Operations buttons */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => triggerIntegrityCheck(pc.id, pc.name)}
                    className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 rounded-xl transition-all cursor-pointer"
                    title="Запустить тест целостности системы (Аудит ФС)"
                  >
                    <Shield className="h-3.5 w-3.5" />
                  </button>

                  {currentUserRole === UserRole.ADMIN && (
                    <>
                      <button
                        onClick={() => handleEditClick(pc)}
                        className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 rounded-xl transition-all cursor-pointer"
                        title="Редактировать конфигурацию"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pc.id, pc.name)}
                        className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title="Удалить ПК из реестра"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

              </div>

            </div>
          );
        })}
        {filteredComputers.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-slate-950 border border-dashed border-slate-800 rounded-2xl">
            <Monitor className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">По вашему запросу не найдено ни одного компьютера</p>
          </div>
        )}
      </div>

    </div>
  );
}
