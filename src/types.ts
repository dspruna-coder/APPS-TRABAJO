// Types matching the 16 sheets in Google Sheets exactly for AgroControl

export type EmpresaOrigen = 'Prados Andinos' | 'Jardines del Molino' | 'Terra Prime';
export const EMPRESAS_ORIGEN: EmpresaOrigen[] = ['Prados Andinos', 'Jardines del Molino', 'Terra Prime'];
export const PUNTO_LLEGADA_FIJO = 'Prados Andinos';

// 1. PRODUCTOS
export interface Producto {
  ID_PRODUCTO: string; // UUID
  PRODUCTO: string;
  KG_ESTANDAR_GAVETA: number;
  ACTIVO: boolean;
}

// 2. CLIENTES (Catálogo cerrado)
export interface Cliente {
  ID_CLIENTE: string; // UUID
  CLIENTE: string;
  ACTIVO: boolean;
}

// 3. GUIAS
export interface Guia {
  ID_GUIA: string; // UUID
  N_GUIA: string; // Manual
  FECHA: string; // YYYY-MM-DD
  EMPRESA_ORIGEN: EmpresaOrigen;
  DESTINATARIO: string;
  PUNTO_LLEGADA: string; // "Prados Andinos"
  TRANSPORTISTA: string;
  ESTADO: 'Registrada' | 'En Recepción' | 'Completada';
}

// 4. DETALLE_GUIA
export interface DetalleGuia {
  ID_DETALLE: string; // UUID
  ID_GUIA: string; // UUID
  ID_PLANIFICACION: string; // Vacío y oculto para fase futura
  PRODUCTO: string;
  GAVETAS: number;
  KG_GAVETA: number;
  KG_TOTAL: number; // GAVETAS * KG_GAVETA
  LOTE: string;
  CLIENTE: string;
}

// 5. RECEPCIONES
export interface Recepcion {
  ID_RECEPCION: string; // UUID
  ID_DETALLE: string; // UUID
  KG_ENVIADOS: number; // Viene de DETALLE_GUIA
  KG_RECIBIDOS: number; // Ingresado por usuario
  FECHA_RECEPCION: string;
  RESPONSABLE: string;
  ESTADO: 'Recibido' | 'Con Diferencia';
}

// 6. PROCESAMIENTO
export interface Procesamiento {
  ID_PROCESO: string; // UUID
  ID_RECEPCION: string; // UUID
  KG_RECIBIDOS: number;
  KG_PROCESADOS: number;
  KG_DESPERDICIO: number;
  DIFERENCIA: number; // KG_RECIBIDOS - KG_PROCESADOS - KG_DESPERDICIO
  FECHA: string;
}

// 7. INVENTARIO_PROCESADO
export interface InventarioProcesado {
  ID_INV_PROCESADO: string; // UUID
  ID_PROCESO: string; // UUID
  CLIENTE: string;
  PRODUCTO: string;
  LOTE: string;
  KG_ENTRADA: number;
  KG_EMPACADOS: number;
  KG_DISPONIBLE: number; // KG_ENTRADA - KG_EMPACADOS
  ULT_ACTUALIZACION: string;
}

// 8. EMPAQUE
export interface Empaque {
  ID_EMPAQUE: string; // UUID
  FECHA: string;
  CLIENTE: string;
  RESPONSABLE: string;
  ESTADO: 'Empacado';
}

// 9. DETALLE_EMPAQUE
export interface DetalleEmpaque {
  ID_DET_EMPAQUE: string; // UUID
  ID_EMPAQUE: string; // UUID
  ID_INV_PROCESADO: string; // UUID
  KG_EMPACADOS: number;
}

