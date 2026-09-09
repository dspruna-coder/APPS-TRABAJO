import {
  AgroControlDatabase,
  Guia,
  DetalleGuia,
  Recepcion,
  Procesamiento,
  InventarioProcesado,
  Empaque,
  DetalleEmpaque,
  InventarioTerminado,
  KardexTerminado,
  Embarque,
  DetalleEmbarque,
  Exportacion,
  Facturacion,
  Producto,
  Cliente,
  ConfiguracionParametro,
  LoteMaestro,
} from '../types';

const STORAGE_KEY = 'agrocontrol_db_v1';

export function generateLotesSeedData(): LoteMaestro[] {
  const lotes: LoteMaestro[] = [];

  // 1. TERRA PRIME: Cebollín: lotes 1 al 40. Todos ACTIVOS.
  for (let i = 1; i <= 40; i++) {
    lotes.push({
      ID_LOTE: `lote-tp-${String(i).padStart(3, '0')}`,
      FINCA: 'Terra Prime',
      CODIGO_LOTE: String(i),
      PRODUCTO: 'Cebollín',
      ACTIVO: true,
    });
  }

  // 2. PRADOS ANDINOS:
  // Albahaca: 201, 202, 203, 204, 301, 302, 303, 304, 305, 306, 307, 308, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, VIV
  const albahacaPrados = [
    '201', '202', '203', '204',
    '301', '302', '303', '304', '305', '306', '307', '308',
    '401', '402', '403', '404', '405', '406', '407', '408', '409', '410', '411', '412', '413',
    '601', '602', '603', '604', '605', '606', '607', '608', '609', '610', '611', '612', '613', '614', '615', '616',
    'VIV',
  ];
  albahacaPrados.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-pa-alb-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Prados Andinos',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Albahaca',
      ACTIVO: true,
    });
  });

  // Cebollín: 101, 102, 103, 104, 105, 106, 107, 109, 110, 111, 114, 115, 117, 118, 119, 120, 123, 125, 126, 127, 128
  const cebollinPrados = [
    '101', '102', '103', '104', '105', '106', '107', '109', '110', '111',
    '114', '115', '117', '118', '119', '120', '123', '125', '126', '127', '128',
  ];
  cebollinPrados.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-pa-ceb-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Prados Andinos',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Cebollín',
      ACTIVO: true,
    });
  });

  // Tomillo: 501
  lotes.push({
    ID_LOTE: 'lote-pa-tom-501',
    FINCA: 'Prados Andinos',
    CODIGO_LOTE: '501',
    PRODUCTO: 'Tomillo',
    ACTIVO: true,
  });

  // PRUEBAS: 502
  lotes.push({
    ID_LOTE: 'lote-pa-pru-502',
    FINCA: 'Prados Andinos',
    CODIGO_LOTE: '502',
    PRODUCTO: 'PRUEBAS',
    ACTIVO: true,
  });

  // 3. JARDINES DEL MOLINO:
  // Albahaca: 1201, 1203, 1205, 1207, 1208, 1209
  const albahacaJM = ['1201', '1203', '1205', '1207', '1208', '1209'];
  albahacaJM.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-jm-alb-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Jardines del Molino',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Albahaca',
      ACTIVO: true,
    });
  });

  // Perifolio: 1202, 1204, 1206
  const perifolioJM = ['1202', '1204', '1206'];
  perifolioJM.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-jm-per-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Jardines del Molino',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Perifolio',
      ACTIVO: true,
    });
  });

  // Lechuga Frisée: 1210, 1303, 1304, 1305, 1307, 1309
  const lechugaJM = ['1210', '1303', '1304', '1305', '1307', '1309'];
  lechugaJM.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-jm-lec-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Jardines del Molino',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Lechuga Frisée',
      ACTIVO: true,
    });
  });

  // Salvia: 1301, 1308, 1310
  const salviaJM = ['1301', '1308', '1310'];
  salviaJM.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-jm-sal-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Jardines del Molino',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Salvia',
      ACTIVO: true,
    });
  });

  // Cebollín: 1128, 1141, 1143
  const cebollinJM = ['1128', '1141', '1143'];
  cebollinJM.forEach((cod, idx) => {
    lotes.push({
      ID_LOTE: `lote-jm-ceb-${String(idx + 1).padStart(3, '0')}`,
      FINCA: 'Jardines del Molino',
      CODIGO_LOTE: cod,
      PRODUCTO: 'Cebollín',
      ACTIVO: true,
    });
  });

  // Lote 1302: PRODUCTO vacío y ACTIVO = NO
  lotes.push({
    ID_LOTE: 'lote-jm-ina-1302',
    FINCA: 'Jardines del Molino',
    CODIGO_LOTE: '1302',
    PRODUCTO: '',
    ACTIVO: false,
  });

  return lotes;
}

