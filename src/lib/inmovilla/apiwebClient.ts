/**
 * Cliente TypeScript para la API web de Inmovilla
 *
 * Port directo de apiinmovilla.php / cliente.php
 *
 * Endpoint: https://apiweb.inmovilla.com/apiweb/apiweb.php
 * Autenticación: numagencia + password (sin token adicional)
 *
 * Uso:
 *   const client = new InmovillaApiClient({ numagencia: '2', password: '82ku9xz2aw3', idioma: 1 });
 *   const result = await client.query()
 *     .paginacion(1, 50, 'ascensor=1', 'precioinmo asc')
 *     .fetch();
 *   const { paginacion } = result;
 */

const API_URL = 'https://apiweb.inmovilla.com/apiweb/apiweb.php';

// ─── Tipos de respuesta ───────────────────────────────────────────────────────

export interface PaginacionItem {
  cod_ofer:     number;
  ref:          string;
  keyacci:      number;   // 1=Venta, 2=Alquiler, 3=Traspaso
  precioinmo:   number;
  outlet:       number;
  precioalq:    number;
  tipomensual:  string;
  numfotos:     number;
  nbtipo:       string;
  ciudad:       string;
  zona:         string;
  numagencia:   number;
  m_parcela:    number;
  m_uties:      number;
  m_cons:       number;
  m_terraza:    number;
  banyos:       number;
  aseos:        number;
  habdobles:    number;
  habitaciones: number;
  total_hab:    number;
  distmar:      number;
  ascensor:     number;
  aire_con:     number;
  parking:      number;
  piscina_com:  number;
  piscina_prop: number;
  diafano:      number;
  todoext:      number;
  foto:         string;
  calefaccion:  number;
  fechaact:     string;
  [key: string]: unknown;
}

export interface FichaItem {
  cod_ofer:       number;
  ref:            string;
  keyacci:        number;
  precioinmo:     number;
  precioalq:      number;
  numfotos:       number;
  nbtipo:         string;
  ciudad:         string;
  zona:           string;
  numagencia:     number;
  m_cons:         number;
  m_uties:        number;
  m_parcela:      number;
  m_terraza:      number;
  banyos:         number;
  aseos:          number;
  habitaciones:   number;
  habdobles:      number;
  total_hab:      number;
  ascensor:       number;
  aire_con:       number;
  parking:        number;
  piscina_com:    number;
  piscina_prop:   number;
  energialetra:   string;
  energiavalor:   number;
  emisionesletra: string;
  emisionesvalor: number;
  tourvirtual:    number;
  fotos360:       number;
  video:          number;
  [key: string]: unknown;
}

export interface TipoItem      { cod_tipo: number; tipo: string }
export interface CiudadItem    { cod_ciu: number; city: string; provincia: string; codprov: number }
export interface ZonaItem      { cod_zona: number; zone: string }

export interface ApiResponse {
  paginacion?:           { posicion: number; elementos: number; total: number } & Record<number, PaginacionItem>;
  destacados?:           { posicion: number; elementos: number; total: number } & Record<number, PaginacionItem>;
  ficha?:                { posicion: number; elementos: number; total: number } & Record<number, FichaItem>;
  tipos?:                Record<number, TipoItem>;
  ciudades?:             Record<number, CiudadItem>;
  zonas?:                Record<number, ZonaItem>;
  [key: string]:         unknown;
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface ProcesosEntry {
  tipo:          string;
  posinicial:    number;
  numelementos:  number;
  where:         string;
  orden:         string;
}

interface ClientConfig {
  numagencia:    string;
  password:      string;
  idioma?:       number;       // 1=ES, 2=EN, etc. Default: 1
  addnumagencia?: string;      // sufijo del usuario API (ej: '_000_ext'). Default: ''
  domain?:       string;       // dominio para el parámetro elDominio
}

// ─── Query Builder ────────────────────────────────────────────────────────────

export class InmovillaQuery {
  private procesos: ProcesosEntry[] = [];

  constructor(private readonly config: ClientConfig) {}

  /** Lista de tipos de propiedad */
  tipos(posinicial = 1, numelementos = 100, where = '', orden = '') {
    return this._add('tipos', posinicial, numelementos, where, orden);
  }

