import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatForSlack } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    const card = await prisma.contextCard.findUnique({
      where: { id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const slackText = formatForSlack(card);
    return NextResponse.json({ text: slackText });
  } catch (error) {
    return NextResponse.json({ error: 'Slack formatting failed' }, { status: 500 });
  }
}