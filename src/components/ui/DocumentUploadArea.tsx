/**
 * Document Upload Area - Drag and drop file upload component
 * Provides file upload interface with validation and preview
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DocumentUploadAreaProps {
  onFileSelect: (file: File, notes?: string) => Promise<void>;
  isUploading?: boolean;
  uploadError?: Error | null;
  acceptedTypes?: string;
  maxSizeInMB?: number;
  className?: string;
}

interface FilePreview {
  file: File;
  url: string;
}

export function DocumentUploadArea({
  onFileSelect,
  isUploading = false,
  uploadError,
  acceptedTypes = 'image/*,.pdf',
  maxSizeInMB = 10,
  className
}: DocumentUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FilePreview | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    // Check file type
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const isValidType = acceptedTypesArray.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return 'Invalid file type. Please select an image or PDF file.';
    }

    return null;
  }, [acceptedTypes, maxSizeInBytes, maxSizeInMB]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setSelectedFile({ file, url });
  }, [validateFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await onFileSelect(selectedFile.file, notes || undefined);
      // Clear the form on successful upload
      setSelectedFile(null);
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      // Error is handled by parent component
    }
  }, [selectedFile, notes, onFileSelect]);

  const handleClearFile = useCallback(() => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.url);
      setSelectedFile(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFile]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup object URL on unmount
  React.useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(selectedFile.url);
      }
    };
  }, [selectedFile]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver && 'border-primary bg-primary/5',
          !isDragOver && !selectedFile && 'border-gray-300 hover:border-gray-400',
          selectedFile && 'border-green-300 bg-green-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <DocumentIcon className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-800">{selectedFile.file.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFile}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or{' '}
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-primary hover:text-primary/80 font-medium"
                  disabled={isUploading}
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports images and PDF files up to {maxSizeInMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {(error || uploadError) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {error || (uploadError instanceof Error ? uploadError.message : 'Upload failed')}
          </p>
        </div>
      )}

      {/* Notes Input */}
      {selectedFile && (
        <div className="space-y-2">
          <label htmlFor="upload-notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="upload-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this document..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={2}
            disabled={isUploading}
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
            className="bg-green-600 hover:bg-green-700"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}