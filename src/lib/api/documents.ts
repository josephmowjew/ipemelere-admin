/**
 * Document Management API Client - Admin endpoints for document verification
 * Handles passenger document verification, viewing, and management
 */

import { api } from '@/lib/api/client';

// Document types based on backend documentation
export type DocumentType =
  | 'national_id'
  | 'driver_license'
  | 'vehicle_registration'
  | 'vehicle_insurance'
  | 'profile_picture'
  | 'bank_statement'
  | 'proof_of_address'
  | 'medical_certificate'
  | 'police_clearance';

// Document statuses based on backend documentation
export type DocumentStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'resubmission_required';

// Document interface based on backend response
export interface Document {
  id: number;
  userId: number;
  documentType: DocumentType;
  status: DocumentStatus;
  originalFileName: string;
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  submissionAttempt: number;
  isLatestVersion: boolean;
  notes?: string;
  rejectionReason?: string;
  adminNotes?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  // For pending documents endpoint
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// API request/response types
export interface VerifyDocumentRequest {
  notes?: string;
}

export interface RejectDocumentRequest {
  reason: string;
  notes?: string;
}

export interface UploadDocumentRequest {
  file: File;
  notes?: string;
}

export interface UploadDocumentResponse {
  document: Document;
  fileInfo: {
    originalName: string;
    filename: string;
    path: string;
    size: number;
  };
  message: string;
}

/**
 * Document Management API Service
 */
export class DocumentService {
  /**
   * Get all documents for a specific passenger
   */
  static async getPassengerDocuments(passengerId: number): Promise<Document[]> {
    try {
      const response = await api.get<Document[]>(`/admin/passengers/${passengerId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch passenger documents:', error);
      throw error;
    }
  }

  /**
   * Get all pending documents across all passengers
   */
  static async getPendingDocuments(limit = 50): Promise<Document[]> {
    try {
      const response = await api.get<Document[]>(`/admin/passengers/documents/pending?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch pending documents:', error);
      throw error;
    }
  }

  /**
   * Verify a document
   */
  static async verifyDocument(documentId: number, data: VerifyDocumentRequest): Promise<Document> {
    try {
      const response = await api.put<Document>(`/admin/passengers/documents/${documentId}/verify`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to verify document:', error);
      throw error;
    }
  }

  /**
   * Reject a document
   */
  static async rejectDocument(documentId: number, data: RejectDocumentRequest): Promise<Document> {
    try {
      const response = await api.put<Document>(`/admin/passengers/documents/${documentId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to reject document:', error);
      throw error;
    }
  }

  /**
   * Upload a national ID document for a passenger
   */
  static async uploadNationalId(passengerId: number, data: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData();
      // Try common field names - let's try 'nationalId' since it's a national ID upload
      formData.append('nationalId', data.file);
      if (data.notes) {
        formData.append('notes', data.notes);
      }

      // Debug: Log what we're sending
      console.log('Uploading with field name: nationalId');
      console.log('File:', data.file.name, data.file.type, data.file.size);
      console.log('Notes:', data.notes);

      const response = await api.post<UploadDocumentResponse>(
        `/admin/passengers/${passengerId}/documents/upload/national-id`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to upload national ID:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Re-throw the original error to preserve the response data
      throw error;
    }
  }

  /**
   * Download a document (returns blob for download)
   */
  static async downloadDocument(passengerId: number, documentId: number): Promise<Blob> {
    try {
      const response = await api.get(`/admin/passengers/${passengerId}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download document:', error);
      throw error;
    }
  }

  /**
   * View a document (returns blob for viewing in browser)
   * Uses the same download endpoint but for viewing purposes
   */
  static async viewDocument(passengerId: number, documentId: number): Promise<Blob> {
    try {
      const response = await api.get(`/admin/passengers/${passengerId}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to view document:', error);
      throw error;
    }
  }

  /**
   * Get document view URL (for displaying in browser)
   * Note: This is deprecated in favor of viewDocument for secure viewing
   */
  static getDocumentViewUrl(document: Document): string {
    return document.fileUrl;
  }

  /**
   * Helper function to get document type display name
   */
  static getDocumentTypeDisplayName(documentType: DocumentType): string {
    const displayNames: Record<DocumentType, string> = {
      national_id: 'National ID',
      driver_license: 'Driver License',
      vehicle_registration: 'Vehicle Registration',
      vehicle_insurance: 'Vehicle Insurance',
      profile_picture: 'Profile Picture',
      bank_statement: 'Bank Statement',
      proof_of_address: 'Proof of Address',
      medical_certificate: 'Medical Certificate',
      police_clearance: 'Police Clearance',
    };
    return displayNames[documentType] || documentType;
  }

  /**
   * Helper function to get status color class
   */
  static getStatusColorClass(status: DocumentStatus): string {
    const colorClasses: Record<DocumentStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      resubmission_required: 'bg-orange-100 text-orange-800',
    };
    return colorClasses[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Check if a document can be verified/rejected
   */
  static canManageDocument(status: DocumentStatus): boolean {
    return status === 'pending' || status === 'under_review';
  }
}

// Export the service functions for easy use
export const documentApi = {
  getPassengerDocuments: DocumentService.getPassengerDocuments.bind(DocumentService),
  getPendingDocuments: DocumentService.getPendingDocuments.bind(DocumentService),
  verifyDocument: DocumentService.verifyDocument.bind(DocumentService),
  rejectDocument: DocumentService.rejectDocument.bind(DocumentService),
  uploadNationalId: DocumentService.uploadNationalId.bind(DocumentService),
  downloadDocument: DocumentService.downloadDocument.bind(DocumentService),
  viewDocument: DocumentService.viewDocument.bind(DocumentService),
  getDocumentViewUrl: DocumentService.getDocumentViewUrl.bind(DocumentService),
  getDocumentTypeDisplayName: DocumentService.getDocumentTypeDisplayName.bind(DocumentService),
  getStatusColorClass: DocumentService.getStatusColorClass.bind(DocumentService),
  canManageDocument: DocumentService.canManageDocument.bind(DocumentService),
};

export default documentApi;