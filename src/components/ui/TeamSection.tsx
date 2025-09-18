import React from 'react';
import { TeamMember } from './TeamMember';
import { TeamSection as TeamSectionType } from '@/types/team';

interface TeamSectionProps {
  section: TeamSectionType;
  className?: string;
}

export function TeamSection({ section, className = '' }: TeamSectionProps) {
  return (
    <section className={`py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-yellow-50/30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-yellow-100 text-slate-700 text-sm font-semibold mb-6">
            👥 Our People
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6">
            {section.title.split(' ').map((word, index) =>
              index === section.title.split(' ').length - 1 ? (
                <span key={index} className="bg-gradient-to-r from-green-600 to-yellow-600 bg-clip-text text-transparent"> {word}</span>
              ) : (
                <span key={index}>{word} </span>
              )
            )}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {section.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.members.map((member) => (
            <TeamMember key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}