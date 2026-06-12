"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import JSZip from "jszip";

const MASTER_PROMPT = `You are a world-class luxury real-estate creative director, branding strategist, marketing psychologist, architectural visualization expert, luxury branding consultant, and high-conversion advertisement designer.

The uploaded image is an existing real-estate poster.

IMPORTANT

Treat the uploaded poster ONLY as a source of:

• Project information
• Layout understanding
• Township planning
• Amenities
• Approvals
• Pricing
• Contact details
• Location details
• Investment information

Do NOT use the uploaded poster as a visual design reference.

Do NOT copy:

• Colors
• Layout
• Typography
• Composition
• Icons
• Decorative elements
• Information arrangement
• Brochure structure
• CTA design
• Visual hierarchy

The final advertisement must be completely redesigned.

──────────────────────────────

USER CAMPAIGN INPUT

{{USER_CAMPAIGN_INPUT}}

──────────────────────────────

CAMPAIGN OVERRIDE ENGINE

The uploaded poster acts as the baseline project information source.

Priority Order:

1. USER_CAMPAIGN_INPUT
2. Extracted Poster Information
3. AI Generated Campaign Content

Whenever USER_CAMPAIGN_INPUT contains updated information, treat it as the newest and most accurate information.

This includes:

• Pricing
• Festival Pricing
• Offer Pricing
• EMI Information
• Registration Offers
• Booking Offers
• Plot Availability
• Scarcity Information
• Contact Details
• Address Information
• Marketing Messages
• Headlines
• Taglines
• CTA Messages
• Offer Validity Dates

If USER_CAMPAIGN_INPUT supplies both original price and offer price:

Display both.

Example:

Original Price ₹1250/SQFT
Festival Price ₹999/SQFT

If USER_CAMPAIGN_INPUT only supplies offer pricing:

Display only the supplied pricing.

Do not invent original pricing.

If USER_CAMPAIGN_INPUT does not specify a field:

Preserve the extracted project information.

──────────────────────────────

PROJECT INFORMATION RULE

Automatically identify and preserve all business-critical information including:

• Builder Name
• Project Name
• Layout Name
• Approval Information
• Pricing
• Amenities
• Contact Details
• Office Address
• Location Information
• Plot Details
• Project Specifications
• Investment Information
• Sales Information
• Legal Information
• Customer Trust Information
• Any other factual project information visible in the poster

Preserve all factual information unless overridden by USER_CAMPAIGN_INPUT.

Never invent project facts.

──────────────────────────────

CREATIVE CONCEPT EXPLORATION RULE

Before designing the final advertisement, internally explore multiple campaign concepts.

Potential concepts include:

• Smart City Expansion
• Infrastructure Growth
• Future Appreciation
• Wealth Creation
• Family Legacy
• Festival Prosperity
• Premium Lifestyle
• Investor Opportunity
• Landmark Township
• Community Living
• Golden Opportunity
• Future Ready Living

Select the strongest concept.

Only then create the final advertisement.

Avoid generic brochure designs.

The final output should feel like a premium advertising campaign rather than a property flyer.

──────────────────────────────

CAMPAIGN DEVELOPMENT RULE

If USER_CAMPAIGN_INPUT is provided:

Use it as the primary campaign direction.

Convert it into:

• Headline
• Tagline
• Emotional Story
• Investment Narrative
• Hero Visual
• Visual Atmosphere
• Buyer Psychology
• Marketing Hook
• Call To Action

Build the entire advertisement around the campaign.

The campaign should influence:

• Environment
• Lighting
• Mood
• Storytelling
• Landscaping
• Atmosphere
• People
• Branding
• Visual Style

Do not use the campaign merely as decoration.

──────────────────────────────

PROJECT VISUALIZATION RULE

The uploaded poster represents a plotted-layout real-estate project.

The plotted layout is one of the strongest selling points.

It must remain clearly visible.

The audience must immediately understand:

• What is being sold
• How the layout is planned
• Where the roads are
• Where the parks are
• Where the amenities are
• Why the investment is valuable

Do not hide the layout behind decorative elements.

Do not generate:

• Gate-only advertisements
• Entrance-only advertisements
• Building-only advertisements

──────────────────────────────

SITE BOUNDARY ENFORCEMENT RULE

The plotted layout represents a legally defined township.

The project boundary must always be clearly visible.

Display:

• Complete compound wall
• Defined perimeter
• Security-controlled township edges
• Boundary landscaping
• Perimeter plantations
• Township edge treatment

All plots, roads, parks, amenities, and open spaces must remain completely inside the project boundary.

The township must never visually merge into surrounding land.

Roads must not extend beyond project boundaries.

Plots must not blend into external terrain.

The viewer must instantly understand:

"This is a clearly defined approved plotted development."

Avoid:

• Floating plots
• Open-ended roads
• Missing boundaries
• Township merging into farmland
• Undefined project limits

──────────────────────────────

MASTERPLAN CLARITY RULE

The township planning must be understandable within 3 seconds.

Clearly display:

• Plot divisions
• Internal roads
• Main boulevard
• Entrance axis
• Parks
• Open spaces
• Amenities
• Compound walls
• Township structure

Avoid excessive visual effects that obscure layout visibility.

──────────────────────────────

HERO VISUAL RULE

Preferred perspective:

Premium drone camera view from above and slightly in front of the entrance.

The image should show:

• Grand entrance
• Main roads
• Plot layout
• Parks
• Amenities
• Township planning
• Development scale
• Compound wall
• Project boundary

Visual balance:

70% Layout Visibility

20% Entrance Experience

10% Campaign Storytelling

The layout must remain the hero.

──────────────────────────────

FULL CANVAS DESIGN RULE

Design the advertisement as a unified premium campaign.

Do not default to:

• White lower sections
• White information panels
• Generic brochure templates
• Top-image bottom-text layouts

The entire poster should feel like one integrated composition.

Allow the campaign theme to influence:

• Background
• Colors
• Typography
• Information Cards
• Decorative Elements
• Atmosphere
• Lighting

Only use white backgrounds if the chosen campaign concept genuinely requires them.

──────────────────────────────

FESTIVAL INTEGRATION RULE

If the campaign is based on a festival:

Integrate the festival naturally into:

• Entrance decorations
• Landscaping
• People
• Atmosphere
• Lighting
• Township branding

Do not simply place festival objects on top of the poster.

The festival should influence the entire environment.

──────────────────────────────

DESIGN REQUIREMENTS

Create:

• Luxury real-estate branding
• Strong visual hierarchy
• Cinematic quality
• Architectural visualization quality
• Premium typography
• Elegant information cards
• Magazine-cover aesthetics
• Social-media-ready composition
• Premium brochure quality
• High-conversion marketing design

The final design should feel comparable to work produced by top international branding agencies.

──────────────────────────────

REALISM RULE

Photorealistic architectural visualization.

Drone photography realism.

Ultra-realistic township rendering.

Natural lighting.

Premium landscape architecture.

Professional real-estate marketing quality.

Avoid:

• Cartoon appearance
• Unrealistic geometry
• Distorted roads
• Floating structures
• Text corruption
• Unrealistic layouts

──────────────────────────────

FINAL OBJECTIVE

Create a completely new premium real-estate advertisement that preserves factual project information while reinventing all visual design.

The final result should feel like an award-winning campaign from a top-tier international real-estate branding agency.

The viewer should immediately feel:

"I want to invest here."`;

