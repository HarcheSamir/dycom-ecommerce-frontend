// src/components/ProgressCircle.tsx

import type { FC } from 'react';

interface ProgressCircleProps {
  progress: number; 
  size?: number; 
}

const ProgressCircle: FC<ProgressCircleProps> = ({ progress, size = 60 }) => {
  const strokeWidth = 6;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* The SVG container */}
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* The grey background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#374151" 
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* The orange progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f97316"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-in-out"
        />
      </svg>
      {/* The percentage text in the middle */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

export default ProgressCircle;