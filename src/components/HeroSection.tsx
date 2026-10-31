"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onGetStarted: () => void;
}

// Waveform bars: [height class, animation delay, animation duration]
const leftBars: [string, string, string][] = [
  ["h-8", "0ms", "1.1s"],
  ["h-14", "150ms", "1.3s"],
  ["h-20", "300ms", "1.2s"],
];
const rightBars: [string, string, string][] = [
  ["h-20", "200ms", "1.2s"],
  ["h-14", "350ms", "1.4s"],
  ["h-8", "100ms", "1.1s"],
];

function Bar({ spec }: { spec: [string, string, string] }) {
  const [height, delay, duration] = spec;
  return (
    <div
      className={`w-2 ${height} bg-amber-600 rounded-full animate-bounce`}
      style={{ animationDelay: delay, animationDuration: duration }}
    />
  );
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between py-16 px-6 max-w-6xl mx-auto gap-12 overflow-x-clip">
      {/* Left: text */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
        <h2 className="text-5xl md:text-7xl font-extrabold text-stone-800 tracking-tight leading-tight">
          Speak your mind. We&apos;ll keep the context.
        </h2>
        <p className="text-lg md:text-xl text-stone-600 mt-6 max-w-lg">
          ConxVoe turns your spoken thoughts into structured, actionable context
          cards. Never lose your flow again.
        </p>
        <Button
          onClick={onGetStarted}
          className="bg-amber-700 hover:bg-amber-800 text-white shadow-xl shadow-amber-700/30 rounded-full px-8 py-6 text-lg mt-8 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Mic />
          Get Started
        </Button>
      </div>

      {/* Right: voice graphic */}
      <div
        className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Concentric rings */}
        <div
          className="border border-amber-500/20 rounded-full absolute w-40 h-40 animate-ping"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="border border-amber-500/20 rounded-full absolute w-56 h-56 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "1s" }}
        />
        <div
          className="border border-amber-500/20 rounded-full absolute w-72 h-72 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "2s" }}
        />

        {/* Waveform bars flanking the mic */}
        <div className="absolute inset-0 flex items-center justify-center gap-2.5">
          {leftBars.map((spec, i) => (
            <Bar key={`l${i}`} spec={spec} />
          ))}
          <div className="w-24 shrink-0" />
          {rightBars.map((spec, i) => (
            <Bar key={`r${i}`} spec={spec} />
          ))}
        </div>

        {/* Center mic */}
        <Mic className="w-24 h-24 text-amber-700 z-10 drop-shadow-xl" />
      </div>
    </section>
  );
}
