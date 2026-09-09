import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { addProcesamiento } from '../storage/db';
import { Cpu, CheckCircle2, Lock, AlertCircle, Plus } from 'lucide-react';

interface ProcesamientoViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

export const ProcesamientoView: React.FC<ProcesamientoViewProps> = ({ db, onDatabaseUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRecepcionId, setSelectedRecepcionId] = useState<string>('');
  const [kgProcesados, setKgProcesados] = useState<string>('');
  const [kgDesperdicio, setKgDesperdicio] = useState<string>('0');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Available receptions to process
  // We can show all receptions (or those not yet processed)
  const processedRecepcionIds = new Set(db.PROCESAMIENTO.map((p) => p.ID_RECEPCION));
  const availableRecepciones = db.RECEPCIONES.filter((r) => !processedRecepcionIds.has(r.ID_RECEPCION));

  const activeRecepcion = db.RECEPCIONES.find((r) => r.ID_RECEPCION === selectedRecepcionId);
  const activeDetalle = activeRecepcion
    ? db.DETALLE_GUIA.find((d) => d.ID_DETALLE === activeRecepcion.ID_DETALLE)
    : null;

  const kgRecibidos = activeRecepcion ? activeRecepcion.KG_RECIBIDOS : 0;
  const numKgProcesados = parseFloat(kgProcesados) || 0;
  const numKgDesperdicio = parseFloat(kgDesperdicio) || 0;
  const diferencia = kgRecibidos - numKgProcesados - numKgDesperdicio;

  const handleSelectRecepcion = (recId: string) => {
    setSelectedRecepcionId(recId);
    const rec = db.RECEPCIONES.find((r) => r.ID_RECEPCION === recId);
    if (rec) {
      // suggest 95% processed, 5% waste as default guideline
      const suggestedProc = Math.round(rec.KG_RECIBIDOS * 0.95);
      const suggestedWaste = rec.KG_RECIBIDOS - suggestedProc;
      setKgProcesados(suggestedProc.toString());
      setKgDesperdicio(suggestedWaste.toString());
    }
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedRecepcionId) {
      setErrorMsg('Debe seleccionar una recepción para procesar.');
      return;
    }
    if (numKgProcesados <= 0) {
      setErrorMsg('Los KG Procesados deben ser mayores a 0.');
      return;
    }
    if (numKgDesperdicio < 0) {
      setErrorMsg('El desperdicio no puede ser negativo.');
      return;
    }
    if (numKgProcesados + numKgDesperdicio > kgRecibidos) {
      setErrorMsg(
        `Guardado bloqueado: KG_PROCESADOS + KG_DESPERDICIO (${(numKgProcesados + numKgDesperdicio).toFixed(2)} kg) supera los KG_RECIBIDOS (${kgRecibidos.toLocaleString()} kg). La DIFERENCIA no puede ser negativa.`
      );
      return;
    }

    try {
      const { newDb, proceso } = addProcesamiento(db, {
        ID_RECEPCION: selectedRecepcionId,
        KG_PROCESADOS: numKgProcesados,
        KG_DESPERDICIO: numKgDesperdicio,
        FECHA: fecha,
      });

      onDatabaseUpdate(newDb);
      setSuccessMsg(
        `Procesamiento registrado con éxito (${numKgProcesados} kg procesados, ${numKgDesperdicio} kg merma). Se generó automáticamente la entrada en INVENTARIO_PROCESADO.`
      );
      setShowForm(false);
      setSelectedRecepcionId('');
      setKgProcesados('');
      setKgDesperdicio('0');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el procesamiento.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Procesamiento</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Selección, pesaje procesado y registro de merma de fruta.
          </p>
        </div>
        <div>
          {availableRecepciones.length > 0 && (
            <button
              id="btn-nuevo-proceso"
              onClick={() => {
                if (!showForm && availableRecepciones[0]) {
                  handleSelectRecepcion(availableRecepciones[0].ID_RECEPCION);
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Cerrar Registro' : `Nuevo Procesamiento (${availableRecepciones.length} lotes)`}</span>
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

      {/* Available lots to process */}
      {availableRecepciones.length > 0 && !showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lotes Recibidos Listos para Procesamiento ({availableRecepciones.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white rounded border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3">Lote</th>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Kg Recibidos</th>
                  <th className="py-2 px-3">Fecha Recepción</th>
                  <th className="py-2 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableRecepciones.map((rec) => {
                  const det = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === rec.ID_DETALLE);
                  return (
                    <tr key={rec.ID_RECEPCION} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">{det?.LOTE || '—'}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{det?.PRODUCTO || '—'}</td>
                      <td className="py-2 px-3 text-slate-600">{det?.CLIENTE || '—'}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-emerald-700">
                        {rec.KG_RECIBIDOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-slate-500">{rec.FECHA_RECEPCION}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleSelectRecepcion(rec.ID_RECEPCION)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                        >
                          Procesar Lote
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
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Registrar Procesamiento de Lote</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Select Recepcion */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lote / Recepción de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-recepcion-proceso"
                  required
                  value={selectedRecepcionId}
                  onChange={(e) => handleSelectRecepcion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Seleccionar lote recibido --</option>
                  {availableRecepciones.map((r) => {
                    const d = db.DETALLE_GUIA.find((det) => det.ID_DETALLE === r.ID_DETALLE);
                    return (
                      <option key={r.ID_RECEPCION} value={r.ID_RECEPCION}>
                        Lote: {d?.LOTE} | {d?.PRODUCTO} | {r.KG_RECIBIDOS} kg recibidos ({d?.CLIENTE})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Proceso <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-proceso"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* KG Recibidos (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG Recibidos (Base)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${kgRecibidos.toLocaleString()} kg`}
                  className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-100 text-slate-600 rounded-md font-mono cursor-not-allowed"
                />
              </div>

              {/* KG Procesados */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG Procesados (Entrada a Inventario) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-kg-procesados"
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej. 1420"
                  value={kgProcesados}
                  onChange={(e) => setKgProcesados(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              {/* KG Desperdicio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG Desperdicio (Merma/Desecho) <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-kg-desperdicio"
                  type="number"
                  step="0.01"
                  required
                  placeholder="ej. 70"
                  value={kgDesperdicio}
                  onChange={(e) => setKgDesperdicio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>
            </div>

            {/* Mass balance box */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Balance de Masa: DIFERENCIA = KG_RECIBIDOS - KG_PROCESADOS - KG_DESPERDICIO
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">KG Recibidos</span>
                  <span className="text-sm font-bold text-slate-800">{kgRecibidos.toLocaleString()} kg</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">KG Procesados</span>
                  <span className="text-sm font-bold text-emerald-700">{numKgProcesados.toLocaleString()} kg</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">KG Desperdicio</span>
                  <span className="text-sm font-bold text-amber-700">{numKgDesperdicio.toLocaleString()} kg</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Diferencia</span>
                  <span
                    className={`text-sm font-bold ${
                      diferencia >= 0 ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)} kg
                  </span>
                </div>
              </div>

              {diferencia < 0 && (
                <div className="p-2.5 bg-red-50 border border-red-300 rounded text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">Guardado bloqueado:</span> KG_PROCESADOS + KG_DESPERDICIO ({(numKgProcesados + numKgDesperdicio).toFixed(2)} kg) supera los KG_RECIBIDOS ({kgRecibidos.toLocaleString()} kg). La diferencia no puede ser negativa ({diferencia.toFixed(2)} kg).
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
                id="btn-guardar-proceso"
                disabled={diferencia < 0}
                className={`px-5 py-2 text-white rounded-md text-xs font-semibold shadow-xs transition-colors ${
                  diferencia < 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Guardar Procesamiento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Procesamiento</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {db.PROCESAMIENTO.length}
            </span>
          </div>
        </div>

        {db.PROCESAMIENTO.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay registros de procesamiento todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ID Proceso</th>
                  <th className="py-2.5 px-3 font-semibold">Lote / Cliente</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Recibidos</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Procesados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Desperdicio</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha</th>
                  <th className="py-2.5 px-3 font-semibold">Destino Auto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {db.PROCESAMIENTO.map((proc) => {
                  const rec = db.RECEPCIONES.find((r) => r.ID_RECEPCION === proc.ID_RECEPCION);
                  const det = rec ? db.DETALLE_GUIA.find((d) => d.ID_DETALLE === rec.ID_DETALLE) : null;
                  const inv = db.INVENTARIO_PROCESADO.find((i) => i.ID_PROCESO === proc.ID_PROCESO);

                  return (
                    <tr key={proc.ID_PROCESO} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        {proc.ID_PROCESO.slice(0, 8)}...
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-mono font-semibold text-slate-800">{det?.LOTE || '—'}</div>
                        <div className="text-[11px] text-slate-500">
                          {det?.PRODUCTO} • {det?.CLIENTE}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {proc.KG_RECIBIDOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                        {proc.KG_PROCESADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700">
                        {proc.KG_DESPERDICIO.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                            proc.DIFERENCIA === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {proc.DIFERENCIA.toFixed(2)} kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{proc.FECHA}</td>
                      <td className="py-2 px-3">
                        {inv ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Inv. Procesado ({inv.KG_DISPONIBLE} kg disp.)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sincronizado</span>
                        )}
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
