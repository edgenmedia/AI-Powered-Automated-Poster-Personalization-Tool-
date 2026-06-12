"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { EditorProvider } from "@/store/editorstore";
import FloatingToolbar from "./FloatingToolbar";
import UploadSidebar from "./UploadSidebar";
import AIAgentSidebar from "./AIAgentSidebar";
import MobileDock from "./MobileDock";

// Dynamically import CanvasArea to disable SSR for Konva (browser-only)
const CanvasArea = dynamic(() => import("./CanvasArea"), { ssr: false });

export default function EditorLayout() {
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(320);
  
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Resize handler for Left Sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingLeft) return;
      // Constraint between 240px and 480px
      const newWidth = Math.max(240, Math.min(480, e.clientX));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizingLeft) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingLeft]);

  // Resize handler for Right Sidebar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRight) return;
      // Constraint between 240px and 480px
      const newWidth = Math.max(240, Math.min(480, window.innerWidth - e.clientX));
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingRight(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizingRight) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingRight]);

  return (
    <EditorProvider>
      <main className="w-full flex flex-col overflow-hidden bg-[#0B0F19] text-white h-[100dvh] pb-16 md:h-screen md:pb-0">
        {/* Fixed top Header Navbar */}
        <FloatingToolbar />

        {/* Editor Body Split */}
        <div className="flex-1 flex overflow-hidden relative">
          <UploadSidebar width={leftWidth} />
          
          {/* Left Resizer Handle (desktop only) */}
          <div 
            onMouseDown={() => setIsResizingLeft(true)}
            className="hidden md:block w-1 hover:w-1.5 bg-white/10 hover:bg-violet-500 cursor-col-resize select-none transition-all duration-150 z-30 relative shrink-0"
          />

          <CanvasArea />

          {/* Right Resizer Handle (desktop only) */}
          <div 
            onMouseDown={() => setIsResizingRight(true)}
            className="hidden md:block w-1 hover:w-1.5 bg-white/10 hover:bg-violet-500 cursor-col-resize select-none transition-all duration-150 z-30 relative shrink-0"
          />

          <AIAgentSidebar width={rightWidth} />
        </div>

        {/* Mobile bottom dock and slide-up drawers */}
        <div className="block md:hidden">
          <MobileDock />
        </div>
      </main>
    </EditorProvider>
  );
}