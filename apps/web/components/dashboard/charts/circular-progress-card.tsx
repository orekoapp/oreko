'use client';

import { Card, CardContent } from '@/components/ui/card';

interface CircularProgressCardProps {
  label: string;
  percentage: number;
  color?: string;
  size?: number;
  className?: string;
}

export function CircularProgressCard({
  label,
  percentage,
  color = 'hsl(var(--primary))',
  size = 120,
  className,
}: CircularProgressCardProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
