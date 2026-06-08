"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import JSZip from "jszip";

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
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

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

interface HistoryState {
  past: TextLayer[][];
  present: TextLayer[];
  future: TextLayer[][];
}

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterFile, setPosterFileState] = useState<File | null>(null);
  const [posterDimensions, setPosterDimensions] = useState({ width: 0, height: 0 });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvPreviews, setCsvPreviews] = useState<Record<string, string>[]>([]);
  const [csvValidation, setCsvValidation] = useState<CSVValidation | null>(null);
  const [totalCSVRows, setTotalCSVRows] = useState(0);

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });

  const layers = history.present;

  const setLayers = React.useCallback((
    action: React.SetStateAction<TextLayer[]>
  ) => {
    setHistory((prevHistory) => {
      const nextPresent = typeof action === "function" ? action(prevHistory.present) : action;
      if (nextPresent === prevHistory.present) return prevHistory;

      const newPast = [...prevHistory.past, prevHistory.present];
      return {
        past: newPast.length > 50 ? newPast.slice(newPast.length - 50) : newPast,
        present: nextPresent,
        future: [],
      };
    });
  }, []);

  const undo = React.useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.past.length === 0) return prevHistory;

      const previous = prevHistory.past[prevHistory.past.length - 1];
      const newPast = prevHistory.past.slice(0, prevHistory.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prevHistory.present, ...prevHistory.future],
      };
    });
  }, []);

  const redo = React.useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.future.length === 0) return prevHistory;

      const next = prevHistory.future[0];
      const newFuture = prevHistory.future.slice(1);

      return {
        past: [...prevHistory.past, prevHistory.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey) {
          if (e.key === "z" || e.key === "Z") {
            e.preventDefault();
            redo();
          }
        } else {
          if (e.key === "z" || e.key === "Z") {
            e.preventDefault();
            undo();
          } else if (e.key === "y" || e.key === "Y") {
            e.preventDefault();
            redo();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

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
    if (!posterFile || csvPreviews.length === 0) {
      alert("Please upload both a poster template and a CSV/Excel file.");
      return;
    }
    if (layers.length === 0) {
      alert("Please map at least one text field to the canvas before exporting.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Create a JSZip instance
      const zip = new JSZip();

      // 2. Load the template image
      const img = new Image();
      const objectUrl = URL.createObjectURL(posterFile);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load poster image"));
        img.src = objectUrl;
      });

      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      // 3. Create a canvas at original resolution
      const canvas = document.createElement("canvas");
      canvas.width = imgW;
      canvas.height = imgH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get 2D context");

      // 4. Find name column for file naming
      let nameColumn: string | null = null;
      if (csvPreviews.length > 0) {
        const firstRow = csvPreviews[0];
        for (const col of Object.keys(firstRow)) {
          if (["name", "fullname", "full name", "first name", "customer"].includes(col.toLowerCase())) {
            nameColumn = col;
            break;
          }
        }
      }

      const existingNames = new Set<string>();

      // Helper function to wrap text
      const wrapText = (textStr: string, maxWidth: number) => {
        if (!maxWidth || maxWidth <= 0) return [textStr];
        const words = textStr.split(/\s+/);
        if (words.length === 0) return [];
        const linesList: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width <= maxWidth) {
            currentLine = testLine;
          } else {
            linesList.push(currentLine);
            currentLine = word;
          }
        }
        linesList.push(currentLine);
        return linesList;
      };

      // 5. Generate image for each row
      for (let idx = 0; idx < csvPreviews.length; idx++) {
        const row = csvPreviews[idx];
        
        // Clear canvas and draw background template
        ctx.clearRect(0, 0, imgW, imgH);
        ctx.drawImage(img, 0, 0, imgW, imgH);

        // Draw each text layer
        for (const layer of layers) {
          // Get text value, checking for manual row overrides
          let textVal = row[layer.column] !== undefined ? String(row[layer.column]) : "";
          if (rowEdits[idx] && rowEdits[idx][layer.column] !== undefined) {
            textVal = String(rowEdits[idx][layer.column]);
          }
          textVal = textVal.trim();
          if (!textVal) continue;

          // Configure text styles
          const fontStyle = `${layer.fontWeight} ${layer.fontSize}px "${layer.fontFamily}"`;
          ctx.font = fontStyle;
          ctx.fillStyle = layer.fontColor;
          ctx.textBaseline = "top";

          // Calculate wrapped lines
          const lines = wrapText(textVal, layer.width);
          
          // Line height is 1.15 of font size
          const lineHeight = layer.fontSize * 1.15;
          let yOffset = layer.y;

          for (const line of lines) {
            const metrics = ctx.measureText(line);
            let xDraw = layer.x;

            if (layer.width && layer.width > 0) {
              if (layer.align === "center") {
                ctx.textAlign = "center";
                xDraw = layer.x + layer.width / 2;
              } else if (layer.align === "right") {
                ctx.textAlign = "right";
                xDraw = layer.x + layer.width;
              } else {
                ctx.textAlign = "left";
                xDraw = layer.x;
              }
            } else {
              ctx.textAlign = layer.align || "left";
              xDraw = layer.x;
            }

            ctx.fillText(line, xDraw, yOffset);
            yOffset += lineHeight;
          }
        }

        // Convert canvas to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/png");
        });

        if (blob) {
          // Generate unique file name
          let baseName = "";
          if (nameColumn && row[nameColumn]) {
            baseName = String(row[nameColumn])
              .trim()
              .replace(/[^a-zA-Z0-9\s\-_]/g, "")
              .replace(/\s+/g, "_");
          }
          if (!baseName) {
            baseName = `poster_${idx + 1}`;
          }

          let candidate = baseName.toLowerCase();
          let counter = 1;
          while (existingNames.has(candidate)) {
            candidate = `${baseName.toLowerCase()}_${counter}`;
            counter++;
          }
          existingNames.add(candidate);
          const fileName = counter > 1 ? `${baseName}_${counter - 1}.png` : `${baseName}.png`;

          zip.file(fileName, blob);
        }
      }

      // 6. Generate ZIP file and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(content);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${posterFile.name.split(".")[0]}_personalized_posters.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Clean up URLs
      URL.revokeObjectURL(objectUrl);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Client-side ZIP export failed:", err);
      alert("Error generating bulk zip file in browser. Please check console.");
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
        undo,
        redo,
        canUndo,
        canRedo,
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
