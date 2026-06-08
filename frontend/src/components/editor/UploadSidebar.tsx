"use client";

import { useEditor } from "@/store/editorstore";
import { 
  Upload, 
  Check, 
  Plus, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Loader2,
  Wand2
} from "lucide-react";
import { useState } from "react";

export default function UploadSidebar({ width }: { width?: number }) {
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
    activePreviewRowIndex,
    setActivePreviewRowIndex,
    isParsingCSV,
    placingColumn,
    setPlacingColumn,
  } = useEditor();

  const [isValidationOpen, setIsValidationOpen] = useState(true);

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

  // Check if a CSV column is already mapped on the canvas
  const isColumnMapped = (col: string) => {
    return layers.some((layer) => layer.column === col);
  };

  return (
    <aside 
      className="hidden md:flex h-full border-r border-white/10 bg-[#111827] p-5 flex flex-col overflow-hidden shrink-0"
      style={{ width: width ?? 320 }}
    >
      <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
        <Upload className="w-5 h-5 text-violet-400" />
        <span>Campaign Uploads</span>
      </h2>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Base Poster Template Upload */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Base Poster</h3>
          
          <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all text-center">
            <Upload className="w-6 h-6 text-white/30 mb-2" />
            <span className="text-xs font-medium text-white/70">
              {posterFile ? posterFile.name : "Select Image Template"}
            </span>
            <span className="text-[10px] text-white/40 mt-1">PNG, JPG, JPEG (Max 10MB)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterUpload}
              className="hidden"
            />
          </label>

          {posterFile && posterDimensions.width > 0 && (
            <p className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Loaded: {posterDimensions.width} × {posterDimensions.height} px</span>
            </p>
          )}
        </div>

        {/* CSV/Excel Data Upload */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Spreadsheet Data</h3>

          <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-all text-center">
            {isParsingCSV ? (
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin mb-2" />
            ) : (
              <FileText className="w-6 h-6 text-white/30 mb-2" />
            )}
            <span className="text-xs font-medium text-white/70">
              {csvFile ? csvFile.name : "Select CSV / Excel"}
            </span>
            <span className="text-[10px] text-white/40 mt-1">.csv, .xlsx, .xls</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleCSVUpload}
              className="hidden"
              disabled={isParsingCSV}
            />
          </label>

          {totalCSVRows > 0 && (
            <p className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Parsed {totalCSVRows} rows successfully</span>
            </p>
          )}
        </div>

        {/* Live Preview Selector (Only shows when CSV data exists) */}
        {csvPreviews.length > 0 && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-600/5 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-300">Live Preview</h3>
            
            <div className="flex items-center justify-between bg-black/30 rounded-xl p-2.5">
              <button
                onClick={handlePrevRow}
                disabled={activePreviewRowIndex === 0}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center select-none">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  Row {activePreviewRowIndex + 1} of {csvPreviews.length}
                </p>
                <p className="text-xs font-semibold text-white/90 truncate max-w-[130px] mt-0.5">
                  {Object.values(csvPreviews[activePreviewRowIndex])[0] || "No data"}
                </p>
              </div>

              <button
                onClick={handleNextRow}
                disabled={activePreviewRowIndex === csvPreviews.length - 1}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Field Mappings & Columns */}
        {csvColumns.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Field Mapping</h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {csvColumns.map((col) => {
                const mapped = isColumnMapped(col);
                const isPlacing = placingColumn === col;
                
                return (
                  <div 
                    key={col}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                      isPlacing 
                        ? "bg-violet-600/20 border-violet-500 text-violet-300 animate-pulse" 
                        : "bg-black/20 border-white/5"
                    }`}
                  >
                    <span className="truncate max-w-[130px] text-white/80 font-medium" title={col}>
                      {col}
                    </span>
                    
                    {mapped ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                        <Check className="w-3 h-3" />
                        <span>Mapped</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPlacingColumn(isPlacing ? null : col)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                          isPlacing
                            ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20"
                            : "text-violet-400 hover:text-white bg-violet-500/10 hover:bg-violet-600"
                        }`}
                      >
                        {isPlacing ? "Click Canvas..." : "Add to Canvas"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CSV Diagnostics & Validation */}
        {csvValidation && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setIsValidationOpen(!isValidationOpen)}
              className="w-full flex items-center justify-between p-4 text-left border-b border-white/5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                <span>Spreadsheet Diagnostics</span>
              </h3>
              <span className="text-[10px] text-white/30">{isValidationOpen ? "Hide" : "Show"}</span>
            </button>

            {isValidationOpen && (
              <div className="p-4 space-y-3 bg-black/10 text-xs">
                {/* Empty cells count */}
                <div>
                  <h4 className="text-[11px] font-medium text-white/60 mb-1">Missing Values:</h4>
                  {Object.keys(csvValidation.empty_counts).length > 0 ? (
                    <ul className="space-y-1.5">
                      {Object.entries(csvValidation.empty_counts).map(([col, validation]: any) => (
                        <li key={col} className="rounded overflow-hidden">
                          <div className="flex justify-between text-yellow-300 bg-yellow-500/5 px-2 py-1 rounded">
                            <span>{col}</span>
                            <span className="font-semibold">{validation.count} empty</span>
                          </div>
                          {validation.count > 0 && (
                            <p className="text-[9px] text-white/40 mt-1 px-1">
                              Image numbers: {validation.empty_rows.map((r: number) => r + 1).join(", ")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded">✓ No missing values detected</p>
                  )}
                </div>

                
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}