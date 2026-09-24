import React from "react";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export default function FloatingPathsBackgroundExample() {
  return (
    <FloatingPathsBackground
      className="aspect-16/9 flex items-center justify-center"
      position={-1}
    >
      <div className="relative z-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Floating Paths Background</h2>
        <p className="text-muted-foreground mt-2">Smooth organic flowing bezier paths</p>
      </div>
    </FloatingPathsBackground>
  );
}
