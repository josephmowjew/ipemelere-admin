/**
 * Document Reject Dialog - Modal for admin to reject documents with custom reason
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  XMarkIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { documentApi, type Document } from '@/lib/api/documents';

interface DocumentRejectDialogProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string, notes?: string) => Promise<void>;
  isRejecting?: boolean;
}

export function DocumentRejectDialog({
  document,
  isOpen,
  onClose,
  onReject,
  isRejecting = false
}: DocumentRejectDialogProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Common rejection reasons for quick selection
  const commonReasons = [
    'Document image is unclear and text is not readable',
    'Document appears to be damaged or incomplete',
    'Document has expired',
    'Document type does not match requirements',
    'Document appears to be altered or fraudulent',
    'Photo quality is too poor to verify identity',
    'Document information does not match passenger details'
  ];

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setError(null);
      await onReject(reason.trim(), notes.trim() || undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject document');
    }
  };

  const handleClose = () => {
    setReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  const handleReasonSelect = (selectedReason: string) => {
    setReason(selectedReason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl mx-4 overflow-y-auto">
        <Card className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reject Document</h2>
                <p className="text-sm text-gray-500">
                  {documentApi.getDocumentTypeDisplayName(document.documentType)} - {document.originalFileName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
              disabled={isRejecting}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800">Document Rejection</h3>
                  <p className="text-sm text-red-700 mt-1">
                    The passenger will be notified by email about this rejection and the reason provided.
                    They will need to resubmit a new document.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Common Rejection Reasons (Click to select)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {commonReasons.map((commonReason, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleReasonSelect(commonReason)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      reason === commonReason
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                    disabled={isRejecting}
                  >
                    <span className="text-sm">{commonReason}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div>
              <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for rejecting this document..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                disabled={isRejecting}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This reason will be included in the email notification sent to the passenger.
              </p>
            </div>

            {/* Admin Notes */}
            <div>
              <label htmlFor="reject-notes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                id="reject-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes for other admins..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={isRejecting}
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes are for internal use and will not be sent to the passenger.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-gray-50">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject Document
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}