/**
 * Document Data Hooks - React Query hooks for document management
 * Provides data fetching, caching, and mutations for passenger documents
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, type Document, type VerifyDocumentRequest, type RejectDocumentRequest } from '@/lib/api/documents';

// Query keys for consistent caching
export const documentQueryKeys = {
  all: ['documents'] as const,
  passenger: (id: number) => [...documentQueryKeys.all, 'passenger', id] as const,
  pending: () => [...documentQueryKeys.all, 'pending'] as const,
};

/**
 * Hook to fetch passenger documents
 */
export function usePassengerDocuments(passengerId: number) {
  return useQuery({
    queryKey: documentQueryKeys.passenger(passengerId),
    queryFn: () => documentApi.getPassengerDocuments(passengerId),
    enabled: !!passengerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch pending documents
 */
export function usePendingDocuments(limit = 50) {
  return useQuery({
    queryKey: documentQueryKeys.pending(),
    queryFn: () => documentApi.getPendingDocuments(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for pending items)
  });
}

/**
 * Hook to verify a document
 */
export function useVerifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: VerifyDocumentRequest }) =>
      documentApi.verifyDocument(documentId, data),
    onSuccess: (updatedDocument) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.passenger(updatedDocument.userId) });
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.pending() });

      // Update passenger details cache if available
      queryClient.invalidateQueries({ queryKey: ['passengers', 'detail', updatedDocument.userId] });
    },
  });
}

/**
 * Hook to reject a document
 */
export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: number; data: RejectDocumentRequest }) =>
      documentApi.rejectDocument(documentId, data),
    onSuccess: (updatedDocument) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.passenger(updatedDocument.userId) });
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.pending() });

      // Update passenger details cache if available
      queryClient.invalidateQueries({ queryKey: ['passengers', 'detail', updatedDocument.userId] });
    },
  });
}

/**
 * Hook to upload a national ID document
 */
export function useUploadNationalId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ passengerId, data }: { passengerId: number; data: { file: File; notes?: string } }) =>
      documentApi.uploadNationalId(passengerId, data),
    onSuccess: (response) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.passenger(response.document.userId) });
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.pending() });

      // Update passenger details cache if available
      queryClient.invalidateQueries({ queryKey: ['passengers', 'detail', response.document.userId] });
    },
    onError: (error) => {
      // Log the error for debugging
      console.error('Upload mutation error:', error);
    }
  });
}

/**
 * Hook to download a document
 */
export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ passengerId, documentId }: { passengerId: number; documentId: number }) =>
      documentApi.downloadDocument(passengerId, documentId),
    onSuccess: (blob, { documentId }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

/**
 * Hook to view a document
 */
export function useViewDocument() {
  return useMutation({
    mutationFn: ({ passengerId, documentId }: { passengerId: number; documentId: number }) =>
      documentApi.viewDocument(passengerId, documentId),
    onSuccess: (blob, { documentId }) => {
      // Create blob URL and open in new tab
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      // Clean up the blob URL after a delay to allow the browser to load it
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      // If popup was blocked, fallback to current tab
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = url;
      }
    },
  });
}

/**
 * Combined hook for passenger document management
 * Provides all document-related data and actions for a passenger
 */
export function usePassengerDocumentManagement(passengerId: number) {
  const {
    data: documents,
    isLoading,
    error,
    refetch: refetchDocuments,
  } = usePassengerDocuments(passengerId);

  const verifyMutation = useVerifyDocument();
  const rejectMutation = useRejectDocument();
  const uploadMutation = useUploadNationalId();
  const downloadMutation = useDownloadDocument();
  const viewMutation = useViewDocument();

  // Helper functions
  const verifyDocument = (documentId: number, notes?: string) => {
    return verifyMutation.mutate({ documentId, data: { notes } });
  };

  const rejectDocument = (documentId: number, reason: string, notes?: string) => {
    return rejectMutation.mutate({ documentId, data: { reason, notes } });
  };

  const uploadNationalId = (file: File, notes?: string) => {
    return uploadMutation.mutate({ passengerId, data: { file, notes } });
  };

  const downloadDocument = (documentId: number) => {
    return downloadMutation.mutate({ passengerId, documentId });
  };

  const viewDocument = (documentId: number) => {
    return viewMutation.mutate({ passengerId, documentId });
  };

  // Group documents by type
  const documentsByType = documents?.reduce((acc, doc) => {
    if (!acc[doc.documentType]) {
      acc[doc.documentType] = [];
    }
    acc[doc.documentType].push(doc);
    return acc;
  }, {} as Record<string, Document[]>) || {};

  // Get the latest version of each document type
  const latestDocuments = documents?.filter(doc => doc.isLatestVersion) || [];

  // Check overall verification status
  const hasVerifiedDocuments = latestDocuments.some(doc => doc.status === 'verified');
  const hasPendingDocuments = latestDocuments.some(doc => doc.status === 'pending' || doc.status === 'under_review');
  const hasRejectedDocuments = latestDocuments.some(doc => doc.status === 'rejected');

  const overallStatus = hasRejectedDocuments
    ? 'rejected'
    : hasPendingDocuments
    ? 'pending'
    : hasVerifiedDocuments
    ? 'verified'
    : 'no_documents';

  return {
    // Data
    documents,
    documentsByType,
    latestDocuments,

    // Loading states
    isLoading,
    isVerifying: verifyMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isUploading: uploadMutation.isPending,
    isDownloading: downloadMutation.isPending,
    isViewing: viewMutation.isPending,

    // Error states
    error,
    verifyError: verifyMutation.error,
    rejectError: rejectMutation.error,
    uploadError: uploadMutation.error,
    downloadError: downloadMutation.error,
    viewError: viewMutation.error,

    // Status information
    overallStatus,
    hasVerifiedDocuments,
    hasPendingDocuments,
    hasRejectedDocuments,

    // Actions
    verifyDocument,
    rejectDocument,
    uploadNationalId,
    downloadDocument,
    viewDocument,
    refetchDocuments,
  };
}