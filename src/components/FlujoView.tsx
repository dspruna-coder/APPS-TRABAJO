import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import {
  GitCommit,
  CheckCircle2,
  FileText,
  PackageCheck,
  Cpu,
  Boxes,
  Package,
  Truck,
  Send,
  Receipt,
  Search,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface FlujoViewProps {
  db: AgroControlDatabase;
  onNavigateTab: (tab: any) => void;
}

export const FlujoView: React.FC<FlujoViewProps> = ({ db, onNavigateTab }) => {
  // Collect all known LOTES
  const allLotes = Array.from(new Set(db.DETALLE_GUIA.map((d) => d.LOTE)));
  const [selectedLote, setSelectedLote] = useState<string>(allLotes[0] || '');

  // Trace data for selected lot
  const detalleGuia = db.DETALLE_GUIA.find((d) => d.LOTE === selectedLote);
  const guia = detalleGuia ? db.GUIAS.find((g) => g.ID_GUIA === detalleGuia.ID_GUIA) : null;
  const recepcion = detalleGuia
    ? db.RECEPCIONES.find((r) => r.ID_DETALLE === detalleGuia.ID_DETALLE)
    : null;
  const proceso = recepcion
    ? db.PROCESAMIENTO.find((p) => p.ID_RECEPCION === recepcion.ID_RECEPCION)
    : null;
  const invProcesado = proceso
    ? db.INVENTARIO_PROCESADO.find((i) => i.ID_PROCESO === proceso.ID_PROCESO)
    : null;

  // Empaques for this lot
  const detallesEmpaque = invProcesado
    ? db.DETALLE_EMPAQUE.filter((de) => de.ID_INV_PROCESADO === invProcesado.ID_INV_PROCESADO)
    : [];
  const empaqueIds = new Set(detallesEmpaque.map((de) => de.ID_EMPAQUE));
  const empaques = db.EMPAQUE.filter((e) => empaqueIds.has(e.ID_EMPAQUE));

  // Inventario Terminado for this lot
  const invTerminados = db.INVENTARIO_TERMINADO.filter((it) => it.LOTE === selectedLote);
  const invTerminadoIds = new Set(invTerminados.map((it) => it.ID_INV_TERMINADO));

  // Kardex for this lot
  const kardexMoves = db.KARDEX_TERMINADO.filter((k) =>
    invTerminadoIds.has(k.ID_INV_TERMINADO)
  );

  // Embarques for this lot
  const detallesEmbarque = db.DETALLE_EMBARQUE.filter((de) =>
    invTerminadoIds.has(de.ID_INV_TERMINADO)
  );
  const embarqueIds = new Set(detallesEmbarque.map((de) => de.ID_EMBARQUE));
  const embarques = db.EMBARQUES.filter((e) => embarqueIds.has(e.ID_EMBARQUE));

  // Exportaciones for this lot
  const detEmbarqueIds = new Set(detallesEmbarque.map((de) => de.ID_DET_EMBARQUE));
  const exportaciones = db.EXPORTACIONES.filter((exp) =>
    detEmbarqueIds.has(exp.ID_DET_EMBARQUE)
  );
  const expIds = new Set(exportaciones.map((e) => e.ID_EXPORTACION));

  // Facturaciones for this lot
  const facturaciones = db.FACTURACION.filter(
    (f) =>
      embarqueIds.has(f.ID_EMBARQUE) ||
      expIds.has(f.ID_EMBARQUE) ||
      (detalleGuia && f.ID_EMBARQUE === detalleGuia.ID_DETALLE) ||
      (guia && f.ID_EMBARQUE === guia.ID_GUIA)
  );

  // Global counts for pipeline overview
  const pipelineSteps = [
    {
      step: 1,
      id: 'guias',
      name: 'Guía de Cosecha',
      icon: FileText,
      count: `${db.GUIAS.length} guías`,
      detail: `${db.DETALLE_GUIA.reduce((a, b) => a + b.KG_TOTAL, 0).toLocaleString()} kg`,
      status: db.GUIAS.length > 0 ? 'Activo' : 'Vacío',
    },
    {
      step: 2,
      id: 'recepcion',
      name: 'Recepción',
      icon: PackageCheck,
      count: `${db.RECEPCIONES.length} recepciones`,
      detail: `${db.RECEPCIONES.reduce((a, b) => a + b.KG_RECIBIDOS, 0).toLocaleString()} kg`,
      status: db.RECEPCIONES.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      step: 3,
      id: 'procesamiento',
      name: 'Procesamiento',
      icon: Cpu,
      count: `${db.PROCESAMIENTO.length} procesos`,
      detail: `${db.PROCESAMIENTO.reduce((a, b) => a + b.KG_PROCESADOS, 0).toLocaleString()} kg`,
      status: db.PROCESAMIENTO.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      step: 4,
      id: 'inventarios',
      name: 'Inv. Procesado',
      icon: Boxes,
      count: `${db.INVENTARIO_PROCESADO.length} lotes`,
      detail: `${db.INVENTARIO_PROCESADO.reduce((a, b) => a + b.KG_DISPONIBLE, 0).toLocaleString()} kg disp.`,
      status: db.INVENTARIO_PROCESADO.length > 0 ? 'Activo' : 'Vacío',
    },
    {
      step: 5,
      id: 'empaque',
      name: 'Empaque',
      icon: Package,
      count: `${db.EMPAQUE.length} empaques`,
      detail: `${db.DETALLE_EMPAQUE.reduce((a, b) => a + b.KG_EMPACADOS, 0).toLocaleString()} kg`,
      status: db.EMPAQUE.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      step: 6,
      id: 'inventarios',
      name: 'Inv. Terminado',
      icon: Boxes,
      count: `${db.INVENTARIO_TERMINADO.length} lotes`,
      detail: `${db.INVENTARIO_TERMINADO.reduce((a, b) => a + b.KG_DISPONIBLE, 0).toLocaleString()} kg disp.`,
      status: db.INVENTARIO_TERMINADO.length > 0 ? 'Activo' : 'Vacío',
    },
    {
      step: 7,
      id: 'embarque',
      name: 'Embarque',
      icon: Truck,
      count: `${db.EMBARQUES.length} embarques`,
      detail: `${db.DETALLE_EMBARQUE.reduce((a, b) => a + b.KG_EMBARCADOS, 0).toLocaleString()} kg`,
      status: db.EMBARQUES.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      step: 8,
      id: 'exportacion',
      name: 'Exportación',
      icon: Send,
      count: `${db.EXPORTACIONES.length} envíos`,
      detail: `${db.EXPORTACIONES.reduce((a, b) => a + b.KG_EXPORTADOS, 0).toLocaleString()} kg`,
      status: db.EXPORTACIONES.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      step: 9,
      id: 'facturacion',
      name: 'Facturación',
      icon: Receipt,
      count: `${db.FACTURACION.length} facturas`,
      detail: `${db.FACTURACION.reduce((a, b) => a + b.KG_COBRADOS, 0).toLocaleString()} kg`,
      status: db.FACTURACION.length > 0 ? 'Activo' : 'Pendiente',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Flujo Operativo y Trazabilidad
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Guía → Recepción → Proceso → Inventarios → Empaque → Embarque → Exportación → Facturación
          </p>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          Etapas del Flujo Operativo
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <button
                key={step.step}
                onClick={() => onNavigateTab(step.id)}
                className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">0{step.step}</span>
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight mb-1">
                  {step.name}
                </div>
                <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                  {step.detail}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {step.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lot Traceability Explorer */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" />
              Trazabilidad por Lote
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historial del lote desde la cosecha hasta la facturación.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Seleccionar Lote:</span>
            <select
              value={selectedLote}
              onChange={(e) => setSelectedLote(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-md bg-white text-emerald-800"
            >
              {allLotes.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Traceability Timeline */}
        <div className="space-y-4">
          {/* Step 1: Guía de Cosecha */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Guía de Cosecha (Origen Campo)
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  Guía {guia?.N_GUIA || '—'} • Origen: {guia?.EMPRESA_ORIGEN || '—'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Cliente asignado: <strong className="text-slate-800">{detalleGuia?.CLIENTE}</strong> | Producto: <strong className="text-slate-800">{detalleGuia?.PRODUCTO}</strong>
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-slate-500">Gavetas: {detalleGuia?.N_GAVETAS}</div>
              <div className="text-sm font-bold text-slate-900">{detalleGuia?.KG_TOTAL.toLocaleString()} kg enviados</div>
              <div className="text-[11px] text-slate-400">{guia?.FECHA}</div>
            </div>
          </div>

          {/* Step 2: Recepción */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                recepcion ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                2
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Recepción en Planta
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {recepcion ? `Recibido por ${recepcion.RESPONSABLE}` : 'Pendiente de pesaje en báscula'}
                </div>
                {recepcion && (
                  <div className="text-xs text-slate-600 mt-1">
                    Estado: <span className="font-semibold text-emerald-700">{recepcion.ESTADO}</span> | Fecha: {recepcion.FECHA_RECEPCION}
                  </div>
                )}
              </div>
            </div>
            {recepcion && (
              <div className="text-right font-mono text-xs">
                <div className="text-slate-500">Recibidos: <strong className="text-slate-900">{recepcion.KG_RECIBIDOS.toLocaleString()} kg</strong></div>
                <div className={`text-[11px] font-bold ${
                  recepcion.KG_RECIBIDOS - recepcion.KG_ENVIADOS === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  Dif: {(recepcion.KG_RECIBIDOS - recepcion.KG_ENVIADOS) >= 0 ? '+' : ''}
                  {(recepcion.KG_RECIBIDOS - recepcion.KG_ENVIADOS).toFixed(2)} kg
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Procesamiento & Inventario Procesado */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                proceso ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                3
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Procesamiento e Inventario Procesado
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {proceso ? `Procesado el ${proceso.FECHA}` : 'Pendiente de proceso'}
                </div>
                {invProcesado && (
                  <div className="text-xs text-slate-600 mt-1">
                    En stock disponible: <strong className="text-emerald-700 font-mono">{invProcesado.KG_DISPONIBLE} kg</strong> (Empacados: {invProcesado.KG_EMPACADOS} kg)
                  </div>
                )}
              </div>
            </div>
            {proceso && (
              <div className="text-right font-mono text-xs">
                <div className="text-emerald-700 font-bold">{proceso.KG_PROCESADOS.toLocaleString()} kg procesados</div>
                <div className="text-amber-700 text-[11px]">Merma/Desecho: {proceso.KG_DESPERDICIO.toLocaleString()} kg</div>
              </div>
            )}
          </div>

          {/* Step 4: Empaque & Inventario Terminado */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                empaques.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                4
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Empaque y Kardex de Entrada
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {empaques.length > 0
                    ? `${empaques.length} orden(es) de empaque registradas`
                    : 'Sin empaque todavía'}
                </div>
                {invTerminados.length > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    Inventario Terminado: <strong className="text-emerald-700 font-mono">{invTerminados.reduce((a, b) => a + b.KG_DISPONIBLE, 0)} kg disp.</strong>
                  </div>
                )}
              </div>
            </div>
            {detallesEmpaque.length > 0 && (
              <div className="text-right font-mono text-xs">
                <div className="text-emerald-700 font-bold">
                  {detallesEmpaque.reduce((a, b) => a + b.KG_EMPACADOS, 0).toLocaleString()} kg empacados
                </div>
                <div className="text-slate-400 text-[11px]">Kardex: Entrada Empaque</div>
              </div>
            )}
          </div>

          {/* Step 5: Embarque & Exportación */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                embarques.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                5
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Embarque y Declaración de Exportación
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {embarques.length > 0
                    ? `Embarcado para ${embarques[0].CLIENTE} (${embarques[0].FECHA})`
                    : 'Pendiente de despacho a puerto'}
                </div>
                {exportaciones.length > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    Exportado en puerto: <strong className="text-emerald-700 font-mono">{exportaciones.reduce((a, b) => a + b.KG_EXPORTADOS, 0)} kg</strong>
                  </div>
                )}
              </div>
            </div>
            {detallesEmbarque.length > 0 && (
              <div className="text-right font-mono text-xs">
                <div className="text-blue-700 font-bold">
                  {detallesEmbarque.reduce((a, b) => a + b.KG_EMBARCADOS, 0).toLocaleString()} kg embarcados
                </div>
                <div className="text-slate-400 text-[11px]">Kardex: Salida Embarque</div>
              </div>
            )}
          </div>

          {/* Step 6: Facturación */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                facturaciones.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>
                6
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Facturación
                </span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {facturaciones.length > 0
                    ? `Factura ${facturaciones[0].N_FACTURA} (${facturaciones[0].ESTADO})`
                    : 'Pendiente de facturación'}
                </div>
                {facturaciones.length > 0 && (
                  <div className="text-xs text-slate-600 mt-1">
                    Fecha: {facturaciones[0].FECHA}
                  </div>
                )}
              </div>
            </div>
            {facturaciones.length > 0 && (
              <div className="text-right font-mono text-xs">
                <div className="text-emerald-700 font-bold text-sm">
                  {facturaciones[0].KG_COBRADOS.toLocaleString()} kg facturados
                </div>
                <div className="text-slate-500 text-[11px]">Control de volumen liquidado</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
