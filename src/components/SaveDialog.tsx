"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { ContextCardType } from "./ContextCard";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: ContextCardType) => void;
}

export function SaveDialog({ open, onOpenChange, onSave }: SaveDialogProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && open) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, text]);

  const handleSave = async () => {
    if (wordCount < 5) {
      setError("Note too short. Please provide at least 5 words.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save context");
      }

      // API returns the raw card; tolerate { card } too
      const card = data?.card ?? data;
      if (!card || !card.id) {
        throw new Error("Invalid response from server.");
      }

      onSave(card);
      setText("");
      onOpenChange(false);
      toast.success("Context Saved", {
  description: "Your context card has been successfully created.",
});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Save Context</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Speak naturally. Describe what you are working on, what you have
            tried, and what is next. Wispr Flow will transcribe your voice here.
          </div>
          <Textarea
            placeholder="Press your Wispr hotkey and start speaking... (Ctrl+Enter to save)"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            rows={6}
            className="resize-none"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{wordCount} words</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || wordCount === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" /> Save Context
                  </>
                )}
              </Button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}