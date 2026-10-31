import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { cardId, assumptionIndex, newValue } = await req.json();

    if (!cardId || typeof newValue !== "string" || !newValue.trim()) {
      return NextResponse.json(
        { error: "cardId and newValue are required" },
        { status: 400 }
      );
    }

    const card = await prisma.contextCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Parse the stored assumptions array (default to [] if it fails)
    let assumptions: string[] = [];
    try {
      const parsed = JSON.parse(card.assumptions || "[]");
      if (Array.isArray(parsed)) assumptions = parsed;
    } catch {
      assumptions = [];
    }

    if (
      !Number.isInteger(assumptionIndex) ||
      assumptionIndex < 0 ||
      assumptionIndex >= assumptions.length
    ) {
      return NextResponse.json(
        { error: "Invalid assumptionIndex" },
        { status: 400 }
      );
    }

    assumptions[assumptionIndex] = newValue.trim();

    // Simulate a real-time AI adjustment without hitting rate limits.
    // Strip a previous "[Updated: ...] - " prefix so repeated edits don't stack.
    const baseNextAction = card.nextAction.replace(/^\[Updated: .*?\] - /, "");

    const updatedCard = await prisma.contextCard.update({
      where: { id: cardId },
      data: {
        assumptions: JSON.stringify(assumptions),
        nextAction: `[Updated: ${newValue.trim()}] - ${baseNextAction}`,
      },
      include: { handoffs: true },
    });

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Patch error:", error);
    return NextResponse.json(
      { error: "Failed to update context" },
      { status: 500 }
    );
  }
}
