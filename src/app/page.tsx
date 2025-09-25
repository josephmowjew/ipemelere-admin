import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'Safe & Reliable Transport Services in Malawi',
  description: 'Book safe, reliable, and affordable rides across Lilongwe, Malawi. 24/7 service with verified drivers, transparent pricing, and real-time tracking.',
  keywords: 'Malawi transport, Lilongwe taxi, ride hailing, safe transport, taxi booking, Ipemelere',
  openGraph: {
    title: 'Ipemelere - Safe & Reliable Transport Services in Malawi',
    description: 'Book safe, reliable, and affordable rides across Lilongwe, Malawi. 24/7 service with verified drivers, transparent pricing, and real-time tracking.',
    type: 'website',
    images: ['/Ipemelere_Logo.png'],
  },
};

// JSON-LD structured data for local business
const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ipemelere Transport Services",
  "image": "/Ipemelere_Logo.png",
  "description": "Safe, reliable, and affordable ride-hailing services across Lilongwe, Malawi. Book your ride with Ipemelere - your trusted transport partner available 24/7.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lilongwe",
    "addressCountry": "MW"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -13.9626,
    "longitude": 33.7741
  },
  "url": typeof window !== 'undefined' ? window.location.origin : 'https://ipemelere.com',
  "telephone": "+2658888119333",
  "email": "ganyuipemelere@gmail.com",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": -13.9626,
      "longitude": 33.7741
    },
    "geoRadius": "50000"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Transport Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Sedan Ride",
          "description": "Comfortable rides for 1-4 passengers"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Hatchback Ride", 
          "description": "Efficient transport for city trips"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Premium Ride",
          "description": "Luxury vehicles for special occasions"
        }
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "3"
  }
};

