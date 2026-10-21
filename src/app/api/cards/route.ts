import { NextResponse } from 'next/server';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';

// `export const dynamic` is not allowed with `cacheComponents: true`.
// Awaiting connection() opts this handler out of build-time prerendering.
export async function GET() {
  await connection();
  try {
    const cards = await prisma.contextCard.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Return the raw array, NOT wrapped in { cards: ... }
    return NextResponse.json(cards); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 });
  }
}