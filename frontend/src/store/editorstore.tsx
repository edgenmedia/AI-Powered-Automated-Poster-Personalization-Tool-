"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface TextLayer {
  id: string;
  column: string;
  x: number; // original pixel coordinates on the poster template
  y: number;
  width: number; // original width (0 if unconstrained)
  fontSize: number; // original size
  fontColor: string;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  align: "left" | "center" | "right";
  defaultText?: string; // fallback if CSV data is not loaded
}

export interface CSVValidation {
  total_rows: number;
  columns: string[];
  empty_counts: Record<
    string,
    { count: number; empty_rows: number[] }
  >;
  phone_validation: Record<
    string,
    { is_phone_col: boolean; invalid_count: number; invalid_rows: number[] }
  >;
}

export interface AISuggestion {
  id: string;
  title: string;
  text: string;
  role: string; // "heading" | "body" | "contact"
  suggestedStyles: Partial<TextLayer>;
}

export interface EditorContextType {
  // Poster State
  posterUrl: string | null;
  posterFile: File | null;
  setPosterFile: (file: File | null) => void;
  posterDimensions: { width: number; height: number };
  setPosterDimensions: (dims: { width: number; height: number }) => void;

  // CSV State
  csvFile: File | null;
  csvColumns: string[];
  csvPreviews: Record<string, string>[];
  csvValidation: CSVValidation | null;
  totalCSVRows: number;
  setCSVFile: (file: File | null) => void;
  parseCSV: (file: File) => Promise<void>;

  // Interactive Layers State
  layers: TextLayer[];
  setLayers: React.Dispatch<React.SetStateAction<TextLayer[]>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addLayerForColumn: (column: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<TextLayer>) => void;

  // Active Preview Row
  activePreviewRowIndex: number;
  setActivePreviewRowIndex: (index: number) => void;
  updateActiveRowValue: (column: string, newValue: string) => void;

  // API Call Statuses
  isParsingCSV: boolean;
  isDetecting: boolean;
  isExporting: boolean;
  isGeneratingAI: boolean;

  // Actions
  autoDetectCoordinates: () => Promise<void>;
  exportPostersZip: () => Promise<void>;
  generateAISuggestions: (
    occasion: string,
    tone: string,
    instruction: string
  ) => Promise<void>;
  aiSuggestions: AISuggestion[];
  applyAISuggestions: (suggestions: AISuggestion[]) => void;

  // Placement Mode State
  placingColumn: string | null;
  setPlacingColumn: (col: string | null) => void;

