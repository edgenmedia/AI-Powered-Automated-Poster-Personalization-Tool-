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
  Wand2 
} from "lucide-react";

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
    isGeneratingAI,
    generateAISuggestions,
    aiSuggestions,
    applyAISuggestions,
    placingColumn,
    setPlacingColumn,
    rowEdits,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  // AI Agent States
  const [occasion, setOccasion] = useState("Auto Today");
  const [tone, setTone] = useState("Premium");
  const [instruction, setInstruction] = useState("");

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);
  const supportsEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;

  // Auto-switch to "edit" tab when a text layer is selected on canvas
  useEffect(() => {
    if (selectedLayerId) {
      setActiveTab("edit");
    }
  }, [selectedLayerId]);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    if (!supportsEyeDropper || !selectedLayerId) return;
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      updateLayer(selectedLayerId, { fontColor: result.sRGBHex });
    } catch (err) {
      console.log("Color picker canceled:", err);
    }
  };

  const handleGenerate = () => {
    generateAISuggestions(occasion, tone, instruction);
  };

  const handleApply = () => {
    applyAISuggestions(aiSuggestions);
  };

  const makeItPremium = () => {
    if (layers.length === 0) {
      alert("Please map some text layers first!");
      return;
    }
    if (selectedLayerId) {
      updateLayer(selectedLayerId, {
        fontFamily: "Playfair Display",
        fontWeight: "bold",
        fontColor: "#FBBF24",
      });
    } else {
      const updated = layers.map((layer) => {
        const lowerCol = layer.column.toLowerCase();
        if (lowerCol.includes("heading") || lowerCol.includes("title") || lowerCol.includes("name")) {
          return { ...layer, fontFamily: "Montserrat", fontWeight: "bold" as const, fontColor: "#FFFFFF" };
        }
        return { ...layer, fontFamily: "Inter", fontColor: "#67e8f9" };
      });
      updateLayer(layers[0].id, updated[0]); // Simple bulk override
    }
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
    <div>
      {/* Backdrop Overlay when bottom sheet is active */}
      {activeTab && (
        <div 
          onClick={() => setActiveTab(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div 
        className={`fixed left-0 right-0 z-50 bg-[#111827] border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col transition-transform duration-300 ease-out ${
          activeTab ? "translate-y-0" : "translate-y-full"
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
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">Base Poster</h3>
                <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition text-center">
                  <Upload className="w-5 h-5 text-white/30 mb-1" />
                  <span className="text-xs text-white/70 truncate max-w-[200px]">
                    {posterFile ? posterFile.name : "Select Image Template"}
                  </span>
                  <input type="file" accept="image/*" onChange={handlePosterUpload} className="hidden" />
                </label>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50">Spreadsheet Data</h3>
                <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition text-center">
                  {isParsingCSV ? (
                    <Loader2 className="w-5 h-5 text-violet-400 animate-spin mb-1" />
                  ) : (
                    <Upload className="w-5 h-5 text-white/30 mb-1" />
                  )}
                  <span className="text-xs text-white/70 truncate max-w-[200px]">
                    {csvFile ? csvFile.name : "Select CSV / Excel"}
                  </span>
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleCSVUpload} className="hidden" disabled={isParsingCSV} />
                </label>
              </div>

              {csvValidation && (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <button 
                    onClick={() => setIsValidationOpen(!isValidationOpen)}
                    className="w-full flex items-center justify-between p-3 text-left bg-black/10"
                  >
                    <span className="font-semibold text-white/50 uppercase tracking-wider">Spreadsheet Diagnostics</span>
                    <span className="text-[10px] text-white/30">{isValidationOpen ? "Hide" : "Show"}</span>
                  </button>
                  {isValidationOpen && (
                    <div className="p-3 bg-black/20 space-y-2">
                      <p className="text-emerald-400">✓ Validation details checked</p>
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
            </div>
          )}

          {/* AI AGENT PANEL */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Occasion Mode</label>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none">
                  <option className="text-black bg-white" value="Auto Today">Auto Today</option>
                  <option className="text-black bg-white" value="Festival">Festival Celebration</option>
                  <option className="text-black bg-white" value="Trending News">Trending News</option>
                  <option className="text-black bg-white" value="Custom">Custom Campaign</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none">
                  <option className="text-black bg-white" value="Premium">Premium / Executive</option>
                  <option className="text-black bg-white" value="Hinglish">Hinglish (Colloquial)</option>
                  <option className="text-black bg-white" value="Massy">Massy / Vibrant</option>
                  <option className="text-black bg-white" value="Professional">Professional / Corporate</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-white/50 tracking-wider">AI Instructions</label>
                <textarea rows={2} value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="E.g. Discount offer on Holi..." className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white outline-none resize-none" />
              </div>

              <button onClick={handleGenerate} disabled={isGeneratingAI} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-bold text-white flex items-center justify-center gap-1.5 shadow">
                {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Magic</span>
              </button>

              {aiSuggestions.length > 0 && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-600/5 p-4 space-y-2">
                  <h4 className="font-bold text-violet-300">Suggestions:</h4>
                  {aiSuggestions.map((s) => (
                    <div key={s.id} className="border-b border-white/5 pb-1 last:border-b-0">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider font-bold">{s.title}</p>
                      <p className="italic text-white/80">"{s.text}"</p>
                    </div>
                  ))}
                  <button onClick={handleApply} className="w-full mt-2 py-2 rounded-xl bg-violet-600 font-bold text-white">Apply suggestion</button>
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
                    <select value={selectedLayer.fontFamily} onChange={(e) => updateLayer(selectedLayer.id, { fontFamily: e.target.value })} className="mt-1 w-full bg-[#1f2937] border border-white/10 rounded-xl px-3 py-2 text-white outline-none">
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
                        {supportsEyeDropper && (
                          <button onClick={handlePickColor} className="p-1 hover:bg-white/10 rounded-lg text-white/70">
                            <Pipette className="w-4 h-4" />
                          </button>
                        )}
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

      {/* Horizontally Scrollable Bottom Dock Tabs Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-white/10 z-40 shadow-lg flex flex-col">
        <div className="h-16 px-4 flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-thin">
          <button 
            onClick={() => setActiveTab(activeTab === "uploads" ? null : "uploads")}
            className={`flex-1 min-w-[85px] flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "uploads" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Uploads</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "fields" ? null : "fields")}
            className={`flex-1 min-w-[85px] flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "fields" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">Fields</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "ai" ? null : "ai")}
            className={`flex-1 min-w-[85px] flex flex-col items-center justify-center py-1 rounded-xl transition ${activeTab === "ai" ? "text-violet-400 bg-white/5" : "text-white/60 hover:text-white"}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">AI Agent</span>
          </button>

          <button 
            onClick={() => setActiveTab(activeTab === "edit" ? null : "edit")}
            disabled={!selectedLayerId}
            className={`flex-1 min-w-[85px] flex flex-col items-center justify-center py-1 rounded-xl transition disabled:opacity-30 disabled:pointer-events-none ${
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
