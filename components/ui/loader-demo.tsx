"use client";

import React, { useState } from "react";
import { ArtaficLoader } from "@/components/ui/artafic-loader";

export default function ArtaficLoaderDemo() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 font-sans">
      {/* Reusable ARTAFIC Full-Screen Loader */}
      <ArtaficLoader
        isLoading={isLoading}
        onFinished={() => console.log("ARTAFIC Loader animation finished.")}
      />

      <div className="text-center space-y-4 max-w-md mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ARTAFIC Web Application
        </h1>
        <p className="text-slate-600">
          The page content has completed loading and is fully interactive.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsLoading(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm transition-colors cursor-pointer"
          >
            Show Loader
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={() => setIsLoading(false)}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
            >
              Dismiss Loader
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