  /** Lista de provincias */
  provincias(posinicial = 1, numelementos = 100, where = '', orden = '') {
    return this._add('provincias', posinicial, numelementos, where, orden);
  }

  /** Lista de ciudades con propiedades */
  ciudades(posinicial = 1, numelementos = 100, where = '', orden = '') {
    return this._add('ciudades', posinicial, numelementos, where, orden);
  }

  /** Lista de zonas (filtrar por key_loca=X para una ciudad concreta) */
  zonas(posinicial = 1, numelementos = 100, where = '', orden = '') {
    return this._add('zonas', posinicial, numelementos, where, orden);
  }

  /**
   * Lista paginada de propiedades (máx 50 por llamada)
   * @example .paginacion(1, 50, "ascensor=1 AND keyacci=1", "precioinmo asc")
   */
  paginacion(posinicial = 1, numelementos = 50, where = '', orden = '') {
    return this._add('paginacion', posinicial, numelementos, where, orden);
  }

  /** Propiedades destacadas (máx 30) */
  destacados(posinicial = 1, numelementos = 20, where = '', orden = 'precioinmo, precioalq') {
    return this._add('destacados', posinicial, numelementos, where, orden);
  }

  /**
   * Ficha completa de una propiedad
   * @example .ficha("ofertas.cod_ofer=350914")
   */
  ficha(where: string) {
    return this._add('ficha', 1, 1, where, '');
  }

  /** Lista de cod_ofer disponibles (máx 5000) */
  listarDisponibles(posinicial = 1, numelementos = 5000, where = '') {
    return this._add('listar_propiedades_disponibles', posinicial, numelementos, where, '');
  }

  /** Ejecuta la petición y devuelve el JSON de respuesta */
  async fetch(clientIp = '127.0.0.1'): Promise<ApiResponse> {
    const { numagencia, password, idioma = 1, addnumagencia = '', domain = 'localhost' } = this.config;

    // Construir el parámetro texto.
    // Formato: numagencia;password;idioma;tipo;pos;num;where;orden;...
    // Nota: "lostipos" eliminado — el PHP lo trata como tipo de query y corrompe el parsing.
    let texto = `${numagencia}${addnumagencia};${password};${idioma}`;
    for (const p of this.procesos) {
      texto += `;${p.tipo};${p.posinicial};${p.numelementos};${p.where};${p.orden}`;
    }

    const encodedTexto = encodeURIComponent(texto); // equivale a rawurlencode en PHP
    const body = `param=${encodedTexto}&elDominio=${domain}&ia=${clientIp}&json=1`;

    console.log('[Inmovilla] texto →', texto);

    const res = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache:   'no-store',
    });

    if (!res.ok) {
      throw new Error(`Inmovilla API error: ${res.status} ${res.statusText}`);
    }

    const text = await res.text();
    try {
      return JSON.parse(text) as ApiResponse;
    } catch {
      console.error('[Inmovilla] respuesta no-JSON:', text.slice(0, 500));
      throw new Error(`Inmovilla API returned non-JSON: ${text.slice(0, 200)}`);
    }
  }

  private _add(tipo: string, posinicial: number, numelementos: number, where: string, orden: string) {
    this.procesos.push({ tipo, posinicial, numelementos, where, orden });
    return this;
  }
}

// ─── Cliente principal ────────────────────────────────────────────────────────

export class InmovillaApiClient {
  constructor(private readonly config: ClientConfig) {}

  /** Inicia un query builder encadenable */
  query() {
    return new InmovillaQuery(this.config);
  }
}

// ─── Instancia por defecto (usa variables de entorno) ────────────────────────

export const inmovillaClient = new InmovillaApiClient({
  numagencia:    process.env.INMOVILLA_NUMAGENCIA ?? '',
  password:      process.env.INMOVILLA_PASSWORD   ?? '',
  idioma:        Number(process.env.INMOVILLA_IDIOMA ?? '1'),
  addnumagencia: process.env.INMOVILLA_ADD_AGENCIA ?? '',
  domain:        process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'localhost',
});
