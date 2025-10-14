'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckIcon,
  DocumentCheckIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon,
  PhoneIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon as TimeIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

type VerificationStatus = 'success' | 'error';
type MessageType = 'verified' | 'expired' | 'invalid' | 'not_found' | 'already_verified' | 'unknown_error';

function WelcomeContent() {
  const searchParams = useSearchParams();

  const status = searchParams.get('status') as VerificationStatus | null;
  const message = searchParams.get('message') as MessageType | null;
  const email = searchParams.get('email') ? decodeURIComponent(searchParams.get('email')!) : null;

  const isSuccess = status === 'success' && message === 'verified';
  const isError = status === 'error';

  // Define error configurations
  const errorConfigs = {
    expired: {
      icon: ClockIcon,
      title: 'Verification Link Expired',
      description: email
        ? `Your verification link for ${email} has expired. We'll send you a new one.`
        : 'Your verification link has expired. Please request a new verification email.',
      actionText: 'Send New Link',
      bgColor: 'from-orange-500/20',
      borderColor: 'border-orange-400/30',
      textColor: 'text-orange-300',
      iconBg: 'from-orange-500 to-red-600'
    },
    invalid: {
      icon: XCircleIcon,
      title: 'Invalid Verification Link',
      description: email
        ? `The verification link for ${email} is invalid or corrupted. Please try again.`
        : 'The verification link is invalid or corrupted. Please request a new verification email.',
      actionText: 'Request New Link',
      bgColor: 'from-red-500/20',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-300',
      iconBg: 'from-red-500 to-red-600'
    },
    not_found: {
      icon: ExclamationTriangleIcon,
      title: 'Verification Token Not Found',
      description: 'The verification token could not be found. Please request a new verification email.',
      actionText: 'Request New Link',
      bgColor: 'from-gray-500/20',
      borderColor: 'border-gray-400/30',
      textColor: 'text-gray-300',
      iconBg: 'from-gray-500 to-gray-600'
    },
    already_verified: {
      icon: CheckIcon,
      title: 'Email Already Verified',
      description: email
        ? `Great news! The email ${email} is already verified. You can proceed with your driver registration.`
        : 'This email is already verified. You can proceed with your driver registration.',
      actionText: 'Continue to Dashboard',
      bgColor: 'from-blue-500/20',
      borderColor: 'border-blue-400/30',
      textColor: 'text-blue-300',
      iconBg: 'from-blue-500 to-blue-600'
    },
    unknown_error: {
      icon: ExclamationTriangleIcon,
      title: 'Verification Error',
      description: email
        ? `We encountered an error verifying ${email}. Please try again or contact support.`
        : 'We encountered an error during verification. Please try again or contact support.',
      actionText: 'Contact Support',
      bgColor: 'from-red-500/20',
      borderColor: 'border-red-400/30',
      textColor: 'text-red-300',
      iconBg: 'from-red-500 to-red-600'
    }
  };

  const currentError = isError && message && message !== 'verified' ? errorConfigs[message as Exclude<MessageType, 'verified'>] : null;

  const completedSteps = [
    {
      icon: CheckIcon,
      title: 'Driver Account Created',
      description: 'Your Ipemelere driver account has been successfully created',
      completed: true,
    },
    {
      icon: CheckIcon,
      title: 'Email Verified',
      description: email ? `Email ${email} has been verified` : 'Email has been verified',
      completed: isSuccess || (isError && message === 'already_verified'),
    },
  ];

  const remainingSteps = [
    {
      icon: DocumentCheckIcon,
      title: 'Upload Required Documents',
      description: 'Upload your driver\'s license, vehicle registration, and insurance documents in the Ipemelere driver app',
      action: 'Continue in App',
      href: '#download',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Complete Driver Profile',
      description: 'Add your vehicle details and complete your profile in the Ipemelere driver app',
      action: 'Continue in App',
      href: '#download',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-green-900 to-black py-24 sm:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-white/10" style={{backgroundSize: '60px 60px'}}></div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/20 via-yellow-500/10 to-green-900/30"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Status Badge */}
              {isSuccess && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 text-sm font-medium mb-8">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Email verified successfully
                </div>
              )}

              {currentError && (
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${currentError.bgColor} backdrop-blur-sm border ${currentError.borderColor} ${currentError.textColor} text-sm font-medium mb-8`}>
                  <currentError.icon className="w-4 h-4 mr-2" />
                  Verification {message}
                </div>
              )}

              {/* Default badge if no status */}
              {!status && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  Getting Started as Driver
                </div>
              )}

              {/* Logo */}
              <div className="mx-auto h-20 w-20 flex items-center justify-center mb-8 transform hover:scale-110 transition-transform duration-300">
                <Image
                  src="/Ipemelere_Logo.png"
                  alt="Ipemelere Logo"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>

              {/* Dynamic Title and Content */}
              {isSuccess && (
                <>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    Welcome to
                    <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                      Ipemelere Driver!
                    </span>
                  </h1>
                  <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto">
                    {email ? `Welcome back, ${email}!` : 'Your driver account has been created successfully!'}
                    <span className="font-semibold text-yellow-300"> Complete a few more steps</span> to start
                    <span className="font-semibold text-lime-300"> earning with Ipemelere</span> across Malawi.
                    <span className="block mt-4 text-lg italic font-medium text-yellow-200">
                      Ndife Aganyu Anu
                    </span>
                  </p>
                </>
              )}

              {currentError && (
                <>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    {currentError.title}
                    <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                      {message === 'already_verified' ? 'Ready to Continue' : 'Let\'s Fix This'}
                    </span>
                  </h1>
                  <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto">
                    {currentError.description}
                    <span className="block mt-4 text-lg italic font-medium text-yellow-200">
                      We're here to help - Ndife Aganyu Anu
                    </span>
                  </p>
                </>
              )}

              {!status && (
                <>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                    Welcome to
                    <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                      Ipemelere Driver!
                    </span>
                  </h1>
                  <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto">
                    Your journey to earning with safe and reliable transport starts here.
                    <span className="font-semibold text-yellow-300"> Complete your driver registration</span> to start
                    <span className="font-semibold text-lime-300"> accepting rides across Malawi</span>.
                    <span className="block mt-4 text-lg italic font-medium text-yellow-200">
                      Ndife Aganyu Anu
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Progress/Error Section */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Error State */}
            {currentError && (
              <div className="text-center mb-20">
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${currentError.bgColor.replace('/20', '/10')} text-slate-700 text-sm font-semibold mb-6`}>
                  🔧 Action Required
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                  Let's Get This
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"> Sorted</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Don't worry - these issues are easy to fix. We'll help you get back on track.
                </p>

                {/* Error Resolution Card */}
                <div className="mt-16 max-w-2xl mx-auto">
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader>
                      <div className="flex items-center justify-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${currentError.iconBg} rounded-xl flex items-center justify-center`}>
                          <currentError.icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-red-800">{currentError.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-red-700 mb-6 text-lg">{currentError.description}</p>
                      <div className="space-y-4">
                        {(message === 'expired' || message === 'invalid' || message === 'not_found') && (
                          <div className="space-y-3">
                            <p className="text-sm text-orange-700 font-medium">
                              📱 To {currentError.actionText.toLowerCase()}, please use the Ipemelere driver app or contact support.
                            </p>
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-none shadow-lg"
                              asChild
                            >
                              <Link href="#download">
                                Download Driver App
                                <DevicePhoneMobileIcon className="ml-2 w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        )}
                        {message === 'already_verified' && (
                          <div className="space-y-3">
                            <p className="text-sm text-blue-700 font-medium">
                              📱 Continue your driver registration in the Ipemelere driver app to complete setup and start accepting rides.
                            </p>
                            <Button
                              size="lg"
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg"
                              asChild
                            >
                              <Link href="#download">
                                Download Driver App
                                <DevicePhoneMobileIcon className="ml-2 w-4 h-4" />
                              </Link>
                            </Button>
                          </div>
                        )}
                        {message === 'unknown_error' && (
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-none shadow-lg"
                            asChild
                          >
                            <Link href="/contact">
                              {currentError.actionText}
                              <PhoneIcon className="ml-2 w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                          asChild
                        >
                          <Link href="/contact">
                            Contact Support
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Success State */}
            {(isSuccess || (!status)) && (
              <div className="text-center mb-20">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                  🎯 Your Progress
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                  Getting You
                  <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Road Ready</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Just a few more steps to complete your driver registration and start earning
                </p>
              </div>
            )}

            {/* Completed Steps - Only show for success or default state */}
            {(isSuccess || (!status && !currentError)) && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">✅ Completed Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedSteps.map((step, index) => (
                    <div key={index} className="group">
                      <div className="bg-green-50 rounded-3xl p-8 border-2 border-green-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-yellow-200/30 rounded-full transform translate-x-16 -translate-y-16"></div>

                        <div className="relative z-10 flex items-start space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-green-800 mb-2">{step.title}</h4>
                            <p className="text-green-700">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps - Only show for success or default state */}
            {(isSuccess || (!status && !currentError)) && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">🚀 Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {remainingSteps.map((step, index) => (
                    <Card key={index} className="group relative border-2 border-slate-200 hover:border-green-300 transition-colors duration-300">
                      <CardHeader className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10 flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <step.icon className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors duration-300">
                            {step.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-slate-600 mb-6">{step.description}</p>
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-green-500 to-yellow-600 hover:from-green-600 hover:to-yellow-700 text-white border-none shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                          asChild
                        >
                          <Link href={step.href}>
                            {step.action}
                            <ArrowRightIcon className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Driver Benefits Preview */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-green-50/50"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100 text-slate-700 text-sm font-semibold mb-6">
                ✨ Driver Benefits
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Why Drive With
                <span className="bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent"> Ipemelere</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <CurrencyDollarIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                      Competitive Earnings
                    </h3>
                    <p className="text-slate-600 leading-6">
                      Earn competitive rates with transparent pricing and weekly payouts directly to your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group text-center">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100/50 to-green-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <TimeIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-yellow-600 transition-colors duration-300">
                      Flexible Schedule
                    </h3>
                    <p className="text-slate-600 leading-6">
                      Drive when you want. Set your own hours and work as much or as little as you like.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group text-center">
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <UserGroupIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                      Driver Support
                    </h3>
                    <p className="text-slate-600 leading-6">
                      24/7 driver support team ready to assist you with any questions or concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-900 via-green-900 to-black text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-grid-white/10" style={{backgroundSize: '60px 60px'}}></div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/20 via-yellow-500/10 to-green-900/30"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                Almost Ready!
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8">
                Complete Your
                <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  Driver Registration
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto mb-12">
                Finish the setup process and you'll be ready to start accepting rides and
                <span className="font-semibold text-yellow-300"> earning</span> with
                <span className="font-semibold text-lime-300"> Ipemelere</span>.
              </p>
            </div>

            <div className="text-center mb-8">
              <p className="text-lg text-white/90 mb-6">
                📱 Complete your driver registration in the Ipemelere driver app to start accepting rides!
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-lime-500 hover:from-yellow-600 hover:to-lime-600 text-black border-none shadow-2xl shadow-yellow-500/25 transform hover:scale-105 transition-all duration-200 font-bold" asChild>
                  <Link href="#download">
                    Download Driver App
                    <DevicePhoneMobileIcon className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 bg-white/10" asChild>
                  <Link href="/contact">
                    Need Help?
                    <PhoneIcon className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-white/90 mb-4">Questions? Driver support is here 24/7:</p>
              <div className="flex flex-wrap justify-center gap-4 text-yellow-300">
                <a href="tel:+2658888119333" className="hover:text-yellow-200 transition-colors">+265 888 81 93 33</a>
                <span className="text-white/50">•</span>
                <a href="tel:+265999355461" className="hover:text-yellow-200 transition-colors">+265 999 35 54 61</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 flex items-center justify-center mb-8">
              <Image
                src="/Ipemelere_Logo.png"
                alt="Ipemelere Logo"
                width={80}
                height={80}
                className="object-contain drop-shadow-lg animate-pulse"
                priority
              />
            </div>
            <p className="text-lg text-muted-foreground">Loading your welcome page...</p>
          </div>
        </main>
        <PublicFooter />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
