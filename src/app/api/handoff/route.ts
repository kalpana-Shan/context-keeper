import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBriefing } from "@/lib/llm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: "cardId is required" }, { status: 400 });
    }

    const card = await prisma.contextCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Generate the AI briefing
    const briefing = await generateBriefing(card);

    // Create a unique 12-character slug (e.g., 'aB3xY9zK2mNq')
    const slug = nanoid(12);

    const handoff = await prisma.handoff.create({
      data: {
        slug,
        cardId,
        briefing,
      },
    });

    // Return the full URL for the frontend to open
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/handoff/${slug}`;
    
    return NextResponse.json({ handoff, url });
  } catch (error) {
    console.error("Handoff error:", error);
    return NextResponse.json({ error: "Failed to generate handoff" }, { status: 500 });
  }
}