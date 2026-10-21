"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Plus, Mic, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SaveDialog } from "@/components/SaveDialog";
import { ContextCard, ContextCardType } from "@/components/ContextCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RestoreDialog } from "@/components/RestoreDialog";

import { toast } from "sonner";

export default function Home() {
  const [cards, setCards] = useState<ContextCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/cards");
        if (res.ok) {
          const data = await res.json();
          const cardsArray = Array.isArray(data) ? data : data.cards || [];
          setCards(cardsArray);
        }
      } catch (error) {
        console.error("Failed to fetch cards", error);
        toast.error("Error", {
          description: "Failed to load your context cards.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSaveDialogOpen(true);
      }
      // Restore shortcut (Ctrl+R)
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault(); // Stop browser refresh
        setIsRestoreDialogOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSaveSuccess = (newCard: ContextCardType) => {
    setCards((prev) => [newCard, ...prev]);
  };

  const handleDelete = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }
    toast("Card removed", {
      description: "Removed from this view. Permanent delete comes in polish.",
    });
  };

  const filteredCards = cards.filter(Boolean).filter((card) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.project.toLowerCase().includes(q) ||
      card.status.toLowerCase().includes(q) ||
      card.tags.toLowerCase().includes(q)
    );
  });

  const selectedCard = selectedCardId
    ? cards.find((c) => c && c.id === selectedCardId) ?? null
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-aurora">
      {/* Left sidebar: logo, save button, history */}
      <aside className="w-80 shrink-0 glass-panel h-full flex flex-col z-20 shadow-xl border-r border-white/20">
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                x: [0, -80, 0, 0],
                rotate: [0, -20, 0, 0],
                scale: [1, 0.8, 1, 1],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.2, 0.4, 1],
                repeat: Infinity,
                repeatDelay: 5,
                ease: "easeInOut",
              }}
              className="bg-gradient-to-tr from-purple-600 to-indigo-500 p-1.5 rounded-xl shadow-lg shadow-purple-500/30"
            >
              <Mic className="w-5 h-5 text-white" />
            </motion.div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-900 to-indigo-900">
              Context Keeper
            </h1>
          </div>

          <Button
            onClick={() => setIsSaveDialogOpen(true)}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 rounded-full px-6 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Context
          </Button>

          {/* ADDED: Restore Context Button */}
          <Button
            onClick={() => setIsRestoreDialogOpen(true)}
            className="w-full mt-2 bg-white/50 hover:bg-white/70 text-purple-700 border border-purple-200 shadow-sm transition-all duration-300 hover:scale-[1.02] rounded-full px-6 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore Context
          </Button>
        </div>

        <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-purple-900/60">
          History
        </div>

        <div className="overflow-y-auto flex-1 px-2 pb-4 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          ) : cards.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">
              Nothing saved yet.
            </p>
          ) : (
            cards.filter(Boolean).map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/50 ${
                  card.id === selectedCardId
                    ? "bg-purple-100/50 ring-1 ring-purple-200/60 shadow-sm"
                    : ""
                }`}
              >
                <div className="text-sm font-medium truncate">
                  {card.project}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(card.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right main area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="shrink-0 px-8 pt-6 pb-2">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects, status, or tags..."
              className="pl-12 h-12 rounded-full border-none shadow-lg shadow-purple-200/50 bg-white/60 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-purple-500 text-base"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
              <p>Loading your context...</p>
            </div>
          ) : selectedCard ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCard.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className="max-w-3xl mx-auto"
              >
                <Button
                  variant="ghost"
                  onClick={() => setSelectedCardId(null)}
                  className="mb-4 rounded-full text-purple-900 hover:bg-white/50 transition-all duration-300 active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to all cards
                </Button>
                <ContextCard card={selectedCard} onDelete={handleDelete} />
              </motion.div>
            </AnimatePresence>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-purple-200/60 rounded-xl">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? "No matches found" : "No context saved yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? "Try a different search term."
                  : "Press Ctrl+K and speak to save your first context."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsSaveDialogOpen(true)}
                  variant="outline"
                >
                  Save your first card
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence>
                {filteredCards.map((card) => (
                  <ContextCard
                    key={card.id}
                    card={card}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <SaveDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveSuccess}
      />
      
      {/* ADDED: Restore Dialog Component */}
      <RestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
      />
    </div>
  );
}