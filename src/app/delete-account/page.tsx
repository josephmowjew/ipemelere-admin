import React from 'react';
import {
  TrashIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon,
  PhoneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Delete Your Account - Ipemelere Transport Services',
  description: 'Learn how to delete your Ipemelere account and what happens to your data.',
};

export default function DeleteAccountPage(): React.ReactElement {
  const steps = [
    {
      number: 1,
      title: 'Open the Ipemelere app',
      description: 'Launch the Ipemelere mobile application on your device',
    },
    {
      number: 2,
      title: 'Go to Settings → Account',
      description: 'Navigate to the Settings menu and select Account options',
    },
    {
      number: 3,
      title: 'Tap "Delete Account"',
      description: 'Find and select the Delete Account option',
    },
    {
      number: 4,
      title: 'Enter your password to confirm',
      description: 'For security purposes, you\'ll need to verify your identity',
    },
    {
      number: 5,
      title: 'Tap "Confirm Deletion"',
      description: 'Complete the account deletion process',
    },
  ];

  const whatHappens = [
    {
      icon: ExclamationTriangleIcon,
      title: 'Immediate Deactivation',
      description: 'Your account will be deactivated immediately and you will no longer be able to log in.',
    },
    {
      icon: TrashIcon,
      title: 'Profile Removal',
      description: 'Your profile will be removed from active users and won\'t be visible to drivers or passengers.',
    },
    {
      icon: ClockIcon,
      title: 'No Access',
      description: 'You will lose access to your ride history, saved locations, and payment methods.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-destructive/10 via-background to-destructive/5 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <TrashIcon className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Delete Your Account
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-8 max-w-3xl mx-auto">
                We&apos;re sorry to see you go. Learn how to delete your account and what happens to your data.
              </p>
            </div>
          </div>
        </section>

        {/* How to Delete Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              How to Delete Your Account
            </h2>

            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Happens Section */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                What Happens When You Delete Your Account
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {whatHappens.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                    <item.icon className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-6">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Retention Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Data Retention
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrashIcon className="w-5 h-5 text-destructive" />
                  Data that is deleted
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Active account status</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  Data that is kept
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Account information (name, email, phone)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Ride history</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Payment records</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-6">
              <p className="text-muted-foreground leading-7">
                This data is retained for legal, accounting, and business purposes in accordance with
                Malawian law and our Privacy Policy. We retain this information to comply with tax
                regulations, resolve disputes, prevent fraud, and meet our legal obligations.
              </p>
            </div>
          </div>
        </section>

        {/* Need Help Section */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
              Need Help?
            </h2>

            <p className="text-lg text-muted-foreground leading-8 mb-8">
              If you&apos;re experiencing issues with our service or have questions about account deletion,
              please contact us before deleting your account. We&apos;re here to help!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Phone Support</h3>
                <div className="space-y-1">
                  <p className="text-muted-foreground">+265 888 81 93 33</p>
                  <p className="text-muted-foreground">+265 999 35 54 61</p>
                  <p className="text-muted-foreground">+27 739 476 681</p>
                  <p className="text-muted-foreground">+93 700 017 627</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Available 24/7</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Email Support</h3>
                <p className="text-muted-foreground">support@ipemelere.com</p>
                <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
