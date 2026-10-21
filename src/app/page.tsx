"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  Mic,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Home as HomeIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SaveDialog } from "@/components/SaveDialog";
import { ContextCard, ContextCardType } from "@/components/ContextCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RestoreDialog } from "@/components/RestoreDialog";

import { toast } from "sonner";

function Mascot() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="relative flex flex-col items-center"
      aria-hidden="true"
    >
      {/* Soft glow */}
      <div className="absolute inset-0 -z-10 m-auto h-40 w-40 rounded-full bg-purple-400/30 blur-3xl" />

      <svg
        width="180"
        height="190"
        viewBox="0 0 180 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mascot-body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <line
          x1="90"
          y1="22"
          x2="90"
          y2="40"
          stroke="#7c3aed"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <motion.circle
          cx="90"
          cy="16"
          r="7"
          fill="#f0abfc"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "90px 16px" }}
        />

        {/* Arms */}
        <motion.ellipse
          cx="28"
          cy="118"
          rx="11"
          ry="20"
          fill="#8b5cf6"
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "34px 100px" }}
        />
        <motion.ellipse
          cx="152"
          cy="118"
          rx="11"
          ry="20"
          fill="#8b5cf6"
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "146px 100px" }}
        />

        {/* Body */}
        <rect
          x="30"
          y="40"
          width="120"
          height="115"
          rx="42"
          fill="url(#mascot-body)"
        />
        {/* Highlight */}
        <ellipse
          cx="62"
          cy="60"
          rx="16"
          ry="7"
          fill="white"
          opacity="0.3"
          transform="rotate(-20 62 60)"
        />

        {/* Face screen */}
        <rect x="46" y="64" width="88" height="56" rx="26" fill="#1e1b4b" />

        {/* Eyes (blinking) */}
        <motion.ellipse
          cx="70"
          cy="92"
          rx="8"
          ry="10"
          fill="#e9d5ff"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 4,
            times: [0, 0.45, 0.5, 0.55, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "70px 92px" }}
        />
        <motion.ellipse
          cx="110"
          cy="92"
          rx="8"
          ry="10"
          fill="#e9d5ff"
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{
            duration: 4,
            times: [0, 0.45, 0.5, 0.55, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "110px 92px" }}
        />

        {/* Cheeks */}
        <circle cx="54" cy="106" r="5" fill="#f9a8d4" opacity="0.6" />
        <circle cx="126" cy="106" r="5" fill="#f9a8d4" opacity="0.6" />

        {/* Smile */}
        <path
          d="M80 106 Q90 114 100 106"
          stroke="#e9d5ff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Belly light */}
        <circle cx="90" cy="138" r="6" fill="white" opacity="0.5" />
      </svg>

      {/* Shadow that shrinks as the robot rises */}
      <motion.div
        animate={{ scaleX: [1, 0.8, 1], opacity: [0.25, 0.12, 0.25] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="-mt-1 h-3 w-24 rounded-full bg-purple-900/40 blur-md"
      />
    </motion.div>
  );
}

const kbdClass =
  "pointer-events-none select-none rounded border border-purple-200 bg-white/70 px-1.5 py-0.5 font-mono text-[10px] font-medium text-purple-700 shadow-sm";

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

  const handleHome = () => {
    setSelectedCardId(null);
    setSearchQuery("");
  };

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
            <kbd className="ml-auto rounded border border-white/30 bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
              Ctrl + K
            </kbd>
          </Button>

          <Button
            onClick={() => setIsRestoreDialogOpen(true)}
            className="w-full mt-2 bg-purple-100/70 hover:bg-purple-200/80 text-purple-700 border border-purple-300 shadow-sm shadow-purple-200/50 transition-all duration-300 hover:scale-[1.02] rounded-full px-6 active:scale-95"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore Context
          </Button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={handleHome}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/50 ${
              selectedCardId === null && !searchQuery
                ? "bg-purple-100/50 text-purple-900 ring-1 ring-purple-200/60"
                : "text-purple-900/80"
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Home
          </button>
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
          ) : filteredCards.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">
              No matching contexts.
            </p>
          ) : (
            filteredCards.map((card) => (
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
              className="pl-12 pr-20 h-12 rounded-full border-none shadow-lg shadow-purple-200/50 bg-white/60 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-purple-500 text-base"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
            <kbd
              className={`${kbdClass} absolute right-4 top-1/2 -translate-y-1/2`}
              title="Restore shortcut"
            >
              Ctrl + R
            </kbd>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Strip */}
          {!isLoading && cards.length > 0 && (
            <div className="flex gap-4 mb-6 text-sm font-medium text-purple-900/70">
              <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="bg-purple-200/50 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  {cards.length}
                </span>
                Contexts Saved
              </div>
              {/* Hardcode the Wispr words for now based on your actual usage */}
              <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-600" />
                40k+ Words Dictated
              </div>
            </div>
          )}

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
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2 text-purple-900">
                {filteredCards.length === 0
                  ? "No matches found"
                  : `${filteredCards.length} match${
                      filteredCards.length === 1 ? "" : "es"
                    } found`}
              </h3>
              <p>
                {filteredCards.length === 0
                  ? "Try a different search term."
                  : "Pick one from the sidebar to restore it."}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <Mascot />
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
                Context Keeper
              </h2>
              <p className="mt-3 max-w-md text-gray-600">
                Select a context from the sidebar to restore it, or press{" "}
                <kbd className={kbdClass}>Ctrl + K</kbd> to save a new thought.
              </p>
            </motion.div>
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