// Seed data with realistic agricultural cycle from harvest guide to billing
export function generateSeedData(): AgroControlDatabase {
  const prodHassId = 'p1111111-1111-4111-8111-111111111111';
  const prodArandanoId = 'p2222222-2222-4222-8222-222222222222';
  const prodFresaId = 'p3333333-3333-4333-8333-333333333333';

  const PRODUCTOS: Producto[] = [
    {
      ID_PRODUCTO: prodHassId,
      PRODUCTO: 'Aguacate Hass',
      KG_ESTANDAR_GAVETA: 10,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: prodArandanoId,
      PRODUCTO: 'Arándano Biloxi',
      KG_ESTANDAR_GAVETA: 3,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: prodFresaId,
      PRODUCTO: 'Fresa Monterrey',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-cebollin-001',
      PRODUCTO: 'Cebollín',
      KG_ESTANDAR_GAVETA: 10,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-albahaca-001',
      PRODUCTO: 'Albahaca',
      KG_ESTANDAR_GAVETA: 10,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-perifolio-001',
      PRODUCTO: 'Perifolio',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-lechuga-001',
      PRODUCTO: 'Lechuga Frisée',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-salvia-001',
      PRODUCTO: 'Salvia',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-tomillo-001',
      PRODUCTO: 'Tomillo',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-romero-001',
      PRODUCTO: 'Romero',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-menta-001',
      PRODUCTO: 'Menta',
      KG_ESTANDAR_GAVETA: 5,
      ACTIVO: true,
    },
    {
      ID_PRODUCTO: 'prod-pruebas-001',
      PRODUCTO: 'PRUEBAS',
      KG_ESTANDAR_GAVETA: 10,
      ACTIVO: true,
    },
  ];

  const clientEquinoccioId = 'c1111111-1111-4111-8111-111111111111';
  const clientAndinaId = 'c2222222-2222-4222-8222-222222222222';

  const CLIENTES: Cliente[] = [
    {
      ID_CLIENTE: clientEquinoccioId,
      CLIENTE: 'Equinoccio Vegetal',
      ACTIVO: true,
    },
    {
      ID_CLIENTE: clientAndinaId,
      CLIENTE: 'Exportadora Andina',
      ACTIVO: true,
    },
  ];

  // Guía de siembra 1
  const guia1Id = 'g1000000-0000-4000-8000-000000000001';
  const GUIAS: Guia[] = [
    {
      ID_GUIA: guia1Id,
      N_GUIA: 'GR-2026-0841',
      FECHA: '2026-09-08',
      EMPRESA_ORIGEN: 'Jardines del Molino',
      DESTINATARIO: 'Planta de Empaque Prados',
      PUNTO_LLEGADA: 'Prados Andinos',
      TRANSPORTISTA: 'TransAndes Express - Camión #12',
      ESTADO: 'Completada',
    },
  ];

  const det1Id = 'd1000000-0000-4000-8000-000000000001';
  const det2Id = 'd2000000-0000-4000-8000-000000000002';
  const DETALLE_GUIA: DetalleGuia[] = [
    {
      ID_DETALLE: det1Id,
      ID_GUIA: guia1Id,
      ID_PLANIFICACION: '',
      PRODUCTO: 'Aguacate Hass',
      GAVETAS: 150,
      KG_GAVETA: 10,
      KG_TOTAL: 1500,
      LOTE: 'LOTE-JM-2601',
      CLIENTE: 'Equinoccio Vegetal',
    },
    {
      ID_DETALLE: det2Id,
      ID_GUIA: guia1Id,
      ID_PLANIFICACION: '',
      PRODUCTO: 'Arándano Biloxi',
      GAVETAS: 200,
      KG_GAVETA: 3,
      KG_TOTAL: 600,
      LOTE: 'LOTE-JM-2602',
      CLIENTE: 'Equinoccio Vegetal',
    },
  ];

  const rec1Id = 'r1000000-0000-4000-8000-000000000001';
  const rec2Id = 'r2000000-0000-4000-8000-000000000002';
  const RECEPCIONES: Recepcion[] = [
    {
      ID_RECEPCION: rec1Id,
      ID_DETALLE: det1Id,
      KG_ENVIADOS: 1500,
      KG_RECIBIDOS: 1495, // 5 kg de merma en transporte
      FECHA_RECEPCION: '2026-09-08',
      RESPONSABLE: 'Carlos Mendoza',
      ESTADO: 'Con Diferencia',
    },
    {
      ID_RECEPCION: rec2Id,
      ID_DETALLE: det2Id,
      KG_ENVIADOS: 600,
      KG_RECIBIDOS: 600,
      FECHA_RECEPCION: '2026-09-08',
      RESPONSABLE: 'Carlos Mendoza',
      ESTADO: 'Recibido',
    },
  ];

  const proc1Id = 'pr100000-0000-4000-8000-000000000001';
  const PROCESAMIENTO: Procesamiento[] = [
    {
      ID_PROCESO: proc1Id,
      ID_RECEPCION: rec1Id,
      KG_RECIBIDOS: 1495,
      KG_PROCESADOS: 1420,
      KG_DESPERDICIO: 70,
      DIFERENCIA: 5, // 1495 - 1420 - 70 = 5 kg
      FECHA: '2026-09-08',
    },
  ];

  const invProc1Id = 'ip100000-0000-4000-8000-000000000001';
  const INVENTARIO_PROCESADO: InventarioProcesado[] = [
    {
      ID_INV_PROCESADO: invProc1Id,
      ID_PROCESO: proc1Id,
      CLIENTE: 'Equinoccio Vegetal',
      PRODUCTO: 'Aguacate Hass',
      LOTE: 'LOTE-JM-2601',
      KG_ENTRADA: 1420,
      KG_EMPACADOS: 1000,
      KG_DISPONIBLE: 420,
      ULT_ACTUALIZACION: '2026-09-08T16:30:00.000Z',
    },
  ];

  const emp1Id = 'em100000-0000-4000-8000-000000000001';
  const EMPAQUE: Empaque[] = [
    {
      ID_EMPAQUE: emp1Id,
      FECHA: '2026-09-08',
      CLIENTE: 'Equinoccio Vegetal',
      RESPONSABLE: 'Marta Ruales',
      ESTADO: 'Empacado',
    },
  ];

  const detEmp1Id = 'de100000-0000-4000-8000-000000000001';
  const DETALLE_EMPAQUE: DetalleEmpaque[] = [
    {
      ID_DET_EMPAQUE: detEmp1Id,
      ID_EMPAQUE: emp1Id,
      ID_INV_PROCESADO: invProc1Id,
      KG_EMPACADOS: 1000,
    },
  ];

  const invTerm1Id = 'it100000-0000-4000-8000-000000000001';
  const INVENTARIO_TERMINADO: InventarioTerminado[] = [
    {
      ID_INV_TERMINADO: invTerm1Id,
      ID_DET_EMPAQUE: detEmp1Id,
      CLIENTE: 'Equinoccio Vegetal',
      PRODUCTO: 'Aguacate Hass',
      LOTE: 'LOTE-JM-2601',
      KG_ENTRADA: 1000,
      KG_EMBARCADOS: 800,
      KG_DISPONIBLE: 200,
      ULT_ACTUALIZACION: '2026-09-09T09:00:00.000Z',
    },
  ];

  const mov1Id = 'km100000-0000-4000-8000-000000000001';
  const mov2Id = 'km200000-0000-4000-8000-000000000002';
  const KARDEX_TERMINADO: KardexTerminado[] = [
    {
      ID_MOVIMIENTO: mov1Id,
      FECHA_HORA: '2026-09-08T17:00:00.000Z',
      ID_INV_TERMINADO: invTerm1Id,
      TIPO: 'Entrada Empaque',
      REFERENCIA: emp1Id,
      ENTRADA: 1000,
      SALIDA: 0,
    },
    {
      ID_MOVIMIENTO: mov2Id,
      FECHA_HORA: '2026-09-09T09:30:00.000Z',
      ID_INV_TERMINADO: invTerm1Id,
      TIPO: 'Salida Embarque',
      REFERENCIA: 'emb10000-0000-4000-8000-000000000001',
      ENTRADA: 0,
      SALIDA: 800,
    },
  ];

  const emb1Id = 'emb10000-0000-4000-8000-000000000001';
  const EMBARQUES: Embarque[] = [
    {
      ID_EMBARQUE: emb1Id,
      FECHA: '2026-09-09',
      CLIENTE: 'Equinoccio Vegetal',
      ESTADO: 'Embarcado',
    },
  ];

  const detEmb1Id = 'demb1000-0000-4000-8000-000000000001';
  const DETALLE_EMBARQUE: DetalleEmbarque[] = [
    {
      ID_DET_EMBARQUE: detEmb1Id,
      ID_EMBARQUE: emb1Id,
      ID_INV_TERMINADO: invTerm1Id,
      KG_EMBARCADOS: 800,
    },
  ];

  const exp1Id = 'exp10000-0000-4000-8000-000000000001';
  const EXPORTACIONES: Exportacion[] = [
    {
      ID_EXPORTACION: exp1Id,
      FECHA: '2026-09-09',
      ID_DET_EMBARQUE: detEmb1Id,
      KG_EXPORTADOS: 796, // 4 kg de diferencia aduanera / balanza de puerto
    },
  ];

  const fact1Id = 'fc100000-0000-4000-8000-000000000001';
  const fact2Id = 'fc200000-0000-4000-8000-000000000002';
  const FACTURACION: Facturacion[] = [
    {
      ID_FACTURACION: fact1Id,
      ID_EMBARQUE: exp1Id,
      N_FACTURA: 'FAC-EQ-001',
      FECHA: '2026-09-09',
      KG_COBRADOS: 796,
      PRECIO_KG: 0,
      TOTAL: 0,
      ESTADO: 'Emitida',
      TIPO_FACTURA: 'PRADOS_EQUINOCCIO',
    },
    {
      ID_FACTURACION: fact2Id,
      ID_EMBARQUE: det1Id,
      N_FACTURA: 'FAC-JM-001',
      FECHA: '2026-09-09',
      KG_COBRADOS: 1500,
      PRECIO_KG: 0,
      TOTAL: 0,
      ESTADO: 'Emitida',
      TIPO_FACTURA: 'FINCA_PRADOS',
    },
  ];

  const CONFIGURACION: ConfiguracionParametro[] = [
    { CLAVE: 'EMPRESA_LOCAL', VALOR: 'Prados Andinos', DESCRIPCION: 'Empresa central operadora' },
    { CLAVE: 'PUNTO_LLEGADA_DEFAULT', VALOR: 'Prados Andinos', DESCRIPCION: 'Punto fijo de llegada de guías' },
    { CLAVE: 'SPREADSHEET_ID', VALOR: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', DESCRIPCION: 'ID del Google Spreadsheet con 16 pestañas' },
    { CLAVE: 'SPREADSHEET_NAME', VALOR: 'AgroControl_Master_DB', DESCRIPCION: 'Nombre del libro de cálculo' },
    { CLAVE: 'ULTIMA_SINCRONIZACION', VALOR: '2026-09-09T13:50:00.000Z', DESCRIPCION: 'Timestamp de última sincronización con Google Sheets' },
  ];

  return {
    PRODUCTOS,
    CLIENTES,
    GUIAS,
    DETALLE_GUIA,
    RECEPCIONES,
    PROCESAMIENTO,
    INVENTARIO_PROCESADO,
    EMPAQUE,
    DETALLE_EMPAQUE,
    INVENTARIO_TERMINADO,
    KARDEX_TERMINADO,
    EMBARQUES,
    DETALLE_EMBARQUE,
    EXPORTACIONES,
    FACTURACION,
    CONFIGURACION,
    LOTES: generateLotesSeedData(),
  };
}

export function loadDatabase(): AgroControlDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Basic validity check
      if (parsed.PRODUCTOS && parsed.GUIAS && parsed.DETALLE_GUIA) {
        let needsSave = false;
        // Migration: Ensure LOTES exists
        if (!parsed.LOTES || !Array.isArray(parsed.LOTES) || parsed.LOTES.length === 0) {
          parsed.LOTES = generateLotesSeedData();
          needsSave = true;
        }
        // Migration: Ensure required products exist in PRODUCTOS
        const requiredProds = [
          'Tomillo',
          'Romero',
          'Menta',
          'PRUEBAS',
          'Cebollín',
          'Albahaca',
          'Perifolio',
          'Lechuga Frisée',
          'Salvia',
        ];
        for (const prodName of requiredProds) {
          if (!parsed.PRODUCTOS.some((p: Producto) => p.PRODUCTO.toLowerCase() === prodName.toLowerCase())) {
            parsed.PRODUCTOS.push({
              ID_PRODUCTO: crypto.randomUUID(),
              PRODUCTO: prodName,
              KG_ESTANDAR_GAVETA: ['Cebollín', 'Albahaca', 'PRUEBAS'].includes(prodName) ? 10 : 5,
              ACTIVO: true,
            });
            needsSave = true;
          }
        }
        if (needsSave) {
          saveDatabase(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading database from localStorage:', e);
  }
  const initial = generateSeedData();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(db: AgroControlDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Error saving database to localStorage:', e);
  }
}

export function resetDatabase(): AgroControlDatabase {
  const initial = generateSeedData();
  saveDatabase(initial);
  return initial;
}

// Business Logic Operations with strict validation and immutability

export function addGuia(
  db: AgroControlDatabase,
  guiaData: Omit<Guia, 'ID_GUIA' | 'PUNTO_LLEGADA' | 'ESTADO'>,
  detalles: Array<{
    PRODUCTO: string;
    GAVETAS: number;
    LOTE: string;
    CLIENTE: string;
  }>
): { newDb: AgroControlDatabase; guia: Guia } {
  const idGuia = crypto.randomUUID();
  const newGuia: Guia = {
    ID_GUIA: idGuia,
    N_GUIA: guiaData.N_GUIA.trim(),
    FECHA: guiaData.FECHA,
    EMPRESA_ORIGEN: guiaData.EMPRESA_ORIGEN,
    DESTINATARIO: guiaData.DESTINATARIO.trim(),
    PUNTO_LLEGADA: 'Prados Andinos',
    TRANSPORTISTA: guiaData.TRANSPORTISTA.trim(),
    ESTADO: 'Registrada',
  };

  const newDetalles: DetalleGuia[] = detalles.map((d) => {
    const prod = db.PRODUCTOS.find((p) => p.PRODUCTO === d.PRODUCTO);
    const kgGaveta = prod ? prod.KG_ESTANDAR_GAVETA : 0;
    const kgTotal = d.GAVETAS * kgGaveta;

    return {
      ID_DETALLE: crypto.randomUUID(),
      ID_GUIA: idGuia,
      ID_PLANIFICACION: '', // Oculto y vacío para fase futura
      PRODUCTO: d.PRODUCTO,
      GAVETAS: Number(d.GAVETAS),
      KG_GAVETA: kgGaveta,
      KG_TOTAL: kgTotal,
      LOTE: d.LOTE.trim(),
      CLIENTE: d.CLIENTE,
    };
  });

  const updatedDb: AgroControlDatabase = {
    ...db,
    GUIAS: [newGuia, ...db.GUIAS],
    DETALLE_GUIA: [...newDetalles, ...db.DETALLE_GUIA],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, guia: newGuia };
}

export function addRecepcion(
  db: AgroControlDatabase,
  recepcionData: {
    ID_DETALLE: string;
    KG_RECIBIDOS: number;
    FECHA_RECEPCION: string;
    RESPONSABLE: string;
  }
): { newDb: AgroControlDatabase; recepcion: Recepcion } {
  // Check if detail already has a reception
  const alreadyReceived = db.RECEPCIONES.some(
    (r) => r.ID_DETALLE === recepcionData.ID_DETALLE
  );
  if (alreadyReceived) {
    throw new Error('Esta línea de guía ya tiene una recepción registrada. Una línea de guía tiene una sola recepción.');
  }

  const detalle = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === recepcionData.ID_DETALLE);
  if (!detalle) {
    throw new Error('Detalle de guía no encontrado.');
  }

  const idRecepcion = crypto.randomUUID();
  const kgEnviados = detalle.KG_TOTAL;
  const kgRecibidos = Number(recepcionData.KG_RECIBIDOS);
  const estado: 'Recibido' | 'Con Diferencia' =
    kgRecibidos !== kgEnviados ? 'Con Diferencia' : 'Recibido';

  const newRecepcion: Recepcion = {
    ID_RECEPCION: idRecepcion,
    ID_DETALLE: recepcionData.ID_DETALLE,
    KG_ENVIADOS: kgEnviados,
    KG_RECIBIDOS: kgRecibidos,
    FECHA_RECEPCION: recepcionData.FECHA_RECEPCION,
    RESPONSABLE: recepcionData.RESPONSABLE.trim(),
    ESTADO: estado,
  };

  // Update Guía state if all details for this guía are received
  const guiaId = detalle.ID_GUIA;
  const allDetailsForGuia = db.DETALLE_GUIA.filter((d) => d.ID_GUIA === guiaId);
  const existingRecepcionCount = db.RECEPCIONES.filter((r) =>
    allDetailsForGuia.some((d) => d.ID_DETALLE === r.ID_DETALLE)
  ).length;

  const willBeAllReceived = existingRecepcionCount + 1 >= allDetailsForGuia.length;

  const updatedGuias = db.GUIAS.map((g) => {
    if (g.ID_GUIA === guiaId) {
      return {
        ...g,
        ESTADO: willBeAllReceived ? ('Completada' as const) : ('En Recepción' as const),
      };
    }
    return g;
  });

  const updatedDb: AgroControlDatabase = {
    ...db,
    GUIAS: updatedGuias,
    RECEPCIONES: [newRecepcion, ...db.RECEPCIONES],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, recepcion: newRecepcion };
}

export function addProcesamiento(
  db: AgroControlDatabase,
  procesoData: {
    ID_RECEPCION: string;
    KG_PROCESADOS: number;
    KG_DESPERDICIO: number;
    FECHA: string;
  }
): { newDb: AgroControlDatabase; proceso: Procesamiento } {
  const recepcion = db.RECEPCIONES.find((r) => r.ID_RECEPCION === procesoData.ID_RECEPCION);
  if (!recepcion) {
    throw new Error('Recepción no encontrada.');
  }

  // Find detail to keep client, product, lot
  const detalle = db.DETALLE_GUIA.find((d) => d.ID_DETALLE === recepcion.ID_DETALLE);
  if (!detalle) {
    throw new Error('Detalle de guía origen no encontrado.');
  }

  const idProceso = crypto.randomUUID();
  const kgRecibidos = recepcion.KG_RECIBIDOS;
  const kgProcesados = Number(procesoData.KG_PROCESADOS);
  const kgDesperdicio = Number(procesoData.KG_DESPERDICIO);

  if (kgProcesados + kgDesperdicio > kgRecibidos) {
    throw new Error(
      `Guardado bloqueado: KG_PROCESADOS (${kgProcesados}) + KG_DESPERDICIO (${kgDesperdicio}) = ${kgProcesados + kgDesperdicio} kg supera los KG_RECIBIDOS (${kgRecibidos} kg). La DIFERENCIA no puede ser negativa.`
    );
  }

  const diferencia = kgRecibidos - kgProcesados - kgDesperdicio;

  const newProceso: Procesamiento = {
    ID_PROCESO: idProceso,
    ID_RECEPCION: procesoData.ID_RECEPCION,
    KG_RECIBIDOS: kgRecibidos,
    KG_PROCESADOS: kgProcesados,
    KG_DESPERDICIO: kgDesperdicio,
    DIFERENCIA: diferencia,
    FECHA: procesoData.FECHA,
  };

  // Automatically generate INVENTARIO_PROCESADO
  const idInvProcesado = crypto.randomUUID();
  const nowIso = new Date().toISOString();
  const newInvProcesado: InventarioProcesado = {
    ID_INV_PROCESADO: idInvProcesado,
    ID_PROCESO: idProceso,
    CLIENTE: detalle.CLIENTE,
    PRODUCTO: detalle.PRODUCTO,
    LOTE: detalle.LOTE,
    KG_ENTRADA: kgProcesados,
    KG_EMPACADOS: 0,
    KG_DISPONIBLE: kgProcesados,
    ULT_ACTUALIZACION: nowIso,
  };

  const updatedDb: AgroControlDatabase = {
    ...db,
    PROCESAMIENTO: [newProceso, ...db.PROCESAMIENTO],
    INVENTARIO_PROCESADO: [newInvProcesado, ...db.INVENTARIO_PROCESADO],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, proceso: newProceso };
}

export function addEmpaque(
  db: AgroControlDatabase,
  empaqueData: {
    FECHA: string;
    CLIENTE: string;
    RESPONSABLE: string;
  },
  detallesEmpaque: Array<{
    ID_INV_PROCESADO: string;
    KG_EMPACADOS: number;
  }>
): { newDb: AgroControlDatabase; empaque: Empaque } {
  if (detallesEmpaque.length === 0) {
    throw new Error('Debe agregar al menos una línea de empaque.');
  }

  // Validate: all batches must belong to the same client, have KG_DISPONIBLE > 0, and not exceed available
  const nowIso = new Date().toISOString();
  const idEmpaque = crypto.randomUUID();

  // Create copies of inventories to update
  const invProcesadoMap = new Map(db.INVENTARIO_PROCESADO.map((item) => [item.ID_INV_PROCESADO, { ...item }]));
  const newDetallesEmpaque: DetalleEmpaque[] = [];
  const newInventariosTerminados: InventarioTerminado[] = [];
  const newKardexMovimientos: KardexTerminado[] = [];

  // Validate: KG_EMPACADOS > KG_DISPONIBLE de INVENTARIO_PROCESADO
  const totalByInv = new Map<string, number>();
  for (const item of detallesEmpaque) {
    const kg = Number(item.KG_EMPACADOS);
    if (kg <= 0) {
      throw new Error('Los kg a empacar deben ser mayores a 0.');
    }
    totalByInv.set(item.ID_INV_PROCESADO, (totalByInv.get(item.ID_INV_PROCESADO) || 0) + kg);
  }

  for (const [idInv, totalToPack] of totalByInv.entries()) {
    const inv = invProcesadoMap.get(idInv);
    if (!inv) {
      throw new Error(`Inventario procesado ${idInv} no encontrado.`);
    }
    if (totalToPack > inv.KG_DISPONIBLE) {
      throw new Error(
        `Guardado bloqueado: KG_EMPACADOS (${totalToPack} kg) > KG_DISPONIBLE (${inv.KG_DISPONIBLE} kg) de INVENTARIO_PROCESADO para el lote ${inv.LOTE}.`
      );
    }
  }

  for (const item of detallesEmpaque) {
    const inv = invProcesadoMap.get(item.ID_INV_PROCESADO);
    if (!inv) {
      throw new Error(`Inventario procesado ${item.ID_INV_PROCESADO} no encontrado.`);
    }

    if (inv.CLIENTE !== empaqueData.CLIENTE) {
      throw new Error(`El lote ${inv.LOTE} pertenece a ${inv.CLIENTE}, no al cliente seleccionado (${empaqueData.CLIENTE}).`);
    }

    const kgToPack = Number(item.KG_EMPACADOS);
    if (kgToPack <= 0) {
      throw new Error('Los kg a empacar deben ser mayores a 0.');
    }

    if (kgToPack > inv.KG_DISPONIBLE) {
      throw new Error(`Sobreconsumo bloqueado: No se pueden empacar ${kgToPack} kg del lote ${inv.LOTE}. Disponible: ${inv.KG_DISPONIBLE} kg.`);
    }

    const idDetEmpaque = crypto.randomUUID();
    newDetallesEmpaque.push({
      ID_DET_EMPAQUE: idDetEmpaque,
      ID_EMPAQUE: idEmpaque,
      ID_INV_PROCESADO: item.ID_INV_PROCESADO,
      KG_EMPACADOS: kgToPack,
    });

    // Update INVENTARIO_PROCESADO
    inv.KG_EMPACADOS = Number((inv.KG_EMPACADOS + kgToPack).toFixed(2));
    inv.KG_DISPONIBLE = Number((inv.KG_ENTRADA - inv.KG_EMPACADOS).toFixed(2));
    inv.ULT_ACTUALIZACION = nowIso;

    // Generate INVENTARIO_TERMINADO
    const idInvTerminado = crypto.randomUUID();
    newInventariosTerminados.push({
      ID_INV_TERMINADO: idInvTerminado,
      ID_DET_EMPAQUE: idDetEmpaque,
      CLIENTE: inv.CLIENTE,
      PRODUCTO: inv.PRODUCTO,
      LOTE: inv.LOTE,
      KG_ENTRADA: kgToPack,
      KG_EMBARCADOS: 0,
      KG_DISPONIBLE: kgToPack,
      ULT_ACTUALIZACION: nowIso,
    });

    // Generate KARDEX_TERMINADO: Entrada Empaque
    newKardexMovimientos.push({
      ID_MOVIMIENTO: crypto.randomUUID(),
      FECHA_HORA: nowIso,
      ID_INV_TERMINADO: idInvTerminado,
      TIPO: 'Entrada Empaque',
      REFERENCIA: idEmpaque,
      ENTRADA: kgToPack,
      SALIDA: 0,
    });
  }

  const newEmpaque: Empaque = {
    ID_EMPAQUE: idEmpaque,
    FECHA: empaqueData.FECHA,
    CLIENTE: empaqueData.CLIENTE,
    RESPONSABLE: empaqueData.RESPONSABLE.trim(),
    ESTADO: 'Empacado',
  };

  const updatedInvProcesado = Array.from(invProcesadoMap.values());

  const updatedDb: AgroControlDatabase = {
    ...db,
    EMPAQUE: [newEmpaque, ...db.EMPAQUE],
    DETALLE_EMPAQUE: [...newDetallesEmpaque, ...db.DETALLE_EMPAQUE],
    INVENTARIO_PROCESADO: updatedInvProcesado,
    INVENTARIO_TERMINADO: [...newInventariosTerminados, ...db.INVENTARIO_TERMINADO],
    KARDEX_TERMINADO: [...newKardexMovimientos, ...db.KARDEX_TERMINADO],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, empaque: newEmpaque };
}

export function addEmbarque(
  db: AgroControlDatabase,
  embarqueData: {
    FECHA: string;
    CLIENTE: string;
  },
  detallesEmbarque: Array<{
    ID_INV_TERMINADO: string;
    KG_EMBARCADOS: number;
  }>
): { newDb: AgroControlDatabase; embarque: Embarque } {
  if (detallesEmbarque.length === 0) {
    throw new Error('Debe agregar al menos una línea de embarque.');
  }

  const nowIso = new Date().toISOString();
  const idEmbarque = crypto.randomUUID();

  const invTerminadoMap = new Map(db.INVENTARIO_TERMINADO.map((item) => [item.ID_INV_TERMINADO, { ...item }]));
  const newDetallesEmbarque: DetalleEmbarque[] = [];
  const newKardexMovimientos: KardexTerminado[] = [];

  // Validate: KG_EMBARCADOS > KG_DISPONIBLE de INVENTARIO_TERMINADO
  const totalByInv = new Map<string, number>();
  for (const item of detallesEmbarque) {
    const kg = Number(item.KG_EMBARCADOS);
    if (kg <= 0) {
      throw new Error('Los kg a embarcar deben ser mayores a 0.');
    }
    totalByInv.set(item.ID_INV_TERMINADO, (totalByInv.get(item.ID_INV_TERMINADO) || 0) + kg);
  }

  for (const [idInv, totalToShip] of totalByInv.entries()) {
    const inv = invTerminadoMap.get(idInv);
    if (!inv) {
      throw new Error(`Inventario terminado ${idInv} no encontrado.`);
    }
    if (totalToShip > inv.KG_DISPONIBLE) {
      throw new Error(
        `Guardado bloqueado: KG_EMBARCADOS (${totalToShip} kg) > KG_DISPONIBLE (${inv.KG_DISPONIBLE} kg) de INVENTARIO_TERMINADO para el lote ${inv.LOTE}.`
      );
    }
  }

  for (const item of detallesEmbarque) {
    const inv = invTerminadoMap.get(item.ID_INV_TERMINADO);
    if (!inv) {
      throw new Error(`Inventario terminado ${item.ID_INV_TERMINADO} no encontrado.`);
    }

    if (inv.CLIENTE !== embarqueData.CLIENTE) {
      throw new Error(`El lote ${inv.LOTE} pertenece a ${inv.CLIENTE}, no al cliente ${embarqueData.CLIENTE}.`);
    }

    const kgToShip = Number(item.KG_EMBARCADOS);
    if (kgToShip <= 0) {
      throw new Error('Los kg a embarcar deben ser mayores a 0.');
    }

    if (kgToShip > inv.KG_DISPONIBLE) {
      throw new Error(`Sobreconsumo bloqueado: No se pueden embarcar ${kgToShip} kg del lote ${inv.LOTE}. Disponible: ${inv.KG_DISPONIBLE} kg.`);
    }

    const idDetEmbarque = crypto.randomUUID();
    newDetallesEmbarque.push({
      ID_DET_EMBARQUE: idDetEmbarque,
      ID_EMBARQUE: idEmbarque,
      ID_INV_TERMINADO: item.ID_INV_TERMINADO,
      KG_EMBARCADOS: kgToShip,
    });

    // Update INVENTARIO_TERMINADO
    inv.KG_EMBARCADOS = Number((inv.KG_EMBARCADOS + kgToShip).toFixed(2));
    inv.KG_DISPONIBLE = Number((inv.KG_ENTRADA - inv.KG_EMBARCADOS).toFixed(2));
    inv.ULT_ACTUALIZACION = nowIso;

    // Generate KARDEX_TERMINADO: Salida Embarque
    newKardexMovimientos.push({
      ID_MOVIMIENTO: crypto.randomUUID(),
      FECHA_HORA: nowIso,
      ID_INV_TERMINADO: inv.ID_INV_TERMINADO,
      TIPO: 'Salida Embarque',
      REFERENCIA: idEmbarque,
      ENTRADA: 0,
      SALIDA: kgToShip,
    });
  }

  const newEmbarque: Embarque = {
    ID_EMBARQUE: idEmbarque,
    FECHA: embarqueData.FECHA,
    CLIENTE: embarqueData.CLIENTE,
    ESTADO: 'Embarcado',
  };

  const updatedInvTerminado = Array.from(invTerminadoMap.values());

  const updatedDb: AgroControlDatabase = {
    ...db,
    EMBARQUES: [newEmbarque, ...db.EMBARQUES],
    DETALLE_EMBARQUE: [...newDetallesEmbarque, ...db.DETALLE_EMBARQUE],
    INVENTARIO_TERMINADO: updatedInvTerminado,
    KARDEX_TERMINADO: [...newKardexMovimientos, ...db.KARDEX_TERMINADO],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, embarque: newEmbarque };
}

export function addExportacion(
  db: AgroControlDatabase,
  exportacionData: {
    FECHA: string;
    ID_DET_EMBARQUE: string;
    KG_EXPORTADOS: number;
  }
): { newDb: AgroControlDatabase; exportacion: Exportacion } {
  const detEmbarque = db.DETALLE_EMBARQUE.find((d) => d.ID_DET_EMBARQUE === exportacionData.ID_DET_EMBARQUE);
  if (!detEmbarque) {
    throw new Error('Detalle de embarque no encontrado.');
  }

  const idExportacion = crypto.randomUUID();
  const newExportacion: Exportacion = {
    ID_EXPORTACION: idExportacion,
    FECHA: exportacionData.FECHA,
    ID_DET_EMBARQUE: exportacionData.ID_DET_EMBARQUE,
    KG_EXPORTADOS: Number(exportacionData.KG_EXPORTADOS),
  };

  // Rule: "Exportación no modifica inventario."
  const updatedDb: AgroControlDatabase = {
    ...db,
    EXPORTACIONES: [newExportacion, ...db.EXPORTACIONES],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, exportacion: newExportacion };
}

export function addFacturacion(
  db: AgroControlDatabase,
  facturaData: {
    ID_EMBARQUE: string;
    N_FACTURA: string;
    FECHA: string;
    KG_COBRADOS: number;
    PRECIO_KG?: number;
    ESTADO?: 'Emitida' | 'Anulada';
    TIPO_FACTURA?: 'FINCA_PRADOS' | 'PRADOS_EQUINOCCIO';
  }
): { newDb: AgroControlDatabase; factura: Facturacion } {
  const numKgCobrados = Number(facturaData.KG_COBRADOS);
  if (numKgCobrados <= 0) {
    throw new Error('Los KG facturados deben ser mayores a 0.');
  }

  // Regla 6: Finca -> Prados
  // La suma acumulada de KG facturados para una referencia nunca puede superar los KG_TOTAL de DETALLE_GUIA.
  if (facturaData.TIPO_FACTURA === 'FINCA_PRADOS') {
    const detalle = db.DETALLE_GUIA.find(
      (d) => d.ID_DETALLE === facturaData.ID_EMBARQUE || d.ID_GUIA === facturaData.ID_EMBARQUE
    );
    if (detalle) {
      const kgFisicos = detalle.KG_TOTAL;
      const yaFacturados = db.FACTURACION
        .filter(
          (f) =>
            f.ESTADO === 'Emitida' &&
            (f.ID_EMBARQUE === detalle.ID_DETALLE || f.ID_EMBARQUE === detalle.ID_GUIA)
        )
        .reduce((sum, f) => sum + f.KG_COBRADOS, 0);

      if (yaFacturados + numKgCobrados > kgFisicos) {
        throw new Error(
          `Guardado bloqueado: La suma acumulada de KG facturados (${(yaFacturados + numKgCobrados).toFixed(2)} kg) supera los KG_TOTAL de DETALLE_GUIA (${kgFisicos} kg). Máximo pendiente: ${Math.max(0, kgFisicos - yaFacturados).toFixed(2)} kg.`
        );
      }
    }
  }

  // Regla 7: Prados -> Equinoccio
  // La referencia debe ser EXPORTACION. La suma acumulada de KG facturados nunca puede superar KG_EXPORTADOS.
  if (facturaData.TIPO_FACTURA === 'PRADOS_EQUINOCCIO') {
    const exp = db.EXPORTACIONES.find(
      (e) => e.ID_EXPORTACION === facturaData.ID_EMBARQUE || e.ID_DET_EMBARQUE === facturaData.ID_EMBARQUE
    );
    if (exp) {
      const kgExportados = exp.KG_EXPORTADOS;
      const yaFacturados = db.FACTURACION
        .filter(
          (f) =>
            f.ESTADO === 'Emitida' &&
            (f.ID_EMBARQUE === exp.ID_EXPORTACION || f.ID_EMBARQUE === exp.ID_DET_EMBARQUE)
        )
        .reduce((sum, f) => sum + f.KG_COBRADOS, 0);

      if (yaFacturados + numKgCobrados > kgExportados) {
        throw new Error(
          `Guardado bloqueado: La suma acumulada de KG facturados (${(yaFacturados + numKgCobrados).toFixed(2)} kg) supera los KG_EXPORTADOS (${kgExportados} kg). Máximo pendiente: ${Math.max(0, kgExportados - yaFacturados).toFixed(2)} kg.`
        );
      }
    }
  }

  const idFacturacion = crypto.randomUUID();
  const numPrecioKg = Number(facturaData.PRECIO_KG || 0);
  const total = Math.round(numKgCobrados * numPrecioKg * 100) / 100;

  const newFactura: Facturacion = {
    ID_FACTURACION: idFacturacion,
    ID_EMBARQUE: facturaData.ID_EMBARQUE,
    N_FACTURA: facturaData.N_FACTURA.trim(),
    FECHA: facturaData.FECHA,
    KG_COBRADOS: numKgCobrados,
    PRECIO_KG: numPrecioKg,
    TOTAL: total,
    ESTADO: facturaData.ESTADO || 'Emitida',
    TIPO_FACTURA: facturaData.TIPO_FACTURA,
  };

  // Rule: "Facturación no modifica inventario."
  const updatedDb: AgroControlDatabase = {
    ...db,
    FACTURACION: [newFactura, ...db.FACTURACION],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, factura: newFactura };
}

// ----------------------------------------------------
// 17. LOTES (MAESTRO DE LOTES POR FINCA)
// ----------------------------------------------------
export function addLote(
  db: AgroControlDatabase,
  loteData: {
    FINCA: 'Terra Prime' | 'Prados Andinos' | 'Jardines del Molino';
    CODIGO_LOTE: string;
    PRODUCTO: string;
    ACTIVO?: boolean;
  }
): { newDb: AgroControlDatabase; lote: LoteMaestro } {
  const newLote: LoteMaestro = {
    ID_LOTE: crypto.randomUUID(),
    FINCA: loteData.FINCA,
    CODIGO_LOTE: loteData.CODIGO_LOTE.trim(),
    PRODUCTO: loteData.PRODUCTO.trim(),
    ACTIVO: loteData.ACTIVO !== undefined ? loteData.ACTIVO : true,
  };

  const updatedDb: AgroControlDatabase = {
    ...db,
    LOTES: [newLote, ...(db.LOTES || [])],
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, lote: newLote };
}

export function updateLote(
  db: AgroControlDatabase,
  idLote: string,
  updates: Partial<Pick<LoteMaestro, 'PRODUCTO' | 'ACTIVO' | 'CODIGO_LOTE' | 'FINCA'>>
): { newDb: AgroControlDatabase; lote: LoteMaestro } {
  const lotes = db.LOTES || [];
  const idx = lotes.findIndex((l) => l.ID_LOTE === idLote);
  if (idx === -1) {
    throw new Error('Lote no encontrado.');
  }

  const updatedLote: LoteMaestro = {
    ...lotes[idx],
    ...updates,
  };

  const updatedLotes = [...lotes];
  updatedLotes[idx] = updatedLote;

  const updatedDb: AgroControlDatabase = {
    ...db,
    LOTES: updatedLotes,
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, lote: updatedLote };
}

export function toggleLoteActivo(
  db: AgroControlDatabase,
  idLote: string
): { newDb: AgroControlDatabase; lote: LoteMaestro } {
  const lotes = db.LOTES || [];
  const idx = lotes.findIndex((l) => l.ID_LOTE === idLote);
  if (idx === -1) {
    throw new Error('Lote no encontrado.');
  }

  const updatedLote: LoteMaestro = {
    ...lotes[idx],
    ACTIVO: !lotes[idx].ACTIVO,
  };

  const updatedLotes = [...lotes];
  updatedLotes[idx] = updatedLote;

  const updatedDb: AgroControlDatabase = {
    ...db,
    LOTES: updatedLotes,
  };

  saveDatabase(updatedDb);
  return { newDb: updatedDb, lote: updatedLote };
}

