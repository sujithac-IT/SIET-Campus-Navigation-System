'use client';

import React from 'react';
import { User } from '@/types';

interface FootprintLayerProps {
  users: User[];
  currentUserId?: string;
  zoomLevel?: number;
}

export const FootprintLayer: React.FC<FootprintLayerProps> = ({ users, currentUserId }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <defs>
        <filter id="glow-footprint" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {users.map((user) => {
        if (!user.liveLocationSharing || !user.currentCoordinates) return null;

        const isSelf = user.id === currentUserId;
        const { x, y } = user.currentCoordinates;

        // Generate 3 subtle footprint step trail offsets behind current position
        const step1 = { x: Math.max(2, x - 1.2), y: Math.max(2, y + 1.2), angle: -15, delay: '0s' };
        const step2 = { x: Math.max(2, x - 2.5), y: Math.max(2, y + 2.5), angle: 15, delay: '0.4s' };
        const step3 = { x: Math.max(2, x - 3.8), y: Math.max(2, y + 3.8), angle: -10, delay: '0.8s' };

        const steps = [step1, step2, step3];

        return (
          <g key={`footprints-${user.id}`} className="transition-all duration-700 ease-out">
            {steps.map((step, idx) => (
              <g
                key={`step-${user.id}-${idx}`}
                style={{
                  transform: `translate(${step.x}%, ${step.y}%) rotate(${step.angle}deg)`,
                  transformOrigin: 'center',
                  animationDelay: step.delay
                }}
                className="animate-footstep opacity-75"
              >
                <text
                  x="0"
                  y="0"
                  fontSize={isSelf ? '14' : '11'}
                  fill={isSelf ? '#0284c7' : user.role === 'faculty' ? '#8b5cf6' : '#10b981'}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ filter: 'url(#glow-footprint)' }}
                >
                  👣
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};
