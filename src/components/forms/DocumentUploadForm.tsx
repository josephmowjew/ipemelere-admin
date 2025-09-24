/**
 * Document Upload Form - Component for uploading driver documents
 * Following form patterns from design document
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { driverAPI, type DriverDocument } from '@/lib/api/drivers';

type DocumentType = 'national-id' | 'driver-license' | 'profile-picture' | 'vehicle-registration' | 'vehicle-insurance';

interface DocumentUploadFormProps {
  driverId: number;
  onUploadSuccess: (document: unknown) => void;
  onCancel: () => void;
  loading?: boolean;
  existingDocuments?: DriverDocument[];
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; maxSize: number; formats: string[] }[] = [
  { value: 'national-id', label: 'National ID', maxSize: 5, formats: ['image/jpeg', 'image/png', 'application/pdf'] },
  { value: 'driver-license', label: 'Driver License', maxSize: 5, formats: ['image/jpeg', 'image/png', 'application/pdf'] },
  { value: 'profile-picture', label: 'Profile Picture', maxSize: 2, formats: ['image/jpeg', 'image/png'] },
  { value: 'vehicle-registration', label: 'Vehicle Registration', maxSize: 5, formats: ['image/jpeg', 'image/png', 'application/pdf'] },
  { value: 'vehicle-insurance', label: 'Vehicle Insurance', maxSize: 5, formats: ['image/jpeg', 'image/png', 'application/pdf'] },
];

export function DocumentUploadForm({
  driverId,
  onUploadSuccess,
  onCancel,
  loading = false,
  existingDocuments = []
}: DocumentUploadFormProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('national-id');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Filter out document types that already exist
  const existingDocTypes = new Set(
    existingDocuments
      .filter(doc => doc.status !== 'rejected') // Allow re-upload of rejected documents
      .map(doc => doc.documentType.replace(/_/g, '-')) // Convert backend format (underscores) to frontend format (hyphens)
  );

  const availableDocumentTypes = DOCUMENT_TYPES.filter(type =>
    !existingDocTypes.has(type.value)
  );

  // If the current selected type is no longer available, switch to first available
  const validDocumentType = availableDocumentTypes.find(type => type.value === documentType)
    ? documentType
    : (availableDocumentTypes[0]?.value || 'national-id');

  // Update state if we had to change the selected type
  if (validDocumentType !== documentType) {
    setDocumentType(validDocumentType as DocumentType);
  }

  const selectedDocType = DOCUMENT_TYPES.find(dt => dt.value === validDocumentType)!;

  const validateFile = (file: File): string | null => {
    if (!selectedDocType.formats.includes(file.type)) {
      return `Invalid file type. Allowed: ${selectedDocType.formats.join(', ')}`;
    }

    if (file.size > selectedDocType.maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${selectedDocType.maxSize}MB`;
    }

    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      const result = await driverAPI.uploadDocument(driverId, documentType, selectedFile, notes);
      console.log('Upload successful:', result);
      onUploadSuccess(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('Upload error:', err);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  // If no document types are available for upload
  if (availableDocumentTypes.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
          <p className="text-sm text-muted-foreground">
            Upload a document for this driver. All uploads are subject to review.
          </p>
        </div>

        <div className="text-center py-8">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">All Documents Uploaded</h4>
          <p className="text-sm text-gray-500 mb-6">
            This driver has uploaded all required document types. No additional uploads are needed.
          </p>
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Upload a document for this driver. All uploads are subject to review.
          </p>
          {existingDocTypes.size > 0 && (
            <p className="text-sm text-blue-600">
              Note: Only document types that haven&apos;t been uploaded are shown below.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type *</Label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            {availableDocumentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* File Requirements */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start gap-2">
            <DocumentIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Requirements for {selectedDocType.label}</p>
              <ul className="text-blue-700 mt-1">
                <li>• Maximum file size: {selectedDocType.maxSize}MB</li>
                <li>• Formats: {selectedDocType.formats.map(f => f.split('/')[1].toUpperCase()).join(', ')}</li>
                <li>• File should be clear and readable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="space-y-2">
          <Label>File Upload *</Label>
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border",
              selectedFile ? "border-green-300 bg-green-50" : ""
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto" />
                <div>
                  <p className="font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-sm text-green-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 pointer-events-none">
                  <ArrowUpTrayIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">Drop your file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                </div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={selectedDocType.formats.join(',')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
              </>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this document..."
            className="resize-none"
            rows={3}
            maxLength={500}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            {notes.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Card>
  );
}