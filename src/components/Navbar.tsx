import React, { useState } from 'react';
import { TabId } from '../types';
import {
  FileText,
  PackageCheck,
  Cpu,
  Package,
  Boxes,
  Truck,
  Send,
  Receipt,
  Scale,
  Database,
  Menu,
  X,
  ChevronRight,
  GitCommit,
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenSheetsModal: () => void;
}

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'guias', label: 'Guías', icon: FileText },
  { id: 'recepcion', label: 'Recepción', icon: PackageCheck },
  { id: 'procesamiento', label: 'Procesamiento', icon: Cpu },
  { id: 'empaque', label: 'Empaque', icon: Package },
  { id: 'inventarios', label: 'Inventarios', icon: Boxes },
  { id: 'embarque', label: 'Embarque', icon: Truck },
  { id: 'exportacion', label: 'Exportación', icon: Send },
  { id: 'facturacion', label: 'Facturación', icon: Receipt },
  { id: 'controles', label: 'Controles', icon: Scale },
  { id: 'flujo', label: 'Flujo / Trace', icon: GitCommit },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSheetsModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-white">AgroControl</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-medium border border-emerald-700/50">
                  Operativo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Flujo Agrícola: Cosecha → Empaque → Embarque → Facturación
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-open-sheets-config"
              onClick={onOpenSheetsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Ver tablas de datos"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Base de Datos</span>
            </button>

            {/* Mobile menu button */}
            <button
              id="btn-toggle-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Operational Flow Sub-bar (Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-between py-2 border-t border-slate-800/80 text-[11px] text-slate-400 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1 font-mono">
            <span className={currentTab === 'guias' ? 'text-emerald-400 font-semibold' : ''}>Guía Cosecha</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'recepcion' ? 'text-emerald-400 font-semibold' : ''}>Recepción</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'procesamiento' ? 'text-emerald-400 font-semibold' : ''}>Procesamiento</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'inventarios' ? 'text-emerald-400 font-semibold' : ''}>Inv. Procesado</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'empaque' ? 'text-emerald-400 font-semibold' : ''}>Empaque</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'inventarios' ? 'text-emerald-400 font-semibold' : ''}>Inv. Terminado</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'embarque' ? 'text-emerald-400 font-semibold' : ''}>Embarque</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'exportacion' ? 'text-emerald-400 font-semibold' : ''}>Exportación</span>
            <ChevronRight className="w-3 h-3 text-slate-600 inline" />
            <span className={currentTab === 'facturacion' ? 'text-emerald-400 font-semibold' : ''}>Facturación</span>
          </div>
          <div className="flex items-center gap-2 pl-4 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
            <span>Sistema en línea</span>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
