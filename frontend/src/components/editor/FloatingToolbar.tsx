"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@/store/editorstore";
import { 
  Bold, 
  Trash2, 
  Pipette, 
  Download, 
  Loader2,
  Undo,
  Redo
} from "lucide-react";

export default function FloatingToolbar() {
  const {
    layers,
    selectedLayerId,
    updateLayer,
    removeLayer,
    isExporting,
    exportPostersZip,
    posterFile,
    csvFile,
    activePreviewRowIndex,
    csvPreviews,
    updateActiveRowValue,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();

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

  // Dynamically load Google Fonts stylesheet containing Canva-like fonts
  useEffect(() => {
    const linkId = "google-fonts-canvas";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@400;700&family=Montserrat:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Oswald:wght@400;700&family=Lora:wght@400;700&family=Raleway:wght@400;700&family=Merriweather:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Caveat:wght@700&family=Dancing+Script:wght@700&family=Lobster&family=Bebas+Neue&family=Cinzel:wght@700&family=Great+Vibes&family=Satisfy&family=Permanent+Marker&family=Sacramento&family=Quicksand:wght@500;700&family=Nunito:wght@700&family=Anton&family=League+Spartan:wght@700&family=Cormorant+Garamond:ital,wght@1,600&family=Bodoni+Moda:ital,wght@1,600&family=Libre+Baskerville:wght@700&family=Shadows+Into+Light&family=Yellowtail&display=swap";
      document.head.appendChild(link);
    }
  }, []);

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

  const handleExport = () => {
    if (!posterFile || !csvFile) {
      alert("Please upload a base poster template and a CSV/Excel file in the sidebar first.");
      return;
    }
    if (layers.length === 0) {
      alert("Please map at least one text field (e.g. Customer Name) before exporting.");
      return;
    }
    exportPostersZip();
  };

  // Determine current text value based on preview row or layer default fallback
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
    <header className="w-full h-16 border-b border-white/10 bg-[#111827] px-4 md:px-6 flex items-center justify-between z-40 shrink-0 select-none">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <img src="/icon.png" alt="Posterly Logo" className="h-13 w-13 object-contain rounded-xl shadow-md shadow-violet-500/10" />
        <span className="font-black text-sm tracking-wide text-white">Posterly Studio</span>
      </div>

      {/* Middle: Designing Sections */}
      <div className="hidden md:flex flex-1 justify-center max-w-3xl px-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl transition-all duration-200">
          {/* Inline Text Input for Typo Correction */}
          <input
            type="text"
            value={getCurrentTextValue()}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={!selectedLayer}
            placeholder={selectedLayer ? "Edit text content..." : "Select a layer..."}
            className="w-36 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white outline-none placeholder:text-white/30 focus:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Edit mapped value / text override"
          />

          {/* Font Family Select */}
          <div className={!selectedLayer ? "opacity-40 pointer-events-none" : ""}>
            <select
              value={selectedFont}
              onChange={(e) => handleFontChange(e.target.value)}
              disabled={!selectedLayer}
              className="rounded-xl border border-white/10 bg-[#1f2937] px-2 py-1 text-xs text-white outline-none cursor-pointer hover:bg-white/15 max-w-[100px] disabled:cursor-not-allowed"
            >
              <optgroup label="Sans-Serif" className="text-white bg-[#111827]">
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Oswald">Oswald</option>
                <option value="Raleway">Raleway</option>
                <option value="Quicksand">Quicksand</option>
                <option value="Nunito">Nunito</option>
                <option value="League Spartan">League Spartan</option>
                <option value="Arial">Arial</option>
              </optgroup>

              <optgroup label="Serif" className="text-white bg-[#111827]">
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Cinzel">Cinzel</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="Bodoni Moda">Bodoni Moda</option>
                <option value="Libre Baskerville">Libre Baskerville</option>
                <option value="Georgia">Georgia</option>
              </optgroup>

              <optgroup label="Handwriting / Script" className="text-white bg-[#111827]">
                <option value="Pacifico">Pacifico</option>
                <option value="Caveat">Caveat</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Great Vibes">Great Vibes</option>
                <option value="Satisfy">Satisfy</option>
                <option value="Sacramento">Sacramento</option>
                <option value="Yellowtail">Yellowtail</option>
              </optgroup>

              <optgroup label="Display / Bold" className="text-white bg-[#111827]">
                <option value="Bebas Neue">Bebas Neue</option>
                <option value="Permanent Marker">Permanent Marker</option>
                <option value="Lobster">Lobster</option>
                <option value="Anton">Anton</option>
                <option value="Shadows Into Light">Shadows Into Light</option>
              </optgroup>
            </select>
          </div>

          {/* Undo / Redo Buttons */}
          <div className="flex items-center gap-1 bg-white/10 rounded-xl px-1.5 py-0.5 text-white">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Input */}
          <div className={`flex items-center rounded-xl border border-white/10 bg-white/10 px-1 py-0.5 text-white transition-opacity ${!selectedLayer ? "opacity-40 pointer-events-none" : ""}`}>
            <button 
              onClick={() => selectedLayer && updateLayer(selectedLayer.id, { fontSize: Math.max(10, selectedLayer.fontSize - 2) })}
              disabled={!selectedLayer}
              className="px-1.5 py-0.5 text-xs hover:bg-white/10 rounded-lg cursor-pointer disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              value={selectedLayer ? selectedLayer.fontSize : 0}
              onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { fontSize: Math.max(10, Number(e.target.value)) })}
              disabled={!selectedLayer}
              className="w-8 text-center bg-transparent text-xs outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:cursor-not-allowed"
            />
            <button 
              onClick={() => selectedLayer && updateLayer(selectedLayer.id, { fontSize: selectedLayer.fontSize + 2 })}
              disabled={!selectedLayer}
              className="px-1.5 py-0.5 text-xs hover:bg-white/10 rounded-lg cursor-pointer disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Color Input */}
          <div className={`flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-1.5 py-0.5 text-white transition-opacity ${!selectedLayer ? "opacity-40 pointer-events-none" : ""}`}>
            <input
              type="color"
              value={selectedLayer ? selectedLayer.fontColor : "#000000"}
              onChange={(e) => selectedLayer && updateLayer(selectedLayer.id, { fontColor: e.target.value })}
              disabled={!selectedLayer}
              className="h-5 w-5 cursor-pointer rounded border-none bg-transparent disabled:cursor-not-allowed"
            />
            {supportsEyeDropper && (
              <button
                onClick={handlePickColor}
                disabled={!selectedLayer}
                className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white cursor-pointer disabled:cursor-not-allowed"
                title="Pick color from poster"
              >
                <Pipette className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bold Toggle */}
          <button
            onClick={() => selectedLayer && updateLayer(selectedLayer.id, { fontWeight: selectedLayer.fontWeight === "bold" ? "normal" : "bold" })}
            disabled={!selectedLayer}
            className={`p-1.5 rounded-xl border border-white/10 hover:bg-white/15 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
              selectedLayer?.fontWeight === "bold" ? "bg-violet-600/30 border-violet-500/50 text-violet-400" : "text-white/70"
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Delete Layer */}
          <button
            onClick={() => selectedLayer && removeLayer(selectedLayer.id)}
            disabled={!selectedLayer}
            className="p-1.5 rounded-xl border border-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Delete Text Layer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Export ZIP Button */}
      <div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1.5 md:gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Generating ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}