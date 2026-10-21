import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchContext } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // 1. Get all cards to give the LLM context
    const cards = await prisma.contextCard.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (cards.length === 0) {
      return NextResponse.json({ message: 'No cards found in database' }, { status: 404 });
    }

    // 2. Ask LLM which card matches the query
    const matchedId = await matchContext(query, cards);

    if (matchedId === 'NONE') {
      return NextResponse.json({ message: 'No matching context found' }, { status: 404 });
    }

    // 3. Return the matched card
    const matchedCard = cards.find((c) => c.id === matchedId);
    return NextResponse.json(matchedCard || { message: 'Card not found' });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}