import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helpers';
import { ensureProfile } from '@/lib/profile';
import { ensureBenchmarkAssetExists, fetchHistoricalPrices } from '@/lib/prices';

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  await ensureProfile(user.id);
  const profiles = await db.select().from(schema.profiles).where(eq(schema.profiles.userId, user.id));
  return NextResponse.json(profiles);
}

export async function PATCH(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { id, name, benchmarkSymbol } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const updateSet: Partial<typeof schema.profiles.$inferInsert> = {};
  if (name?.trim()) updateSet.name = name.trim();
  if (benchmarkSymbol?.trim()) updateSet.benchmarkSymbol = benchmarkSymbol.trim().toUpperCase();

  if (benchmarkSymbol?.trim()) {
    const symbol = benchmarkSymbol.trim().toUpperCase();
    const assetId = await ensureBenchmarkAssetExists(symbol);
    // Backfill 2 years of prices for the benchmark to ensure history works
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const startDate = twoYearsAgo.toISOString().split('T')[0];
    await fetchHistoricalPrices(assetId, symbol, symbol.endsWith('.AX'), startDate, '1d');
  }

  const result = await db.update(schema.profiles)
    .set(updateSet)
    .where(and(eq(schema.profiles.id, id), eq(schema.profiles.userId, user.id)))
    .returning({ id: schema.profiles.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  const result = await db.insert(schema.profiles).values({
    name: name.trim(),
    createdAt: new Date().toISOString().split('T')[0],
    userId: user.id,
  }).returning();
  return NextResponse.json(result[0]);
}