  // Row edits tracking
  rowEdits: Record<number, Record<string, string>>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterFile, setPosterFileState] = useState<File | null>(null);
  const [posterDimensions, setPosterDimensions] = useState({ width: 0, height: 0 });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvPreviews, setCsvPreviews] = useState<Record<string, string>[]>([]);
  const [csvValidation, setCsvValidation] = useState<CSVValidation | null>(null);
  const [totalCSVRows, setTotalCSVRows] = useState(0);

  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activePreviewRowIndex, setActivePreviewRowIndex] = useState(0);

  // Row edits tracking state
  const [rowEdits, setRowEdits] = useState<Record<number, Record<string, string>>>({});

  const updateActiveRowValue = (column: string, newValue: string) => {
    setCsvPreviews((prev) => {
      const updated = [...prev];
      if (updated[activePreviewRowIndex]) {
        updated[activePreviewRowIndex] = {
          ...updated[activePreviewRowIndex],
          [column]: newValue,
        };
      }
      return updated;
    });

    setRowEdits((prev) => {
      const currentRowEdits = prev[activePreviewRowIndex] || {};
      return {
        ...prev,
        [activePreviewRowIndex]: {
          ...currentRowEdits,
          [column]: newValue,
        },
      };
    });
  };

  // Status flags
  const [isParsingCSV, setIsParsingCSV] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // AI suggestions list
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // Placement Mode State
  const [placingColumn, setPlacingColumn] = useState<string | null>(null);

  // Cleanup object URL on change
  const setPosterFile = (file: File | null) => {
    if (posterUrl) {
      URL.revokeObjectURL(posterUrl);
    }
    setPosterFileState(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPosterUrl(url);
      
      // Load image to get original dimensions
      const img = new Image();
      img.onload = () => {
        setPosterDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    } else {
      setPosterUrl(null);
      setPosterDimensions({ width: 0, height: 0 });
    }
  };

  const setCSVFile = (file: File | null) => {
    setCsvFile(file);
    setRowEdits({});
    if (!file) {
      setCsvColumns([]);
      setCsvPreviews([]);
      setCsvValidation(null);
      setTotalCSVRows(0);
      setActivePreviewRowIndex(0);
    }
  };

  const parseCSV = async (file: File) => {
    setIsParsingCSV(true);
    setCSVFile(file);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE_URL}/api/parse-columns`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse file structure");
      }

      const data = await res.json();
      setCsvColumns(data.columns);
      setCsvPreviews(data.preview_rows || []);
      setCsvValidation(data.validation);
      setTotalCSVRows(data.total_rows || 0);
      setActivePreviewRowIndex(0);
    } catch (err) {
      console.error("CSV parse error:", err);
      alert("Error parsing contact file. Make sure backend is running.");
    } finally {
      setIsParsingCSV(false);
    }
  };

  const addLayerForColumn = (column: string) => {
    if (layers.some((l) => l.column === column)) return;

    // Use image dimensions to position relatively or default to center
    const defaultX = posterDimensions.width ? Math.max(50, (posterDimensions.width - 400) / 2) : 100;
    const defaultY = posterDimensions.height ? Math.max(100, posterDimensions.height * 0.5) : 300;

    const newLayer: TextLayer = {
      id: `layer-${column}-${Date.now()}`,
      column,
      x: defaultX,
      y: defaultY,
      width: posterDimensions.width ? Math.min(400, posterDimensions.width - 100) : 300,
      fontSize: 36,
      fontColor: "#000000",
      fontFamily: "Inter",
      fontWeight: "bold",
      align: "center",
    };

    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const autoDetectCoordinates = async () => {
    if (!posterFile) {
      alert("Please upload a poster first.");
      return;
    }
    if (csvColumns.length === 0) {
      alert("Please upload a CSV / Excel file first.");
      return;
    }

    setIsDetecting(true);
    try {
      const formData = new FormData();
      formData.append("poster", posterFile);
      formData.append("columns", JSON.stringify(csvColumns));

      const res = await fetch(`${API_BASE_URL}/api/auto-detect`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Auto-detection request failed");
      }

      const data = await res.json();
      const detections = data.detections || [];

      if (detections.length === 0) {
        alert("OCR did not find matches on the poster. Placing default layers.");
        // Place default layers as fallback
        csvColumns.forEach((col) => {
          addLayerForColumn(col);
        });
        return;
      }

      // Merge detections with current layers
      const updatedLayers = [...layers];
      detections.forEach((det: any) => {
        const existingIdx = updatedLayers.findIndex((l) => l.column === det.column);
        
        const newLayer: TextLayer = {
          id: existingIdx >= 0 ? updatedLayers[existingIdx].id : `layer-${det.column}-${Date.now()}`,
          column: det.column,
          x: det.x,
          y: det.y,
          width: det.width || 300,
          fontSize: det.fontSize || 32,
          fontColor: det.fontColor || "#000000",
          fontFamily: det.fontFamily || "Inter",
          fontWeight: det.fontWeight === "bold" ? "bold" : "normal",
          align: det.align || "left",
        };

        if (existingIdx >= 0) {
          updatedLayers[existingIdx] = newLayer;
        } else {
          updatedLayers.push(newLayer);
        }
      });

      setLayers(updatedLayers);
      alert(`Auto-detected coordinates for: ${detections.map((d: any) => d.column).join(", ")}`);
    } catch (err) {
      console.error("OCR auto-detect failed:", err);
      // Fallback: Place default layers
      csvColumns.forEach((col) => {
        addLayerForColumn(col);
      });
      alert("Could not complete OCR. Placed default layers in the center.");
    } finally {
      setIsDetecting(false);
    }
  };

  const exportPostersZip = async () => {
    if (!posterFile || !csvFile) {
      alert("Please upload both a poster template and a CSV/Excel file.");
      return;
    }
    if (layers.length === 0) {
      alert("Please map at least one text field to the canvas before exporting.");
      return;
    }

    setIsExporting(true);
    try {
      const formData = new FormData();
      formData.append("poster", posterFile);
      formData.append("data_file", csvFile);
      
      // format mappings to match FieldMapping Pydantic model in backend
      const mappings = layers.map((l) => ({
        column: l.column,
        x: l.x,
        y: l.y,
        width: l.width,
        fontSize: l.fontSize,
        fontColor: l.fontColor,
        fontFamily: l.fontFamily,
        fontWeight: l.fontWeight,
        align: l.align,
      }));

      formData.append("mappings", JSON.stringify(mappings));
      formData.append("row_edits", JSON.stringify(rowEdits));

      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Bulk generation failed on server");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${posterFile.name.split(".")[0]}_personalized_posters.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP export failed:", err);
      alert("Error generating bulk zip file. Verify backend server logs.");
    } finally {
      setIsExporting(false);
    }
  };

  const generateAISuggestions = async (
    occasion: string,
    tone: string,
    instruction: string
  ) => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, tone, instruction }),
      });

      if (!res.ok) {
        throw new Error("AI suggestion request failed");
      }

      const data = await res.json();
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("AI suggestions failed:", err);
      alert("AI Suggestion server error. Ensure backend is running and up-to-date.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyAISuggestions = (suggestions: AISuggestion[]) => {
    if (suggestions.length === 0) return;

    // Remove existing suggestions or add to the current layers
    const updatedLayers = [...layers];

    suggestions.forEach((s) => {
      // Find if we already have a layer for this column
      const existingIdx = updatedLayers.findIndex((l) => l.column === s.role);
      const suggestedX = posterDimensions.width ? Math.max(50, (posterDimensions.width - 450) / 2) : 100;

      const newLayer: TextLayer = {
        id: existingIdx >= 0 ? updatedLayers[existingIdx].id : `layer-ai-${s.role}-${Date.now()}`,
        column: s.role, // Use the role/key as column
        x: s.suggestedStyles?.x || suggestedX,
        y: s.suggestedStyles?.y || (s.role === "heading" ? 150 : s.role === "body" ? 300 : 550),
        width: s.suggestedStyles?.width || 450,
        fontSize: s.suggestedStyles?.fontSize || 36,
        fontColor: s.suggestedStyles?.fontColor || "#ffffff",
        fontFamily: s.suggestedStyles?.fontFamily || "Poppins",
        fontWeight: s.suggestedStyles?.fontWeight || "bold",
        align: s.suggestedStyles?.align || "center",
      };

      if (existingIdx >= 0) {
        updatedLayers[existingIdx] = newLayer;
      } else {
        updatedLayers.push(newLayer);
      }

      // Add mockup csv columns if not existing
      if (!csvColumns.includes(s.role)) {
        setCsvColumns((prev) => [...prev, s.role]);
        // Also add mockup row preview text
        setCsvPreviews((prev) => {
          if (prev.length === 0) {
            return [{ [s.role]: s.text }];
          }
          return prev.map((row) => ({
            ...row,
            [s.role]: row[s.role] || s.text,
          }));
        });
      } else {
        // Update the preview data to show the AI's copy
        setCsvPreviews((prev) => {
          if (prev.length === 0) {
            return [{ [s.role]: s.text }];
          }
          return prev.map((row) => ({
            ...row,
            [s.role]: s.text,
          }));
        });
      }
    });

    setLayers(updatedLayers);
    alert("Applied AI generated layers to the canvas!");
  };

  return (
    <EditorContext.Provider
      value={{
        posterUrl,
        posterFile,
        setPosterFile,
        posterDimensions,
        setPosterDimensions,

        csvFile,
        csvColumns,
        csvPreviews,
        csvValidation,
        totalCSVRows,
        setCSVFile,
        parseCSV,

        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        addLayerForColumn,
        removeLayer,
        updateLayer,

        activePreviewRowIndex,
        setActivePreviewRowIndex,
        updateActiveRowValue,

        isParsingCSV,
        isDetecting,
        isExporting,
        isGeneratingAI,

        autoDetectCoordinates,
        exportPostersZip,
        generateAISuggestions,
        aiSuggestions,
        applyAISuggestions,

        placingColumn,
        setPlacingColumn,
        rowEdits,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
