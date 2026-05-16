import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/db';
import { eq, and } from 'drizzle-orm';
import { requireUser } from '@/lib/auth-helpers';
import { resolveProfileId } from '@/lib/profile';

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const profileId = await resolveProfileId(request, user.id);
  if (profileId instanceof NextResponse) return profileId;

  const assets = await db.select()
    .from(schema.assets)
    .where(eq(schema.assets.profileId, profileId));

  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const profileId = await resolveProfileId(request, user.id);
  if (profileId instanceof NextResponse) return profileId;

  const body = await request.json();
  const { symbol, name, displayTicker, yahooSymbol, category, platform } = body;

  if (!symbol || !name || !displayTicker || !yahooSymbol || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if asset already exists for this profile
  const existing = await db.select()
    .from(schema.assets)
    .where(and(
      eq(schema.assets.profileId, profileId),
      eq(schema.assets.yahooSymbol, yahooSymbol)
    ))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  const result = await db.insert(schema.assets).values({
    profileId,
    symbol: symbol.toUpperCase(),
    name,
    displayTicker: displayTicker.toUpperCase(),
    yahooSymbol,
    category,
    platform: platform || null,
    isActive: true,
  }).returning();

  return NextResponse.json(result[0]);
}
