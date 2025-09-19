'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface PublicFooterProps {
  className?: string;
}

export function PublicFooter({ className }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-muted/30 border-t border-border', className)}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/Ipemelere_Logo.png"
                alt="Ipemelere"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-6">
              Safe, reliable, and affordable transport services across Malawi. 
              Your trusted ride-hailing partner for daily commutes and special occasions.
            </p>
            <div className="space-y-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  24/7 Service
                </span>
              </div>
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Registered Passenger Carrying Vehicles (RED NUMBERS) with Passenger Category Drivers
                </span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium">+265 888 81 93 33</p>
                  <p className="text-xs text-muted-foreground">Customer Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium">ganyuipemelere@gmail.com</p>
                  <p className="text-xs text-muted-foreground">General Inquiries</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">Lilongwe, Malawi</p>
                  <p className="text-xs text-muted-foreground">Serving Greater Lilongwe Area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operating hours & services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Service Hours</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-foreground font-medium">24/7 Available</p>
                  <p className="text-xs text-muted-foreground">Every day of the week</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Services</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Regular Taxi Service</li>
                  <li>• Airport Transfers</li>
                  <li>• Corporate Transport</li>
                  <li>• Event Transportation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* App download & quick links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Get Started</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Download our mobile app:</p>
                <div className="space-y-2">
                  <Link 
                    href="#download"
                    className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <DevicePhoneMobileIcon className="h-4 w-4" />
                    <span>Android App (Coming Soon)</span>
                  </Link>
                  <Link 
                    href="#download"
                    className="flex items-center space-x-2 text-sm text-muted-foreground"
                  >
                    <DevicePhoneMobileIcon className="h-4 w-4" />
                    <span>iOS App (Future Release)</span>
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Quick Links</h4>
                <div className="space-y-1">
                  <Link href="/about" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                  <Link href="/contact" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                  <Link href="/privacy" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-xs text-muted-foreground">
              © {currentYear} Ganyu Ipemelere. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <GlobeAltIcon className="h-3 w-3" />
                <span>Made in Malawi</span>
              </span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}