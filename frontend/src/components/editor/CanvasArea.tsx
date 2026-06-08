"use client";

import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect, Group } from "react-konva";
import { useEditor, TextLayer } from "@/store/editorstore";
import { Download, Plus, Minus, RotateCcw, Search } from "lucide-react";

export default function CanvasArea() {
  const {
    posterUrl,
    layers,
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    activePreviewRowIndex,
    csvPreviews,
    placingColumn,
    setPlacingColumn,
  } = useEditor();

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [stageDraggable, setStageDraggable] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomInput, setZoomInput] = useState("100%");
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 500, height: 600 });

  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Measure container dimensions dynamically to fill the central split
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      setContainerSize({
        width: containerRef.current!.offsetWidth,
        height: containerRef.current!.offsetHeight,
      });
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Load image element from posterUrl
  useEffect(() => {
    if (!posterUrl) {
      setImageEl(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
    };
    img.src = posterUrl;
  }, [posterUrl]);

  // Reset stage zoom and pan when poster changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.position({ x: 0, y: 0 });
      stageRef.current.scale({ x: 1, y: 1 });
      stageRef.current.batchDraw();
      setZoom(1);
    }
  }, [posterUrl, imageEl]);

  // Force stage redraw when custom Google Fonts are fully loaded in the browser
  useEffect(() => {
    if (typeof window === "undefined" || !("fonts" in document)) return;

    const loadFonts = async () => {
      try {
        const promises = layers.map((layer) => document.fonts.load(`12px "${layer.fontFamily}"`));
        await Promise.all(promises);
        if (stageRef.current) {
          stageRef.current.batchDraw();
        }
      } catch (err) {
        console.error("Font loading error:", err);
      }
    };

    loadFonts();
  }, [layers]);

  // Fit poster template in the centered workspace
  let scale = 1;
  let basePosterWidth = 360;
  let basePosterHeight = 520;
  let basePosterX = (containerSize.width - basePosterWidth) / 2;
  let basePosterY = (containerSize.height - basePosterHeight) / 2;

  if (imageEl) {
    const imgW = imageEl.naturalWidth;
    const imgH = imageEl.naturalHeight;
    // Fit scale inside stage (leaving a 40px margin)
    scale = Math.min((containerSize.width - 40) / imgW, (containerSize.height - 40) / imgH);
    basePosterWidth = imgW * scale;
    basePosterHeight = imgH * scale;
    basePosterX = (containerSize.width - basePosterWidth) / 2;
    basePosterY = (containerSize.height - basePosterHeight) / 2;
  }

  // Get active preview text or placeholder/default override
  const getDisplayText = (layer: TextLayer) => {
    if (csvPreviews.length > 0) {
      const activeRow = csvPreviews[activePreviewRowIndex];
      return activeRow?.[layer.column] !== undefined 
        ? String(activeRow[layer.column]) 
        : (layer.defaultText || `[${layer.column}]`);
    }
    return layer.defaultText || `[${layer.column}]`;
  };

  // Click handler for Stage (creates a field if placing, otherwise deselects)
  const handleStageClick = (e: any) => {
    // 1. If in placement mode, drop the field at clicked position
    if (placingColumn) {
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      if (pointer) {
        // Convert screen coordinate to original pixel coordinate accounting for stage scale and position
        const stageScale = stage.scaleX();
        const clickX = (pointer.x - stage.x()) / stageScale;
        const clickY = (pointer.y - stage.y()) / stageScale;

        const origX = (clickX - basePosterX) / scale;
        const origY = (clickY - basePosterY) / scale;

        // Get sample text from first CSV row if available
        const sampleText = csvPreviews.length > 0 
          ? (csvPreviews[0]?.[placingColumn] || `[${placingColumn}]`)
          : `[${placingColumn}]`;

        const newLayer: TextLayer = {
          id: `layer-${placingColumn}-${Date.now()}`,
          column: placingColumn,
          x: origX,
          y: origY,
          width: 250, // default width
          fontSize: 31, // default size is 31
          fontColor: "#000000",
          fontFamily: "Arial", // default fontFamily is Arial
          fontWeight: "bold",
          align: "left", // default align is left
          defaultText: sampleText,
        };

        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        setPlacingColumn(null); // Exit placement mode
      }
      return;
    }

    // 2. Standard Click outside to deselect
    if (e.target === e.target.getStage() || e.target.name() === "background-image") {
      setSelectedLayerId(null);
    }
  };

  // Zoom stage on scroll wheel or touchpad pinch, preventing global website zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Pointer coordinates relative to the Stage position
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.1;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom between 0.4x and 5.0x
    if (newScale < 0.4 || newScale > 5.0) return;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    setZoom(newScale);
  };

  // Sync zoomInput with zoom state changes
  useEffect(() => {
    setZoomInput(`${Math.round(zoom * 100)}%`);
  }, [zoom]);

  // Close zoom dropdown on click/mousedown outside the control widget
  useEffect(() => {
    if (!showZoomDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const container = document.getElementById("zoom-controls-container");
      if (container && !container.contains(target)) {
        setShowZoomDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showZoomDropdown]);

  const handleZoomChange = (newScale: number) => {
    const clampedScale = Math.min(Math.max(newScale, 0.4), 5.0);
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    
    // Zoom relative to the center of the container
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;

    const mousePointTo = {
      x: (centerX - stage.x()) / oldScale,
      y: (centerY - stage.y()) / oldScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: centerX - mousePointTo.x * clampedScale,
      y: centerY - mousePointTo.y * clampedScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    
    setZoom(clampedScale);
  };

  const handleResetZoom = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.position({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });
    stage.batchDraw();
    setZoom(1);
  };

  const applyZoomFromInput = (val: string) => {
    const parsed = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed)) {
      const newScale = parsed / 100;
      handleZoomChange(newScale);
    } else {
      setZoomInput(`${Math.round(zoom * 100)}%`);
    }
  };

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInput(e.target.value);
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyZoomFromInput(zoomInput);
      e.currentTarget.blur();
    }
  };

  const handleZoomInputBlur = () => {
    applyZoomFromInput(zoomInput);
  };

  // Determine stage drag capability on mouse/touch down
  const handleStageMouseDown = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;
    const isTargetStageOrBg = e.target === e.target.getStage() || e.target.name() === "background-image";
    setStageDraggable(isTargetStageOrBg && !placingColumn);
  };

  // Pan Stage Drag Handling
  const handleStageDragStart = (e: any) => {
    const stage = stageRef.current;
    if (stage && !placingColumn) {
      stage.container().style.cursor = "grabbing";
    }
  };

  // Cursor handling feedback
  const handleStageMouseMove = (e: any) => {
    const stage = stageRef.current;
    if (!stage || placingColumn) return;

    if (stage.isDragging()) {
      stage.container().style.cursor = "grabbing";
    } else if (e.target.name() === "background-image" || e.target === stage) {
      stage.container().style.cursor = "grab";
    } else {
      stage.container().style.cursor = "default";
    }
  };

  // Download high-quality current previewed poster locally
  const handleDownloadCurrent = () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Deselect selection first to hide bounding borders in exported image
    setSelectedLayerId(null);

    // Wait for the render loop to clear selection lines
    setTimeout(() => {
      // Export canvas at original high-resolution size, accounting for Stage scale and position
      // To get the exact template image size, we render the Stage bounds matching basePoster
      const stageScale = stage.scaleX();
      const dataURL = stage.toDataURL({
        x: stage.x() + basePosterX * stageScale,
        y: stage.y() + basePosterY * stageScale,
        width: basePosterWidth * stageScale,
        height: basePosterHeight * stageScale,
        pixelRatio: 1 / scale / stageScale,
        mimeType: "image/png",
      });

      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `poster_preview_row_${activePreviewRowIndex + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 80);
  };

  // Attach transformer to selected node (unless actively dragging)
  useEffect(() => {
    if (transformerRef.current) {
      if (selectedLayerId && selectedLayerId !== draggingId) {
        const stage = transformerRef.current.getStage();
        const selectedNode = stage.findOne("#" + selectedLayerId);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer().batchDraw();
        } else {
          transformerRef.current.nodes([]);
        }
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedLayerId, draggingId, layers, activePreviewRowIndex]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 h-full bg-[#0B0F19] relative flex items-center justify-center overflow-hidden select-none"
      style={{ touchAction: "none" }} // disable default browser touch gestures
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_40%)] pointer-events-none" />

      {/* Floating Single Poster controls: Zoom & Download (Top-Right, Off the Poster) */}
      {imageEl && (
        <div 
          id="zoom-controls-container"
          className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2"
        >
          {/* Main Controls Row */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#1f2937]/80 border border-white/10 shadow-lg backdrop-blur-md">
            {/* Reset / Fit Page Button */}
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 active:scale-95 transition cursor-pointer"
              title="Reset Zoom (100%)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Toggle Zoom Lens Button */}
            <button
              onClick={() => setShowZoomDropdown(!showZoomDropdown)}
              className={`p-1.5 rounded-lg active:scale-95 transition cursor-pointer ${
                showZoomDropdown
                  ? "bg-violet-600 text-white shadow"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              title="Toggle Zoom Controls"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/10" />

            {/* Download Button */}
            <button
              onClick={handleDownloadCurrent}
              className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white hover:scale-105 active:scale-95 transition shadow cursor-pointer flex items-center justify-center"
              title="Download single preview poster at high quality"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Collapsible Zoom controls dropdown (underneath main buttons) */}
          {showZoomDropdown && (
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#1f2937]/90 border border-white/10 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Zoom Out Button */}
              <button
                onClick={() => handleZoomChange(zoom / 1.2)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 active:scale-95 transition cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Zoom Percentage Input */}
              <div className="flex items-center bg-black/30 border border-white/5 rounded-lg px-1.5 py-0.5">
                <input
                  type="text"
                  value={zoomInput}
                  onChange={handleZoomInputChange}
                  onBlur={handleZoomInputBlur}
                  onKeyDown={handleZoomInputKeyDown}
                  className="w-10 bg-transparent text-center text-xs font-semibold text-white focus:outline-none"
                />
              </div>

              {/* Zoom In Button */}
              <button
                onClick={() => handleZoomChange(zoom * 1.2)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 active:scale-95 transition cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Workspace Stage (covers the entire central area to catch events) */}
      {imageEl ? (
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onWheel={handleWheel}
          draggable={stageDraggable}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
          onDragStart={handleStageDragStart}
          onDragEnd={() => {
            if (stageRef.current && !placingColumn) {
              stageRef.current.container().style.cursor = "grab";
            }
          }}
          onMouseMove={handleStageMouseMove}
          className="bg-transparent"
          style={placingColumn ? { cursor: "crosshair" } : {}}
        >
          <Layer>
            {/* Background Poster Template */}
            <KonvaImage
              image={imageEl}
              x={basePosterX}
              y={basePosterY}
              width={basePosterWidth}
              height={basePosterHeight}
              name="background-image"
            />

            {/* Text layers */}
            {layers.map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              const isDragging = draggingId === layer.id;
              const textVal = getDisplayText(layer);
              const textWidth = layer.width ? layer.width * scale : 200 * scale;

              return (
                <Group key={layer.id}>
                  {/* Bounding Box Outline (visible when NOT selected and NOT dragging) */}
                  {!isSelected && !isDragging && (
                    <Rect
                      x={basePosterX + layer.x * scale}
                      y={basePosterY + layer.y * scale}
                      width={textWidth}
                      height={layer.fontSize * scale * 1.3}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth={1}
                      dash={[3, 3]}
                      listening={false}
                    />
                  )}
                  
                  <KonvaText
                    id={layer.id}
                    text={textVal}
                    x={basePosterX + layer.x * scale}
                    y={basePosterY + layer.y * scale}
                    width={layer.width ? layer.width * scale : undefined}
                    fontSize={layer.fontSize * scale}
                    fill={layer.fontColor}
                    fontFamily={layer.fontFamily}
                    fontStyle={layer.fontWeight}
                    align={layer.align}
                    draggable
                    onDragStart={() => {
                      setSelectedLayerId(layer.id);
                      setDraggingId(layer.id);
                    }}
                    onDragEnd={(e) => {
                      const node = e.target;
                      setDraggingId(null);
                      updateLayer(layer.id, {
                        x: (node.x() - basePosterX) / scale,
                        y: (node.y() - basePosterY) / scale,
                      });
                    }}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedLayerId(layer.id);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedLayerId(layer.id);
                    }}
                  />
                </Group>
              );
            })}

            {/* Selection Transformer for Bounding Box Width adjustment (hidden during dragging) */}
            {selectedLayerId && (
              <Transformer
                ref={transformerRef}
                visible={selectedLayerId !== draggingId}
                boundBoxFunc={(oldBox, newBox) => {
                  // Prevent box from being resized too small
                  if (newBox.width < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
                enabledAnchors={["middle-left", "middle-right"]}
                rotateEnabled={false}
                borderStroke="#8B5CF6"
                anchorStroke="#8B5CF6"
                anchorFill="#FFFFFF"
                anchorSize={8}
                borderDash={[3, 3]}
                onTransformEnd={(e) => {
                  const node = e.target;
                  if (node) {
                    const newWidth = Math.max(30, node.width() * node.scaleX());
                    // Reset Konva node scaling to prevent visual distortion
                    node.scaleX(1);
                    updateLayer(selectedLayerId, {
                      width: newWidth / scale,
                      x: (node.x() - basePosterX) / scale,
                      y: (node.y() - basePosterY) / scale,
                    });
                  }
                }}
              />
            )}
          </Layer>
        </Stage>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-white/30 space-y-3 animate-pulse">
          <svg 
            className="w-12 h-12 stroke-current" 
            fill="none" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">No Poster Loaded</p>
          <p className="text-xs text-white/20 max-w-xs">Upload a base poster template in the left sidebar to begin customization</p>
        </div>
      )}

      {placingColumn && (
        <div className="absolute bottom-8 bg-violet-600/90 text-white border border-violet-500/30 text-xs px-4 py-2 rounded-xl shadow-lg animate-bounce backdrop-blur z-20">
          Placement Mode: Click anywhere on the poster to drop field <strong>"{placingColumn}"</strong>
        </div>
      )}
    </div>
  );
}