'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { cn } from '@/lib/utils';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: 'ride' | 'driver' | 'business' | 'support';
}

const validationRules = {
  name: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  },
  phone: {
    required: 'Phone number is required',
    pattern: {
      value: /^(\+265|0)[0-9]{9}$/,
      message: 'Please enter a valid Malawi phone number (+265XXXXXXXXX or 0XXXXXXXXX)',
    },
  },
  subject: {
    required: 'Subject is required',
    minLength: {
      value: 5,
      message: 'Subject must be at least 5 characters',
    },
  },
  message: {
    required: 'Message is required',
    minLength: {
      value: 10,
      message: 'Message must be at least 10 characters',
    },
  },
  serviceType: {
    required: 'Please select a service type',
  },
} as const;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just log the data - replace with actual API call
      console.log('Contact form data:', data);
      
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+265 888 81 93 33', 'Available 24/7'],
      action: 'tel:+2658888119333',
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['support@ipemelere.com', 'We respond within 24 hours'],
      action: 'mailto:support@ipemelere.com',
    },
    {
      icon: MapPinIcon,
      title: 'Location',
      details: ['Lilongwe, Malawi', 'Serving Greater Lilongwe Area'],
      action: null,
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: ['24/7 Service', 'Customer support available anytime'],
      action: null,
    },
  ];

  const serviceTypes = [
    { value: 'ride', label: 'Book a Ride', icon: DevicePhoneMobileIcon },
    { value: 'driver', label: 'Become a Driver', icon: PhoneIcon },
    { value: 'business', label: 'Business Services', icon: EnvelopeIcon },
    { value: 'support', label: 'General Support', icon: ChatBubbleLeftRightIcon },
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
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                24/7 Available
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                Contact
                <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  Ipemelere
                </span>
              </h1>
              <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto">
                We&apos;re here to help with 
                <span className="font-semibold text-yellow-300"> ride bookings</span>, 
                <span className="font-semibold text-lime-300"> driver applications</span>, 
                <span className="font-semibold text-green-300"> business partnerships</span>, or any questions.
              </p>
              
              {/* Quick Actions */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-lime-500 hover:from-yellow-600 hover:to-lime-600 text-black border-none shadow-2xl shadow-yellow-500/25 transform hover:scale-105 transition-all duration-200 font-bold" asChild>
                  <a href="tel:+2658888119333">
                    Call Now
                    <PhoneIcon className="ml-2 w-5 h-5" />
                  </a>
                </Button>
                <Button size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 bg-white/10" asChild>
                  <a href="mailto:support@ipemelere.com">
                    Email Us
                    <EnvelopeIcon className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                📞 Get In Touch
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Multiple Ways to 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Reach Us</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                        {info.title}
                      </h3>
                      <div className="space-y-2">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className={cn(
                            idx === 0 ? 'text-slate-900 font-semibold text-lg' : 'text-slate-600 text-sm'
                          )}>
                            {info.action && idx === 0 ? (
                              <a href={info.action} className="hover:text-yellow-600 transition-colors">
                                {detail}
                              </a>
                            ) : (
                              detail
                            )}
                          </p>
                        ))}
                      </div>
                      <div className="mt-6 w-12 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-green-50/50"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100 text-slate-700 text-sm font-semibold mb-6">
                📝 Send Message
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Send us a 
                <span className="bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent"> Message</span>
              </h2>
              <p className="text-xl text-slate-600">
                Fill out the form below and we&apos;ll get back to you as soon as possible
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-10">
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-center">
                    Thank you for your message! We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-center">
                    Sorry, there was an error sending your message. Please try again or call us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Service Type Selection */}
                <div>
                  <Label htmlFor="serviceType" className="text-base font-medium">
                    What can we help you with? *
                  </Label>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceTypes.map((type) => (
                      <label key={type.value} className="relative">
                        <input
                          {...register('serviceType', validationRules.serviceType)}
                          type="radio"
                          value={type.value}
                          className="sr-only peer"
                        />
                        <div className="p-4 border border-slate-200 rounded-xl cursor-pointer transition-all peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-green-300 hover:bg-green-25 group">
                          <div className="flex items-center space-x-3">
                            <type.icon className="w-5 h-5 text-green-600 group-hover:text-yellow-600 transition-colors" />
                            <span className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">{type.label}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.serviceType && (
                    <p className="mt-1 text-sm text-destructive">{errors.serviceType.message}</p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name', validationRules.name)}
                      placeholder="Enter your full name"
                      className={cn(errors.name && 'border-destructive')}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone', validationRules.phone)}
                      placeholder="+265 888 81 93 33"
                      className={cn(errors.phone && 'border-destructive')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', validationRules.email)}
                    placeholder="your.email@example.com"
                    className={cn(errors.email && 'border-destructive')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    {...register('subject', validationRules.subject)}
                    placeholder="What is your message about?"
                    className={cn(errors.subject && 'border-destructive')}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    {...register('message', validationRules.message)}
                    placeholder="Please provide details about your inquiry..."
                    className={cn('min-h-[120px]', errors.message && 'border-destructive')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <div className="text-center">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-yellow-600 hover:from-green-600 hover:to-yellow-700 text-white border-none shadow-xl shadow-green-500/25 transform hover:scale-105 transition-all duration-200 font-bold text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                    {!isSubmitting && <div className="ml-2 text-lg">→</div>}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Quick Contact */}
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
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                Urgent Support
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8">
                Need Immediate
                <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  Assistance?
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-3xl mx-auto mb-12">
                For urgent ride bookings or immediate support, contact us directly. 
                <span className="font-semibold text-yellow-300"> We&apos;re available 24/7</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-lime-500 hover:from-yellow-600 hover:to-lime-600 text-black border-none shadow-2xl shadow-yellow-500/25 transform hover:scale-105 transition-all duration-200 font-bold" asChild>
                <a href="tel:+2658888119333">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Call Now: +265 888 81 93 33
                </a>
              </Button>
              <Button size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 bg-white/10" asChild>
                <a href="mailto:support@ipemelere.com">
                  <EnvelopeIcon className="w-5 h-5 mr-2" />
                  Email Support
                </a>
              </Button>
            </div>
            
            {/* Response Time Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 to-lime-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">24/7</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Available</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">&lt;24h</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Response</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">100%</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Committed</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <PublicFooter />
    </div>
  );
}