"use client";
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  setFiles, 
  uploadPdfs, 
  endSession 
} from "@/lib/redux/slices/sessionSlice";

export function Upload() {
  const dispatch = useAppDispatch();
  const { 
    files, 
    sessionId, 
    isSessionActive, 
    isLoading, 
    error 
  } = useAppSelector(state => state.session);

  const handleFileUpload = (newFiles: File[]) => {
    dispatch(setFiles(newFiles));
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) return;
    dispatch(uploadPdfs(files));
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    dispatch(endSession(sessionId));
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full h-full max-w-4xl mx-auto flex-1 min-h-96 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={handleFileUpload} />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={isSessionActive ? handleEndSession : handleProcessFiles}
          disabled={isLoading || (!isSessionActive && files.length === 0)}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            isSessionActive
              ? "bg-red-500 hover:bg-red-600 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white",
            (isLoading || (!isSessionActive && files.length === 0)) && 
              "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isSessionActive ? "Ending..." : "Processing..."}
            </span>
          ) : (
            isSessionActive ? "End Session" : "Process Files"
          )}
        </button>
      </div>
    </div>
  );
}
