"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import "./artafic-loader.css";

export interface ArtaficLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Explicit loading flag.
   * - When `true`, loader remains visible and animates continuously.
   * - When transitioning from `true` to `false`, initiates the smooth fade-out.
   * - When omitted (`undefined`), auto-dismisses once page has loaded after a minimum display time.
   */
  isLoading?: boolean;
  /**
   * Duration of the fade-out transition in milliseconds.
   * Default: 300ms.
   */
  fadeDuration?: number;
  /**
   * Callback fired once the fade-out completes and the loader unmounts.
   */
  onFinished?: () => void;
  className?: string;
  overlayClassName?: string;
}

// Official ARTAFIC Logo Vector Paths (viewBox: -25 -20 2045 365)
const ARTAFIC_VECTOR_PATHS = {
  a1: {
    dark: "M 152 10 L 215 11 L 337 265 L 358 311 L 359 318 L 299 320 L 211 124 L 184 70 L 163 110 L 134 180 L 125 191 L 111 223 L 108 236 L 71 316 L 48 320 L 9 319 Z",
    teal: "M 133 180 L 139 186 L 164 194 L 219 203 L 237 235 L 241 251 L 223 252 L 178 246 L 145 239 L 114 228 L 109 232 L 125 191 Z",
    delay: "0s",
  },
  r: {
    dark: "M 399 10 L 548 10 L 579 13 L 611 25 L 640 50 L 654 72 L 661 96 L 662 130 L 659 146 L 650 168 L 640 182 L 621 201 L 597 215 L 597 217 L 651 292 L 666 318 L 604 319 L 543 228 L 474 228 L 459 230 L 457 318 L 403 319 L 400 317 Z M 460 58 L 458 70 L 459 179 L 553 177 L 579 166 L 594 152 L 603 128 L 603 105 L 595 83 L 582 70 L 566 60 Z",
    teal: "",
    delay: "0.12s",
  },
  t: {
    dark: "M 686 10 L 954 10 L 953 43 L 949 58 L 849 59 L 847 318 L 796 319 L 793 317 L 792 59 L 688 57 Z",
    teal: "",
    delay: "0.24s",
  },
  a2: {
    dark: "M 1085 10 L 1125 10 L 1182 129 L 1192 156 L 1165 173 L 1153 179 L 1148 179 L 1139 165 L 1105 91 L 1093 70 L 981 315 L 976 318 L 954 320 L 921 319 L 920 316 L 924 305 L 963 226 L 1062 12 Z M 1212 201 L 1217 202 L 1219 206 L 1257 286 L 1269 318 L 1210 320 L 1204 309 L 1176 247 L 1169 226 L 1190 216 Z",
    teal: "M 1191 151 L 1216 202 L 1212 201 L 1206 204 L 1190 216 L 1169 226 L 1171 233 L 1166 228 L 1137 239 L 1084 249 L 1047 251 L 1038 248 L 1041 235 L 1057 202 L 1097 198 L 1133 188 L 1144 182 L 1137 161 L 1147 178 L 1153 179 L 1192 156 Z",
    delay: "0.36s",
  },
  f: {
    dark: "M 1311 10 L 1543 10 L 1542 56 L 1365 59 L 1365 128 L 1346 142 L 1325 164 L 1317 177 L 1310 182 Z",
    teal: "M 1476 117 L 1516 118 L 1516 166 L 1481 164 L 1455 167 L 1432 173 L 1408 185 L 1388 204 L 1377 223 L 1371 240 L 1366 269 L 1365 320 L 1311 318 L 1308 312 L 1308 291 L 1313 241 L 1324 208 L 1343 177 L 1367 153 L 1398 134 L 1433 122 Z",
    delay: "0.48s",
  },
  i: {
    dark: "M 1591 10 L 1648 10 L 1646 318 L 1591 320 Z",
    teal: "",
    delay: "0.60s",
  },
  c: {
    dark: "M 1851 5 L 1896 6 L 1929 14 L 1960 29 L 1977 41 L 1987 52 L 1982 61 L 1954 89 L 1926 69 L 1896 57 L 1852 55 L 1830 59 L 1809 68 L 1790 82 L 1773 103 L 1762 125 L 1759 172 L 1763 197 L 1780 228 L 1805 252 L 1824 262 L 1840 267 L 1883 269 L 1913 261 L 1953 235 L 1988 267 L 1971 285 L 1952 299 L 1918 313 L 1885 319 L 1850 320 L 1825 316 L 1795 306 L 1766 290 L 1738 265 L 1721 241 L 1708 211 L 1702 183 L 1701 149 L 1707 114 L 1719 84 L 1737 58 L 1761 36 L 1789 20 L 1819 10 Z",
    teal: "",
    delay: "0.72s",
  },
};

export function ArtaficLoader({
  isLoading,
  fadeDuration = 300,
  onFinished,
  className,
  overlayClassName,
  ...props
}: ArtaficLoaderProps) {
  const [mounted, setMounted] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    // 1. Controlled mode (isLoading explicitly boolean)
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

    // 2. Uncontrolled / page-ready mode:
    // Ensures a minimum display time of 2200ms so the user can experience the animation
    const startTime = Date.now();
    const MIN_DISPLAY_MS = 2200;

    const dismiss = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setMounted(false);
          onFinished?.();
        }, fadeDuration);
      }, remaining);
      return timer;
    };

    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        const timer = dismiss();
        return () => clearTimeout(timer);
      } else {
        let timer: NodeJS.Timeout;
        const handleLoad = () => {
          timer = dismiss();
        };
        window.addEventListener("load", handleLoad, { once: true });
        return () => {
          window.removeEventListener("load", handleLoad);
          if (timer) clearTimeout(timer);
        };
      }
    }
  }, [isLoading, fadeDuration, onFinished]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "artafic-loading-overlay",
        isExiting && "artafic-loading-overlay--hidden",
        overlayClassName
      )}
      style={{
        transitionDuration: `${fadeDuration}ms`,
      }}
    >
      <div
        className={cn("artafic-loader", className)}
        role="status"
        aria-label="Loading ARTAFIC"
        {...props}
      >
        {/* ARTAFIC Logo Vector Wordmark: Solid Fill + SelfMadeSystem Stroke Engine */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-25 -20 2045 365"
          className="artafic-wordmark-svg"
          aria-hidden="true"
        >
          {/* Layer 1: Solid Filled ARTAFIC Wordmark (#111827 dark + #14B8A6 teal accents) */}
          <g className="artafic-wordmark-fill" aria-hidden="true">
            {Object.entries(ARTAFIC_VECTOR_PATHS).map(([key, letter]) => (
              <React.Fragment key={`fill-${key}`}>
                <path
                  d={letter.dark}
                  fill="#111827"
                  fillRule="evenodd"
                />
                {letter.teal && (
                  <path
                    d={letter.teal}
                    fill="#14B8A6"
                    fillRule="evenodd"
                  />
                )}
              </React.Fragment>
            ))}
          </g>

          {/* Layer 2: SelfMadeSystem Animated Stroke Layer (active tracer beam, fades at rest) */}
          <g className="artafic-wordmark-stroke" aria-hidden="true">
            {Object.entries(ARTAFIC_VECTOR_PATHS).map(([key, letter]) => (
              <g key={`stroke-group-${key}`} className={`letter-${key}`}>
                <path
                  d={letter.dark}
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="dash"
                  pathLength={360}
                  style={{ animationDelay: letter.delay }}
                />
                {letter.teal && (
                  <path
                    d={letter.teal}
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dash"
                    pathLength={360}
                    style={{ animationDelay: letter.delay }}
                  />
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default ArtaficLoader;
