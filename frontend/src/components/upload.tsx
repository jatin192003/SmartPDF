"use client";
import React, { useRef } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  setFiles, 
  uploadPdfs
} from "@/lib/redux/slices/sessionSlice";

export function Upload() {
  const dispatch = useAppDispatch();
  const { 
    files, 
    isSessionActive, 
    isLoading, 
    error 
  } = useAppSelector(state => state.session);
  
  const fileUploadKey = useRef(Date.now()).current;

  const handleFileUpload = (newFiles: File[]) => {
    dispatch(setFiles(newFiles));
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    dispatch(uploadPdfs(files));
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full h-full max-w-4xl mx-auto flex-1 min-h-96 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload 
          onChange={handleFileUpload}
          key={isSessionActive ? `session-active` : `no-session-${fileUploadKey}`}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleProcessFiles}
          disabled={isLoading || files.length === 0}
          className={cn(
            "inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
            (isLoading || files.length === 0) && 
              "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Process Files"
          )}
        </button>
      </div>
    </div>
  );
}
