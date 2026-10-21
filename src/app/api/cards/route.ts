import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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