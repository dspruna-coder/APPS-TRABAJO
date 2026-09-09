import React, { useState } from 'react';
import { AgroControlDatabase } from '../types';
import { X, Table, ExternalLink, Check, Copy, Database, Layers } from 'lucide-react';

interface SheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: AgroControlDatabase;
}

export const SheetsModal: React.FC<SheetsModalProps> = ({ isOpen, onClose, db }) => {
  const [selectedSheet, setSelectedSheet] = useState<string>('GUIAS');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sheetsInfo = [
    {
      name: 'PRODUCTOS',
      desc: 'Catálogo de productos y kg estándar por gaveta',
      fields: ['ID_PRODUCTO', 'PRODUCTO', 'KG_ESTANDAR_GAVETA', 'ACTIVO'],
      data: db.PRODUCTOS,
    },
    {
      name: 'CLIENTES',
      desc: 'Catálogo cerrado de clientes habilitados',
      fields: ['ID_CLIENTE', 'CLIENTE', 'ACTIVO'],
      data: db.CLIENTES,
    },
    {
      name: 'GUIAS',
      desc: 'Encabezado de guías de cosecha desde campo',
      fields: ['ID_GUIA', 'N_GUIA', 'FECHA', 'EMPRESA_ORIGEN', 'DESTINATARIO', 'PUNTO_LLEGADA', 'TRANSPORTISTA', 'ESTADO'],
      data: db.GUIAS,
    },
    {
      name: 'DETALLE_GUIA',
      desc: 'Líneas de guía con cálculo de kg y lote',
      fields: ['ID_DETALLE', 'ID_GUIA', 'ID_PLANIFICACION', 'PRODUCTO', 'GAVETAS', 'KG_GAVETA', 'KG_TOTAL', 'LOTE', 'CLIENTE'],
      data: db.DETALLE_GUIA,
    },
    {
      name: 'RECEPCIONES',
      desc: 'Pesaje de entrada en báscula de planta',
      fields: ['ID_RECEPCION', 'ID_DETALLE', 'KG_ENVIADOS', 'KG_RECIBIDOS', 'FECHA_RECEPCION', 'RESPONSABLE', 'ESTADO'],
      data: db.RECEPCIONES,
    },
    {
      name: 'PROCESAMIENTO',
      desc: 'Selección, pesaje procesado y merma',
      fields: ['ID_PROCESO', 'ID_RECEPCION', 'KG_RECIBIDOS', 'KG_PROCESADOS', 'KG_DESPERDICIO', 'DIFERENCIA', 'FECHA'],
      data: db.PROCESAMIENTO,
    },
    {
      name: 'INVENTARIO_PROCESADO',
      desc: 'Stock disponible tras proceso (auto generado)',
      fields: ['ID_INV_PROCESADO', 'ID_PROCESO', 'CLIENTE', 'PRODUCTO', 'LOTE', 'KG_ENTRADA', 'KG_EMPACADOS', 'KG_DISPONIBLE', 'ULT_ACTUALIZACION'],
      data: db.INVENTARIO_PROCESADO,
    },
    {
      name: 'EMPAQUE',
      desc: 'Encabezado de empaque por cliente',
      fields: ['ID_EMPAQUE', 'FECHA', 'CLIENTE', 'RESPONSABLE', 'ESTADO'],
      data: db.EMPAQUE,
    },
    {
      name: 'DETALLE_EMPAQUE',
      desc: 'Líneas consumidas de inventario procesado',
      fields: ['ID_DET_EMPAQUE', 'ID_EMPAQUE', 'ID_INV_PROCESADO', 'KG_EMPACADOS'],
      data: db.DETALLE_EMPAQUE,
    },
    {
      name: 'INVENTARIO_TERMINADO',
      desc: 'Stock terminado listo para embarque (auto generado)',
      fields: ['ID_INV_TERMINADO', 'ID_DET_EMPAQUE', 'CLIENTE', 'PRODUCTO', 'LOTE', 'KG_ENTRADA', 'KG_EMBARCADOS', 'KG_DISPONIBLE', 'ULT_ACTUALIZACION'],
      data: db.INVENTARIO_TERMINADO,
    },
    {
      name: 'KARDEX_TERMINADO',
      desc: 'Histórico inmutable de entradas y salidas',
      fields: ['ID_MOVIMIENTO', 'FECHA_HORA', 'ID_INV_TERMINADO', 'TIPO', 'REFERENCIA', 'ENTRADA', 'SALIDA'],
      data: db.KARDEX_TERMINADO,
    },
    {
      name: 'EMBARQUES',
      desc: 'Encabezado de despacho a puerto/cliente',
      fields: ['ID_EMBARQUE', 'FECHA', 'CLIENTE', 'ESTADO'],
      data: db.EMBARQUES,
    },
    {
      name: 'DETALLE_EMBARQUE',
      desc: 'Líneas de producto terminado embarcadas',
      fields: ['ID_DET_EMBARQUE', 'ID_EMBARQUE', 'ID_INV_TERMINADO', 'KG_EMBARCADOS'],
      data: db.DETALLE_EMBARQUE,
    },
    {
      name: 'EXPORTACIONES',
      desc: 'Declaración de exportación y pesaje en aduana',
      fields: ['ID_EXPORTACION', 'FECHA', 'ID_DET_EMBARQUE', 'KG_EXPORTADOS'],
      data: db.EXPORTACIONES,
    },
    {
      name: 'FACTURACION',
      desc: 'Control y registro de facturación de kilogramos',
      fields: ['ID_FACTURACION', 'ID_EMBARQUE', 'N_FACTURA', 'FECHA', 'KG_COBRADOS', 'PRECIO_KG', 'TOTAL', 'ESTADO'],
      data: db.FACTURACION,
    },
    {
      name: 'CONFIGURACION',
      desc: 'Parámetros del sistema',
      fields: ['CLAVE', 'VALOR', 'DESCRIPCION'],
      data: db.CONFIGURACION,
    },
  ];

  const currentSheetInfo = sheetsInfo.find((s) => s.name === selectedSheet) || sheetsInfo[0];

  const handleCopySheetNames = () => {
    const names = sheetsInfo.map((s) => s.name).join('\n');
    navigator.clipboard.writeText(names);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Estructura de Tablas del Sistema</h3>
              <p className="text-xs text-slate-400">
                Esquema canónico de datos y registros almacenados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left sheet list, Right table viewer */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: List of 16 sheets */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50 p-3 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tablas del Sistema
              </span>
              <button
                onClick={handleCopySheetNames}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                title="Copiar nombres de tablas"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiados' : 'Copiar 16 nombres'}</span>
              </button>
            </div>

            <div className="space-y-1">
              {sheetsInfo.map((s, idx) => {
                const isSel = s.name === selectedSheet;
                return (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSheet(s.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                      isSel
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono text-[11px] opacity-80 mr-1.5">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <span className="font-bold">{s.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSel ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.data.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Sheet details and live table */}
          <div className="md:col-span-8 p-5 overflow-y-auto max-h-[70vh] flex flex-col space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-base font-bold text-slate-900">
                  Hoja: <span className="text-emerald-700">{currentSheetInfo.name}</span>
                </h4>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  {currentSheetInfo.data.length} filas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{currentSheetInfo.desc}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                {currentSheetInfo.fields.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Sheet Table */}
            <div className="border border-slate-200 rounded-md overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    {currentSheetInfo.fields.map((f) => (
                      <th key={f} className="py-2 px-3 font-semibold font-mono whitespace-nowrap">
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentSheetInfo.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={currentSheetInfo.fields.length}
                        className="py-6 text-center text-slate-400 text-xs"
                      >
                        Sin registros todavía en esta pestaña.
                      </td>
                    </tr>
                  ) : (
                    currentSheetInfo.data.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {currentSheetInfo.fields.map((f) => {
                          const val = row[f];
                          return (
                            <td key={f} className="py-1.5 px-3 font-mono text-[11px] whitespace-nowrap">
                              {typeof val === 'boolean'
                                ? val
                                  ? 'TRUE'
                                  : 'FALSE'
                                : typeof val === 'number'
                                ? val.toLocaleString()
                                : val !== undefined && val !== null
                                ? String(val)
                                : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Compatible con la API de Google Sheets v4 y AppScript.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
