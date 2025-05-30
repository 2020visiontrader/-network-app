'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Synchronizing neural network...', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-background gradient-mesh flex items-center justify-center px-4'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className={`${sizeClasses[size]} border-2 border-border rounded-full animate-spin`}>
            <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin"></div>
          </div>
          
          {/* Inner pulse */}
          <div className={`absolute inset-2 bg-accent/20 rounded-full pulse-hive`}></div>
        </div>
        
        {message && (
          <p className="text-sm text-subtle mt-4 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