const compilePrompt = (userInput: string): string => {
  const campaign = userInput && userInput.trim() ? userInput.trim() : "Create a luxury real-estate advertisement with premium aesthetic.";
  return MASTER_PROMPT.replace(/\{\{USER_CAMPAIGN_INPUT\}\}/g, campaign).replace(/\{USER_CAMPAIGN_INPUT\}/g, campaign);
};

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
  isGeneratingAIPoster: boolean;
  isPreviewingPrompt: boolean;

  // Actions
  autoDetectCoordinates: () => Promise<void>;
  exportPostersZip: () => Promise<void>;
  generateAIPoster: (file: File, additionalInput: string, customPrompt?: string) => Promise<void>;
  generatePromptPreview: (file: File, additionalInput: string) => Promise<void>;
  previewedPrompt: string;
  setPreviewedPrompt: (prompt: string) => void;
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
  const [isGeneratingAIPoster, setIsGeneratingAIPoster] = useState(false);
  const [isPreviewingPrompt, setIsPreviewingPrompt] = useState(false);
  const [previewedPrompt, setPreviewedPrompt] = useState("");

  // AI suggestions list
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  // Placement Mode State
  const [placingColumn, setPlacingColumn] = useState<string | null>(null);

  // Cleanup object URL on change
  const setPosterFile = (file: File | null) => {
    if (file && file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      alert("Only PNG files are allowed on the canvas.");
      return;
    }
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

  // Load default poster from public folder on mount if exists
  useEffect(() => {
    const loadDefaultPoster = async () => {
      try {
        const res = await fetch("/default.png");
        if (res.ok) {
          const blob = await res.blob();
          const file = new File([blob], "default.png", { type: "image/png" });
          setPosterFile(file);
          console.log("Loaded default poster from public: /default.png");
        }
      } catch (e) {
        console.error("Failed to load default poster:", e);
      }
    };
    loadDefaultPoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const generateAIPoster = async (file: File, additionalInput: string, customPrompt?: string) => {
    setIsGeneratingAIPoster(true);
    try {
      const isCustom = !!(customPrompt && customPrompt.trim());
      const rawPrompt = isCustom ? customPrompt! : additionalInput;
      if (!rawPrompt || !rawPrompt.trim()) {
        throw new Error("Campaign direction prompt cannot be empty.");
      }

      const finalPrompt = isCustom ? rawPrompt.trim() : compilePrompt(rawPrompt);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("finalPrompt", finalPrompt);
      formData.append("size", "1024x1536");

      const res = await fetch(`${API_BASE_URL}/api/poster/generate-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.detail || "Failed to generate AI poster");
      }

      const data = await res.json();
      if (!data.success || !data.imageUrl) {
        throw new Error(data.message || "Invalid response from API");
      }

      // 1. Download/Fetch the generated image URL as a Blob
      const fullUrl = data.imageUrl.startsWith("http")
        ? data.imageUrl
        : `${API_BASE_URL}${data.imageUrl}`;

      const imgRes = await fetch(fullUrl);
      const imgBlob = await imgRes.blob();
      const generatedFile = new File([imgBlob], "generated_poster.png", { type: "image/png" });
      
      // 2. Set the generated file as the poster template
      setPosterFile(generatedFile);

      // 3. Automatically download the generated image
      const downloadUrl = URL.createObjectURL(imgBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `redesigned_poster_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      alert("Premium AI real-estate poster generated successfully!");
    } catch (err: any) {
      console.error("Failed to generate AI poster:", err);
      alert(`AI Poster Generation Error: ${err.message || err}. Falling back to default-gen.png.`);
      
      try {
        const fallbackRes = await fetch("/default-gen.png");
        if (fallbackRes.ok) {
          const fallbackBlob = await fallbackRes.blob();
          const fallbackFile = new File([fallbackBlob], "default-gen.png", { type: "image/png" });
          setPosterFile(fallbackFile);
          console.log("Fell back to default-gen.png on canvas.");
        } else {
          console.error("Failed to fetch /default-gen.png fallback image.");
        }
      } catch (fallbackErr) {
        console.error("Error loading fallback default-gen.png:", fallbackErr);
      }
    } finally {
      setIsGeneratingAIPoster(false);
    }
  };

  const generatePromptPreview = async (file: File, additionalInput: string) => {
    setIsPreviewingPrompt(true);
    try {
      const formData = new FormData();
      formData.append("poster", file);
      if (additionalInput.trim()) {
        formData.append("user_campaign_input", additionalInput);
      }

      const res = await fetch(`${API_BASE_URL}/api/preview-prompt`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to generate prompt preview");
      }

      const data = await res.json();
      if (!data.success || !data.final_image_prompt) {
        throw new Error("Invalid response from prompt preview API");
      }

      setPreviewedPrompt(data.final_image_prompt);
    } catch (err: any) {
      console.error("Failed to preview prompt:", err);
      alert(`Prompt Preview Error: ${err.message || err}`);
    } finally {
      setIsPreviewingPrompt(false);
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
        isGeneratingAIPoster,
        isPreviewingPrompt,

        autoDetectCoordinates,
        exportPostersZip,
        generateAISuggestions,
        generateAIPoster,
        generatePromptPreview,
        previewedPrompt,
        setPreviewedPrompt,
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
