"use client";

import { useState, useCallback, useId } from "react";
import type { ChangeEvent, DragEvent } from "react";

interface PhoneProps {
  framedImageUrl: string | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  emptyFrameUrl: string | null;
  className?: string;
}

export function Phone({ framedImageUrl, isLoading, onFileSelect, emptyFrameUrl, className }: PhoneProps) {
  const inputId = useId();

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full bg-transparent ${className ?? ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Show framed result or empty frame */}
      {framedImageUrl ? (
        <img
          src={framedImageUrl}
          alt="Framed screenshot"
          className="w-full h-full object-contain"
        />
      ) : (
        <>
          {emptyFrameUrl && (
            <img
              src={emptyFrameUrl}
              alt="Device frame"
              className="w-full h-full object-contain pointer-events-none select-none"
            />
          )}
          
          {/* Upload hint overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="w-12 h-12 text-zinc-400 dark:text-zinc-600 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center font-medium">
                  Drag and drop or <span className="text-blue-600 dark:text-blue-400 underline">browse files</span>
                </p>
              </div>
            )}
          </div>
        </>
      )}
      
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        id={inputId}
      />
    </div>
  );
}
