"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface ArtaficLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Explicit loading flag.
   * - When `true`, loader remains visible.
   * - When transitioning from `true` to `false`, initiates the 150-300ms fade-out.
   * - When omitted (`undefined`), auto-dismisses as soon as the browser finishes loading (`window.load` / `document.readyState === 'complete'`).
   */
  isLoading?: boolean;
  /**
   * Duration of the fade-out transition in milliseconds.
   * Default: 250ms (within the required 150-300ms range).
   */
  fadeDuration?: number;
  /**
   * Callback fired once the fade-out completes and the loader unmounts.
   */
  onFinished?: () => void;
  className?: string;
}

export function ArtaficLoader({
  isLoading,
  fadeDuration = 250,
  onFinished,
  className,
  ...props
}: ArtaficLoaderProps) {
  const [mounted, setMounted] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // 1. Controlled mode (isLoading explicitly provided)
    if (typeof isLoading === "boolean") {
      if (!isLoading) {
        setIsExiting(true);
        const timer = setTimeout(() => {
          setMounted(false);
          onFinished?.();
        }, fadeDuration);
        return () => clearTimeout(timer);
      } else {
        setMounted(true);
        setIsExiting(false);
      }
      return;
    }

    // 2. Uncontrolled / page-ready mode
    const dismiss = () => {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setMounted(false);
        onFinished?.();
      }, fadeDuration);
    };

    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        dismiss();
      } else {
        window.addEventListener("load", dismiss, { once: true });
        return () => window.removeEventListener("load", dismiss);
      }
    }
  }, [isLoading, fadeDuration, onFinished]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "artafic-loader",
        isExiting && "artafic-loader--hidden",
        className
      )}
      style={{
        transitionDuration: `${fadeDuration}ms`,
      }}
      role="status"
      aria-label="Loading ARTAFIC"
      {...props}
    >
      <div className="artafic-loader__text" aria-hidden="true">
        <span>A</span>
        <span>R</span>
        <span>T</span>
        <span>A</span>
        <span>F</span>
        <span>I</span>
        <span>C</span>
      </div>

      <div className="artafic-loader__line" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}

export default ArtaficLoader;
