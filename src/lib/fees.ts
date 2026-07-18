// Fee transparency helpers. MER (management expense ratio) is stored in basis
// points on `assets.mer_bps`; brokerage in AUD on `transactions.fee_aud`.

// Issuer-published MERs at authoring time. Treated as a starting-point seed —
// users can override per asset in the holdings UI.
export const STATIC_MER_BPS: Record<string, number> = {
  // Vanguard AU
  VAS: 7,
  VGS: 18,
  VAF: 10,
  VIF: 20,
  VGE: 48,
  VAP: 23,
  VGAD: 20,
  VTS: 3,
  VEU: 8,
  // BetaShares
  A200: 4,
  NDQ: 48,
  QUS: 14,
  // iShares
  IVV: 4,
  IOO: 9,
  IAA: 44,
  // State Street
  STW: 5,
  // Gold ETPs
  PMGOLD: 15,
  GOLD: 40,
};

function stripKnownSuffix(symbol: string): string {
  const upper = symbol.toUpperCase();
  for (const suffix of ['.AX', '.US', '.NYSE', '.NASDAQ']) {
    if (upper.endsWith(suffix)) return upper.slice(0, -suffix.length);
  }
  return upper;
}

export function lookupMerBps(symbolOrYahoo: string | null | undefined): number | null {
  if (!symbolOrYahoo) return null;
  const key = stripKnownSuffix(symbolOrYahoo.trim());
  return STATIC_MER_BPS[key] ?? null;
}

export interface HoldingForMer {
  marketValueAud: number;
  merBps: number | null;
}

// Market-value-weighted average MER in whole basis points. Holdings with null
// merBps are excluded from both numerator and denominator (unknown != zero).
// Returns null when no holding has a known MER.
export function computeWeightedMerBps(holdings: HoldingForMer[]): number | null {
  let numer = 0;
  let denom = 0;
  for (const h of holdings) {
    if (h.merBps == null) continue;
    numer += h.marketValueAud * h.merBps;
    denom += h.marketValueAud;
  }
  if (denom === 0) return null;
  return Math.round(numer / denom);
}

export interface DragProjectionEntry {
  years: number;
  withFeesAud: number;
  withoutFeesAud: number;
  lostAud: number;
}

// Directional drag projection: assumes constant balance growing at gross return r
// (default 7% nominal), no contributions/withdrawals/tax. Returns [] when MER is
// unknown — UI shouldn't show a misleading "$0 lost" line.
export function buildDragProjection(
  balanceAud: number,
  weightedMerBps: number | null,
  r = 0.07,
): DragProjectionEntry[] {
  if (weightedMerBps == null) return [];
  const f = weightedMerBps / 10000;
  return [10, 20, 30].map((years) => {
    const withFeesAud = Math.round(balanceAud * Math.pow(1 + r - f, years));
    const withoutFeesAud = Math.round(balanceAud * Math.pow(1 + r, years));
    return {
      years,
      withFeesAud,
      withoutFeesAud,
      lostAud: withoutFeesAud - withFeesAud,
    };
  });
}

export interface TransactionForBrokerage {
  feeAud: number | null;
}

export function aggregateBrokerage(transactions: TransactionForBrokerage[]): {
  lifetimeBrokerageAud: number;
  unknownBrokerageCount: number;
} {
  let lifetime = 0;
  let unknown = 0;
  for (const t of transactions) {
    if (t.feeAud == null) unknown += 1;
    else lifetime += t.feeAud;
  }
  return {
    lifetimeBrokerageAud: Math.round(lifetime * 100) / 100,
    unknownBrokerageCount: unknown,
  };
}
