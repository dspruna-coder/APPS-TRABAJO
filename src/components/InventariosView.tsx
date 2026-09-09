import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { Boxes, PackageCheck, Truck, History, Lock } from 'lucide-react';

interface InventariosViewProps {
  db: AgroControlDatabase;
}

export const InventariosView: React.FC<InventariosViewProps> = ({ db }) => {
  const [subTab, setSubTab] = useState<'procesado' | 'terminado' | 'kardex'>('procesado');
  const [filterCliente, setFilterCliente] = useState<string>('todos');

  // Totals for summaries
  const totalProcEntrada = db.INVENTARIO_PROCESADO.reduce((a, b) => a + b.KG_ENTRADA, 0);
  const totalProcEmpacados = db.INVENTARIO_PROCESADO.reduce((a, b) => a + b.KG_EMPACADOS, 0);
  const totalProcDisponible = db.INVENTARIO_PROCESADO.reduce((a, b) => a + b.KG_DISPONIBLE, 0);

  const totalTermEntrada = db.INVENTARIO_TERMINADO.reduce((a, b) => a + b.KG_ENTRADA, 0);
  const totalTermEmbarcados = db.INVENTARIO_TERMINADO.reduce((a, b) => a + b.KG_EMBARCADOS, 0);
  const totalTermDisponible = db.INVENTARIO_TERMINADO.reduce((a, b) => a + b.KG_DISPONIBLE, 0);

  const filteredProc = db.INVENTARIO_PROCESADO.filter(
    (i) => filterCliente === 'todos' || i.CLIENTE === filterCliente
  );

  const filteredTerm = db.INVENTARIO_TERMINADO.filter(
    (i) => filterCliente === 'todos' || i.CLIENTE === filterCliente
  );

  const clients = Array.from(
    new Set([
      ...db.INVENTARIO_PROCESADO.map((i) => i.CLIENTE),
      ...db.INVENTARIO_TERMINADO.map((i) => i.CLIENTE),
    ])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventarios y Kardex</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Control de existencias procesadas, terminadas y registro de movimientos.
          </p>
        </div>

        {/* Filter by Client */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filtrar por Cliente:</span>
          <select
            value={filterCliente}
            onChange={(e) => setFilterCliente(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 font-medium"
          >
            <option value="todos">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-3 pt-2 gap-2">
        <button
          id="tab-inv-procesado"
          onClick={() => setSubTab('procesado')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'procesado'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Inventario Procesado ({filteredProc.length})</span>
        </button>

        <button
          id="tab-inv-terminado"
          onClick={() => setSubTab('terminado')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'terminado'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Inventario Terminado ({filteredTerm.length})</span>
        </button>

        <button
          id="tab-kardex-terminado"
          onClick={() => setSubTab('kardex')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            subTab === 'kardex'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex Terminado ({db.KARDEX_TERMINADO.length})</span>
        </button>
      </div>

      {/* 1. INVENTARIO_PROCESADO */}
      {subTab === 'procesado' && (
        <div className="bg-white border border-slate-200 rounded-b-lg shadow-xs overflow-hidden">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/70 border-b border-slate-200">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Entrada Procesada</span>
              <span className="text-lg font-bold font-mono text-slate-900">{totalProcEntrada.toLocaleString()} kg</span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Kg Empacados</span>
              <span className="text-lg font-bold font-mono text-amber-700">{totalProcEmpacados.toLocaleString()} kg</span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Kg Disponible para Empaque</span>
              <span className="text-lg font-bold font-mono text-emerald-700">{totalProcDisponible.toLocaleString()} kg</span>
            </div>
          </div>

          {filteredProc.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay inventario procesado registrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">ID Inv. Procesado</th>
                    <th className="py-2.5 px-3 font-semibold">Lote</th>
                    <th className="py-2.5 px-3 font-semibold">Producto</th>
                    <th className="py-2.5 px-3 font-semibold">Cliente</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Entrada</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Empacados</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Disponible</th>
                    <th className="py-2.5 px-3 font-semibold">Últ. Actualización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredProc.map((item) => (
                    <tr key={item.ID_INV_PROCESADO} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        {item.ID_INV_PROCESADO.slice(0, 8)}...
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.LOTE}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.PRODUCTO}</td>
                      <td className="py-2 px-3 text-slate-700">{item.CLIENTE}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {item.KG_ENTRADA.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-700">
                        {item.KG_EMPACADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs inline-block ${
                            item.KG_DISPONIBLE > 0
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.KG_DISPONIBLE.toLocaleString()} kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {item.ULT_ACTUALIZACION.replace('T', ' ').slice(0, 19)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. INVENTARIO_TERMINADO */}
      {subTab === 'terminado' && (
        <div className="bg-white border border-slate-200 rounded-b-lg shadow-xs overflow-hidden">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50/70 border-b border-slate-200">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Entrada Empacada</span>
              <span className="text-lg font-bold font-mono text-slate-900">{totalTermEntrada.toLocaleString()} kg</span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Kg Embarcados</span>
              <span className="text-lg font-bold font-mono text-blue-700">{totalTermEmbarcados.toLocaleString()} kg</span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Kg Disponible para Embarque</span>
              <span className="text-lg font-bold font-mono text-emerald-700">{totalTermDisponible.toLocaleString()} kg</span>
            </div>
          </div>

          {filteredTerm.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay inventario terminado registrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">ID Inv. Terminado</th>
                    <th className="py-2.5 px-3 font-semibold">Lote</th>
                    <th className="py-2.5 px-3 font-semibold">Producto</th>
                    <th className="py-2.5 px-3 font-semibold">Cliente</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Entrada</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Embarcados</th>
                    <th className="py-2.5 px-3 font-semibold text-right">KG Disponible</th>
                    <th className="py-2.5 px-3 font-semibold">Últ. Actualización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTerm.map((item) => (
                    <tr key={item.ID_INV_TERMINADO} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                        {item.ID_INV_TERMINADO.slice(0, 8)}...
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.LOTE}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.PRODUCTO}</td>
                      <td className="py-2 px-3 text-slate-700">{item.CLIENTE}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {item.KG_ENTRADA.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-700">
                        {item.KG_EMBARCADOS.toLocaleString()} kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs inline-block ${
                            item.KG_DISPONIBLE > 0
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.KG_DISPONIBLE.toLocaleString()} kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {item.ULT_ACTUALIZACION.replace('T', ' ').slice(0, 19)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. KARDEX_TERMINADO */}
      {subTab === 'kardex' && (
        <div className="bg-white border border-slate-200 rounded-b-lg shadow-xs overflow-hidden">
          {db.KARDEX_TERMINADO.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay movimientos en el Kardex.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">ID Movimiento</th>
                    <th className="py-2.5 px-3 font-semibold">Fecha y Hora</th>
                    <th className="py-2.5 px-3 font-semibold">Lote / Producto (Inv. Terminado)</th>
                    <th className="py-2.5 px-3 font-semibold">Tipo de Movimiento</th>
                    <th className="py-2.5 px-3 font-semibold">Referencia</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Entrada (+)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Salida (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {db.KARDEX_TERMINADO.map((mov) => {
                    const inv = db.INVENTARIO_TERMINADO.find(
                      (i) => i.ID_INV_TERMINADO === mov.ID_INV_TERMINADO
                    );
                    const isEntrada = mov.TIPO === 'Entrada Empaque';

                    return (
                      <tr key={mov.ID_MOVIMIENTO} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-400">
                          {mov.ID_MOVIMIENTO.slice(0, 8)}...
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {mov.FECHA_HORA.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-mono font-semibold text-slate-800">{inv?.LOTE || '—'}</div>
                          <div className="text-[11px] text-slate-500">{inv?.PRODUCTO} • {inv?.CLIENTE}</div>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              isEntrada
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {mov.TIPO}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                          {mov.REFERENCIA.slice(0, 12)}...
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {mov.ENTRADA > 0 ? `+${mov.ENTRADA.toLocaleString()} kg` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                          {mov.SALIDA > 0 ? `-${mov.SALIDA.toLocaleString()} kg` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
