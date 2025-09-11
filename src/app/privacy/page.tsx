import React from 'react';
import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Privacy Policy - Ipemelere Transport Services',
  description: 'Learn how Ipemelere protects your personal data and privacy while providing safe, reliable transport services in Malawi.',
};

export default function PrivacyPage() {
  const lastUpdated = 'December 2024';

  const dataTypes = [
    {
      icon: UserGroupIcon,
      title: 'Personal Information',
      items: ['Name and contact details', 'Phone number and email', 'Profile photo (optional)', 'Age and identification (for verification)'],
    },
    {
      icon: MapPinIcon,
      title: 'Location Data',
      items: ['Pickup and drop-off locations', 'Real-time location during rides', 'Location history for service improvement', 'GPS coordinates for accurate routing'],
    },
    {
      icon: PhoneIcon,
      title: 'Communication Data',
      items: ['Phone calls for ride coordination', 'Customer service communications', 'Feedback and ratings', 'Support requests and responses'],
    },
    {
      icon: DocumentTextIcon,
      title: 'Transaction Information',
      items: ['Payment method details', 'Ride fare and payment history', 'Mobile money transaction data', 'Receipts and invoices'],
    },
  ];

  const protectionMeasures = [
    {
      icon: LockClosedIcon,
      title: 'Data Encryption',
      description: 'All personal data is encrypted both in transit and at rest using industry-standard encryption protocols.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Access Controls',
      description: 'Strict access controls ensure only authorized personnel can access customer data for legitimate business purposes.',
    },
    {
      icon: EyeIcon,
      title: 'Regular Audits',
      description: 'We conduct regular security audits and assessments to ensure your data remains protected.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Malawi Compliance',
      description: 'Our practices comply with Malawi data protection laws and international privacy standards.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary/10 via-background to-primary/5 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Privacy Policy
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-8 max-w-3xl mx-auto">
                Your privacy and data security are our top priorities. Learn how we collect, 
                use, and protect your personal information.
              </p>
              <div className="mt-6 text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-8">
                Ipemelere Transport Services (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy 
                and ensuring the security of your personal information. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your information when you use our ride-hailing services 
                in Malawi.
              </p>
              
              <p className="text-lg text-muted-foreground leading-8 mt-6">
                By using our services, you consent to the collection and use of information in accordance 
                with this policy. If you do not agree with the terms of this Privacy Policy, please do not 
                use our services.
              </p>
            </div>
          </div>
        </section>

        {/* Information We Collect */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Information We Collect
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                We collect information necessary to provide safe, efficient transport services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dataTypes.map((type, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{type.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {type.items.map((item, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              How We Use Your Information
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Service Delivery</h3>
                <p className="text-muted-foreground leading-7">
                  We use your information to provide ride-hailing services, including connecting you with drivers, 
                  processing payments, providing customer support, and ensuring service quality through ratings and reviews.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Safety and Security</h3>
                <p className="text-muted-foreground leading-7">
                  Your location data helps us ensure your safety during rides, verify driver and passenger identities, 
                  investigate safety incidents, and comply with law enforcement requests when legally required.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Service Improvement</h3>
                <p className="text-muted-foreground leading-7">
                  We analyze usage patterns and feedback to improve our services, optimize routes and pricing, 
                  develop new features, and better serve the Malawian transport market.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Communication</h3>
                <p className="text-muted-foreground leading-7">
                  We use your contact information to coordinate rides through phone calls, send service updates, 
                  safety notifications, promotional offers (with your consent), and important policy changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                How We Protect Your Data
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Industry-leading security measures to keep your information safe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {protectionMeasures.map((measure, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <measure.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{measure.title}</h3>
                  <p className="text-muted-foreground leading-6">{measure.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              When We Share Information
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">With Drivers</h3>
                <p className="text-muted-foreground leading-7">
                  We share necessary information with drivers to provide your ride, including your name, 
                  phone number, and pickup/drop-off locations to coordinate your transportation.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Service Providers</h3>
                <p className="text-muted-foreground leading-7">
                  We work with trusted third-party service providers for payment processing, mapping services, 
                  customer support, and technology infrastructure. These providers are contractually bound to 
                  protect your data.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Legal Requirements</h3>
                <p className="text-muted-foreground leading-7">
                  We may disclose information when required by Malawian law, court orders, or to protect 
                  the safety and rights of our users, employees, or the public.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Business Transfers</h3>
                <p className="text-muted-foreground leading-7">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                  to the new entity, with the same privacy protections applying.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Your Privacy Rights
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Access and Portability</h3>
                  <p className="text-muted-foreground">
                    You can request access to your personal data and receive a copy in a portable format.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Correction and Updates</h3>
                  <p className="text-muted-foreground">
                    You can update your profile information and request correction of inaccurate data.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Deletion</h3>
                  <p className="text-muted-foreground">
                    You can request deletion of your account and associated data, subject to legal requirements.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Marketing Opt-out</h3>
                  <p className="text-muted-foreground">
                    You can unsubscribe from promotional communications while still receiving service-related messages.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Location Services</h3>
                  <p className="text-muted-foreground">
                    You can control location sharing through your device settings, though this may limit service functionality.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Concerns</h3>
                  <p className="text-muted-foreground">
                    You can raise privacy concerns or complaints through our customer support channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Data Retention
            </h2>
            
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-8">
                We retain your personal information only for as long as necessary to provide our services, 
                comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
              
              <p className="text-lg text-muted-foreground leading-8">
                Account information is retained while your account is active. Trip history and location data 
                are typically retained for 7 years for safety, legal, and service improvement purposes. 
                Payment information is retained according to financial regulations in Malawi.
              </p>
              
              <p className="text-lg text-muted-foreground leading-8">
                When you delete your account, we will delete or anonymize your personal information within 
                90 days, except where retention is required by law or for legitimate business purposes 
                such as safety investigations or legal proceedings.
              </p>
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="py-16 sm:py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12 text-center">
              Children&apos;s Privacy
            </h2>
            
            <div className="text-center space-y-6">
              <p className="text-lg text-muted-foreground leading-8">
                Our services are not intended for children under 18 years of age. We do not knowingly 
                collect personal information from children under 18. If you are a parent or guardian and 
                believe your child has provided us with personal information, please contact us immediately.
              </p>
              
              <p className="text-lg text-muted-foreground leading-8">
                Rides for minors must be booked by a parent or guardian who takes responsibility for 
                the trip and any associated data collection.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
              Questions About Privacy?
            </h2>
            
            <p className="text-lg text-muted-foreground leading-8 mb-8">
              If you have questions about this Privacy Policy or how we handle your personal information, 
              please contact us using the methods below.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Phone</h3>
                <p className="text-muted-foreground">+265 888 81 93 33</p>
                <p className="text-sm text-muted-foreground mt-1">Available 24/7</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground">privacy@ipemelere.com</p>
                <p className="text-sm text-muted-foreground mt-1">We respond within 24 hours</p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="text-xl font-semibold text-foreground mb-3">Policy Updates</h3>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on our website and through our app. Changes 
                take effect immediately upon posting.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <PublicFooter />
    </div>
  );
}