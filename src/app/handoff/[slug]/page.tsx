import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  FolderKanban,
  CheckCircle2,
  FlaskConical,
  ArrowRight,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
} from "lucide-react";

// Force this page to render dynamically on every request (fixes the new Date() prerender error)
export const dynamic = "force-dynamic";

export default async function HandoffPage({
  params,
}: {
  params: Promise<{ slug: string }>; // Next.js 15 requires params to be a Promise
}) {
  // Next.js 15 requires you to await params
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  if (!slug) {
    notFound();
  }

  const handoff = await prisma.handoff.findUnique({
    where: { slug },
    include: { card: true },
  });

  if (!handoff) {
    notFound();
  }

  const { card } = handoff;

  return (
    <main className="min-h-screen bg-aurora py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-8 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-500 p-2 rounded-xl shadow-lg">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{card.project}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(card.createdAt), "MMMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(card.createdAt), "h:mm a")}
            </span>
          </div>
          
          <div className="flex gap-2 mt-4">
            {card.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
              <span key={tag} className="bg-purple-100/50 text-purple-700 text-xs px-3 py-1 rounded-full border border-purple-200/50">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* AI Briefing */}
        <div className="glass-panel rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-purple-600" />
          </div>
          
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Handoff Briefing
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Current Status
              </h3>
              <p className="text-gray-800 leading-relaxed bg-white/40 p-4 rounded-xl border border-white/50">
                {card.status}
              </p>
            </div>

            {card.tried && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-blue-500" />
                  What Has Been Tried
                </h3>
                <p className="text-gray-800 leading-relaxed bg-white/40 p-4 rounded-xl border border-white/50">
                  {card.tried}
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <ArrowRight className="w-4 h-4 text-orange-500" />
                Next Action
              </h3>
              <div className="bg-orange-50/60 border border-orange-200/60 p-4 rounded-xl">
                <p className="text-gray-900 font-medium leading-relaxed">
                  {card.nextAction}
                </p>
              </div>
            </div>

            {card.blockers && (
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Blockers / Waiting On
                </h3>
                <p className="text-red-700 bg-red-50/50 p-4 rounded-xl border border-red-100/50 leading-relaxed">
                  {card.blockers}
                </p>
              </div>
            )}
          </div>

          <hr className="my-8 border-gray-300/30" />

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Context Summary
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{handoff.briefing}"
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 text-sm text-gray-500">
          Generated by Context Keeper — Voice-Driven Cognitive Load Management
        </div>
      </div>
    </main>
  );
}