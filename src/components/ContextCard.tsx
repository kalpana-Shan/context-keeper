"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FolderKanban,
  CheckCircle2,
  FlaskConical,
  ArrowRight,
  AlertTriangle,
  Clock,
  Trash2,
  MessageSquare,
  Share2,
  Bot,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export interface ContextCardType {
  id: string;
  project: string;
  status: string;
  tried: string | null;
  nextAction: string;
  blockers: string | null;
  tags: string;
  assumptions?: string | null;
  createdAt: string;
  handoffs?: any[];
}

interface ContextCardProps {
  card: ContextCardType;
  onDelete?: (id: string) => void;
  onCardUpdated?: (card: ContextCardType) => void;
  highlightNextAction?: boolean;
}

export function ContextCard({
  card,
  onDelete,
  onCardUpdated,
  highlightNextAction = false,
}: ContextCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const tagList = card.tags
    ? card.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  let assumptionList: string[] = [];
  if (card.assumptions) {
    try {
      const parsed = JSON.parse(card.assumptions);
      if (Array.isArray(parsed)) {
        assumptionList = parsed.filter(
          (a): a is string => typeof a === "string" && a.trim() !== ""
        );
      }
    } catch {
      assumptionList = [];
    }
  }

  const isOutdated =
    Date.now() - new Date(card.createdAt).getTime() > 24 * 60 * 60 * 1000;

  const handleUpdateAssumption = async (index: number) => {
    if (!editValue.trim()) return;
    const toastId = toast.loading("Updating context...");
    try {
      const res = await fetch("/api/patch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, assumptionIndex: index, newValue: editValue }),
      });
      const data = await res.json();
      if (res.ok && data.card) {
        toast.success("Context updated!", { id: toastId });
        setEditingIndex(null);
        if (onCardUpdated) onCardUpdated(data.card);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handleCopySlack = async () => {
    try {
      const res = await fetch("/api/handoff/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });
      const data = await res.json();
      if (data.slackText) {
        await navigator.clipboard.writeText(data.slackText);
        // Sonner API: toast.success
        toast.success("Copied!", {
          description: "Slack message copied to clipboard.",
        });
      } else {
        throw new Error("No Slack text returned");
      }
    } catch {
      // Sonner API: toast.error
      toast.error("Error", {
        description: "Failed to copy.",
      });
    }
  };

   const handleCopyAIPrompt = async () => {
    const prompt = `I need to continue working on a task. Here is my current context:
- Project/Task: ${card.project}
- Current Status: ${card.status}
- What I've Tried: ${card.tried || "N/A"}
- Next Action Needed: ${card.nextAction}
- Blockers: ${card.blockers || "None"}

Please review this context and help me execute the next action. Tell me exactly what to do first.`;
    
    await navigator.clipboard.writeText(prompt);
    toast.success("AI Prompt copied!", {
      description: "Paste this into Cursor, Claude, or ChatGPT to resume work.",
    });
  };

  const handleHandoff = async () => {
    const toastId = toast.loading("Generating briefing...");
    try {
      const res = await fetch("/api/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Handoff created!", { id: toastId });
        if (data.handoff) {
          onCardUpdated?.({ ...card, handoffs: [...(card.handoffs ?? []), data.handoff] });
        }
      } else {
        throw new Error(data.error || "Failed to generate handoff");
      }
    } catch (err) {
      toast.error("Error creating handoff", { id: toastId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -180, x: -50, y: 50 }}
      animate={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, rotate: 180, x: 50, y: -50 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="w-full glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(180,83,9,0.15)] h-full border-t border-l border-white/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="truncate">{card.project}</span>
              </CardTitle>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(card.createdAt), {
                  addSuffix: true,
                })}
                {isOutdated && (
                  <span className="ml-1 text-amber-600 font-medium">
                    (May be outdated)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap justify-end max-w-[40%]">
              {tagList.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-amber-50/50 text-amber-800 border border-amber-100/50 shadow-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </span>
              <p className="text-sm">{card.status}</p>
            </div>
          </div>

          {assumptionList.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
              <span className="text-xs font-medium text-amber-800 uppercase tracking-wide">
                Assumptions to Verify
              </span>
              <div className="mt-1.5 space-y-1.5">
                {assumptionList.map((assumption, i) => (
                  <div key={`${assumption}-${i}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs bg-white/70 text-stone-700 border border-amber-200 rounded-full px-2.5 py-1">
                        {assumption}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingIndex(i);
                          setEditValue(assumption);
                        }}
                        className="shrink-0 text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
                      >
                        ✎ Changed
                      </button>
                    </div>
                    {editingIndex === i && (
                      <div className="mt-1.5">
                        <Input
                          autoFocus
                          value={editValue}
                          placeholder="What's the new situation? Press Enter to update"
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleUpdateAssumption(i);
                            } else if (e.key === "Escape") {
                              setEditingIndex(null);
                            }
                          }}
                          className="h-8 text-xs bg-white/80 border-amber-200 focus-visible:ring-amber-600"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {card.tried && (
            <div className="flex items-start gap-2">
              <FlaskConical className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tried
                </span>
                <p className="text-sm">{card.tried}</p>
              </div>
            </div>
          )}

          <div
            className={`flex items-start gap-2 p-2 rounded-md ${
              highlightNextAction
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-amber-50/50 border border-amber-100/50"
            }`}
          >
            <ArrowRight className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Next Action
              </span>
              <p className="text-sm font-medium">{card.nextAction}</p>
            </div>
          </div>

          {card.blockers && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Blockers
                </span>
                <p className="text-sm text-red-600">{card.blockers}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHandoff}
              className="bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-stone-900 text-white hover:text-white border-transparent transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Share2 className="w-3 h-3 mr-1" /> Hand Off
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySlack}
              className="transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3 h-3 mr-1" /> Slack
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyAIPrompt} 
              className="bg-stone-100/60 hover:bg-stone-200/60 text-stone-700 border-stone-300/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Bot className="w-3 h-3 mr-1" /> AI Prompt
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(card.id)}
                className="text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}