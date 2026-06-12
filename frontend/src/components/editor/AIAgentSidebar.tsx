"use client";

import { useState } from "react";
import { useEditor } from "@/store/editorstore";
import { Loader2, Wand2, Sparkles, ChevronDown, ChevronUp, Search } from "lucide-react";
import { CAMPAIGN_CATEGORIES } from "@/constants/campaigns";

export default function AIAgentSidebar({ width }: { width?: number }) {
  const {
    posterFile,
    isGeneratingAIPoster,
    generateAIPoster,
    generatePromptPreview,
    previewedPrompt,
    setPreviewedPrompt,
    isPreviewingPrompt
  } = useEditor();

  // Redesign Input State
  const [campaignInput, setCampaignInput] = useState("");

  // Copy Feedback State
  const [copied, setCopied] = useState(false);

  // Dropdown & Search State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const filteredCategories = CAMPAIGN_CATEGORIES.map((cat) => {
    const filtered = cat.campaigns.filter(
      (camp) =>
        camp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camp.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...cat,
      campaigns: filtered,
    };
  }).filter((cat) => cat.campaigns.length > 0);

  const handlePreviewSubmit = () => {
    if (!posterFile) {
      alert("Please upload a base poster first in the Uploads sidebar!");
      return;
    }
    generatePromptPreview(posterFile, campaignInput);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseCustomPrompt = () => {
    if (!posterFile) {
      alert("Please upload a base poster first in the Uploads sidebar!");
      return;
    }
    generateAIPoster(posterFile, "", previewedPrompt);
  };

  return (
    <aside
      className="hidden md:flex h-full border-l border-white/10 bg-[#111827] p-5 flex flex-col overflow-hidden shrink-0"
      style={{ width: width ?? 320 }}
    >
      {/* Sidebar Header */}
      <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <span>AI Agent Studio</span>
      </h2>

      {/* Contents */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              AI Poster Redesign (OpenAI Edit)
            </label>
            <p className="text-[10.5px] text-white/40 mt-1 leading-relaxed">
              Analyze your uploaded poster, extract key details, and completely redesign the background using OpenAI Image Edit API matching your campaign direction.
            </p>
          </div>

          {/* Campaign Templates Dropdown */}
          <div className="relative">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Select Campaign Template
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="mt-1.5 w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none hover:bg-white/10 focus:border-violet-500/50 transition duration-150 cursor-pointer"
            >
              <span className="truncate text-white/70">
                Choose a campaign concept...
              </span>
              <ChevronDown
                className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="mt-2 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-md p-2 space-y-2 max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-50">
                {/* Search Input */}
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-white/20 focus:border-violet-500/30"
                  />
                </div>

                {/* Categories / Campaigns List */}
                <div className="space-y-1">
                  {filteredCategories.map((cat) => {
                    const isExpanded = searchQuery ? true : !!expandedCategories[cat.category];
                    return (
                      <div key={cat.category} className="border-b border-white/5 last:border-0 pb-1">
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.category)}
                          className="w-full flex items-center justify-between py-1.5 px-1 text-left text-[10.5px] font-bold text-violet-300 hover:text-violet-200 transition"
                        >
                          <span>{cat.category}</span>
                          {!searchQuery && (
                            <span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 text-white/40" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-white/40" />
                              )}
                            </span>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-1 pl-1.5 pr-0.5 py-1 space-y-1">
                            {cat.campaigns.map((camp) => (
                              <button
                                key={camp.value}
                                type="button"
                                onClick={() => {
                                  setCampaignInput(camp.value);
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                                className="w-full text-left text-[10.5px] text-white/70 hover:text-white hover:bg-white/5 rounded px-2 py-1.5 transition leading-snug cursor-pointer"
                              >
                                {camp.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <p className="text-center text-white/30 text-[10px] py-4 italic">No campaigns found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Campaign Direction Input */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Campaign Direction (Customize)
            </label>
            <textarea
              rows={4}
              value={campaignInput}
              onChange={(e) => setCampaignInput(e.target.value)}
              placeholder="Select a template above, or type custom campaign direction here..."
              className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 hover:bg-white/10 focus:border-violet-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handlePreviewSubmit}
              disabled={isPreviewingPrompt || isGeneratingAIPoster}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-xs font-semibold text-white transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPreviewingPrompt ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Previewing Prompt...</span>
                </>
              ) : (
                <span>Preview Prompt</span>
              )}
            </button>
          </div>

          {/* Prompt Preview Card */}
          {previewedPrompt && (
            <div className="rounded-xl border border-violet-500/30 bg-violet-600/5 p-3.5 space-y-3 animate-fade-in mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                  Final Image Prompt
                </span>
                <button
                  onClick={handleCopy}
                  className="text-[10px] flex items-center gap-1 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Prompt"}
                </button>
              </div>

              <textarea
                rows={6}
                value={previewedPrompt}
                onChange={(e) => setPreviewedPrompt(e.target.value)}
                className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-xs text-white/95 outline-none placeholder:text-white/20 focus:border-violet-500/50 leading-relaxed font-mono"
              />

              <button
                onClick={handleUseCustomPrompt}
                disabled={isGeneratingAIPoster}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 py-3 text-xs font-semibold text-white shadow hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingAIPoster ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Redesign...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Redesign</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Premium details */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[10.5px] text-white/50 leading-relaxed space-y-1.5">
            <p className="font-semibold text-white/70">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Factual details (pricing, contact, amenities) are saved exactly.</li>
              <li>The Image API generates a luxury background layout based on the prompt.</li>
              <li>Your business layers are re-rendered on top as editable canvas elements.</li>
            </ol>
          </div>
        </div>
      </div>
    </aside>
  );
}