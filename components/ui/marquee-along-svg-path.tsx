"use client";

import React, { useEffect, useRef, useState } from "react";

interface MarqueeAlongSvgPathProps {
  path: string;
  viewBox?: string;
  baseVelocity?: number;
  showPath?: boolean;
  slowdownOnHover?: boolean;
  draggable?: boolean;
  dragAwareDirection?: boolean;
  dragVelocityDecay?: number;
  scrollAwareDirection?: boolean;
  useScrollVelocity?: boolean;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  repeat?: number;
  enableRollingZIndex?: boolean;
  dragSensitivity?: number;
  className?: string;
  responsive?: boolean;
  grabCursor?: boolean;
  children: React.ReactNode[];
}

export default function MarqueeAlongSvgPath({
  path,
  viewBox = "0 0 1040 570",
  baseVelocity = 4,
  showPath = false,
  children,
  className = "",
}: MarqueeAlongSvgPathProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [items, setItems] = useState<{ progress: number }[]>([]);

  useEffect(() => {
    const childArray = React.Children.toArray(children);
    const count = childArray.length;
    const initialItems = childArray.map((_, i) => ({
      progress: (i / count) * 100,
    }));
    setItems(initialItems);
  }, [children]);

  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setItems((prev) =>
        prev.map((item) => {
          let nextProgress = item.progress + baseVelocity * delta * 2;
          if (nextProgress > 100) nextProgress -= 100;
          if (nextProgress < 0) nextProgress += 100;
          return { ...item, progress: nextProgress };
        })
      );

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [baseVelocity]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref={pathRef}
          d={path}
          fill="none"
          stroke={showPath ? "rgba(20, 184, 166, 0.4)" : "none"}
          strokeWidth="2"
        />
      </svg>
      {pathRef.current &&
        React.Children.map(children, (child, index) => {
          if (!items[index] || !pathRef.current) return null;
          const totalLen = pathRef.current.getTotalLength();
          const pointDist = (items[index].progress / 100) * totalLen;
          const pt = pathRef.current.getPointAtLength(pointDist);
          return (
            <div
              key={index}
              className="absolute transition-transform duration-75"
              style={{
                transform: `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`,
              }}
            >
              {child}
            </div>
          );
        })}
    </div>
  );
}