export default function LandingPage() {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'All drivers are verified and insured. Your safety is our top priority.',
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Fair Pricing',
      description: 'Transparent distance-based pricing. No hidden fees or surge pricing.',
    },
    {
      icon: ClockIcon,
      title: '24/7 Available',
      description: 'Round-the-clock service whenever you need a reliable ride.',
    },
    {
      icon: MapPinIcon,
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time from pickup to destination.',
    },
  ];

  const vehicleTypes = [
    { type: 'Sedan', description: 'Comfortable rides for 1-4 passengers', price: 'MWK 2500 ($1.4) per km' },
    { type: 'Hatchback', description: 'Efficient transport for city trips', price: 'MWK 2500 ($1.4) per km' },
    { type: 'Premium', description: 'Luxury vehicles for special occasions', price: 'MWK 2500 ($1.4) per km' },
  ];

  const testimonials = [
    {
      name: 'Grace Mbewe',
      role: 'Regular Customer',
      content: 'Ipemelere has made my daily commute so much easier. The drivers are professional and the app is simple to use.',
      rating: 5,
    },
    {
      name: 'John Phiri',
      role: 'Business Executive',
      content: 'Reliable service for my business meetings. I can always count on Ipemelere to get me there on time.',
      rating: 5,
    },
    {
      name: 'Mary Banda',
      role: 'Student',
      content: 'Affordable and safe. Perfect for getting around Lilongwe without worrying about transportation.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center bg-gradient-to-br from-black via-slate-900 to-gray-900 overflow-x-visible overflow-y-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0 bg-grid-white/10" style={{backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center, transparent 20%, black)'}}></div>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-yellow-500/10 to-green-800/20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-lime-400 rounded-full mr-2 animate-pulse"></div>
                  Now available in Lilongwe
                </div>
                
                {/* Company Logo - Rolling Wheel Animation */}
                <div className="mb-6 w-full relative">
                  <div className="rolling-logo absolute left-0">
                    <Image
                      src="/Ipemelere_Logo.png"
                      alt="Ganyu Ipemelere"
                      width={280}
                      height={120}
                      priority
                      className="h-20 sm:h-24 lg:h-28 w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                  Your Ride
                  <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-500 bg-clip-text text-transparent">
                    Awaits
                  </span>
                </h1>
                
                <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-lg">
                  Safe, reliable transport across Malawi. Get where you need to go with 
                  <span className="font-semibold text-yellow-300"> verified drivers</span> and 
                  <span className="font-semibold text-lime-300"> transparent pricing</span>.
                  <span className="block mt-4 text-lg italic font-medium text-yellow-200">
                    Ndife Aganyu Anu
                  </span>
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="btn-primary-glow text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-lime-500 hover:from-yellow-400 hover:to-lime-400 text-black border-none shadow-2xl shadow-yellow-500/25 font-bold relative overflow-hidden group" asChild>
                    <Link href="/contact">
                      <span className="relative z-10">Book Your Ride</span>
                      <div className="ml-2 text-lg relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</div>
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-lime-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </Link>
                  </Button>
                  <Button size="lg" className="btn-secondary-glow text-lg px-8 py-4 bg-white/10 border-2 border-white/50 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm font-semibold relative overflow-hidden group" asChild>
                    <Link href="#download">
                      <span className="relative z-10">Get the App</span>
                      <DevicePhoneMobileIcon className="ml-2 w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-16 grid grid-cols-3 gap-8 text-center lg:text-left">
                  <div className="group">
                    <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-400 to-lime-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">20+</div>
                    <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Vehicles</div>
                  </div>
                  <div className="group">
                    <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">24/7</div>
                    <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Service</div>
                  </div>
                  <div className="group">
                    <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">100%</div>
                    <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Verified</div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Interactive Elements */}
              <div className="relative flex justify-center lg:justify-end">
                {/* Floating elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 bg-gradient-to-r from-green-500/20 to-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
                </div>
                
                {/* Main visual */}
                <div className="relative z-10 p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl">
                  <div className="space-y-6">
                    {/* Mock app interface */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Book a Ride</h3>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                          <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                          <span className="text-slate-600 text-sm">Your location</span>
                        </div>
                        <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                          <span className="text-slate-600 text-sm">Where to?</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-green-50 rounded text-green-700 text-center font-medium">
                          Sedan • MWK 2500 ($1.4)/km
                        </div>
                        <div className="p-2 bg-yellow-50 rounded text-yellow-700 text-center font-medium">
                          Premium • MWK 2500 ($1.4)/km
                        </div>
                      </div>
                    </div>
                    
                    {/* Trust indicators */}
                    <div className="flex items-center justify-center space-x-4 text-white/80">
                      <div className="flex items-center text-sm">
                        <ShieldCheckIcon className="w-4 h-4 mr-1 text-green-400" />
                        Verified
                      </div>
                      <div className="flex items-center text-sm">
                        <ClockIcon className="w-4 h-4 mr-1 text-yellow-400" />
                        24/7
                      </div>
                      <div className="flex items-center text-sm">
                        <CurrencyDollarIcon className="w-4 h-4 mr-1 text-green-400" />
                        Fair Price
                      </div>
                    </div>
                  </div>
                </div>
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

        {/* Features Section */}
        <section id="features" className="py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                ✨ Premium Features
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Why Choose 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> G. Ipemelere</span>?
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Experience transportation reimagined with cutting-edge technology and unmatched service quality
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 h-full">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 w-12 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Types Section */}
        <section id="services" className="py-32 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                🚗 Vehicle Options
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Our 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Vehicle Fleet</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Quality vehicles maintained to the highest standards - we&apos;ll match you with the best available option for your journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {vehicleTypes.map((vehicle, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors duration-300">
                          {vehicle.type}
                        </h3>
                        {index === 1 && (
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-pink-400 text-white text-xs font-bold rounded-full">
                            POPULAR
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {vehicle.description}
                      </p>
                      
                      <div className="flex items-baseline mb-8">
                        <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent">
                          {vehicle.price.split(' ')[0]}
                        </span>
                        <span className="text-slate-500 ml-2 font-medium">
                          {vehicle.price.split(' ').slice(1).join(' ')}
                        </span>
                      </div>
                      
                      <div className="w-full py-3 px-6 rounded-xl font-semibold text-center bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border-2 border-slate-200">
                        Available on Booking
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Area */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                  Serving Greater Lilongwe
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Currently operating across Lilongwe with plans to expand throughout Malawi. 
                  Our local knowledge ensures efficient routes and the best service for our community.
                </p>
                
                <div className="space-y-4">
                  {['City Center', 'Kanengo', 'Area 47', 'Old Town', 'Kawale', 'Ngwenya'].map((area) => (
                    <div key={area} className="flex items-center space-x-3">
                      <CheckIcon className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-primary/10 rounded-full mb-6">
                  <MapPinIcon className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Expanding Soon</h3>
                <p className="text-muted-foreground">
                  Blantyre, Mzuzu, and other major cities coming in 2025
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                ⭐ Customer Stories
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Trusted by 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Thousands</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Real stories from real people who trust Ipemelere for their daily transportation needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                    {/* Quote decoration */}
                    <div className="absolute top-6 right-6 w-8 h-8 text-slate-200 text-4xl font-serif">&ldquo;</div>
                    
                    {/* Stars */}
                    <div className="flex items-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    {/* Content */}
                    <p className="text-slate-700 mb-8 leading-relaxed font-medium italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    
                    {/* Author */}
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Get the Ipemelere App
            </h2>
            <p className="text-xl mb-12 opacity-90">
              Book rides, track your driver, and manage payments all in one place
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3 bg-primary-foreground/10 rounded-lg px-6 py-4">
                <DevicePhoneMobileIcon className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-semibold">Android App</p>
                  <p className="text-sm opacity-75">Coming Very Soon</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-primary-foreground/10 rounded-lg px-6 py-4 opacity-60">
                <DevicePhoneMobileIcon className="w-8 h-8" />
                <div className="text-left">
                  <p className="font-semibold">iOS App</p>
                  <p className="text-sm opacity-75">Future Release</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-lg mb-6">Need a ride right now? Call or chat on WhatsApp:</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button size="lg" variant="secondary" className="text-base px-6 py-3" asChild>
                    <Link href="tel:+2658888119333">📞 +265 888 81 93 33</Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="text-base px-6 py-3 p-0 border-0 bg-transparent hover:bg-transparent" asChild>
                    <Link href="https://wa.me/265888819333" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center transform hover:scale-105 transition-all duration-200 w-full h-full">
                      <Image
                        src="/WhatsAppButtonGreenSmall.svg"
                        alt="Chat on WhatsApp"
                        width={160}
                        height={36}
                        className="max-h-9 w-auto"
                      />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button size="lg" variant="secondary" className="text-base px-6 py-3" asChild>
                    <Link href="tel:+265999355461">📞 +265 999 35 54 61</Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="text-base px-6 py-3 p-0 border-0 bg-transparent hover:bg-transparent" asChild>
                    <Link href="https://wa.me/265999355461" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center transform hover:scale-105 transition-all duration-200 w-full h-full">
                      <Image
                        src="/WhatsAppButtonGreenSmall.svg"
                        alt="Chat on WhatsApp"
                        width={160}
                        height={36}
                        className="max-h-9 w-auto"
                      />
                    </Link>
                  </Button>
                </div>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3 block w-full max-w-md mx-auto" asChild>
                  <Link href="tel:+27739476681">+27 739 476 681</Link>
                </Button>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3 block w-full max-w-md mx-auto" asChild>
                  <Link href="tel:+93700017627">+93 700 017 627</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <PublicFooter />
    </div>
  );
}