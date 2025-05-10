import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    // Only keep the most recent file
    const latestFile = newFiles.slice(-1);
    setFiles(latestFile);
    onChange && onChange(latestFile);
  };

  const handleClick = () => {
    // Don't allow clicking if a file is already uploaded
    if (files.length === 0) {
      fileInputRef.current?.click();
    }
  };

  const clearFiles = () => {
    setFiles([]);
    onChange && onChange([]);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      // Only accept the first file if multiple are somehow dropped
      handleFileChange(acceptedFiles.slice(0, 1));
    },
    onDropRejected: (error) => {
      console.log(error);
    },
    // Disable dropping if a file already exists
    disabled: files.length > 0
  });

  return (
    <div className="w-full h-full relative" {...getRootProps()}>
      {/* Main container with glass effect */}
      <motion.div
        onClick={handleClick}
        whileHover={files.length === 0 ? "animate" : ""}
        className={cn(
          "p-10 group/file rounded-2xl flex items-center justify-center w-full relative overflow-hidden h-full border border-white/20 dark:border-white/5",
          files.length === 0 ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Grid Pattern Background */}
        <GridPattern />
        
        {/* Content overlay */}
        <div className="relative z-10 bg-white/60 dark:bg-neutral-900/60 rounded-xl p-8 backdrop-blur-md border border-white/50 dark:border-neutral-700/50 shadow-xl w-full max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 dark:from-neutral-800/20 dark:to-neutral-800/10 rounded-xl"></div>
          
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []);
              handleFileChange(selectedFiles.slice(0, 1));
            }}
            className="hidden"
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <p className="font-sans font-bold text-neutral-800 dark:text-neutral-200 text-lg">
              Upload PDF file
            </p>
            <p className="font-sans font-normal text-neutral-500 dark:text-neutral-400 text-base mt-2">
              {files.length === 0 
                ? "Drag or drop your PDF file here or click to upload" 
                : "One file uploaded. Clear it to upload a different file"}
            </p>
            
            <div className="relative w-full mt-4 max-w-xl mx-auto">
              {files.length > 0 && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFiles();
                    }}
                    className="px-3 py-1 text-sm bg-red-50/90 hover:bg-red-100/90 text-red-600 rounded-md flex items-center gap-1 transition-colors backdrop-blur-sm border border-red-100/50"
                  >
                    <IconX className="h-4 w-4" />
                    Clear file
                  </button>
                </div>
              )}
              
              {files.length > 0 &&
                files.map((file, idx) => (
                  <motion.div
                    key={"file" + idx}
                    layoutId="file-upload"
                    className={cn(
                      "relative overflow-hidden z-40 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md border border-white/50 dark:border-neutral-700/50",
                      "shadow-lg"
                    )}
                  >
                    <div className="flex justify-between w-full items-center gap-4">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                      >
                        {file.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:text-neutral-200 bg-neutral-100/70 dark:bg-neutral-700/70 backdrop-blur-sm shadow-sm border border-neutral-200/50 dark:border-neutral-600/50"
                      >
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </motion.p>
                    </div>

                    <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                        className="px-2 py-0.5 rounded-md bg-neutral-100/70 dark:bg-neutral-700/70 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-600/50"
                      >
                        {file.type}
                      </motion.p>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        layout
                      >
                        modified{" "}
                        {new Date(file.lastModified).toLocaleDateString()}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
                
              {!files.length && (
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md flex items-center justify-center h-36 mt-4 w-full max-w-[10rem] mx-auto rounded-xl border border-white/50 dark:border-neutral-700/50",
                    "shadow-lg"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 dark:from-neutral-700/20 dark:to-neutral-700/10 rounded-xl"></div>
                  
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 dark:text-neutral-300 flex flex-col items-center"
                    >
                      Drop it
                      <IconUpload className="h-5 w-5 text-neutral-600 dark:text-neutral-400 mt-2" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
              )}

              {!files.length && (
                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400/50 dark:border-sky-500/30 inset-0 z-30 bg-transparent flex items-center justify-center h-36 mt-4 w-full max-w-[10rem] mx-auto rounded-xl"
                ></motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 15; // Increased for more grid elements
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-gray-50/80 to-white/40 dark:from-neutral-900/80 dark:to-neutral-800/40 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0,rgba(0,0,0,0)_70%)]"></div>
      <div className="flex flex-wrap justify-center items-center gap-x-px gap-y-px w-full h-full opacity-40 dark:opacity-30">
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: columns }).map((_, col) => {
            const index = row * columns + col;
            return (
              <div
                key={`${col}-${row}`}
                className={`w-8 h-8 flex shrink-0 rounded-sm ${
                  index % 2 === 0
                    ? "border border-white/20 dark:border-white/5 bg-transparent"
                    : "border border-white/30 dark:border-white/10 bg-white/5 dark:bg-white/2"
                }`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
