import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { TeamMember as TeamMemberType } from '@/types/team';

interface TeamMemberProps {
  member: TeamMemberType;
  className?: string;
}

export function TeamMember({ member, className = '' }: TeamMemberProps) {
  return (
    <div className={`group relative ${className}`}>
      <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-slate-100 text-center relative overflow-hidden h-full">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-yellow-100/50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Team Member Image - Circular */}
          <div className="mx-auto w-32 h-32 mb-6 relative group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gradient-to-br from-green-500 to-yellow-600 shadow-lg">
              <Image
                src={member.image}
                alt={member.name}
                width={128}
                height={128}
                className="w-full h-full object-cover object-top"
                style={{ objectPosition: '50% 20%' }}
                priority
              />
            </div>
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-yellow-600 p-1 group-hover:shadow-2xl group-hover:shadow-green-500/25 transition-all duration-300">
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover rounded-full"
                  style={{ objectPosition: '50% 20%' }}
                  priority
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
            {member.name}
          </h3>

          {/* Role */}
          <p className="text-yellow-600 font-bold text-lg mb-6">
            {member.role}
          </p>

          {/* Description */}
          <p className="text-slate-600 leading-6 mb-8">
            {member.description}
          </p>

          {/* Social Links */}
          {member.socialLinks && (
            <div className="flex justify-center space-x-4 mb-6">
              {member.socialLinks.email && (
                <Link
                  href={`mailto:${member.socialLinks.email}`}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-600 rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label={`Email ${member.name}`}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                </Link>
              )}
              {member.socialLinks.phone && (
                <Link
                  href={`tel:${member.socialLinks.phone}`}
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-600 rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label={`Call ${member.name}`}
                >
                  <PhoneIcon className="w-5 h-5" />
                </Link>
              )}
              {member.socialLinks.linkedin && (
                <Link
                  href={member.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-600 rounded-full flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                  aria-label={`${member.name}'s LinkedIn Profile`}
                >
                  <LinkIcon className="w-5 h-5" />
                </Link>
              )}
            </div>
          )}

          {/* Animated line */}
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-yellow-600 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>
    </div>
  );
}