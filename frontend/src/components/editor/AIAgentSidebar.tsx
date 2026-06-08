"use client";

import { useState } from "react";
import { useEditor, AISuggestion } from "@/store/editorstore";
import { Sparkles, Loader2, ArrowRight, Wand2 } from "lucide-react";

export default function AIAgentSidebar({ width }: { width?: number }) {
  const {
    isGeneratingAI,
    aiSuggestions,
    generateAISuggestions,
    applyAISuggestions,
    layers,
    updateLayer,
    selectedLayerId,
    setLayers
  } = useEditor();

  const [occasion, setOccasion] = useState("Auto Today");
  const [tone, setTone] = useState("Premium");
  const [instruction, setInstruction] = useState("");

  const handleGenerate = () => {
    generateAISuggestions(occasion, tone, instruction);
  };

  const handleApply = () => {
    applyAISuggestions(aiSuggestions);
  };

  // Cohesive styling themes for "Make It Premium"
  const makeItPremium = () => {
    if (layers.length === 0) {
      alert("Please map some text layers to the canvas first, or generate AI designs!");
      return;
    }

    if (selectedLayerId) {
      // Make only selected layer premium
      updateLayer(selectedLayerId, {
        fontFamily: "Playfair Display",
        fontWeight: "bold",
        fontColor: "#FBBF24", // Elegant Amber Gold
      });
      alert("Applied premium serif styling and gold accent to selected layer!");
    } else {
      // Apply a global cohesive premium style across all layers
      const updatedLayers = layers.map((layer) => {
        const lowerCol = layer.column.toLowerCase();
        if (lowerCol.includes("heading") || lowerCol.includes("title") || lowerCol.includes("name")) {
          return {
            ...layer,
            fontFamily: "Montserrat",
            fontWeight: "bold" as const,
            fontColor: "#FFFFFF",
          };
        } else if (lowerCol.includes("phone") || lowerCol.includes("contact") || lowerCol.includes("body")) {
          return {
            ...layer,
            fontFamily: "Inter",
            fontWeight: "bold" as const,
            fontColor: "#67e8f9", // Soft Cyan
          };
        }
        return {
          ...layer,
          fontFamily: "Inter",
          fontColor: "#E5E7EB",
        };
      });
      setLayers(updatedLayers);
      alert("Applied a premium dual-font layout (Montserrat & Inter) with cyan accents to all canvas layers!");
    }
  };

  return (
    <aside 
      className="hidden md:flex h-full border-l border-white/10 bg-[#111827] p-5 flex flex-col overflow-hidden shrink-0"
      style={{ width: width ?? 320 }}
    >
      <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <span>AI Agent Studio</span>
      </h2>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Occasion Option */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Occasion Mode</label>
          <select 
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-white/10"
          >
            <option className="text-black bg-white" value="Auto Today">Auto Today</option>
            <option className="text-black bg-white" value="Festival">Festival Celebration</option>
            <option className="text-black bg-white" value="Trending News">Trending News</option>
            <option className="text-black bg-white" value="Custom">Custom Campaign</option>
          </select>
        </div>

        {/* Tone Option */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Tone</label>
          <select 
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none cursor-pointer hover:bg-white/10"
          >
            <option className="text-black bg-white" value="Premium">Premium / Executive</option>
            <option className="text-black bg-white" value="Hinglish">Hinglish (Colloquial)</option>
            <option className="text-black bg-white" value="Massy">Massy / Vibrant</option>
            <option className="text-black bg-white" value="Professional">Professional / Corporate</option>
          </select>
        </div>

        {/* AI Instruction Prompts */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">AI Instructions</label>
          <textarea
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe your design goals (e.g. Real-estate launch discount or Holi greetings card...)"
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 hover:bg-white/10 focus:border-violet-500/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={handleGenerate}
            disabled={isGeneratingAI}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/10 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Writing Magic Copy...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Magic Design</span>
              </>
            )}
          </button>

          <button 
            onClick={makeItPremium}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-white hover:bg-white/10 active:scale-[0.98] transition"
          >
            Make It Premium
          </button>
        </div>

        {/* AI suggestions display list */}
        {aiSuggestions.length > 0 && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-600/5 p-4 space-y-3 animate-fade-in mt-4">
            <h3 className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Copy Recommendations</span>
            </h3>

            <div className="space-y-2.5">
              {aiSuggestions.map((s) => (
                <div key={s.id} className="text-xs border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{s.title}</p>
                  <p className="mt-1 text-white/80 font-medium italic">"{s.text}"</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleApply}
              className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 py-2 text-xs font-bold text-white shadow transition"
            >
              <span>Apply Suggestion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}