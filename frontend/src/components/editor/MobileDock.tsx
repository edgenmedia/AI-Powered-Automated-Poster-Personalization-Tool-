"use client";

import React, { useState, useEffect } from "react";
import { useEditor, TextLayer } from "@/store/editorstore";
import { 
  Upload, 
  Layers, 
  Sparkles, 
  Type, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Loader2, 
  X, 
  Bold, 
  Trash2, 
  Pipette, 
  Wand2,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";
import { CAMPAIGN_CATEGORIES } from "@/constants/campaigns";

type TabType = "uploads" | "fields" | "ai" | "edit";

export default function MobileDock() {
  const {
    posterFile,
    setPosterFile,
    posterDimensions,
    csvFile,
    csvColumns,
    csvPreviews,
    csvValidation,
    totalCSVRows,
    parseCSV,
    layers,
    removeLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    activePreviewRowIndex,
    setActivePreviewRowIndex,
    updateActiveRowValue,
    isParsingCSV,
    isDetecting,
    placingColumn,
    setPlacingColumn,
    rowEdits,
    isGeneratingAIPoster,
    generateAIPoster,
    generatePromptPreview,
    previewedPrompt,
    setPreviewedPrompt,
    isPreviewingPrompt,
    isPickingColorCanvas,
    setIsPickingColorCanvas,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  // Redesign Input State
  const [campaignInput, setCampaignInput] = useState("");
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

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const [selectedFont, setSelectedFont] = useState(selectedLayer?.fontFamily || "Inter");

  useEffect(() => {
    if (selectedLayer) {
      setSelectedFont(selectedLayer.fontFamily);
    }
  }, [selectedLayer?.id, selectedLayer?.fontFamily]);

  const handleFontChange = async (newFont: string) => {
    if (!selectedLayer) return;
    setSelectedFont(newFont);

    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 800));
    const loadPromise = (async () => {
      if (typeof window !== "undefined" && "fonts" in document) {
        await document.fonts.load(`12px "${newFont}"`);
      }
    })();

    await Promise.race([loadPromise, timeoutPromise]);
    updateLayer(selectedLayer.id, { fontFamily: newFont });
  };

  const [supportsEyeDropper, setSupportsEyeDropper] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      setSupportsEyeDropper(true);
    }
  }, []);

  // Auto-switch to "edit" tab when a text layer is selected on canvas
  useEffect(() => {
    if (selectedLayerId) {
      setActiveTab("edit");
    }
  }, [selectedLayerId]);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      alert("Only PNG images are allowed on the canvas.");
      e.target.value = "";
      return;
    }
    setPosterFile(file);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseCSV(file);
  };

  const handlePrevRow = () => {
    if (activePreviewRowIndex > 0) {
      setActivePreviewRowIndex(activePreviewRowIndex - 1);
    }
  };

  const handleNextRow = () => {
    if (activePreviewRowIndex < csvPreviews.length - 1) {
      setActivePreviewRowIndex(activePreviewRowIndex + 1);
    }
  };

  const isColumnMapped = (col: string) => {
    return layers.some((layer) => layer.column === col);
  };

  const handlePickColor = async () => {
    if (!selectedLayerId) return;
    setActiveTab(null); // Temporarily close the drawer so they can see the poster clearly
    if (supportsEyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        updateLayer(selectedLayerId, { fontColor: result.sRGBHex });
      } catch (err) {
        console.log("Color picker canceled:", err);
      }
    } else {
      setIsPickingColorCanvas(true);
    }
  };

  const handlePreviewSubmit = () => {
    if (!posterFile) {
      alert("Please upload a base poster first in the Uploads tab!");
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
      alert("Please upload a base poster first in the Uploads tab!");
      return;
    }
    generateAIPoster(posterFile, "", previewedPrompt);
  };

  const getCurrentTextValue = () => {
    if (!selectedLayer) return "";
    if (csvPreviews.length > 0) {
      const activeRow = csvPreviews[activePreviewRowIndex];
      return activeRow?.[selectedLayer.column] !== undefined 
        ? String(activeRow[selectedLayer.column]) 
        : (selectedLayer.defaultText || "");
    }
    return selectedLayer.defaultText || "";
  };

  const handleTextChange = (newText: string) => {
    if (!selectedLayer) return;
    if (csvPreviews.length > 0) {
      updateActiveRowValue(selectedLayer.column, newText);
    } else {
      updateLayer(selectedLayer.id, { defaultText: newText });
    }
  };

  return (
    <div id="mobile-dock-container">
      {/* Backdrop Overlay when bottom sheet is active */}
      {activeTab && (
        <div 
          onClick={() => setActiveTab(null)}
          onTouchStart={() => setActiveTab(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity cursor-pointer" 
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div 
        className={`fixed left-0 right-0 z-50 bg-[#111827] border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col transition-transform duration-300 ease-out ${
          activeTab ? "translate-y-0 pointer-events-auto" : "translate-y-full pointer-events-none"
        }`}
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drawer Header Drag Bar & Title */}
        <div className="w-full flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            {activeTab === "uploads" && <Upload className="w-4 h-4 text-violet-400" />}
            {activeTab === "fields" && <Layers className="w-4 h-4 text-violet-400" />}
            {activeTab === "ai" && <Sparkles className="w-4 h-4 text-violet-400" />}
            {activeTab === "edit" && <Type className="w-4 h-4 text-violet-400" />}
            <span className="font-bold text-white text-sm capitalize">
              {activeTab === "uploads" && "Campaign Uploads"}
              {activeTab === "fields" && "Field Mappings"}
              {activeTab === "ai" && "AI Agent Studio"}
              {activeTab === "edit" && "Edit Text Layer"}
            </span>
          </div>
          <button 
            onClick={() => setActiveTab(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {/* UPLOADS PANEL */}
          {activeTab === "uploads" && (
            <div className="space-y-4">
              <div className={`rounded-xl border p-4 transition-all ${
                posterFile 
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]" 
                  : "border-white/5 bg-white/[0.02]"
              }`}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">Base Poster</h3>
                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer transition text-center ${
                  posterFile 
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-semibold" 
                    : "border-white/10 hover:bg-white/5 text-white/70"
                }`}>
                  <Upload className={`w-5 h-5 mb-1 ${posterFile ? "text-emerald-400" : "text-white/30"}`} />
                  <span className="text-xs truncate max-w-[200px]">
                    {posterFile ? posterFile.name : "Select Image Template"}
                  </span>
                  <input type="file" accept="image/png" onChange={handlePosterUpload} className="hidden" />
                </label>
                {posterFile && posterDimensions.width > 0 && (
                  <p className="mt-2 text-[9px] text-emerald-400/80 font-semibold flex items-center gap-1 justify-center">
                    <Check className="w-3.5 h-3.5" />
                    <span>Loaded: {posterDimensions.width} × {posterDimensions.height} px</span>
                  </p>
                )}
              </div>

              <div className={`rounded-xl border p-4 transition-all ${
                csvFile 
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]" 
                  : "border-white/5 bg-white/[0.02]"
              }`}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">Spreadsheet Data</h3>
                <label className={`flex flex-col items-center justify-center border border-dashed rounded-xl p-4 cursor-pointer transition text-center ${
                  csvFile 
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-semibold" 
                    : "border-white/10 hover:bg-white/5 text-white/70"
                }`}>
                  {isParsingCSV ? (
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin mb-1" />
                  ) : (
                    <Upload className={`w-5 h-5 mb-1 ${csvFile ? "text-emerald-400" : "text-white/30"}`} />
                  )}
                  <span className="text-xs truncate max-w-[200px]">
                    {csvFile ? csvFile.name : "Select CSV / Excel"}
                  </span>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCSVUpload} className="hidden" disabled={isParsingCSV} />
                </label>
                {totalCSVRows > 0 && (
                  <p className="mt-2 text-[9px] text-emerald-400/80 font-semibold flex items-center gap-1 justify-center">
                    <Check className="w-3.5 h-3.5" />
                    <span>Parsed {totalCSVRows} rows successfully</span>
                  </p>
                )}
              </div>

              {csvValidation && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <button 
                    onClick={() => setIsValidationOpen(!isValidationOpen)}
                    className="w-full flex items-center justify-between p-3 text-left bg-black/10 text-white"
                  >
                    <span className="font-semibold text-white/50 uppercase tracking-wider">Spreadsheet Diagnostics</span>
                    <span className="text-[10px] text-white/30">{isValidationOpen ? "Hide" : "Show"}</span>
                  </button>
                  {isValidationOpen && (
                    <div className="p-4 bg-black/20 space-y-3">
                      <div>
                        <h4 className="text-[10px] font-semibold text-white/60 mb-2">Missing Values:</h4>
                        {Object.keys(csvValidation.empty_counts).length > 0 ? (
                          <ul className="space-y-2">
                            {Object.entries(csvValidation.empty_counts).map(([col, valInfo]: any) => (
                              <li key={col} className="rounded overflow-hidden bg-black/20 p-2.5 border border-white/5 text-left">
                                <div className="flex justify-between text-yellow-300 font-semibold">
                                  <span>{col}</span>
                                  <span>{valInfo.count} empty</span>
                                </div>
                                {valInfo.count > 0 && (
                                  <p className="text-[9px] text-white/40 mt-1">
                                    Image numbers: {valInfo.empty_rows.map((r: number) => r + 1).join(", ")}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded text-center">✓ No missing values detected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FIELDS PANEL */}
          {activeTab === "fields" && (
            <div className="space-y-4">
              {csvPreviews.length > 0 && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-600/5 p-4 flex items-center justify-between">
                  <button onClick={handlePrevRow} disabled={activePreviewRowIndex === 0} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Row {activePreviewRowIndex + 1} of {csvPreviews.length}</p>
                    <p className="font-semibold text-white truncate max-w-[140px]">{Object.values(csvPreviews[activePreviewRowIndex])[0] || "No data"}</p>
                  </div>
                  <button onClick={handleNextRow} disabled={activePreviewRowIndex === csvPreviews.length - 1} className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {csvColumns.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Field Mapping</h3>
                  {csvColumns.map((col) => {
                    const mapped = isColumnMapped(col);
                    const isPlacing = placingColumn === col;
                    return (
                      <div key={col} className={`flex items-center justify-between p-2.5 rounded-xl border ${isPlacing ? "bg-violet-600/20 border-violet-500 text-violet-300" : "bg-black/20 border-white/5"}`}>
                        <span className="font-medium text-white/80 truncate max-w-[150px]">{col}</span>
                        {mapped ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                            <Check className="w-3 h-3" /> Mapped
                          </span>
                        ) : (
                          <button 
                            onClick={() => {
                              setPlacingColumn(isPlacing ? null : col);
                              setActiveTab(null); // Close sheet to let them tap canvas
                            }}
                            className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg"
                          >
                            {isPlacing ? "Tap Canvas..." : "Add to Canvas"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-white/30 italic py-4">Upload a spreadsheet first to see columns</p>
              )}

              {/* Spreadsheet diagnostics in Fields Panel */}
              {csvValidation && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden mt-4">
                  <button 
                    onClick={() => setIsValidationOpen(!isValidationOpen)}
                    className="w-full flex items-center justify-between p-3 text-left bg-black/10 text-white"
                  >
                    <span className="font-semibold text-white/50 uppercase tracking-wider">Spreadsheet Diagnostics</span>
                    <span className="text-[10px] text-white/30">{isValidationOpen ? "Hide" : "Show"}</span>
                  </button>
                  {isValidationOpen && (
                    <div className="p-4 bg-black/20 space-y-3">
                      <div>
                        <h4 className="text-[10px] font-semibold text-white/60 mb-2">Missing Values:</h4>
                        {Object.keys(csvValidation.empty_counts).length > 0 ? (
                          <ul className="space-y-2">
                            {Object.entries(csvValidation.empty_counts).map(([col, valInfo]: any) => (
                              <li key={col} className="rounded overflow-hidden bg-black/20 p-2.5 border border-white/5 text-left">
                                <div className="flex justify-between text-yellow-300 font-semibold">
                                  <span>{col}</span>
                                  <span>{valInfo.count} empty</span>
                                </div>
                                {valInfo.count > 0 && (
                                  <p className="text-[9px] text-white/40 mt-1">
                                    Image numbers: {valInfo.empty_rows.map((r: number) => r + 1).join(", ")}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded text-center">✓ No missing values detected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI AGENT PANEL */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Campaign Templates Dropdown */}
              <div className="relative">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                  Select Campaign Template
                </label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="mt-1 w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none hover:bg-white/10 focus:border-violet-500/50 transition duration-150 cursor-pointer"
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
                  <div className="mt-2 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-md p-2 space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent z-50">
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
                <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Campaign Direction (Customize)</label>
                <textarea 
                  rows={3} 
                  value={campaignInput} 
                  onChange={(e) => setCampaignInput(e.target.value)} 
                  placeholder="Select a template above, or type custom campaign direction here..." 
                  className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none resize-none" 
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handlePreviewSubmit} 
                  disabled={isPreviewingPrompt || isGeneratingAIPoster} 
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                >
                  {isPreviewingPrompt ? "Previewing..." : "Preview Prompt"}
                </button>
              </div>

              {previewedPrompt && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-600/5 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-violet-300 uppercase tracking-wider">Final Image Prompt</span>
                    <button 
                      onClick={handleCopy} 
                      className="text-[9px] bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-2 py-0.5 text-white/70 cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={previewedPrompt}
                    onChange={(e) => setPreviewedPrompt(e.target.value)}
                    className="w-full resize-y rounded-lg border border-white/10 bg-black/40 px-2 py-2.5 text-xs text-white outline-none leading-relaxed font-mono"
                  />

                  <button 
                    onClick={handleUseCustomPrompt} 
                    disabled={isGeneratingAIPoster} 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 font-bold text-white text-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    {isGeneratingAIPoster ? (
                      <span>Generating...</span>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate Redesign</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* EDIT PANEL */}
          {activeTab === "edit" && (
            <div className="space-y-4">
              {selectedLayer ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Edit Content</label>
                    <input type="text" value={getCurrentTextValue()} onChange={(e) => handleTextChange(e.target.value)} className="mt-1 w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white outline-none" />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Font Family</label>
                    <select value={selectedFont} onChange={(e) => handleFontChange(e.target.value)} className="mt-1 w-full bg-[#1f2937] border border-white/10 rounded-xl px-3 py-2 text-white outline-none">
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Arial">Arial</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Bebas Neue">Bebas Neue</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Font Size</label>
                      <div className="flex items-center mt-1 bg-white/10 rounded-xl border border-white/10 p-1">
                        <button onClick={() => updateLayer(selectedLayer.id, { fontSize: Math.max(10, selectedLayer.fontSize - 2) })} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg">-</button>
                        <span className="flex-1 text-center font-bold text-white">{selectedLayer.fontSize}</span>
                        <button onClick={() => updateLayer(selectedLayer.id, { fontSize: selectedLayer.fontSize + 2 })} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg">+</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Color</label>
                      <div className="flex items-center gap-2 mt-1 bg-white/10 rounded-xl border border-white/10 px-3 py-1.5">
                        <input type="color" value={selectedLayer.fontColor} onChange={(e) => updateLayer(selectedLayer.id, { fontColor: e.target.value })} className="h-6 w-6 cursor-pointer bg-transparent border-none rounded" />
                        <button onClick={handlePickColor} className="p-1 hover:bg-white/10 rounded-lg text-white/70" title="Pick color from poster">
                          <Pipette className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => updateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === "bold" ? "normal" : "bold" })}
                      className={`flex-1 py-2 rounded-xl border border-white/10 font-bold transition flex items-center justify-center gap-1.5 ${
                        selectedLayer.fontWeight === "bold" ? "bg-violet-600/30 border-violet-500 text-violet-400" : "text-white/70"
                      }`}
                    >
                      <Bold className="w-4 h-4" />
                      <span>Bold</span>
                    </button>

                    <button onClick={() => removeLayer(selectedLayer.id)} className="px-3 py-2 rounded-xl border border-red-500/10 hover:bg-red-500/20 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-white/30 italic py-4">Select a text layer on the canvas to edit styles</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-white/10 z-50 shadow-lg flex flex-col">
        <div className="h-16 px-3 flex items-center justify-between gap-1 w-full">
          <button 
            onClick={() => setActiveTab(activeTab === "uploads" ? null : "uploads")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "uploads" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Uploads</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "fields" ? null : "fields")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "fields" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Fields</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "ai" ? null : "ai")}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "ai" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">AI Agent</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "edit" ? null : "edit")}
            disabled={!selectedLayerId}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none ${
              activeTab === "edit" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Edit Text</span>
          </button>
        </div>
        
        {/* Safe area spacer for mobile devices */}
        <div className="h-[env(safe-area-inset-bottom,0px)] w-full bg-[#111827]" />
      </div>
    </div>
  );
}
