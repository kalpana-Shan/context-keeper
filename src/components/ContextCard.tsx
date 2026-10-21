"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  createdAt: string;
}

interface ContextCardProps {
  card: ContextCardType;
  onDelete?: (id: string) => void;
  highlightNextAction?: boolean;
}

export function ContextCard({
  card,
  onDelete,
  highlightNextAction = false,
}: ContextCardProps) {
  const tagList = card.tags
    ? card.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full hover:shadow-lg transition-shadow h-full">
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
              </div>
            </div>
            <div className="flex gap-1 flex-wrap justify-end max-w-[40%]">
              {tagList.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
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

          {card.tried && (
            <div className="flex items-start gap-2">
              <FlaskConical className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
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
              highlightNextAction ? "bg-yellow-50 border border-yellow-200" : ""
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
            <Button variant="outline" size="sm" onClick={handleCopySlack}>
              <MessageSquare className="w-3 h-3 mr-1" /> Copy for Slack
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(card.id)}
                className="text-red-500 hover:text-red-700"
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