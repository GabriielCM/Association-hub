'use client';

import { useRef, useState, useCallback } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import { resolveUploadUrl } from '@/config/constants';

interface SpaceImageUploadProps {
  /** Already-saved image URLs (from backend) */
  images: string[];
  /** Called when user picks files to upload (in edit mode, fires immediately) */
  onUpload: (file: File) => void;
  /** Called when user removes an existing image */
  onRemove: (imageUrl: string) => void;
  /** For create mode: preview files before space exists */
  pendingFiles?: File[];
  onRemovePending?: (index: number) => void;
  isUploading?: boolean;
}

export function SpaceImageUpload({
  images,
  onUpload,
  onRemove,
  pendingFiles = [],
  onRemovePending,
  isUploading,
}: SpaceImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file && file.type.startsWith('image/')) {
          onUpload(file);
        }
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange],
  );

  return (
    <div className="space-y-3">
      <label className="mb-1 block text-sm font-medium">
        Imagens (16:9)
      </label>

      {/* Image grid */}
      {(images.length > 0 || pendingFiles.length > 0) && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url) => {
            const resolvedUrl = resolveUploadUrl(url);
            return (
              <div key={url} className="group relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
                {resolvedUrl && (
                  <img
                    src={resolvedUrl}
                    alt="Espaço"
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                {images.indexOf(url) === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    Principal
                  </span>
                )}
              </div>
            );
          })}
          {pendingFiles.map((file, index) => (
            <div key={`pending-${index}`} className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-dashed border-blue-300 bg-blue-50">
              <img
                src={URL.createObjectURL(file)}
                alt={`Pendente ${index + 1}`}
                className="h-full w-full object-cover opacity-70"
              />
              <span className="absolute bottom-1 left-1 rounded bg-blue-600/80 px-1.5 py-0.5 text-[10px] text-white">
                Pendente
              </span>
              {onRemovePending && (
                <button
                  type="button"
                  onClick={() => onRemovePending(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / upload button */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-border hover:border-blue-300 hover:bg-muted/50'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Upload className="mb-2 h-6 w-6 animate-pulse text-blue-500" />
            <p className="text-sm text-muted-foreground">Enviando...</p>
          </>
        ) : (
          <>
            <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste imagens ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WebP. Máx 5MB. Proporção 16:9 recomendada.
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </div>
  );
}
