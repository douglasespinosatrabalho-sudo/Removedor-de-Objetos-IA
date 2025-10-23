
import React from 'react';

interface LoadingSpinnerProps {
  progress: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
          />
          <circle
            className="text-red-600 transition-all duration-300 ease-linear"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="60"
            cy="60"
            transform="rotate(-90 60 60)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-red-600">
          {Math.round(progress)}%
        </span>
      </div>
      <p className="text-lg font-medium text-gray-700 animate-pulse">Processando imagem...</p>
    </div>
  );
};
