"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Search, Plus, Mic, Loader2, ArrowLeft, RotateCcw } from "lucide-react";
import { SaveDialog } from "@/components/SaveDialog";
import { ContextCard, ContextCardType } from "@/components/ContextCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RestoreDialog } from "@/components/RestoreDialog";
import { HeroSection } from "@/components/HeroSection";
import { toast } from "sonner";

export default function Home() {
  const [cards, setCards] = useState<ContextCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Tabs: "home" (all recent), "handoffs" (only shared), "all" (everything)
  const [activeTab, setActiveTab] = useState<"home" | "all" | "handoffs">("home");

  useEffect(() => {
    async function fetchCards() {
      try {
        const res = await fetch("/api/cards");
        if (res.ok) {
          const data = await res.json();
          setCards(Array.isArray(data) ? data : data.cards || []);
        }
      } catch (error) {
        toast.error("Error loading contexts");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSaveDialogOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
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
    if (!window.confirm("Are you sure you want to delete this context card?")) return;
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    if (selectedCardId === cardId) setSelectedCardId(null);
    toast("Card removed");
  };

  const handleCardUpdated = (updatedCard: ContextCardType) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
  };

  // Filtering Logic based on tabs and search
  const filteredCards = cards.filter(Boolean).filter((card) => {
    // 1. Filter by Tab
    if (activeTab === "handoffs" && (!card.handoffs || card.handoffs.length === 0)) return false;
    
    // 2. Filter by Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      card.project.toLowerCase().includes(q) ||
      card.status.toLowerCase().includes(q) ||
      card.tags.toLowerCase().includes(q)
    );
  });

  const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null;

  // Hero only appears on the Home tab when no card is open and no search is active
  const showHero = activeTab === "home" && !selectedCard && !searchQuery;

  return (
    <div className="min-h-screen bg-aurora pb-20">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/20 px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => { setActiveTab("home"); setSelectedCardId(null); setSearchQuery(""); }}
        >
          <div className="bg-gradient-to-tr from-amber-600 to-amber-800 p-2 rounded-xl shadow-lg shadow-amber-700/30">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-800">ConxVoe</h1>
        </div>
        
        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
          <button 
            onClick={() => { setActiveTab("home"); setSelectedCardId(null); setSearchQuery(""); }} 
            className={`hover:text-amber-700 transition-colors ${activeTab === 'home' ? 'text-amber-700 font-bold' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => { setActiveTab("all"); setSelectedCardId(null); setSearchQuery(""); }} 
            className={`hover:text-amber-700 transition-colors ${activeTab === 'all' ? 'text-amber-700 font-bold' : ''}`}
          >
            All Contexts
          </button>
          <button 
            onClick={() => { setActiveTab("handoffs"); setSelectedCardId(null); setSearchQuery(""); }} 
            className={`hover:text-amber-700 transition-colors ${activeTab === 'handoffs' ? 'text-amber-700 font-bold' : ''}`}
          >
            Shared Handoffs
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsRestoreDialogOpen(true)} 
            variant="outline" 
            className="border-amber-700 text-amber-700 hover:bg-amber-50 rounded-full transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Restore
          </Button>
          <Button 
            onClick={() => setIsSaveDialogOpen(true)} 
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full shadow-lg shadow-amber-700/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" /> Save Context
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 pt-10">
        
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Search projects, status, or tags..."
            className="pl-12 h-12 rounded-full border-none shadow-lg shadow-stone-200/50 bg-white/60 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-amber-500 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hero (Home tab only, no card selected, no active search) */}
        {showHero ? (
          <HeroSection onGetStarted={() => setIsSaveDialogOpen(true)} />
        ) : (
          <div className="mb-6" />
        )}

        {/* Recent Contexts header (below the hero, only if there are cards) */}
        {showHero && !isLoading && filteredCards.length > 0 && (
          <h2 className="text-2xl font-bold text-stone-800 mb-6 mt-12 px-6 max-w-6xl mx-auto">Recent Contexts</h2>
        )}

        {/* Content Logic */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        ) : selectedCard ? (
          
          /* Single Card Detail View */
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCardId(null)} 
              className="mb-6 text-stone-600 hover:bg-stone-200/50 rounded-full transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {activeTab === 'handoffs' ? 'Handoffs' : 'Contexts'}
            </Button>
            <ContextCard 
              card={selectedCard} 
              onDelete={handleDelete} 
              onCardUpdated={handleCardUpdated} 
            />
          </div>

        ) : filteredCards.length === 0 ? (
          
          /* Empty State (the hero already covers this on Home) */
          showHero ? null : (
            <div className="text-center py-20 border-2 border-dashed border-stone-300/50 rounded-2xl">
              <h3 className="text-lg font-medium text-stone-700 mb-2">
                {activeTab === 'handoffs' ? "No shared handoffs yet" : "No context found"}
              </h3>
              <p className="text-stone-500">
                {searchQuery ? "Try a different search term." : "Press Ctrl+K and speak to save your first context."}
              </p>
            </div>
          )

        ) : (
          
          /* Grid View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredCards.map((card) => (
                <div key={card.id} onClick={() => setSelectedCardId(card.id)} className="cursor-pointer transition-transform hover:-translate-y-1">
                  {/* Stop propagation so clicking buttons inside doesn't open the card detail view */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <ContextCard
                      card={card}
                      onDelete={handleDelete}
                      onCardUpdated={handleCardUpdated}
                    />
                  </div>
                </div>
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
      <RestoreDialog
        open={isRestoreDialogOpen}
        onOpenChange={setIsRestoreDialogOpen}
      />
    </div>
  );
}
