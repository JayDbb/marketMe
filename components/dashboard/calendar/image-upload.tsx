'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!value) return null;
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    onChange(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 group"
          >
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/80 hover:bg-red-500 text-zinc-900 dark:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
              ${isDragging 
                ? 'border-blue-400 bg-blue-400/5' 
                : 'border-black/10 dark:border-white/10 dark:hover:border-white/20 bg-white dark:bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-400/10' : 'bg-white dark:bg-white/5 border-zinc-200'} transition-colors`}>
              <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-blue-400' : 'text-zinc-500 dark:text-white/40'}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500 dark:text-white/80">
                Click to upload <span className="text-zinc-500 dark:text-white/40 font-normal">or drag and drop</span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-white/30 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
