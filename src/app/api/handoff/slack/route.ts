import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatForSlack } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const { cardId } = await req.json()

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 })
    }

    const card = await prisma.contextCard.findUnique({
      where: { id: cardId }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const slackText = formatForSlack(card)
    return NextResponse.json({ slackText })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to format' }, { status: 500 })
  }
}