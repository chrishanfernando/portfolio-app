import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, inArray } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helpers';
import { resolveProfileId } from '@/lib/profile';
import { calculateHoldings } from '@/lib/calculations';
import {
  computeWeightedMerBps,
  buildDragProjection,
  aggregateBrokerage,
} from '@/lib/fees';

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const profileId = await resolveProfileId(request, user.id);
  if (profileId instanceof NextResponse) return profileId;

  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.id, profileId));
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const holdings = await calculateHoldings(profileId);
  const totalValue = holdings.reduce((s, h) => s + h.marketValueAud, 0);

  const weightedMerBps = computeWeightedMerBps(
    holdings.map((h) => ({ marketValueAud: h.marketValueAud, merBps: h.merBps })),
  );

  // Cost AUD per holding when MER known; null otherwise.
  const holdingsOut = holdings.map((h) => ({
    assetId: h.assetId,
    ticker: h.displayTicker,
    marketValueAud: h.marketValueAud,
    merBps: h.merBps,
    annualCostAud:
      h.merBps == null ? null : Math.round((h.marketValueAud * h.merBps) / 10000),
  }));

  const projectedAnnualMerAud =
    weightedMerBps == null
      ? null
      : Math.round(
          // Only count value whose MER is known (consistent with weightedMerBps domain).
          holdings.reduce((s, h) => (h.merBps == null ? s : s + h.marketValueAud), 0) *
            (weightedMerBps / 10000),
        );

  // Brokerage aggregation across all transactions for this profile.
  const profileAssetRows = await db
    .select({ id: schema.assets.id })
    .from(schema.assets)
    .where(eq(schema.assets.profileId, profileId));
  const assetIds = profileAssetRows.map((a) => a.id);

  let lifetimeBrokerageAud = 0;
  let unknownBrokerageCount = 0;
  if (assetIds.length > 0) {
    const txs = await db
      .select({ feeAud: schema.transactions.feeAud })
      .from(schema.transactions)
      .where(inArray(schema.transactions.assetId, assetIds));
    const agg = aggregateBrokerage(txs);
    lifetimeBrokerageAud = agg.lifetimeBrokerageAud;
    unknownBrokerageCount = agg.unknownBrokerageCount;
  }

  const advisorBps = profile.comparisonAdvisorFeeBps ?? 66;
  const comparisonAdvisor = {
    name: profile.comparisonAdvisorName ?? 'Stockspot',
    feeBps: advisorBps,
    projectedAnnualAud: Math.round((totalValue * advisorBps) / 10000),
  };

  const dragProjection = buildDragProjection(totalValue, weightedMerBps);

  return NextResponse.json({
    weightedMerBps,
    projectedAnnualMerAud,
    totalValueAud: totalValue,
    holdings: holdingsOut,
    lifetimeBrokerageAud,
    unknownBrokerageCount,
    comparisonAdvisor,
    dragProjection,
  });
}
