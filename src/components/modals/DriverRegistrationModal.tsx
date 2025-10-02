/**
 * Driver Registration Modal Component
 * Modal wrapper for the multi-step driver registration form
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { DriverRegistrationForm } from '@/components/forms/DriverRegistrationForm';
import { useRegisterDriver } from '@/hooks/api/useDriverData';
import type { DriverRegistrationRequest } from '@/types/registration';

interface DriverRegistrationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (driverId: number) => void;
}

export function DriverRegistrationModal({
  open,
  onClose,
  onSuccess,
}: DriverRegistrationModalProps) {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredDriverId, setRegisteredDriverId] = useState<number | null>(null);
  const registerDriver = useRegisterDriver();

  const handleSubmit = async (data: DriverRegistrationRequest): Promise<void> => {
    try {
      const response = await registerDriver.mutateAsync(data);

      // Registration successful
      setRegistrationSuccess(true);
      setRegisteredDriverId(response.driverId);

      // Call success callback after a short delay to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.driverId);
        }
        handleClose();
      }, 3000);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Registration error:', error);
    }
  };

  const handleClose = (): void => {
    if (!registerDriver.isPending) {
      setRegistrationSuccess(false);
      setRegisteredDriverId(null);
      registerDriver.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Registration</DialogTitle>
        </DialogHeader>

        {/* Success Message */}
        {registrationSuccess && registeredDriverId && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Registration Successful!</strong>
              <br />
              Driver account created successfully. Driver ID: {registeredDriverId}
              <br />
              The driver will receive a verification email to complete the registration process.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {registerDriver.isError && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Registration Failed</strong>
              <br />
              {registerDriver.error instanceof Error
                ? registerDriver.error.message
                : 'An error occurred during registration. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        {!registrationSuccess && (
          <DriverRegistrationForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={registerDriver.isPending}
          />
        )}

        {/* Auto-close countdown after success */}
        {registrationSuccess && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            This modal will close automatically in 3 seconds...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface DriverRegistrationModalTriggerProps {
  onSuccess?: (driverId: number) => void;
  buttonText?: string;
  className?: string;
}

export function DriverRegistrationModalTrigger({
  onSuccess,
  buttonText = 'Register New Driver',
  className,
}: DriverRegistrationModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
      >
        {buttonText}
      </button>

      <DriverRegistrationModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
