import React, { useState } from 'react';
import { AgroControlDatabase, ProductoItem, ClienteItem, ConfiguracionItem, LoteMaestro, EmpresaOrigen } from '../types';
import { generateSeedData, addLote, updateLote, toggleLoteActivo } from '../storage/db';
import {
  Settings,
  Users,
  Layers,
  KeyRound,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Plus,
  Info,
  ExternalLink,
  Search,
  Check,
  X,
  Edit2,
  Filter,
} from 'lucide-react';

interface ControlesViewProps {
  db: AgroControlDatabase;
  onDatabaseUpdate: (newDb: AgroControlDatabase) => void;
}

export const ControlesView: React.FC<ControlesViewProps> = ({ db, onDatabaseUpdate }) => {
  const [subTab, setSubTab] = useState<'catalogos' | 'lotes' | 'configuracion' | 'sheets'>('catalogos');

  // New Product Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProductoName, setNewProductoName] = useState('');
  const [newKgGaveta, setNewKgGaveta] = useState('10');

  // New Client Form
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClienteName, setNewClienteName] = useState('');

  // Lotes State
  const [fincaFilter, setFincaFilter] = useState<'TODAS' | EmpresaOrigen>('TODAS');
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoteModal, setShowLoteModal] = useState(false);
  const [newLoteFinca, setNewLoteFinca] = useState<EmpresaOrigen>('Terra Prime');
  const [newLoteCodigo, setNewLoteCodigo] = useState('');
  const [newLoteProducto, setNewLoteProducto] = useState('Cebollín');
  const [newLoteActivo, setNewLoteActivo] = useState(true);

  const [message, setMessage] = useState<string | null>(null);

  const handleAddProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductoName.trim()) return;

    const newProd: ProductoItem = {
      ID_PRODUCTO: crypto.randomUUID(),
      PRODUCTO: newProductoName.trim(),
      KG_ESTANDAR_GAVETA: parseFloat(newKgGaveta) || 10,
      ACTIVO: true,
    };

    const updatedDb = {
      ...db,
      PRODUCTOS: [...db.PRODUCTOS, newProd],
    };
    onDatabaseUpdate(updatedDb);
    setMessage(`Producto "${newProd.PRODUCTO}" agregado al catálogo.`);
    setNewProductoName('');
    setShowProductModal(false);
  };

  const handleToggleProducto = (id: string) => {
    const updated = db.PRODUCTOS.map((p) =>
      p.ID_PRODUCTO === id ? { ...p, ACTIVO: !p.ACTIVO } : p
    );
    onDatabaseUpdate({ ...db, PRODUCTOS: updated });
  };

  const handleAddCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteName.trim()) return;

    const newCli: ClienteItem = {
      ID_CLIENTE: crypto.randomUUID(),
      CLIENTE: newClienteName.trim(),
      ACTIVO: true,
    };

    const updatedDb = {
      ...db,
      CLIENTES: [...db.CLIENTES, newCli],
    };
    onDatabaseUpdate(updatedDb);
    setMessage(`Cliente "${newCli.CLIENTE}" agregado al catálogo cerrado.`);
    setNewClienteName('');
    setShowClientModal(false);
  };

  const handleToggleCliente = (id: string) => {
    const updated = db.CLIENTES.map((c) =>
      c.ID_CLIENTE === id ? { ...c, ACTIVO: !c.ACTIVO } : c
    );
    onDatabaseUpdate({ ...db, CLIENTES: updated });
  };

  const handleCreateLote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoteCodigo.trim()) return;

    try {
      const { newDb, lote } = addLote(db, {
        FINCA: newLoteFinca,
        CODIGO_LOTE: newLoteCodigo.trim(),
        PRODUCTO: newLoteProducto.trim(),
        ACTIVO: newLoteActivo,
      });
      onDatabaseUpdate(newDb);
      setMessage(`Lote "${lote.CODIGO_LOTE}" (${lote.FINCA}) creado exitosamente.`);
      setNewLoteCodigo('');
      setShowLoteModal(false);
    } catch (err: any) {
      setMessage(`Error al agregar lote: ${err.message}`);
    }
  };

  const handleUpdateLoteProducto = (idLote: string, nuevoProducto: string) => {
    try {
      const { newDb, lote } = updateLote(db, idLote, { PRODUCTO: nuevoProducto });
      onDatabaseUpdate(newDb);
      setMessage(`Lote ${lote.CODIGO_LOTE} (${lote.FINCA}): Producto actualizado a "${nuevoProducto || 'Sin Producto'}".`);
    } catch (err: any) {
      setMessage(`Error al actualizar lote: ${err.message}`);
    }
  };

  const handleToggleLote = (idLote: string) => {
    try {
      const { newDb, lote } = toggleLoteActivo(db, idLote);
      onDatabaseUpdate(newDb);
      setMessage(`Lote ${lote.CODIGO_LOTE} (${lote.FINCA}) ahora está ${lote.ACTIVO ? 'ACTIVO' : 'INACTIVO'}.`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const allLotes = db.LOTES || [];
  const filteredLotes = allLotes.filter((l) => {
    if (fincaFilter !== 'TODAS' && l.FINCA !== fincaFilter) return false;
    if (estadoFilter === 'ACTIVOS' && !l.ACTIVO) return false;
    if (estadoFilter === 'INACTIVOS' && l.ACTIVO) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchCod = (l.CODIGO_LOTE || '').toLowerCase().includes(term);
      const matchProd = (l.PRODUCTO || '').toLowerCase().includes(term);
      const matchFinca = (l.FINCA || '').toLowerCase().includes(term);
      if (!matchCod && !matchProd && !matchFinca) return false;
    }
    return true;
  });

  const countTerraPrime = allLotes.filter((l) => l.FINCA === 'Terra Prime').length;
  const countPrados = allLotes.filter((l) => l.FINCA === 'Prados Andinos').length;
  const countMolino = allLotes.filter((l) => l.FINCA === 'Jardines del Molino').length;
  const countActivos = allLotes.filter((l) => l.ACTIVO).length;
  const countInactivos = allLotes.filter((l) => !l.ACTIVO).length;

  const handleResetData = () => {
    if (window.confirm('¿Deseas reiniciar la base de datos a los valores de prueba iniciales?')) {
      const freshDb = generateSeedData();
      onDatabaseUpdate(freshDb);
      setMessage('Base de datos restablecida con datos semilla iniciales.');
    }
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(db, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgroControl_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Controles y Configuración</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Administración de catálogos cerrados y parámetros operativos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md shadow-xs"
            title="Exportar respaldo de datos"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup</span>
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded-md shadow-xs"
            title="Reiniciar a datos de prueba"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Datos</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Subtabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-3 pt-2 gap-2 overflow-x-auto">
        <button
          id="btn-subtab-catalogos"
          onClick={() => setSubTab('catalogos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            subTab === 'catalogos'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Catálogos (Productos y Clientes)</span>
        </button>

        <button
          id="btn-subtab-lotes"
          onClick={() => setSubTab('lotes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            subTab === 'lotes'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Maestro de Lotes (Tabla 17)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
            {allLotes.length}
          </span>
        </button>

        <button
          id="btn-subtab-configuracion"
          onClick={() => setSubTab('configuracion')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            subTab === 'configuracion'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Parámetros del Sistema</span>
        </button>

        <button
          id="btn-subtab-sheets"
          onClick={() => setSubTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            subTab === 'sheets'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Estructura de Datos</span>
        </button>
      </div>

      {/* Tab 1: Catalogos */}
      {subTab === 'catalogos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRODUCTOS */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Catálogo de Productos</h2>
                <p className="text-[11px] text-slate-500">
                  Define los kilogramos estándar por gaveta
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(!showProductModal)}
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded"
              >
                <Plus className="w-3 h-3" /> Nuevo
              </button>
            </div>

            {showProductModal && (
              <form onSubmit={handleAddProducto} className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Producto</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Arándano Biloxi"
                      value={newProductoName}
                      onChange={(e) => setNewProductoName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">KG Estándar Gaveta</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="10"
                      value={newKgGaveta}
                      onChange={(e) => setNewKgGaveta(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-600 hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-right">Kg / Gaveta</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.PRODUCTOS.map((p) => (
                    <tr key={p.ID_PRODUCTO} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.PRODUCTO}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                        {p.KG_ESTANDAR_GAVETA} kg
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.ACTIVO
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {p.ACTIVO ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleProducto(p.ID_PRODUCTO)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          {p.ACTIVO ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CLIENTES */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Catálogo de Clientes</h2>
                <p className="text-[11px] text-slate-500">
                  Catálogo cerrado de clientes habilitados
                </p>
              </div>
              <button
                onClick={() => setShowClientModal(!showClientModal)}
                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded"
              >
                <Plus className="w-3 h-3" /> Nuevo
              </button>
            </div>

            {showClientModal && (
              <form onSubmit={handleAddCliente} className="p-4 bg-emerald-50/50 border-b border-emerald-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Driscoll's Europe"
                    value={newClienteName}
                    onChange={(e) => setNewClienteName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-600 hover:bg-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {db.CLIENTES.map((c) => (
                    <tr key={c.ID_CLIENTE} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{c.CLIENTE}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.ACTIVO
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.ACTIVO ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleCliente(c.ID_CLIENTE)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          {c.ACTIVO ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CONFIGURACION */}
      {subTab === 'configuracion' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Parámetros del Sistema</h2>
              <p className="text-[11px] text-slate-500">
                Variables globales de configuración operativa
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Clave</th>
                  <th className="py-2.5 px-3 font-semibold">Valor</th>
                  <th className="py-2.5 px-3 font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {db.CONFIGURACION.map((cfg) => (
                  <tr key={cfg.CLAVE} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{cfg.CLAVE}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{cfg.VALOR}</td>
                    <td className="py-2.5 px-3 text-slate-600">{cfg.DESCRIPCION}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Google Sheets Spec & Configuration */}
      {subTab === 'sheets' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-emerald-950">
              <h3 className="font-bold text-sm text-emerald-900">
                Especificación de 16 Pestañas de Google Sheets
              </h3>
              <p>
                Actualmente AgroControl opera con persistencia local de alta fidelidad para permitir pruebas completas e interactivas en Preview.
                Todas las tablas coinciden al 100% con los esquemas de tu Spreadsheet único.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { name: 'PRODUCTOS', desc: 'ID_PRODUCTO, PRODUCTO, KG_ESTANDAR_GAVETA, ACTIVO', count: db.PRODUCTOS.length },
              { name: 'CLIENTES', desc: 'ID_CLIENTE, CLIENTE, ACTIVO', count: db.CLIENTES.length },
              { name: 'GUIAS', desc: 'ID_GUIA, N_GUIA, FECHA, EMPRESA_ORIGEN, DESTINATARIO, ...', count: db.GUIAS.length },
              { name: 'DETALLE_GUIA', desc: 'ID_DETALLE, ID_GUIA, LOTE, CLIENTE, PRODUCTO, N_GAVETAS, ...', count: db.DETALLE_GUIA.length },
              { name: 'RECEPCIONES', desc: 'ID_RECEPCION, ID_DETALLE, KG_ENVIADOS, KG_RECIBIDOS, ...', count: db.RECEPCIONES.length },
              { name: 'PROCESAMIENTO', desc: 'ID_PROCESO, ID_RECEPCION, KG_RECIBIDOS, KG_PROCESADOS, ...', count: db.PROCESAMIENTO.length },
              { name: 'INVENTARIO_PROCESADO', desc: 'ID_INV_PROCESADO, ID_PROCESO, CLIENTE, PRODUCTO, LOTE, ...', count: db.INVENTARIO_PROCESADO.length },
              { name: 'EMPAQUE', desc: 'ID_EMPAQUE, FECHA, CLIENTE, RESPONSABLE, ESTADO', count: db.EMPAQUE.length },
              { name: 'DETALLE_EMPAQUE', desc: 'ID_DET_EMPAQUE, ID_EMPAQUE, ID_INV_PROCESADO, KG_EMPACADOS', count: db.DETALLE_EMPAQUE.length },
              { name: 'INVENTARIO_TERMINADO', desc: 'ID_INV_TERMINADO, ID_DET_EMPAQUE, CLIENTE, PRODUCTO, ...', count: db.INVENTARIO_TERMINADO.length },
              { name: 'KARDEX_TERMINADO', desc: 'ID_MOVIMIENTO, FECHA_HORA, ID_INV_TERMINADO, TIPO, ...', count: db.KARDEX_TERMINADO.length },
              { name: 'EMBARQUES', desc: 'ID_EMBARQUE, FECHA, CLIENTE, ESTADO', count: db.EMBARQUES.length },
              { name: 'DETALLE_EMBARQUE', desc: 'ID_DET_EMBARQUE, ID_EMBARQUE, ID_INV_TERMINADO, ...', count: db.DETALLE_EMBARQUE.length },
              { name: 'EXPORTACIONES', desc: 'ID_EXPORTACION, FECHA, ID_DET_EMBARQUE, KG_EXPORTADOS', count: db.EXPORTACIONES.length },
              { name: 'FACTURACION', desc: 'ID_FACTURACION, ID_EMBARQUE, N_FACTURA, FECHA, KG_COBRADOS, ...', count: db.FACTURACION.length },
              { name: 'CONFIGURACION', desc: 'CLAVE, VALOR, DESCRIPCION', count: db.CONFIGURACION.length },
            ].map((sheet, i) => (
              <div key={sheet.name} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="flex items-center justify-between font-mono font-bold text-slate-800 text-[11px] mb-1">
                  <span>{i + 1}. {sheet.name}</span>
                  <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-[10px] text-emerald-700">
                    {sheet.count} filas
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono line-clamp-2">{sheet.desc}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
              ¿Cómo conectar tu Google Spreadsheet Real?
            </h4>
            <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-700 space-y-2">
              <p>
                Para vincular tu propio Google Spreadsheet en producción, solo requerirás configurar:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                <li>
                  <strong>SPREADSHEET_ID:</strong> El identificador que aparece en la URL de tu Google Sheet (ej. <code className="bg-white px-1 py-0.5 rounded border text-slate-800">https://docs.google.com/spreadsheets/d/TU_ID_AQUI/edit</code>).
                </li>
                <li>
                  <strong>16 Pestañas creadas:</strong> Crear las 16 hojas con los nombres exactos en mayúsculas: <code className="bg-white px-1 py-0.5 rounded border text-emerald-700 font-mono">PRODUCTOS, CLIENTES, GUIAS, DETALLE_GUIA, RECEPCIONES, PROCESAMIENTO, INVENTARIO_PROCESADO, EMPAQUE, DETALLE_EMPAQUE, INVENTARIO_TERMINADO, KARDEX_TERMINADO, EMBARQUES, DETALLE_EMBARQUE, EXPORTACIONES, FACTURACION, CONFIGURACION</code>.
                </li>
                <li>
                  <strong>Cuenta de Servicio o Google OAuth:</strong> Habilitar la <em>Google Sheets API</em> en Google Cloud Console y compartir el Spreadsheet con el email de servicio con permisos de Editor.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
