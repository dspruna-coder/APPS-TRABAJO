import React, { useState } from 'react';
import {
  AgroControlDatabase,
  EmpresaOrigen,
  EMPRESAS_ORIGEN,
  PUNTO_LLEGADA_FIJO,
} from '../types';
import { addGuia } from '../storage/db';
import { Plus, Trash2, CheckCircle2, Lock, AlertCircle, FileText } from 'lucide-react';

interface GuiasViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

interface DetalleDraft {
  producto: string;
  gavetas: number;
  lote: string;
  cliente: string;
}

export const GuiasView: React.FC<GuiasViewProps> = ({ db, onDatabaseUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [nGuia, setNGuia] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [empresaOrigen, setEmpresaOrigen] = useState<EmpresaOrigen>('Jardines del Molino');
  const [destinatario, setDestinatario] = useState('Planta de Empaque Prados');
  const [transportista, setTransportista] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active products and clients
  const activeProductos = db.PRODUCTOS.filter((p) => p.ACTIVO);
  const activeClientes = db.CLIENTES.filter((c) => c.ACTIVO);
  const activeLotesFinca = (db.LOTES || []).filter(
    (l) => l.FINCA === empresaOrigen && l.ACTIVO
  );

  const [detallesDraft, setDetallesDraft] = useState<DetalleDraft[]>(() => {
    const initialLotes = (db.LOTES || []).filter(
      (l) => l.FINCA === 'Jardines del Molino' && l.ACTIVO
    );
    const firstLot = initialLotes[0];
    return [
      {
        producto: firstLot?.PRODUCTO || activeProductos[0]?.PRODUCTO || '',
        gavetas: 100,
        lote: firstLot?.CODIGO_LOTE || '1201',
        cliente: activeClientes[0]?.CLIENTE || '',
      },
    ];
  });

  const handleEmpresaOrigenChange = (nuevaFinca: EmpresaOrigen) => {
    setEmpresaOrigen(nuevaFinca);
    const lotsDeNuevaFinca = (db.LOTES || []).filter(
      (l) => l.FINCA === nuevaFinca && l.ACTIVO
    );
    if (lotsDeNuevaFinca.length > 0) {
      const firstLot = lotsDeNuevaFinca[0];
      setDetallesDraft((prev) =>
        prev.map((d) => ({
          ...d,
          lote: firstLot.CODIGO_LOTE,
          producto: firstLot.PRODUCTO || d.producto,
        }))
      );
    }
  };

  const handleSelectLote = (index: number, codigoLote: string) => {
    const lot = activeLotesFinca.find((l) => l.CODIGO_LOTE === codigoLote);
    const updated = [...detallesDraft];
    if (lot) {
      updated[index] = {
        ...updated[index],
        lote: lot.CODIGO_LOTE,
        // Auto-fill PRODUCTO from maestro LOTES
        producto: lot.PRODUCTO || updated[index].producto,
      };
    } else {
      updated[index] = {
        ...updated[index],
        lote: codigoLote,
      };
    }
    setDetallesDraft(updated);
  };

  const handleAddLine = () => {
    const firstLot = activeLotesFinca[0];
    setDetallesDraft([
      ...detallesDraft,
      {
        producto: firstLot?.PRODUCTO || activeProductos[0]?.PRODUCTO || '',
        gavetas: 50,
        lote: firstLot?.CODIGO_LOTE || '',
        cliente: activeClientes[0]?.CLIENTE || '',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (detallesDraft.length === 1) return;
    setDetallesDraft(detallesDraft.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof DetalleDraft, value: any) => {
    const updated = [...detallesDraft];
    updated[index] = { ...updated[index], [field]: value };
    setDetallesDraft(updated);
  };

  const calculateKgGaveta = (productoNombre: string) => {
    const p = db.PRODUCTOS.find((prod) => prod.PRODUCTO === productoNombre);
    return p ? p.KG_ESTANDAR_GAVETA : 0;
  };

  const totalGavetas = detallesDraft.reduce((acc, curr) => acc + (Number(curr.gavetas) || 0), 0);
  const totalKg = detallesDraft.reduce((acc, curr) => {
    const kgGaveta = calculateKgGaveta(curr.producto);
    return acc + (Number(curr.gavetas) || 0) * kgGaveta;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nGuia.trim()) {
      setErrorMsg('El N° de Guía es obligatorio.');
      return;
    }
    if (!transportista.trim()) {
      setErrorMsg('El Transportista es obligatorio.');
      return;
    }
    if (detallesDraft.length === 0) {
      setErrorMsg('Debe agregar al menos una línea de detalle.');
      return;
    }

    for (const d of detallesDraft) {
      if (!d.producto) {
        setErrorMsg('Todas las líneas deben tener un producto seleccionado.');
        return;
      }
      if (!d.cliente) {
        setErrorMsg('Todas las líneas deben tener un cliente seleccionado.');
        return;
      }
      if (!d.lote.trim()) {
        setErrorMsg('Todas las líneas deben tener un lote especificado.');
        return;
      }
      if (Number(d.gavetas) <= 0) {
        setErrorMsg('El número de gavetas debe ser mayor a 0.');
        return;
      }
    }

    try {
      const { newDb, guia } = addGuia(
        db,
        {
          N_GUIA: nGuia,
          FECHA: fecha,
          EMPRESA_ORIGEN: empresaOrigen,
          DESTINATARIO: destinatario,
          TRANSPORTISTA: transportista,
        },
        detallesDraft.map((d) => ({
          PRODUCTO: d.producto,
          GAVETAS: Number(d.gavetas),
          LOTE: d.lote,
          CLIENTE: d.cliente,
        }))
      );

      onDatabaseUpdate(newDb);
      setSuccessMsg(`Guía ${guia.N_GUIA} registrada exitosamente.`);
      setShowForm(false);
      setNGuia('');
      setTransportista('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la guía.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Guías de Cosecha</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Registro inicial del flujo de cosecha agrícola.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-nueva-guia"
            onClick={() => {
              setShowForm(!showForm);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cerrar Formulario' : 'Nueva Guía'}</span>
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
            <h2 className="text-base font-semibold text-slate-800">Registrar Nueva Guía de Cosecha</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  N° de Guía <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-n-guia"
                  type="text"
                  required
                  placeholder="ej. GR-2026-0842"
                  value={nGuia}
                  onChange={(e) => setNGuia(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de Cosecha <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-fecha-guia"
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa Origen (Finca) <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-empresa-origen"
                  value={empresaOrigen}
                  onChange={(e) => handleEmpresaOrigenChange(e.target.value as EmpresaOrigen)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  {EMPRESAS_ORIGEN.map((emp) => (
                    <option key={emp} value={emp}>
                      {emp}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Finca seleccionada: {activeLotesFinca.length} lotes activos disponibles.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destinatario
                </label>
                <input
                  id="input-destinatario"
                  type="text"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Punto de Llegada
                </label>
                <input
                  id="input-punto-llegada"
                  type="text"
                  readOnly
                  value={PUNTO_LLEGADA_FIJO}
                  className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-100 text-slate-600 rounded-md cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transportista <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-transportista"
                  type="text"
                  required
                  placeholder="ej. TransAndes - Placa ABC-123"
                  value={transportista}
                  onChange={(e) => setTransportista(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                  Líneas de Detalle
                </h3>
                <button
                  type="button"
                  id="btn-agregar-linea-detalle"
                  onClick={handleAddLine}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Línea
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold min-w-[190px]">
                        Lote ({empresaOrigen}) <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-semibold min-w-[210px]">
                        Producto <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-semibold w-24">Gavetas</th>
                      <th className="py-2.5 px-3 font-semibold w-24">Kg/Gaveta</th>
                      <th className="py-2.5 px-3 font-semibold w-24">Kg Total</th>
                      <th className="py-2.5 px-3 font-semibold min-w-[160px]">Cliente</th>
                      <th className="py-2.5 px-3 font-semibold w-12 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {detallesDraft.map((line, idx) => {
                      const kgGaveta = calculateKgGaveta(line.producto);
                      const kgTotal = (Number(line.gavetas) || 0) * kgGaveta;
                      const assignedLot = activeLotesFinca.find((l) => l.CODIGO_LOTE === line.lote);
                      const isManualException =
                        assignedLot &&
                        assignedLot.PRODUCTO &&
                        assignedLot.PRODUCTO !== line.producto;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          {/* 1. LOTE: Solo lotes activos de la FINCA seleccionada */}
                          <td className="py-2 px-3">
                            <select
                              id={`select-line-lote-${idx}`}
                              value={line.lote}
                              onChange={(e) => handleSelectLote(idx, e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">-- Seleccionar Lote --</option>
                              {activeLotesFinca.map((l) => (
                                <option key={l.ID_LOTE} value={l.CODIGO_LOTE}>
                                  Lote {l.CODIGO_LOTE} {l.PRODUCTO ? `(${l.PRODUCTO})` : '(Sin producto)'}
                                </option>
                              ))}
                              {line.lote &&
                                !activeLotesFinca.some((l) => l.CODIGO_LOTE === line.lote) && (
                                  <option value={line.lote}>{line.lote} (Personalizado)</option>
                                )}
                            </select>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {assignedLot?.PRODUCTO ? (
                                <span>Asignado: <strong className="text-slate-700">{assignedLot.PRODUCTO}</strong></span>
                              ) : (
                                <span>{activeLotesFinca.length} lotes activos</span>
                              )}
                            </div>
                          </td>

                          {/* 2. PRODUCTO: Autocompletado desde LOTES, editable como excepción */}
                          <td className="py-2 px-3">
                            <select
                              id={`select-line-producto-${idx}`}
                              value={line.producto}
                              onChange={(e) => handleUpdateLine(idx, 'producto', e.target.value)}
                              className={`w-full px-2 py-1.5 border rounded text-xs bg-white ${
                                isManualException
                                  ? 'border-amber-400 bg-amber-50/30 text-amber-900 font-medium'
                                  : 'border-slate-300 text-slate-800'
                              } focus:ring-1 focus:ring-emerald-500`}
                            >
                              {activeProductos.map((p) => (
                                <option key={p.ID_PRODUCTO} value={p.PRODUCTO}>
                                  {p.PRODUCTO} ({p.KG_ESTANDAR_GAVETA} kg/g)
                                </option>
                              ))}
                            </select>
                            {isManualException && (
                              <div className="mt-1 flex items-center gap-1">
                                <span className="inline-block text-[10px] font-medium text-amber-800 bg-amber-100/80 border border-amber-300 px-1.5 py-0.5 rounded">
                                  Excepción manual (Maestro: {assignedLot?.PRODUCTO})
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 3. GAVETAS */}
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={line.gavetas}
                              onChange={(e) =>
                                handleUpdateLine(idx, 'gavetas', Math.max(1, parseInt(e.target.value) || 0))
                              }
                              className="w-20 px-2 py-1.5 border border-slate-300 rounded text-xs bg-white font-mono"
                            />
                          </td>

                          {/* 4. KG/GAVETA */}
                          <td className="py-2 px-3 text-slate-600 font-mono text-xs">
                            {kgGaveta} kg
                          </td>

                          {/* 5. KG TOTAL */}
                          <td className="py-2 px-3 font-semibold text-slate-900 font-mono text-xs">
                            {kgTotal.toLocaleString()} kg
                          </td>

                          {/* 6. CLIENTE */}
                          <td className="py-2 px-3">
                            <select
                              value={line.cliente}
                              onChange={(e) => handleUpdateLine(idx, 'cliente', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                            >
                              {activeClientes.map((c) => (
                                <option key={c.ID_CLIENTE} value={c.CLIENTE}>
                                  {c.CLIENTE}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* 7. ACCIÓN */}
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              disabled={detallesDraft.length === 1}
                              className={`p-1 rounded ${
                                detallesDraft.length === 1
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                              }`}
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
                      <td colSpan={2} className="py-2.5 px-3">Totales Calculados:</td>
                      <td className="py-2.5 px-3 font-mono">{totalGavetas.toLocaleString()} gav</td>
                      <td className="py-2.5 px-3">—</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700">
                        {totalKg.toLocaleString()} kg
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right text-slate-400 font-normal text-[11px]">
                        Líneas validadas con maestro LOTES
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Submit Action */}
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
                id="btn-guardar-guia"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Guía
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Registered Guides */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">Histórico de Guías</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              {db.GUIAS.length}
            </span>
          </div>
        </div>

        {db.GUIAS.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No hay guías registradas. Inicia registrando una nueva guía de cosecha.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {db.GUIAS.map((guia) => {
              const lineas = db.DETALLE_GUIA.filter((d) => d.ID_GUIA === guia.ID_GUIA);
              const totalKgGuia = lineas.reduce((acc, curr) => acc + curr.KG_TOTAL, 0);

              const estadoColor =
                guia.ESTADO === 'Completada'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : guia.ESTADO === 'En Recepción'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200';

              return (
                <div key={guia.ID_GUIA} className="p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900">{guia.N_GUIA}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${estadoColor}`}>
                        {guia.ESTADO}
                      </span>
                      <span className="text-xs text-slate-500">{guia.FECHA}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>
                        <strong className="text-slate-800">Origen:</strong> {guia.EMPRESA_ORIGEN}
                      </span>
                      <span>
                        <strong className="text-slate-800">Llegada:</strong> {guia.PUNTO_LLEGADA}
                      </span>
                      <span>
                        <strong className="text-slate-800">Transportista:</strong> {guia.TRANSPORTISTA}
                      </span>
                      <span>
                        <strong className="text-slate-800">Total:</strong>{' '}
                        <span className="font-mono font-semibold text-emerald-700">
                          {totalKgGuia.toLocaleString()} kg
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Sub-table: DETALLE_GUIA */}
                  <div className="bg-slate-50/80 rounded border border-slate-200 p-2.5">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5">
                      Detalle ({lineas.length} líneas):
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-200 text-[11px]">
                            <th className="pb-1 px-2">ID Detalle</th>
                            <th className="pb-1 px-2">Producto</th>
                            <th className="pb-1 px-2">Gavetas</th>
                            <th className="pb-1 px-2">Kg/Gaveta</th>
                            <th className="pb-1 px-2">Kg Total</th>
                            <th className="pb-1 px-2">Lote</th>
                            <th className="pb-1 px-2">Cliente</th>
                            <th className="pb-1 px-2">Estado Recepción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lineas.map((line) => {
                            const recepcion = db.RECEPCIONES.find((r) => r.ID_DETALLE === line.ID_DETALLE);

                            return (
                              <tr key={line.ID_DETALLE} className="hover:bg-white/80">
                                <td className="py-1 px-2 font-mono text-[10px] text-slate-400">
                                  {line.ID_DETALLE.slice(0, 8)}...
                                </td>
                                <td className="py-1 px-2 font-medium text-slate-800">{line.PRODUCTO}</td>
                                <td className="py-1 px-2 font-mono">{line.GAVETAS}</td>
                                <td className="py-1 px-2 font-mono text-slate-500">{line.KG_GAVETA} kg</td>
                                <td className="py-1 px-2 font-mono font-semibold text-slate-900">
                                  {line.KG_TOTAL.toLocaleString()} kg
                                </td>
                                <td className="py-1 px-2 font-mono text-slate-700 bg-slate-100/80 rounded px-1">
                                  {line.LOTE}
                                </td>
                                <td className="py-1 px-2 text-slate-700">{line.CLIENTE}</td>
                                <td className="py-1 px-2">
                                  {recepcion ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                                      <CheckCircle2 className="w-3 h-3" /> Recibido ({recepcion.KG_RECIBIDOS} kg)
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-amber-700 font-medium">
                                      Pendiente en Recepción
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
