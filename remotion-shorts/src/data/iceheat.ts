// ═══════════════════════════════════════════════════════════════════════════
// IceHeat-Datenmodell + Auswertung
// Spiegelt 1:1 das Schema aus index.html (JSON-Export v5) wider.
// ═══════════════════════════════════════════════════════════════════════════

export type ResultCode =
  | '1' | '2' | '3' | '0'            // Platzierungen (3/2/1/0 Pkt)
  | 'D' | 'T' | 'M' | 'R' | 'F' | 'N' | 'W' // Ausschluss-Codes (0 Pkt)
  | null;

export interface Driver {
  id: number;
  nr: string;        // Startnummer
  name: string;
  nation: string;    // Föderationskürzel, z. B. "DMSB", "SVEMO"
  photo: string | null; // Data-URL oder null
}

export interface Heat {
  id: number;
  slots: number[];         // 4 Fahrer-IDs nach Startgatter (Index 0 = Gatter 1)
  results: ResultCode[];   // Ergebnis pro Gatter-Slot
}

export interface IceHeatExport {
  v: number;
  eventName: string;
  eventSub: string;
  drivers: Driver[];
  heats: Heat[];
  schemaSegments?: unknown;
}

// ── Gatter-/Helmfarben (aus index.html) ──────────────────────────────────────
export const GATE_BG = ['#dc2626', '#2563eb', '#f1f5f9', '#eab308'];
export const GATE_FG = ['#ffffff', '#ffffff', '#111111', '#111111'];
export const GATE_LBL = ['Innen', 'Mitte-Innen', 'Mitte-Außen', 'Außen'];
export const GATE_DE = ['Rot', 'Blau', 'Weiß', 'Gelb'];

// ── Nation → Flagge/Kürzel ────────────────────────────────────────────────────
const FMN_NAT: Record<string, string> = {
  SVEMO: 'SWE', SML: 'FIN', KNMV: 'NED', ACCR: 'CZE', DMSB: 'GER', FMI: 'ITA',
  AMF: 'AUT', FMS: 'SUI', FFM: 'FRA', ACU: 'GBR', PZM: 'POL', DMU: 'DEN',
};
const FLAGS: Record<string, string> = {
  // Föderationskürzel
  SVEMO: '🇸🇪', SML: '🇫🇮', KNMV: '🇳🇱', ACCR: '🇨🇿', DMSB: '🇩🇪', FMI: '🇮🇹',
  AMF: '🇦🇹', FMS: '🇨🇭', FFM: '🇫🇷', ACU: '🇬🇧', PZM: '🇵🇱', DMU: '🇩🇰',
  // 3-Buchstaben-Nationskürzel (Fallback)
  SWE: '🇸🇪', FIN: '🇫🇮', NED: '🇳🇱', CZE: '🇨🇿', GER: '🇩🇪', ITA: '🇮🇹',
  AUT: '🇦🇹', SUI: '🇨🇭', FRA: '🇫🇷', GBR: '🇬🇧', POL: '🇵🇱', DEN: '🇩🇰',
};

export function getFlag(n: string): string {
  return FLAGS[n] || FLAGS[FMN_NAT[n]] || '🏁';
}
export function getNat(n: string): string {
  return FMN_NAT[n] || n || '';
}

// ── Punkte-Logik (identisch zu scorePoints() in index.html) ──────────────────
export function scorePoints(v: ResultCode): number | null {
  if (v === null || v === undefined || (v as string) === '' || (v as string) === 'null') {
    return null;
  }
  const s = String(v);
  if (s === '1') return 3;
  if (s === '2') return 2;
  if (s === '3') return 1;
  if (s === '0') return 0;
  return null; // Ausschluss-Codes → keine Punkte
}

export function scoreLabel(v: ResultCode): string {
  const s = String(v);
  if (s === '1') return '1.';
  if (s === '2') return '2.';
  if (s === '3') return '3.';
  if (s === '0') return '4.';
  return s; // Ausschluss-Code (D/T/M/R/F/N/W)
}

// ── Abgeleitete Sichten ──────────────────────────────────────────────────────
export interface HeatLine {
  gate: number;              // 0..3
  driver: Driver | null;
  result: ResultCode;
  points: number | null;
}

export function heatLines(data: IceHeatExport, heat: Heat): HeatLine[] {
  return heat.slots.map((id, i) => {
    const result = (heat.results[i] ?? null) as ResultCode;
    return {
      gate: i,
      driver: data.drivers.find((d) => d.id === id) || null,
      result,
      points: scorePoints(result),
    };
  });
}

/** Hat ein Heat bereits Ergebnisse? → bestimmt "Aufstellung" vs. "Ergebnis". */
export function heatHasResults(heat: Heat): boolean {
  return (heat.results || []).some((r) => r !== null && r !== undefined && String(r) !== 'null' && r !== ('' as unknown));
}

export interface Standing {
  driver: Driver;
  total: number;
  heats: number; // Anzahl gefahrener Heats
}

/** Gesamtwertung: Punkte über alle Heats, absteigend sortiert. */
export function standings(data: IceHeatExport): Standing[] {
  const map = new Map<number, Standing>();
  for (const d of data.drivers) map.set(d.id, {driver: d, total: 0, heats: 0});

  for (const h of data.heats) {
    h.slots.forEach((id, i) => {
      const s = map.get(id);
      if (!s) return;
      s.heats += 1;
      const p = scorePoints((h.results[i] ?? null) as ResultCode);
      if (p !== null) s.total += p;
    });
  }

  return [...map.values()]
    .filter((s) => s.heats > 0)
    .sort((a, b) => b.total - a.total || a.driver.name.localeCompare(b.driver.name));
}
