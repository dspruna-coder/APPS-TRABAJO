import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { addEmpaque } from '../storage/db';
import { Package, Plus, Trash2, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

interface EmpaqueViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

interface DetalleEmpaqueDraft {
  idInvProcesado: string;
  kgEmpacados: number;
}

export const EmpaqueView: React.FC<EmpaqueViewProps> = ({ db, onDatabaseUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const activeClientes = db.CLIENTES.filter((c) => c.ACTIVO);
  const [selectedCliente, setSelectedCliente] = useState<string>(
    activeClientes[0]?.CLIENTE || ''
  );
  const [responsable, setResponsable] = useState<string>('Marta Ruales');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter processed inventory: ONLY same client AND KG_DISPONIBLE > 0
  const availableProcessedInventory = db.INVENTARIO_PROCESADO.filter(
    (inv) => inv.CLIENTE === selectedCliente && inv.KG_DISPONIBLE > 0
  );

  const [detallesDraft, setDetallesDraft] = useState<DetalleEmpaqueDraft[]>([]);

  // When client changes or user opens form, reset lines with first available batch
  const handleClientChange = (newClient: string) => {
    setSelectedCliente(newClient);
    const available = db.INVENTARIO_PROCESADO.filter(
      (inv) => inv.CLIENTE === newClient && inv.KG_DISPONIBLE > 0
    );
    if (available.length > 0) {
      setDetallesDraft([
        {
          idInvProcesado: available[0].ID_INV_PROCESADO,
          kgEmpacados: Math.min(100, available[0].KG_DISPONIBLE),
        },
      ]);
    } else {
      setDetallesDraft([]);
    }
  };

  const handleOpenForm = () => {
    const available = db.INVENTARIO_PROCESADO.filter(
      (inv) => inv.CLIENTE === selectedCliente && inv.KG_DISPONIBLE > 0
    );
    if (available.length > 0) {
      setDetallesDraft([
        {
          idInvProcesado: available[0].ID_INV_PROCESADO,
          kgEmpacados: Math.min(100, available[0].KG_DISPONIBLE),
        },
      ]);
    } else {
      setDetallesDraft([]);
    }
    setShowForm(!showForm);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAddLine = () => {
    if (availableProcessedInventory.length === 0) return;
    setDetallesDraft([
      ...detallesDraft,
      {
        idInvProcesado: availableProcessedInventory[0].ID_INV_PROCESADO,
        kgEmpacados: Math.min(50, availableProcessedInventory[0].KG_DISPONIBLE),
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setDetallesDraft(detallesDraft.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof DetalleEmpaqueDraft, value: any) => {
    const updated = [...detallesDraft];
    updated[index] = { ...updated[index], [field]: value };
    setDetallesDraft(updated);
  };

  const totalKgEmpacar = detallesDraft.reduce((acc, curr) => acc + (Number(curr.kgEmpacados) || 0), 0);

  const totalByInvDraft = new Map<string, number>();
  for (const d of detallesDraft) {
    totalByInvDraft.set(d.idInvProcesado, (totalByInvDraft.get(d.idInvProcesado) || 0) + (Number(d.kgEmpacados) || 0));
  }
  const hasOverconsumption = Array.from(totalByInvDraft.entries()).some(([idInv, totalKg]) => {
    const inv = db.INVENTARIO_PROCESADO.find((i) => i.ID_INV_PROCESADO === idInv);
    return inv ? totalKg > inv.KG_DISPONIBLE : false;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedCliente) {
      setErrorMsg('Seleccione un cliente.');
      return;
    }
    if (!responsable.trim()) {
      setErrorMsg('Especifique el responsable.');
      return;
    }
    if (detallesDraft.length === 0) {
      setErrorMsg('Debe agregar al menos un lote de inventario procesado para empacar.');
      return;
    }

    // Validate overconsumption: KG_EMPACADOS > KG_DISPONIBLE
    for (const [idInv, totalKg] of totalByInvDraft.entries()) {
      const inv = db.INVENTARIO_PROCESADO.find((i) => i.ID_INV_PROCESADO === idInv);
      if (!inv) {
        setErrorMsg('Inventario procesado no encontrado.');
        return;
      }
      if (totalKg <= 0) {
        setErrorMsg('Los KG a empacar deben ser mayores a cero.');
        return;
      }
      if (totalKg > inv.KG_DISPONIBLE) {
        setErrorMsg(
          `Guardado bloqueado: KG_EMPACADOS (${totalKg} kg) > KG_DISPONIBLE (${inv.KG_DISPONIBLE} kg) de INVENTARIO_PROCESADO para el lote ${inv.LOTE}.`
        );
        return;
      }
    }

    try {
      const { newDb, empaque } = addEmpaque(
        db,
        {
          FECHA: fecha,
          CLIENTE: selectedCliente,
          RESPONSABLE: responsable,
        },
        detallesDraft.map((d) => ({
          ID_INV_PROCESADO: d.idInvProcesado,
          KG_EMPACADOS: Number(d.kgEmpacados),
        }))
      );

      onDatabaseUpdate(newDb);
      setSuccessMsg(
        `Empaque registrado exitosamente con ${detallesDraft.length} lote(s) (${totalKgEmpacar} kg totales).`
      );
      setShowForm(false);
      setDetallesDraft([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el empaque.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Empaque</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Registro y control de órdenes de empaque por cliente.
          </p>
        </div>
        <div>
          <button
            id="btn-nuevo-empaque"
            onClick={handleOpenForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cerrar Formulario' : 'Nuevo Empaque'}</span>
          </button>
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

      {/* Form Card */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-base font-semibold text-slate-800">Registrar Orden de Empaque</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-cliente-empaque"
                  required
                  value={selectedCliente}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {activeClientes.map((c) => (
                    <option key={c.ID_CLIENTE} value={c.CLIENTE}>
                      {c.CLIENTE}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Regla: Solo se muestran lotes procesados de este cliente.
                </p>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Empaque <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-empaque"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              {/* Responsable */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable de Empaque <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-responsable-empaque"
                  type="text"
                  required
                  placeholder="ej. Marta Ruales"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Selection of Processed Lots to Pack */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Líneas de Empaque (DETALLE_EMPAQUE)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Selecciona inventario procesado disponible. No se permite sobreconsumo de inventario.
                  </p>
                </div>
                {availableProcessedInventory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Lote
                  </button>
                )}
              </div>

              {availableProcessedInventory.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                  No hay inventario procesado con KG disponible mayor a 0 para el cliente{' '}
                  <strong>{selectedCliente}</strong>. Primero registra un procesamiento para este cliente en el paso anterior.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Lote Procesado Disponible</th>
                        <th className="py-2.5 px-3 font-semibold">Producto</th>
                        <th className="py-2.5 px-3 font-semibold text-right w-36">Kg Disponible</th>
                        <th className="py-2.5 px-3 font-semibold text-right w-44">Kg a Empacar</th>
                        <th className="py-2.5 px-3 font-semibold w-12 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {detallesDraft.map((d, idx) => {
                        const inv = db.INVENTARIO_PROCESADO.find(
                          (i) => i.ID_INV_PROCESADO === d.idInvProcesado
                        );
                        const isOver = inv ? Number(d.kgEmpacados) > inv.KG_DISPONIBLE : false;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2 px-3">
                              <select
                                value={d.idInvProcesado}
                                onChange={(e) =>
                                  handleUpdateLine(idx, 'idInvProcesado', e.target.value)
                                }
                                className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                              >
                                {availableProcessedInventory.map((item) => (
                                  <option key={item.ID_INV_PROCESADO} value={item.ID_INV_PROCESADO}>
                                    Lote: {item.LOTE} | {item.PRODUCTO} (Disp: {item.KG_DISPONIBLE} kg)
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-800">
                              {inv?.PRODUCTO || '—'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                              {inv?.KG_DISPONIBLE.toLocaleString()} kg
                            </td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={inv?.KG_DISPONIBLE}
                                value={d.kgEmpacados}
                                onChange={(e) =>
                                  handleUpdateLine(idx, 'kgEmpacados', parseFloat(e.target.value) || 0)
                                }
                                className={`w-32 px-2 py-1 border rounded text-xs text-right font-mono font-bold ${
                                  isOver
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-slate-300 bg-white text-slate-900'
                                }`}
                              />
                              {isOver && (
                                <span className="block text-[10px] text-red-600 font-medium mt-0.5">
                                  Excede disponible!
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveLine(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Eliminar línea"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-3 text-right">
                          Total Kg a Empacar:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                          {totalKgEmpacar.toLocaleString()} kg
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
              {hasOverconsumption && (
                <div className="p-2.5 bg-red-50 border border-red-300 rounded text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">Guardado bloqueado:</span> KG_EMPACADOS supera los KG_DISPONIBLE de INVENTARIO_PROCESADO en uno o más lotes. Reduzca la cantidad para continuar.
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
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
                id="btn-guardar-empaque"
                disabled={availableProcessedInventory.length === 0 || detallesDraft.length === 0 || hasOverconsumption}
                className={`px-5 py-2 text-white rounded-md text-xs font-semibold shadow-xs transition-colors ${
                  hasOverconsumption || availableProcessedInventory.length === 0 || detallesDraft.length === 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Guardar Empaque
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Empaques</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {db.EMPAQUE.length}
            </span>
          </div>
        </div>

        {db.EMPAQUE.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay órdenes de empaque registradas todavía.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {db.EMPAQUE.map((emp) => {
              const lineas = db.DETALLE_EMPAQUE.filter((d) => d.ID_EMPAQUE === emp.ID_EMPAQUE);
              const totalKgEmp = lineas.reduce((acc, curr) => acc + curr.KG_EMPACADOS, 0);

              return (
                <div key={emp.ID_EMPAQUE} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-400">
                        {emp.ID_EMPAQUE.slice(0, 8)}...
                      </span>
                      <span className="text-xs font-bold text-slate-900">{emp.CLIENTE}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {emp.ESTADO}
                      </span>
                      <span className="text-xs text-slate-500">{emp.FECHA}</span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>Responsable: <strong className="text-slate-800">{emp.RESPONSABLE}</strong></span>
                      <span>Total Empacado: <strong className="font-mono text-emerald-700">{totalKgEmp.toLocaleString()} kg</strong></span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded border border-slate-200 p-2 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] text-slate-500 border-b border-slate-200">
                          <th className="pb-1 px-2">ID Detalle</th>
                          <th className="pb-1 px-2">Lote Origen</th>
                          <th className="pb-1 px-2">Producto</th>
                          <th className="pb-1 px-2 text-right">KG Empacados</th>
                          <th className="pb-1 px-2">Estatus en Inv. Terminado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineas.map((line) => {
                          const invProc = db.INVENTARIO_PROCESADO.find(
                            (i) => i.ID_INV_PROCESADO === line.ID_INV_PROCESADO
                          );
                          const invTerm = db.INVENTARIO_TERMINADO.find(
                            (it) => it.ID_DET_EMPAQUE === line.ID_DET_EMPAQUE
                          );

                          return (
                            <tr key={line.ID_DET_EMPAQUE}>
                              <td className="py-1 px-2 font-mono text-[10px] text-slate-400">
                                {line.ID_DET_EMPAQUE.slice(0, 8)}...
                              </td>
                              <td className="py-1 px-2 font-mono text-slate-700">
                                {invProc?.LOTE || '—'}
                              </td>
                              <td className="py-1 px-2 font-medium text-slate-800">
                                {invProc?.PRODUCTO || '—'}
                              </td>
                              <td className="py-1 px-2 text-right font-mono font-bold text-emerald-700">
                                {line.KG_EMPACADOS.toLocaleString()} kg
                              </td>
                              <td className="py-1 px-2">
                                {invTerm ? (
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    Generado ({invTerm.KG_DISPONIBLE} kg disp. para embarque)
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Registrado</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
