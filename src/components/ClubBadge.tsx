import React from 'react';
import { Team } from '../types/game';

interface ClubBadgeProps {
  team: Pick<Team, 'name' | 'shortName' | 'primaryColor' | 'secondaryColor' | 'accentColor' | 'badgeInitials' | 'badgeStyle'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ClubBadge: React.FC<ClubBadgeProps> = ({ team, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-base',
  };

  const pColor = team.primaryColor || '#00583a';
  const sColor = team.secondaryColor || '#ffffff';
  const aColor = team.accentColor || '#ffd700';

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none font-display font-bold shadow-md rounded-b-xl overflow-hidden transition-transform hover:scale-105 ${sizeMap[size]} ${className}`}
      style={{
        backgroundColor: pColor,
        border: `2px solid ${sColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : sColor}`,
      }}
      title={team.name}
    >
      {/* Background patterns based on badgeStyle */}
      {team.badgeStyle === 'stripes' && (
        <div className="absolute inset-0 flex opacity-30 pointer-events-none">
          <div className="w-1/3 h-full" style={{ backgroundColor: sColor }} />
          <div className="w-1/3 h-full" style={{ backgroundColor: pColor }} />
          <div className="w-1/3 h-full" style={{ backgroundColor: sColor }} />
        </div>
      )}

      {team.badgeStyle === 'cross' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
          <div className="w-full h-1/4" style={{ backgroundColor: aColor }} />
          <div className="absolute h-full w-1/4" style={{ backgroundColor: aColor }} />
        </div>
      )}

      {team.badgeStyle === 'diagonal' && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none transform -rotate-45 scale-150"
          style={{
            background: `linear-gradient(to right, ${pColor} 30%, ${sColor} 30%, ${sColor} 70%, ${pColor} 70%)`,
          }}
        />
      )}

      {/* Subtle glossy shield sheen */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

      {/* Monogram or initials */}
      <span
        className="relative z-10 font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        style={{
          color: sColor === pColor ? aColor : sColor,
        }}
      >
        {team.badgeInitials || team.shortName.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
};
