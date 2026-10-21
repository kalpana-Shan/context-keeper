import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractContext } from '@/lib/llm';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const { rawText } = await req.json();

    if (!rawText) {
      return NextResponse.json({ error: 'rawText is required' }, { status: 400 });
    }

    // 1. Use LLM to extract structured data
    const extracted = await extractContext(rawText);
    console.log("Extracted data:", extracted);

    // 2. Edge case: Reject non-work notes based on the LLM's judgment
    if (!extracted.project || extracted.project.toUpperCase() === "NONE") {
      return NextResponse.json({
        error: 'This note does not look like a work context. Please describe what you are working on.',
      }, { status: 400 });
    }

    // 3. Save to database
    console.log("Saving to DB:", {
      rawText,
      project: extracted.project,
      status: extracted.status,
      tried: extracted.tried,
      nextAction: extracted.nextAction,
      blockers: extracted.blockers,
      tags: extracted.tags,
    });
    const card = await prisma.contextCard.create({
      data: {
        id: nanoid(),
        rawText,
        project: extracted.project || 'Unknown Project',
        status: extracted.status || 'Unknown',
        tried: extracted.tried || null,
        // If the LLM didn't find a next action (vague note), we use a generic placeholder
        nextAction: extracted.nextAction || 'No next action specified',
        blockers: extracted.blockers || null,
        tags: extracted.tags || '',
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save context' },
      { status: 500 }
    );
  }
}