// 10. INVENTARIO_TERMINADO
export interface InventarioTerminado {
  ID_INV_TERMINADO: string; // UUID
  ID_DET_EMPAQUE: string; // UUID
  CLIENTE: string;
  PRODUCTO: string;
  LOTE: string;
  KG_ENTRADA: number;
  KG_EMBARCADOS: number;
  KG_DISPONIBLE: number; // KG_ENTRADA - KG_EMBARCADOS
  ULT_ACTUALIZACION: string;
}

// 11. KARDEX_TERMINADO
export type TipoMovimientoKardex = 'Entrada Empaque' | 'Salida Embarque';

export interface KardexTerminado {
  ID_MOVIMIENTO: string; // UUID
  FECHA_HORA: string;
  ID_INV_TERMINADO: string; // UUID
  TIPO: TipoMovimientoKardex;
  REFERENCIA: string; // ID_EMPAQUE o ID_EMBARQUE
  ENTRADA: number;
  SALIDA: number;
}

// 12. EMBARQUES
export interface Embarque {
  ID_EMBARQUE: string; // UUID
  FECHA: string;
  CLIENTE: string;
  ESTADO: 'Embarcado';
}

// 13. DETALLE_EMBARQUE
export interface DetalleEmbarque {
  ID_DET_EMBARQUE: string; // UUID
  ID_EMBARQUE: string; // UUID
  ID_INV_TERMINADO: string; // UUID
  KG_EMBARCADOS: number;
}

// 14. EXPORTACIONES
export interface Exportacion {
  ID_EXPORTACION: string; // UUID
  FECHA: string;
  ID_DET_EMBARQUE: string; // UUID
  KG_EXPORTADOS: number;
}

// 15. FACTURACION
export interface Facturacion {
  ID_FACTURACION: string; // UUID
  ID_EMBARQUE: string; // UUID (referencia a ID_EMBARQUE o ID_GUIA)
  N_FACTURA: string;
  FECHA: string;
  KG_COBRADOS: number;
  PRECIO_KG: number;
  TOTAL: number;
  ESTADO: 'Emitida' | 'Anulada';
  TIPO_FACTURA?: 'FINCA_PRADOS' | 'PRADOS_EQUINOCCIO';
}

// 16. CONFIGURACION
export interface ConfiguracionParametro {
  CLAVE: string;
  VALOR: string;
  DESCRIPCION: string;
}

// 17. LOTES (Maestro de Lotes por Finca)
export interface LoteMaestro {
  ID_LOTE: string; // UUID
  FINCA: EmpresaOrigen; // 'Terra Prime' | 'Prados Andinos' | 'Jardines del Molino'
  CODIGO_LOTE: string;
  PRODUCTO: string; // Producto actual asignado
  ACTIVO: boolean;
}

// Total Database State
export interface AgroControlDatabase {
  PRODUCTOS: Producto[];
  CLIENTES: Cliente[];
  GUIAS: Guia[];
  DETALLE_GUIA: DetalleGuia[];
  RECEPCIONES: Recepcion[];
  PROCESAMIENTO: Procesamiento[];
  INVENTARIO_PROCESADO: InventarioProcesado[];
  EMPAQUE: Empaque[];
  DETALLE_EMPAQUE: DetalleEmpaque[];
  INVENTARIO_TERMINADO: InventarioTerminado[];
  KARDEX_TERMINADO: KardexTerminado[];
  EMBARQUES: Embarque[];
  DETALLE_EMBARQUE: DetalleEmbarque[];
  EXPORTACIONES: Exportacion[];
  FACTURACION: Facturacion[];
  CONFIGURACION: ConfiguracionParametro[];
  LOTES: LoteMaestro[];
}

export type ProductoItem = Producto;
export type ClienteItem = Cliente;
export type ConfiguracionItem = ConfiguracionParametro;
export type LoteItem = LoteMaestro;

export type TabId = 
  | 'guias'
  | 'recepcion'
  | 'procesamiento'
  | 'empaque'
  | 'inventarios'
  | 'embarque'
  | 'exportacion'
  | 'facturacion'
  | 'controles'
  | 'flujo';
