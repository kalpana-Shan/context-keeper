import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { cardId, briefing } = await req.json();

    if (!cardId || !briefing) {
      return NextResponse.json({ error: 'cardId and briefing are required' }, { status: 400 });
    }

    const handoff = await prisma.handoff.create({
      data: {
        id: nanoid(),
        cardId,
        briefing,
        slug: nanoid(8), // short unique slug for URL
      },
    });

    return NextResponse.json(handoff, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Handoff creation failed' }, { status: 500 });
  }
}