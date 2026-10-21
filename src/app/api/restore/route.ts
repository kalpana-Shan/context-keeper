import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBriefing } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const card = await prisma.contextCard.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Generate the AI briefing
    const briefing = await generateBriefing(card);

    return NextResponse.json({ card, briefing });
  } catch (error) {
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}