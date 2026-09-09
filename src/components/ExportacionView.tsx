import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { addExportacion } from '../storage/db';
import { Send, CheckCircle2, Lock, AlertCircle, Plus, Info, AlertTriangle } from 'lucide-react';

interface ExportacionViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

export const ExportacionView: React.FC<ExportacionViewProps> = ({ db, onDatabaseUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDetEmbarqueId, setSelectedDetEmbarqueId] = useState<string>('');
  const [kgExportados, setKgExportados] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Find all DETALLE_EMBARQUE lines
  // Let's identify which ones are already exported
  const exportedDetIds = new Set(db.EXPORTACIONES.map((e) => e.ID_DET_EMBARQUE));
  const availableDetallesEmbarque = db.DETALLE_EMBARQUE.filter((d) => !exportedDetIds.has(d.ID_DET_EMBARQUE));

  const activeDetEmbarque = db.DETALLE_EMBARQUE.find((d) => d.ID_DET_EMBARQUE === selectedDetEmbarqueId);
  const activeInvTerm = activeDetEmbarque
    ? db.INVENTARIO_TERMINADO.find((i) => i.ID_INV_TERMINADO === activeDetEmbarque.ID_INV_TERMINADO)
    : null;
  const activeEmbarque = activeDetEmbarque
    ? db.EMBARQUES.find((e) => e.ID_EMBARQUE === activeDetEmbarque.ID_EMBARQUE)
    : null;

  const kgEmbarcados = activeDetEmbarque ? activeDetEmbarque.KG_EMBARCADOS : 0;
  const numKgExportados = parseFloat(kgExportados) || 0;
  const diferencia = numKgExportados - kgEmbarcados;

  const handleSelectDetalle = (detId: string) => {
    setSelectedDetEmbarqueId(detId);
    const d = db.DETALLE_EMBARQUE.find((item) => item.ID_DET_EMBARQUE === detId);
    if (d) {
      setKgExportados(d.KG_EMBARCADOS.toString());
    }
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedDetEmbarqueId) {
      setErrorMsg('Seleccione un detalle de embarque.');
      return;
    }
    if (numKgExportados <= 0) {
      setErrorMsg('Los KG exportados deben ser mayores a cero.');
      return;
    }

    try {
      const { newDb, exportacion } = addExportacion(db, {
        FECHA: fecha,
        ID_DET_EMBARQUE: selectedDetEmbarqueId,
        KG_EXPORTADOS: numKgExportados,
      });

      onDatabaseUpdate(newDb);
      setSuccessMsg(
        `Exportación registrada exitosamente (${numKgExportados.toLocaleString()} kg). Diferencia: ${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)} kg.`
      );
      setShowForm(false);
      setSelectedDetEmbarqueId('');
      setKgExportados('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar exportación.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Exportaciones</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Declaración de exportación y registro de peso real en puerto.
          </p>
        </div>
        <div>
          {availableDetallesEmbarque.length > 0 && (
            <button
              id="btn-nueva-exportacion"
              onClick={() => {
                if (!showForm && availableDetallesEmbarque[0]) {
                  handleSelectDetalle(availableDetallesEmbarque[0].ID_DET_EMBARQUE);
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Cerrar Registro' : `Registrar Exportación (${availableDetallesEmbarque.length} pendientes)`}</span>
            </button>
          )}
        </div>
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

      {/* Pending Embarques */}
      {availableDetallesEmbarque.length > 0 && !showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lotes Embarcados Pendientes de Declaración de Exportación ({availableDetallesEmbarque.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white rounded border border-slate-200">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3">Lote</th>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3 text-right">KG Embarcados</th>
                  <th className="py-2 px-3">Fecha Embarque</th>
                  <th className="py-2 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableDetallesEmbarque.map((line) => {
                  const invTerm = db.INVENTARIO_TERMINADO.find(
                    (i) => i.ID_INV_TERMINADO === line.ID_INV_TERMINADO
                  );
                  const emb = db.EMBARQUES.find((e) => e.ID_EMBARQUE === line.ID_EMBARQUE);

                  return (
                    <tr key={line.ID_DET_EMBARQUE} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{invTerm?.LOTE || '—'}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{invTerm?.PRODUCTO || '—'}</td>
                      <td className="py-2 px-3 text-slate-600">{invTerm?.CLIENTE || '—'}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                        {line.KG_EMBARCADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-slate-500">{emb?.FECHA}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleSelectDetalle(line.ID_DET_EMBARQUE)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                        >
                          Declarar Exportación
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Card */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Registrar Pesaje de Exportación</h2>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Transacción inmutable
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Select Detalle Embarque */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lote / Detalle Embarque <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-det-embarque"
                  required
                  value={selectedDetEmbarqueId}
                  onChange={(e) => handleSelectDetalle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Seleccionar lote embarcado --</option>
                  {availableDetallesEmbarque.map((line) => {
                    const inv = db.INVENTARIO_TERMINADO.find(
                      (i) => i.ID_INV_TERMINADO === line.ID_INV_TERMINADO
                    );
                    return (
                      <option key={line.ID_DET_EMBARQUE} value={line.ID_DET_EMBARQUE}>
                        Lote: {inv?.LOTE} | {inv?.PRODUCTO} ({line.KG_EMBARCADOS} kg) - {inv?.CLIENTE}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Exportación <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-exportacion"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* KG Exportados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG Exportados (Aduana / Puerto) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-kg-exportados"
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej. 796"
                  value={kgExportados}
                  onChange={(e) => setKgExportados(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>
            </div>

            {/* Comparison Details */}
            {activeDetEmbarque && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Control de Comparación: KG_EMBARCADOS vs KG_EXPORTADOS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Lote y Cliente</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeInvTerm?.LOTE} ({activeInvTerm?.CLIENTE})
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Embarcados</span>
                    <span className="text-sm font-bold text-blue-700">
                      {kgEmbarcados.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">KG Exportados</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {numKgExportados.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Diferencia</span>
                    <span
                      className={`text-sm font-bold ${
                        diferencia === 0
                          ? 'text-emerald-700'
                          : diferencia < 0
                          ? 'text-amber-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)} kg
                    </span>
                  </div>
                </div>

                {numKgExportados > 0 && diferencia !== 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-semibold">Alerta de Diferencia:</span> Existe una diferencia de {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)} kg entre embarque y exportación. La exportación sirve como control de comparación y no modifica inventario.
                    </div>
                  </div>
                )}
              </div>
            )}

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
                id="btn-guardar-exportacion"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Exportación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Exportaciones</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {db.EXPORTACIONES.length}
            </span>
          </div>
        </div>

        {db.EXPORTACIONES.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay exportaciones registradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ID Exportación</th>
                  <th className="py-2.5 px-3 font-semibold">Lote / Cliente</th>
                  <th className="py-2.5 px-3 font-semibold">Producto</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Embarcados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Exportados</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {db.EXPORTACIONES.map((exp) => {
                  const detEmb = db.DETALLE_EMBARQUE.find((d) => d.ID_DET_EMBARQUE === exp.ID_DET_EMBARQUE);
                  const invTerm = detEmb
                    ? db.INVENTARIO_TERMINADO.find((i) => i.ID_INV_TERMINADO === detEmb.ID_INV_TERMINADO)
                    : null;
                  const kgEmb = detEmb ? detEmb.KG_EMBARCADOS : 0;
                  const dif = exp.KG_EXPORTADOS - kgEmb;

                  return (
                    <tr key={exp.ID_EXPORTACION} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        {exp.ID_EXPORTACION.slice(0, 8)}...
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-mono font-semibold text-slate-800">{invTerm?.LOTE || '—'}</div>
                        <div className="text-[11px] text-slate-500">{invTerm?.CLIENTE}</div>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{invTerm?.PRODUCTO || '—'}</td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700 font-semibold">
                        {kgEmb.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                        {exp.KG_EXPORTADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                            dif === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {dif >= 0 ? `+${dif.toFixed(2)}` : dif.toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{exp.FECHA}</td>
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
