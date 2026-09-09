import React, { useState } from 'react';
import { AgroControlDatabase, TabId } from './types';
import { loadDatabase, saveDatabase } from './storage/db';
import { Navbar } from './components/Navbar';
import { GuiasView } from './components/GuiasView';
import { RecepcionView } from './components/RecepcionView';
import { ProcesamientoView } from './components/ProcesamientoView';
import { EmpaqueView } from './components/EmpaqueView';
import { InventariosView } from './components/InventariosView';
import { EmbarqueView } from './components/EmbarqueView';
import { ExportacionView } from './components/ExportacionView';
import { FacturacionView } from './components/FacturacionView';
import { ControlesView } from './components/ControlesView';
import { FlujoView } from './components/FlujoView';
import { SheetsModal } from './components/SheetsModal';

export default function App() {
  const [db, setDb] = useState<AgroControlDatabase>(() => loadDatabase());
  const [currentTab, setCurrentTab] = useState<TabId>('guias');
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  const handleDatabaseUpdate = (newDb: AgroControlDatabase) => {
    setDb(newDb);
    saveDatabase(newDb);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900 selection:bg-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSheetsModal={() => setShowSheetsModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'guias' && (
          <GuiasView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'recepcion' && (
          <RecepcionView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'procesamiento' && (
          <ProcesamientoView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'empaque' && (
          <EmpaqueView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'inventarios' && <InventariosView db={db} />}

        {currentTab === 'embarque' && (
          <EmbarqueView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'exportacion' && (
          <ExportacionView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'facturacion' && (
          <FacturacionView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'controles' && (
          <ControlesView db={db} onDatabaseUpdate={handleDatabaseUpdate} />
        )}

        {currentTab === 'flujo' && (
          <FlujoView db={db} onNavigateTab={(tab) => setCurrentTab(tab)} />
        )}
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AgroControl &copy; {new Date().getFullYear()} — Flujo Operativo Agrícola</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-mono text-emerald-700">16 Tablas Operativas</span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('flujo')}
              className="text-slate-600 hover:text-emerald-700 font-medium underline"
            >
              Trazabilidad por Lote
            </button>
            <span>•</span>
            <button
              onClick={() => setShowSheetsModal(true)}
              className="text-slate-600 hover:text-emerald-700 font-medium underline"
            >
              Ver Tablas
            </button>
          </div>
        </div>
      </footer>

      {/* Sheets 16-Tabs Modal */}
      <SheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        db={db}
      />
    </div>
  );
}
