"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Plus, Mic, Loader2 } from "lucide-react";
import { SaveDialog } from "@/components/SaveDialog";
import { ContextCard, ContextCardType } from "@/components/ContextCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const [cards, setCards] = useState<ContextCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/cards");
        if (res.ok) {
          const data = await res.json();
          // API returns a raw array, but tolerate { cards } too
          const cardsArray = Array.isArray(data) ? data : (data.cards || []);
          setCards(cardsArray);
        }
      } catch (error) {
        console.error("Failed to fetch cards", error);
        // Fixed: Sonner API for errors
        toast.error("Error", {
          description: "Failed to load your context cards.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, []); // Fixed: removed [toast] because toast is no longer a hook

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSaveDialogOpen(true);
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
    // Fixed: Sonner API
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Context Keeper</h1>
          </div>
          <Button
            onClick={() => setIsSaveDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save Context
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search projects, status, or tags..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} 
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Loading your context...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No matches found" : "No context saved yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? "Try a different search term."
                : "Press Ctrl+Shift+S and speak to save your first context."}
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </main>

      <SaveDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveSuccess}
      />
    </div>
  );
}