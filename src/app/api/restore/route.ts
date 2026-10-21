import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchContext } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    // 1. The frontend sends { query: "What was I doing?" }
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 2. Fetch the 20 most recent cards to give the LLM context
    const cards = await prisma.contextCard.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (cards.length === 0) {
      return NextResponse.json({ error: 'No context cards found' }, { status: 404 });
    }

    // 3. Use the LLM to match the query to a specific card
    const matchedId = await matchContext(query, cards);

    if (matchedId === 'NONE') {
      return NextResponse.json({ error: 'No matching context found for that query' }, { status: 404 });
    }

    // 4. Find the full card details and return it
    const card = await prisma.contextCard.findUnique({
      where: { id: matchedId },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore context' }, { status: 500 });
  }
}