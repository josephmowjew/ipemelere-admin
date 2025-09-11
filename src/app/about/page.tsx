import React from 'react';
import Link from 'next/link';
import { 
  UsersIcon,
  TruckIcon,
  MapPinIcon,
  ShieldCheckIcon,
  HeartIcon,
  GlobeAltIcon,
  CheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const metadata = {
  title: 'About Us - Ipemelere Transport Services',
  description: 'Learn about Ipemelere&apos;s mission to provide safe, reliable, and affordable transport services across Malawi.',
};

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Every driver is thoroughly vetted, and all vehicles are regularly inspected for your safety.',
    },
    {
      icon: HeartIcon,
      title: 'Community Focused',
      description: 'We are proud to be a local Malawian company serving our communities with care.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Innovation',
      description: 'Bringing modern technology to traditional transport services in Malawi.',
    },
    {
      icon: UserGroupIcon,
      title: 'Customer First',
      description: 'Your satisfaction and convenience drive everything we do.',
    },
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Founded in Lilongwe',
      description: 'Started with a vision to revolutionize transport in Malawi',
    },
    {
      year: '2024',
      title: 'Fleet of 12 Vehicles',
      description: 'Launched with verified drivers and well-maintained vehicles',
    },
    {
      year: '2024',
      title: 'Technology Platform',
      description: 'Developed comprehensive admin and driver management system',
    },
    {
      year: '2025',
      title: 'Mobile App Launch',
      description: 'Planned Android and iOS apps for seamless booking',
    },
    {
      year: '2025',
      title: 'Expansion to Blantyre',
      description: 'Growing our services to serve more Malawians',
    },
  ];

  const teamMembers = [
    {
      name: 'Management Team',
      role: 'Leadership',
      description: 'Experienced professionals committed to excellence in transport services.',
    },
    {
      name: 'Driver Partners',
      role: 'Service Delivery',
      description: 'Carefully selected and trained drivers who prioritize your safety and comfort.',
    },
    {
      name: 'Customer Support',
      role: 'Support',
      description: 'Dedicated team available 24/7 to assist with your transportation needs.',
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
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                Since 2024
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                About
                <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  Ipemelere
                </span>
              </h1>
              <p className="mt-8 text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto">
                We are passionate about transforming transportation in Malawi through 
                <span className="font-semibold text-yellow-300"> safe technology</span>, 
                <span className="font-semibold text-lime-300"> reliable service</span>, and 
                <span className="font-semibold text-green-300"> community focus</span>.
              </p>
              
              {/* Visual Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-400 to-lime-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">2024</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Founded</div>
                </div>
                <div className="group">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">Local</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Malawian</div>
                </div>
                <div className="group">
                  <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">24/7</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Service</div>
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

        {/* Mission & Vision */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-yellow-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                🎯 Our Purpose
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Mission & 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Vision</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="group">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-green-600 transition-colors duration-300">
                      Our Mission
                    </h3>
                    <p className="text-lg text-slate-600 leading-7 mb-6">
                      To provide safe, reliable, and affordable transportation services that connect 
                      communities across Malawi while supporting local economic growth and employment.
                    </p>
                    <p className="text-lg text-slate-600 leading-7">
                      We believe that everyone deserves access to quality transportation, and we&apos;re 
                      committed to making that a reality through innovative technology and 
                      community-focused service.
                    </p>
                    <div className="mt-8 w-16 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100/50 to-green-100/50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                      <MapPinIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-6 group-hover:text-yellow-600 transition-colors duration-300">
                      Vision 2030
                    </h3>
                    <p className="text-lg text-slate-600 leading-7">
                      To be the leading transport service provider across Malawi, 
                      connecting every major city and community with reliable, 
                      affordable transportation that empowers communities.
                    </p>
                    <div className="mt-8 w-16 h-1 bg-gradient-to-r from-yellow-500 to-green-600 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-green-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100 text-slate-700 text-sm font-semibold mb-6">
                📖 Our Beginning
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Our 
                <span className="bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent"> Story</span>
              </h2>
              <p className="text-xl text-slate-600">
                Born in Malawi, built for Malawians
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-7">
                  Ipemelere was founded in 2024 with a simple but powerful vision: to make 
                  transportation in Malawi safer, more reliable, and more accessible for everyone.
                </p>
                <p className="text-lg text-muted-foreground leading-7">
                  Starting in Lilongwe, we recognized the challenges faced by residents in 
                  finding dependable transportation. Traditional taxi services often lacked 
                  transparency in pricing, reliability in timing, and consistency in service quality.
                </p>
                <p className="text-lg text-muted-foreground leading-7">
                  We set out to change that by combining local knowledge with modern technology, 
                  creating a platform that puts safety, affordability, and customer satisfaction 
                  at the forefront of everything we do.
                </p>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <TruckIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">12+</div>
                    <div className="text-sm text-muted-foreground">Vehicles</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <UsersIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-sm text-muted-foreground">Service</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <MapPinIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">Lilongwe</div>
                    <div className="text-sm text-muted-foreground">Coverage</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <CheckIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-yellow-50/30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                ⚡ Core Values
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Our 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Principles</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                The values that guide everything we do and drive our commitment to excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 text-center h-full relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 leading-6">
                        {value.description}
                      </p>
                      <div className="mt-6 w-12 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-24 sm:py-32 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-green-50/50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-green-100 text-slate-700 text-sm font-semibold mb-6">
                🚀 Our Progress
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Our 
                <span className="bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent"> Journey</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Key milestones in building Malawi&apos;s premier transport service
              </p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="group">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8 bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-600 text-white rounded-full flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform duration-300">
                      {milestone.year}
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                        {milestone.title}
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 md:rotate-90 md:w-1 md:h-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-yellow-50/30"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
                👥 Our People
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
                Our 
                <span className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> Team</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Dedicated professionals committed to serving you better
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="group relative">
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                        <UsersIcon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-yellow-600 font-bold text-lg mb-6">
                        {member.role}
                      </p>
                      <p className="text-slate-600 leading-6">
                        {member.description}
                      </p>
                      <div className="mt-8 w-16 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
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
                Join Us Today
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8">
                Join the
                <span className="block bg-gradient-to-r from-yellow-400 via-lime-400 to-green-400 bg-clip-text text-transparent">
                  Ipemelere Family
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed max-w-4xl mx-auto mb-12">
                Whether you need a ride or want to drive with us, we&apos;re here to serve 
                the Malawian community together with 
                <span className="font-semibold text-yellow-300"> excellence</span> and 
                <span className="font-semibold text-lime-300"> integrity</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-lime-500 hover:from-yellow-600 hover:to-lime-600 text-black border-none shadow-2xl shadow-yellow-500/25 transform hover:scale-105 transition-all duration-200 font-bold" asChild>
                <Link href="/contact">
                  Book Your Ride
                  <div className="ml-2 text-lg">→</div>
                </Link>
              </Button>
              <Button size="lg" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white hover:text-slate-900 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 bg-white/10" asChild>
                <Link href="/contact">
                  Partner With Us
                  <UsersIcon className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 to-lime-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">12+</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Vehicles</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">100%</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Verified</div>
              </div>
              <div className="group">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-200">24/7</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-medium">Available</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <PublicFooter />
    </div>
  );
}