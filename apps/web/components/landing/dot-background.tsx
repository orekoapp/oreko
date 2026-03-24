'use client';

import dynamic from 'next/dynamic';

const DotGrid = dynamic(() => import('@/components/DotGrid'), { ssr: false });

export function DotBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-auto">
      <DotGrid
        dotSize={2}
        gap={26}
        baseColor="#d1d5db"
        activeColor="#3B82F6"
        proximity={120}
        speedTrigger={100}
        shockRadius={250}
        shockStrength={5}
        maxSpeed={5000}
        resistance={750}
        returnDuration={1.5}
      />
    </div>
  );
}
