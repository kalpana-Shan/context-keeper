"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { ContextCard, ContextCardType } from "./ContextCard";

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreDialog({ open, onOpenChange }: RestoreDialogProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCard, setResultCard] = useState<ContextCardType | null>(null);

  const handleRestore = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResultCard(null);

    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to restore context");
      }

      // Ensure we are passing exactly the card object
      setResultCard(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuery("");
      setError(null);
      setResultCard(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-panel border-white/50 shadow-2xl rounded-2xl sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Search className="w-5 h-5 text-purple-600" />
            Restore Context
          </DialogTitle>
          <DialogDescription>
            Ask what you were working on. Wispr Flow will transcribe your question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., What was I doing on the auth bug?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRestore();
              }}
              className="flex-1 bg-white/60 backdrop-blur-md"
              autoFocus
            />
            <Button 
              onClick={handleRestore} 
              disabled={isLoading || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {resultCard && (
            <div className="mt-6">
              <p className="text-xs font-semibold text-purple-600/70 uppercase tracking-wider mb-3">
                Best Match Found
              </p>
              <ContextCard card={resultCard} highlightNextAction={true} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}