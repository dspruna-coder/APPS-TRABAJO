import React, { useState } from 'react';
import { AgroControlDatabase, EmpresaOrigen } from '../types';
import { addFacturacion } from '../storage/db';
import { Receipt, CheckCircle2, AlertCircle, Plus, Building2, ArrowRight, AlertTriangle } from 'lucide-react';

interface FacturacionViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

type TabTipo = 'finca-prados' | 'prados-equinoccio';

export const FacturacionView: React.FC<FacturacionViewProps> = ({ db, onDatabaseUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabTipo>('finca-prados');
  const [showForm, setShowForm] = useState(false);

  // Form states for Finca → Prados
  const [selectedDetalleGuiaId, setSelectedDetalleGuiaId] = useState<string>('');

  // Form states for Prados → Equinoccio
  const [selectedExportacionId, setSelectedExportacionId] = useState<string>('');

  // Shared form fields
  const [nFactura, setNFactura] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kgCobrados, setKgCobrados] = useState<string>('');
  const [estado, setEstado] = useState<'Emitida' | 'Anulada'>('Emitida');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ==========================================
  // TAB 1: FINCA → PRADOS (DETALLE_GUIA)
  // ==========================================
  // References: DETALLE_GUIA where EMPRESA_ORIGEN is 'Jardines del Molino' or 'Terra Prime'
  const fincaDetalles = db.DETALLE_GUIA.filter((d) => {
    const guia = db.GUIAS.find((g) => g.ID_GUIA === d.ID_GUIA);
    return (
      guia &&
      (guia.EMPRESA_ORIGEN === 'Jardines del Molino' || guia.EMPRESA_ORIGEN === 'Terra Prime')
    );
  }).map((d) => {
    const guia = db.GUIAS.find((g) => g.ID_GUIA === d.ID_GUIA)!;
    const kgFisicos = d.KG_TOTAL;
    // Cumulative invoiced KG for this reference
    const facturas = db.FACTURACION.filter(
      (f) =>
        f.TIPO_FACTURA === 'FINCA_PRADOS' &&
        f.ESTADO === 'Emitida' &&
        (f.ID_EMBARQUE === d.ID_DETALLE || f.ID_EMBARQUE === d.ID_GUIA)
    );
    const kgYaFacturados = facturas.reduce((sum, f) => sum + f.KG_COBRADOS, 0);
    const kgPendientes = Math.max(0, kgFisicos - kgYaFacturados);
    const diferencia = kgFisicos - kgYaFacturados;

    return {
      detalle: d,
      guia,
      kgFisicos,
      kgYaFacturados,
      kgPendientes,
      diferencia,
      facturas,
    };
  });

  // Automatically filter pending items
  const pendientesFinca = fincaDetalles.filter((item) => item.kgPendientes > 0);

  // Invoices for Finca → Prados
  const facturasFincaPrados = db.FACTURACION.filter(
    (f) =>
      f.TIPO_FACTURA === 'FINCA_PRADOS' ||
      fincaDetalles.some((fd) => fd.detalle.ID_DETALLE === f.ID_EMBARQUE || fd.guia.ID_GUIA === f.ID_EMBARQUE)
  );

  // ==========================================
  // TAB 2: PRADOS → EQUINOCCIO (EXPORTACIONES)
  // ==========================================
  // References: EXPORTACIONES
  const exportacionesConBalance = db.EXPORTACIONES.map((exp) => {
    const detEmbarque = db.DETALLE_EMBARQUE.find((de) => de.ID_DET_EMBARQUE === exp.ID_DET_EMBARQUE);
    const invTerminado = detEmbarque
      ? db.INVENTARIO_TERMINADO.find((it) => it.ID_INV_TERMINADO === detEmbarque.ID_INV_TERMINADO)
      : null;
    const embarque = detEmbarque
      ? db.EMBARQUES.find((e) => e.ID_EMBARQUE === detEmbarque.ID_EMBARQUE)
      : null;

    const kgExportados = exp.KG_EXPORTADOS;
    // Cumulative invoiced KG for this reference
    const facturas = db.FACTURACION.filter(
      (f) =>
        f.TIPO_FACTURA === 'PRADOS_EQUINOCCIO' &&
        f.ESTADO === 'Emitida' &&
        (f.ID_EMBARQUE === exp.ID_EXPORTACION ||
          f.ID_EMBARQUE === exp.ID_DET_EMBARQUE ||
          (detEmbarque && f.ID_EMBARQUE === detEmbarque.ID_EMBARQUE))
    );
    const kgYaFacturados = facturas.reduce((sum, f) => sum + f.KG_COBRADOS, 0);
    const kgPendientes = Math.max(0, kgExportados - kgYaFacturados);
    const diferencia = kgExportados - kgYaFacturados;

    return {
      exportacion: exp,
      detEmbarque,
      invTerminado,
      embarque,
      kgExportados,
      kgYaFacturados,
      kgPendientes,
      diferencia,
      facturas,
    };
  });

  // Automatically filter pending items
  const pendientesExportacion = exportacionesConBalance.filter((item) => item.kgPendientes > 0);

  // Invoices for Prados → Equinoccio
  const facturasPradosEquinoccio = db.FACTURACION.filter(
    (f) =>
      f.TIPO_FACTURA === 'PRADOS_EQUINOCCIO' ||
      exportacionesConBalance.some(
        (ec) =>
          ec.exportacion.ID_EXPORTACION === f.ID_EMBARQUE ||
          ec.exportacion.ID_DET_EMBARQUE === f.ID_EMBARQUE ||
          (ec.embarque && ec.embarque.ID_EMBARQUE === f.ID_EMBARQUE)
      )
  );

  // Current active draft calculation
  const selectedFincaItem = fincaDetalles.find((fd) => fd.detalle.ID_DETALLE === selectedDetalleGuiaId);
  const numKgCobrados = parseFloat(kgCobrados) || 0;

  const isFincaOverLimit =
    selectedFincaItem && numKgCobrados > 0
      ? selectedFincaItem.kgYaFacturados + numKgCobrados > selectedFincaItem.kgFisicos
      : false;

  const selectedExpItem = exportacionesConBalance.find(
    (ec) => ec.exportacion.ID_EXPORTACION === selectedExportacionId
  );
  const isExpOverLimit =
    selectedExpItem && numKgCobrados > 0
      ? selectedExpItem.kgYaFacturados + numKgCobrados > selectedExpItem.kgExportados
      : false;

  // Switch tabs
  const handleTabChange = (tab: TabTipo) => {
    setActiveTab(tab);
    setShowForm(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Open form preselecting an item
  const handleFacturarFinca = (idDetalle: string, kgPend: number) => {
    setSelectedDetalleGuiaId(idDetalle);
    setKgCobrados(kgPend.toString());
    setNFactura(`FAC-FINCA-${String(facturasFincaPrados.length + 1).padStart(3, '0')}`);
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleFacturarExp = (idExportacion: string, kgPend: number) => {
    setSelectedExportacionId(idExportacion);
    setKgCobrados(kgPend.toString());
    setNFactura(`FAC-EQ-${String(facturasPradosEquinoccio.length + 1).padStart(3, '0')}`);
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleOpenNewForm = () => {
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === 'finca-prados') {
      setNFactura(`FAC-FINCA-${String(facturasFincaPrados.length + 1).padStart(3, '0')}`);
      if (pendientesFinca.length > 0) {
        setSelectedDetalleGuiaId(pendientesFinca[0].detalle.ID_DETALLE);
        setKgCobrados(pendientesFinca[0].kgPendientes.toString());
      } else if (fincaDetalles.length > 0) {
        setSelectedDetalleGuiaId(fincaDetalles[0].detalle.ID_DETALLE);
        setKgCobrados('0');
      }
    } else {
      setNFactura(`FAC-EQ-${String(facturasPradosEquinoccio.length + 1).padStart(3, '0')}`);
      if (pendientesExportacion.length > 0) {
        setSelectedExportacionId(pendientesExportacion[0].exportacion.ID_EXPORTACION);
        setKgCobrados(pendientesExportacion[0].kgPendientes.toString());
      } else if (exportacionesConBalance.length > 0) {
        setSelectedExportacionId(exportacionesConBalance[0].exportacion.ID_EXPORTACION);
        setKgCobrados('0');
      }
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!numKgCobrados || numKgCobrados <= 0) {
      setErrorMsg('Los KG facturados deben ser mayores a cero.');
      return;
    }

    if (!nFactura.trim()) {
      setErrorMsg('El número de factura es obligatorio.');
      return;
    }

    try {
      if (activeTab === 'finca-prados') {
        if (!selectedDetalleGuiaId) {
          setErrorMsg('Seleccione una referencia de detalle de guía.');
          return;
        }

        if (isFincaOverLimit && selectedFincaItem) {
          setErrorMsg(
            `Guardado bloqueado: La suma acumulada de KG facturados (${(
              selectedFincaItem.kgYaFacturados + numKgCobrados
            ).toFixed(2)} kg) supera los KG_TOTAL de DETALLE_GUIA (${selectedFincaItem.kgFisicos.toLocaleString()} kg).`
          );
          return;
        }

        const { newDb, factura } = addFacturacion(db, {
          ID_EMBARQUE: selectedDetalleGuiaId,
          N_FACTURA: nFactura.trim(),
          FECHA: fecha,
          KG_COBRADOS: numKgCobrados,
          PRECIO_KG: 0,
          ESTADO: estado,
          TIPO_FACTURA: 'FINCA_PRADOS',
        });

        onDatabaseUpdate(newDb);
        setSuccessMsg(
          `Factura ${factura.N_FACTURA} registrada exitosamente (${numKgCobrados.toLocaleString()} kg).`
        );
      } else {
        if (!selectedExportacionId) {
          setErrorMsg('Seleccione una referencia de exportación.');
          return;
        }

        if (isExpOverLimit && selectedExpItem) {
          setErrorMsg(
            `Guardado bloqueado: La suma acumulada de KG facturados (${(
              selectedExpItem.kgYaFacturados + numKgCobrados
            ).toFixed(2)} kg) supera los KG_EXPORTADOS (${selectedExpItem.kgExportados.toLocaleString()} kg).`
          );
          return;
        }

        const { newDb, factura } = addFacturacion(db, {
          ID_EMBARQUE: selectedExportacionId,
          N_FACTURA: nFactura.trim(),
          FECHA: fecha,
          KG_COBRADOS: numKgCobrados,
          PRECIO_KG: 0,
          ESTADO: estado,
          TIPO_FACTURA: 'PRADOS_EQUINOCCIO',
        });

        onDatabaseUpdate(newDb);
        setSuccessMsg(
          `Factura ${factura.N_FACTURA} registrada exitosamente para Equinoccio (${numKgCobrados.toLocaleString()} kg).`
        );
      }

      setShowForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la factura.');
    }
  };

  // Metrics for active tab
  const totalKgFisicosTab1 = fincaDetalles.reduce((acc, f) => acc + f.kgFisicos, 0);
  const totalKgFacturadosTab1 = fincaDetalles.reduce((acc, f) => acc + f.kgYaFacturados, 0);
  const totalKgPendientesTab1 = fincaDetalles.reduce((acc, f) => acc + f.kgPendientes, 0);
  const totalDiferenciaTab1 = totalKgFisicosTab1 - totalKgFacturadosTab1;

  const totalKgExportadosTab2 = exportacionesConBalance.reduce((acc, e) => acc + e.kgExportados, 0);
  const totalKgFacturadosTab2 = exportacionesConBalance.reduce((acc, e) => acc + e.kgYaFacturados, 0);
  const totalKgPendientesTab2 = exportacionesConBalance.reduce((acc, e) => acc + e.kgPendientes, 0);
  const totalDiferenciaTab2 = totalKgExportadosTab2 - totalKgFacturadosTab2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Facturación</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Control de facturación y pendientes: Finca → Prados y Prados → Equinoccio.
          </p>
        </div>

        <div>
          <button
            id="btn-nueva-factura"
            onClick={handleOpenNewForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cerrar Formulario' : 'Nueva Factura'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-3 pt-2 gap-2">
        <button
          id="tab-finca-prados"
          onClick={() => handleTabChange('finca-prados')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'finca-prados'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Finca → Prados</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {pendientesFinca.length} pendientes
          </span>
        </button>

        <button
          id="tab-prados-equinoccio"
          onClick={() => handleTabChange('prados-equinoccio')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'prados-equinoccio'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowRight className="w-4 h-4" />
          <span>Prados → Equinoccio</span>
          <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {pendientesExportacion.length} pendientes
          </span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Summary Cards: KG físicos/exportados, KG ya facturados, KG pendientes, Diferencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {activeTab === 'finca-prados' ? (
          <>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Físicos (DETALLE_GUIA)</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {totalKgFisicosTab1.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Ya Facturados</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {totalKgFacturadosTab1.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Pendientes</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                {totalKgPendientesTab1.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Diferencia Total</span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  totalDiferenciaTab1 === 0 ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {totalDiferenciaTab1 >= 0 ? `+${totalDiferenciaTab1.toFixed(2)}` : totalDiferenciaTab1.toFixed(2)} kg
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Exportados (EXPORTACIONES)</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {totalKgExportadosTab2.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Ya Facturados</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {totalKgFacturadosTab2.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">KG Pendientes</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                {totalKgPendientesTab2.toLocaleString()} kg
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">Diferencia Total</span>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  totalDiferenciaTab2 === 0 ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {totalDiferenciaTab2 >= 0 ? `+${totalDiferenciaTab2.toFixed(2)}` : totalDiferenciaTab2.toFixed(2)} kg
              </div>
            </div>
          </>
        )}
      </div>

      {/* Form Modal / Inline Card */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-800">
              {activeTab === 'finca-prados'
                ? 'Registrar Factura: Finca → Prados (Referencia: DETALLE_GUIA)'
                : 'Registrar Factura: Prados → Equinoccio (Referencia: EXPORTACION)'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Document Reference */}
              {activeTab === 'finca-prados' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Línea de Guía (DETALLE_GUIA) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-guia-factura"
                    required
                    value={selectedDetalleGuiaId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedDetalleGuiaId(id);
                      const item = fincaDetalles.find((fd) => fd.detalle.ID_DETALLE === id);
                      if (item) {
                        setKgCobrados(item.kgPendientes.toString());
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Seleccionar Línea de Guía --</option>
                    {fincaDetalles.map((fd) => (
                      <option key={fd.detalle.ID_DETALLE} value={fd.detalle.ID_DETALLE}>
                        {fd.guia.N_GUIA} | {fd.guia.EMPRESA_ORIGEN} | Lote: {fd.detalle.LOTE} ({fd.kgPendientes.toLocaleString()} kg pendientes)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Referencia de Exportación (EXPORTACIONES) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="select-embarque-factura"
                    required
                    value={selectedExportacionId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedExportacionId(id);
                      const item = exportacionesConBalance.find((ec) => ec.exportacion.ID_EXPORTACION === id);
                      if (item) {
                        setKgCobrados(item.kgPendientes.toString());
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Seleccionar Exportación --</option>
                    {exportacionesConBalance.map((ec) => (
                      <option key={ec.exportacion.ID_EXPORTACION} value={ec.exportacion.ID_EXPORTACION}>
                        Exp: {ec.exportacion.FECHA} | Lote: {ec.invTerminado?.LOTE || '—'} ({ec.kgPendientes.toLocaleString()} kg pendientes)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* N° Factura */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Factura <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-n-factura"
                  type="text"
                  required
                  placeholder="FAC-001"
                  value={nFactura}
                  onChange={(e) => setNFactura(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-factura"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* KG Cobrados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG a Facturar <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-kg-cobrados"
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej. 1500"
                  value={kgCobrados}
                  onChange={(e) => setKgCobrados(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-bold"
                />
              </div>
            </div>

            {/* Live Balance Box: KG físicos/exportados, KG ya facturados, KG pendientes y diferencia */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Control de Cantidades y Validación
              </h4>

              {activeTab === 'finca-prados' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Físicos</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedFincaItem ? selectedFincaItem.kgFisicos.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Ya Facturados</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedFincaItem ? selectedFincaItem.kgYaFacturados.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Pendientes</span>
                    <span className="text-sm font-bold text-amber-700">
                      {selectedFincaItem ? selectedFincaItem.kgPendientes.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Diferencia (tras factura)</span>
                    {(() => {
                      const fisicos = selectedFincaItem ? selectedFincaItem.kgFisicos : 0;
                      const ya = selectedFincaItem ? selectedFincaItem.kgYaFacturados : 0;
                      const rem = fisicos - (ya + numKgCobrados);
                      return (
                        <span
                          className={`text-sm font-bold ${
                            rem >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {rem >= 0 ? `+${rem.toFixed(2)}` : rem.toFixed(2)} kg
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Exportados</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedExpItem ? selectedExpItem.kgExportados.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Ya Facturados</span>
                    <span className="text-sm font-bold text-slate-800">
                      {selectedExpItem ? selectedExpItem.kgYaFacturados.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Pendientes</span>
                    <span className="text-sm font-bold text-amber-700">
                      {selectedExpItem ? selectedExpItem.kgPendientes.toLocaleString() : 0} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Diferencia (tras factura)</span>
                    {(() => {
                      const exp = selectedExpItem ? selectedExpItem.kgExportados : 0;
                      const ya = selectedExpItem ? selectedExpItem.kgYaFacturados : 0;
                      const rem = exp - (ya + numKgCobrados);
                      return (
                        <span
                          className={`text-sm font-bold ${
                            rem >= 0 ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {rem >= 0 ? `+${rem.toFixed(2)}` : rem.toFixed(2)} kg
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Over-limit Warning */}
              {activeTab === 'finca-prados' && isFincaOverLimit && selectedFincaItem && (
                <div className="p-2.5 bg-red-50 border border-red-300 rounded text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">Guardado bloqueado:</span> La suma acumulada de KG facturados ({(selectedFincaItem.kgYaFacturados + numKgCobrados).toFixed(2)} kg) supera los KG_TOTAL de DETALLE_GUIA ({selectedFincaItem.kgFisicos.toLocaleString()} kg). Máximo pendiente: {selectedFincaItem.kgPendientes.toFixed(2)} kg.
                  </div>
                </div>
              )}

              {activeTab === 'prados-equinoccio' && isExpOverLimit && selectedExpItem && (
                <div className="p-2.5 bg-red-50 border border-red-300 rounded text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">Guardado bloqueado:</span> La suma acumulada de KG facturados ({(selectedExpItem.kgYaFacturados + numKgCobrados).toFixed(2)} kg) supera los KG_EXPORTADOS ({selectedExpItem.kgExportados.toLocaleString()} kg). Máximo pendiente: {selectedExpItem.kgPendientes.toFixed(2)} kg.
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-guardar-factura"
                disabled={activeTab === 'finca-prados' ? isFincaOverLimit : isExpOverLimit}
                className={`px-5 py-2 text-white rounded-md text-xs font-semibold shadow-xs transition-colors ${
                  (activeTab === 'finca-prados' ? isFincaOverLimit : isExpOverLimit)
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Guardar Factura
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PENDIENTES DE FACTURAR TABLE (Automatic display) */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800">
              {activeTab === 'finca-prados'
                ? 'Pendientes de Facturar (DETALLE_GUIA: Jardines del Molino / Terra Prime)'
                : 'Pendientes de Facturar (EXPORTACIONES: Equinoccio Vegetal)'}
            </h2>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {activeTab === 'finca-prados' ? pendientesFinca.length : pendientesExportacion.length}
            </span>
          </div>
        </div>

        {activeTab === 'finca-prados' ? (
          pendientesFinca.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay líneas de guías de finca pendientes por facturar. Todo se encuentra al día.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Guía / Fecha</th>
                    <th className="py-2.5 px-3 font-semibold">Finca (Origen)</th>
                    <th className="py-2.5 px-3 font-semibold">Lote / Producto</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Físicos</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Ya Facturados</th>
                    <th className="py-2.5 px-3 font-semibold text-right text-amber-800">KG Pendientes</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {pendientesFinca.map((item) => (
                    <tr key={item.detalle.ID_DETALLE} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">
                        {item.guia.N_GUIA} <span className="text-slate-400 font-normal">({item.guia.FECHA})</span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {item.guia.EMPRESA_ORIGEN}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {item.detalle.LOTE} · {item.detalle.PRODUCTO}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                        {item.kgFisicos.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {item.kgYaFacturados.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                        {item.kgPendientes.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">
                        {item.diferencia >= 0 ? `+${item.diferencia.toFixed(2)}` : item.diferencia.toFixed(2)} kg
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleFacturarFinca(item.detalle.ID_DETALLE, item.kgPendientes)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold"
                        >
                          Facturar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : pendientesExportacion.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No hay declaraciones de exportación pendientes por facturar.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Fecha Exportación</th>
                <th className="py-2.5 px-3 font-semibold">Cliente</th>
                <th className="py-2.5 px-3 font-semibold">Lote / Producto</th>
                <th className="py-2.5 px-3 font-semibold text-right">KG Exportados</th>
                <th className="py-2.5 px-3 font-semibold text-right">KG Ya Facturados</th>
                <th className="py-2.5 px-3 font-semibold text-right text-amber-800">KG Pendientes</th>
                <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                <th className="py-2.5 px-3 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pendientesExportacion.map((item) => (
                <tr key={item.exportacion.ID_EXPORTACION} className="hover:bg-slate-50/70">
                  <td className="py-2 px-3 font-mono font-medium text-slate-900">
                    {item.exportacion.FECHA}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {item.embarque?.CLIENTE || 'Equinoccio Vegetal'}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700">
                    {item.invTerminado?.LOTE || '—'} · {item.invTerminado?.PRODUCTO || '—'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-800">
                    {item.kgExportados.toLocaleString()} kg
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">
                    {item.kgYaFacturados.toLocaleString()} kg
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                    {item.kgPendientes.toLocaleString()} kg
                  </td>
                  <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">
                    {item.diferencia >= 0 ? `+${item.diferencia.toFixed(2)}` : item.diferencia.toFixed(2)} kg
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleFacturarExp(item.exportacion.ID_EXPORTACION, item.kgPendientes)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold"
                    >
                      Facturar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Main Invoices History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">
              {activeTab === 'finca-prados'
                ? 'Historial de Facturas: Finca → Prados'
                : 'Historial de Facturas: Prados → Equinoccio'}
            </h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {activeTab === 'finca-prados'
                ? facturasFincaPrados.length
                : facturasPradosEquinoccio.length}
            </span>
          </div>
        </div>

        {activeTab === 'finca-prados' ? (
          facturasFincaPrados.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay facturas registradas para Finca → Prados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">N° Factura</th>
                    <th className="py-2.5 px-3 font-semibold">Finca (Origen)</th>
                    <th className="py-2.5 px-3 font-semibold">Referencia</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Físicos</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Facturados</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Ya Facturados</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Pendientes</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                    <th className="py-2.5 px-3 font-semibold">Fecha</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {facturasFincaPrados.map((fac) => {
                    const matchItem = fincaDetalles.find(
                      (fd) => fd.detalle.ID_DETALLE === fac.ID_EMBARQUE || fd.guia.ID_GUIA === fac.ID_EMBARQUE
                    );
                    const kgFisicos = matchItem ? matchItem.kgFisicos : fac.KG_COBRADOS;
                    const kgYaFacturados = matchItem ? matchItem.kgYaFacturados : fac.KG_COBRADOS;
                    const kgPendientes = matchItem ? matchItem.kgPendientes : 0;
                    const dif = kgFisicos - kgYaFacturados;

                    return (
                      <tr key={fac.ID_FACTURACION} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">
                          {fac.N_FACTURA}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {matchItem?.guia.EMPRESA_ORIGEN || 'Finca'}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {matchItem ? `${matchItem.guia.N_GUIA} · ${matchItem.detalle.LOTE}` : fac.ID_EMBARQUE.slice(0, 8)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                          {kgFisicos.toLocaleString()} kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {fac.KG_COBRADOS.toLocaleString()} kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {kgYaFacturados.toLocaleString()} kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-amber-700">
                          {kgPendientes.toLocaleString()} kg
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                              dif === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {dif >= 0 ? `+${dif.toFixed(2)}` : dif.toFixed(2)} kg
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{fac.FECHA}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              fac.ESTADO === 'Emitida'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {fac.ESTADO}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : facturasPradosEquinoccio.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay facturas registradas para Prados → Equinoccio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">N° Factura</th>
                  <th className="py-2.5 px-3 font-semibold">Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Referencia Exportación</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Exportados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Facturados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Ya Facturados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Pendientes</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {facturasPradosEquinoccio.map((fac) => {
                  const matchItem = exportacionesConBalance.find(
                    (ec) =>
                      ec.exportacion.ID_EXPORTACION === fac.ID_EMBARQUE ||
                      ec.exportacion.ID_DET_EMBARQUE === fac.ID_EMBARQUE ||
                      (ec.embarque && ec.embarque.ID_EMBARQUE === fac.ID_EMBARQUE)
                  );
                  const kgExportados = matchItem ? matchItem.kgExportados : fac.KG_COBRADOS;
                  const kgYaFacturados = matchItem ? matchItem.kgYaFacturados : fac.KG_COBRADOS;
                  const kgPendientes = matchItem ? matchItem.kgPendientes : 0;
                  const dif = kgExportados - kgYaFacturados;

                  return (
                    <tr key={fac.ID_FACTURACION} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {fac.N_FACTURA}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {matchItem?.embarque?.CLIENTE || 'Equinoccio Vegetal'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {matchItem
                          ? `Exp: ${matchItem.exportacion.FECHA} · ${matchItem.invTerminado?.LOTE || '—'}`
                          : fac.ID_EMBARQUE.slice(0, 8)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-700">
                        {kgExportados.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        {fac.KG_COBRADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {kgYaFacturados.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700">
                        {kgPendientes.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                            dif === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {dif >= 0 ? `+${dif.toFixed(2)}` : dif.toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{fac.FECHA}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            fac.ESTADO === 'Emitida'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {fac.ESTADO}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
