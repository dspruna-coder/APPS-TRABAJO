import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { addRecepcion } from '../storage/db';
import { PackageCheck, CheckCircle2, AlertTriangle, Lock, AlertCircle, Plus } from 'lucide-react';

interface RecepcionViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

export const RecepcionView: React.FC<RecepcionViewProps> = ({ db, onDatabaseUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDetalleId, setSelectedDetalleId] = useState<string>('');
  const [kgRecibidos, setKgRecibidos] = useState<string>('');
  const [fechaRecepcion, setFechaRecepcion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [responsable, setResponsable] = useState<string>('Carlos Mendoza');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Find all DETALLE_GUIA that DO NOT have a reception yet
  const receivedDetailIds = new Set(db.RECEPCIONES.map((r) => r.ID_DETALLE));
  const pendingDetalles = db.DETALLE_GUIA.filter((d) => !receivedDetailIds.has(d.ID_DETALLE));

  // Selected detail item
  const activeDetail = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === selectedDetalleId);
  const activeGuia = activeDetail ? db.GUIAS.find((g) => g.ID_GUIA === activeDetail.ID_GUIA) : null;

  const kgEnviados = activeDetail ? activeDetail.KG_TOTAL : 0;
  const numKgRecibidos = parseFloat(kgRecibidos) || 0;
  const diferencia = activeDetail ? numKgRecibidos - kgEnviados : 0;

  const handleSelectPending = (detalleId: string) => {
    setSelectedDetalleId(detalleId);
    const det = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === detalleId);
    if (det) {
      setKgRecibidos(det.KG_TOTAL.toString());
    }
    setShowForm(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedDetalleId) {
      setErrorMsg('Debe seleccionar una línea de guía a recibir.');
      return;
    }
    if (numKgRecibidos <= 0) {
      setErrorMsg('Los Kg recibidos deben ser mayores a cero.');
      return;
    }
    if (!responsable.trim()) {
      setErrorMsg('Debe especificar el responsable de recepción.');
      return;
    }

    try {
      const { newDb, recepcion } = addRecepcion(db, {
        ID_DETALLE: selectedDetalleId,
        KG_RECIBIDOS: numKgRecibidos,
        FECHA_RECEPCION: fechaRecepcion,
        RESPONSABLE: responsable,
      });

      onDatabaseUpdate(newDb);
      setSuccessMsg(
        `Recepción registrada para el lote ${activeDetail?.LOTE || ''}. Estado: ${recepcion.ESTADO}. Diferencia: ${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)} kg.`
      );
      setShowForm(false);
      setSelectedDetalleId('');
      setKgRecibidos('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la recepción.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recepción en Planta</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pesaje en báscula de entrada y control de diferencias contra guía.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingDetalles.length > 0 && (
            <button
              id="btn-recibir-linea"
              onClick={() => {
                if (!showForm && pendingDetalles[0]) {
                  handleSelectPending(pendingDetalles[0].ID_DETALLE);
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Cerrar Registro' : `Recibir Línea (${pendingDetalles.length} pendientes)`}</span>
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

      {/* Pending Lines Alert / Action Table */}
      {pendingDetalles.length > 0 && !showForm && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Líneas de Guía Pendientes de Recepción ({pendingDetalles.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white rounded border border-amber-200">
              <thead>
                <tr className="bg-amber-100/50 text-amber-900 border-b border-amber-200">
                  <th className="py-2 px-3">N° Guía</th>
                  <th className="py-2 px-3">Lote</th>
                  <th className="py-2 px-3">Producto</th>
                  <th className="py-2 px-3">Cliente</th>
                  <th className="py-2 px-3">Kg Enviados</th>
                  <th className="py-2 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {pendingDetalles.map((det) => {
                  const g = db.GUIAS.find((guia) => guia.ID_GUIA === det.ID_GUIA);
                  return (
                    <tr key={det.ID_DETALLE} className="hover:bg-amber-50/50">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">{g?.N_GUIA || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{det.LOTE}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{det.PRODUCTO}</td>
                      <td className="py-2 px-3 text-slate-600">{det.CLIENTE}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900">{det.KG_TOTAL.toLocaleString()} kg</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleSelectPending(det.ID_DETALLE)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                        >
                          Registrar Pesaje
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
            <h2 className="text-base font-semibold text-slate-800">Registrar Recepción de Línea</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Detalle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Línea de Guía a Recibir <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-detalle-recepcion"
                  required
                  value={selectedDetalleId}
                  onChange={(e) => {
                    setSelectedDetalleId(e.target.value);
                    const det = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === e.target.value);
                    if (det) setKgRecibidos(det.KG_TOTAL.toString());
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">-- Seleccionar línea pendiente --</option>
                  {pendingDetalles.map((d) => {
                    const g = db.GUIAS.find((guia) => guia.ID_GUIA === d.ID_GUIA);
                    return (
                      <option key={d.ID_DETALLE} value={d.ID_DETALLE}>
                        {g?.N_GUIA} | Lote: {d.LOTE} | {d.PRODUCTO} ({d.KG_TOTAL} kg)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fecha Recepción */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Recepción <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-recepcion"
                  type="date"
                  required
                  value={fechaRecepcion}
                  onChange={(e) => setFechaRecepcion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable de Recepción <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-responsable-recepcion"
                  type="text"
                  required
                  placeholder="Nombre de quien recibe en báscula"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* KG Recibidos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  KG Recibidos en Báscula <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-kg-recibidos"
                  type="number"
                  step="0.01"
                  required
                  placeholder="Peso real medido"
                  value={kgRecibidos}
                  onChange={(e) => setKgRecibidos(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>
            </div>

            {/* Comparison Box */}
            {activeDetail && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Lote / Cliente:</span>
                    <span className="font-semibold text-slate-800">{activeDetail.LOTE} ({activeDetail.CLIENTE})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">KG Enviados (Guía):</span>
                    <span className="font-mono font-semibold text-slate-800">{kgEnviados.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">KG Recibidos (Báscula):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {numKgRecibidos > 0 ? `${numKgRecibidos.toLocaleString()} kg` : '0 kg'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Diferencia:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs inline-block ${
                        diferencia === 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : diferencia < 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)} kg
                    </span>
                  </div>
                </div>

                {numKgRecibidos > 0 && diferencia !== 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-semibold">Alerta de peso:</span> DIFERENCIA = KG_RECIBIDOS - KG_ENVIADOS = {diferencia >= 0 ? `+${diferencia.toFixed(2)}` : diferencia.toFixed(2)} kg. (No bloquea el guardado).
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
                id="btn-guardar-recepcion"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Recepción
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Recorded Receptions */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Recepciones</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {db.RECEPCIONES.length}
            </span>
          </div>
        </div>

        {db.RECEPCIONES.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay recepciones registradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">ID Recepción</th>
                  <th className="py-2.5 px-3 font-semibold">Guía / Lote</th>
                  <th className="py-2.5 px-3 font-semibold">Producto / Cliente</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Enviados</th>
                  <th className="py-2.5 px-3 font-semibold text-right">KG Recibidos</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Diferencia</th>
                  <th className="py-2.5 px-3 font-semibold">Fecha</th>
                  <th className="py-2.5 px-3 font-semibold">Responsable</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {db.RECEPCIONES.map((rec) => {
                  const det = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === rec.ID_DETALLE);
                  const guia = det ? db.GUIAS.find((g) => g.ID_GUIA === det.ID_GUIA) : null;
                  const dif = rec.KG_RECIBIDOS - rec.KG_ENVIADOS;

                  return (
                    <tr key={rec.ID_RECEPCION} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        {rec.ID_RECEPCION.slice(0, 8)}...
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-mono font-semibold text-slate-800">{guia?.N_GUIA || '—'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{det?.LOTE || '—'}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-900">{det?.PRODUCTO || '—'}</div>
                        <div className="text-[11px] text-slate-500">{det?.CLIENTE || '—'}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {rec.KG_ENVIADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                        {rec.KG_RECIBIDOS.toLocaleString()} kg
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
                      <td className="py-2 px-3 text-slate-600">{rec.FECHA_RECEPCION}</td>
                      <td className="py-2 px-3 text-slate-700">{rec.RESPONSABLE}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            rec.ESTADO === 'Recibido'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rec.ESTADO}
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
