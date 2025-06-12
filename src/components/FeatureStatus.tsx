'use client';

import React from 'react';
import { FEATURE_FLAGS, FEATURE_DESCRIPTIONS, getFeatureFlag } from '@/config/features';

interface FeatureStatusProps {
  showOnlyDisabled?: boolean;
  className?: string;
}

const FeatureStatus: React.FC<FeatureStatusProps> = ({ 
  showOnlyDisabled = false, 
  className = '' 
}) => {
  const features = Object.keys(FEATURE_FLAGS) as (keyof typeof FEATURE_FLAGS)[];
  
  const filteredFeatures = showOnlyDisabled 
    ? features.filter(feature => !getFeatureFlag(feature))
    : features;

  if (filteredFeatures.length === 0) {
    return null;
  }

  return (
    <div className={`card-mobile border-accent/20 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-accent/20 rounded-hive flex items-center justify-center">
          <span className="text-accent text-sm">⚙️</span>
        </div>
        <h3 className="heading-md-mobile text-text">
          {showOnlyDisabled ? 'Disabled Features' : 'Feature Status'}
        </h3>
      </div>
      
      <div className="space-y-3">
        {filteredFeatures.map((feature) => {
          const isEnabled = getFeatureFlag(feature);
          const description = FEATURE_DESCRIPTIONS[feature];
          
          return (
            <div key={feature} className="bg-surface/50 rounded-hive p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isEnabled ? 'bg-accent2' : 'bg-border'
                  }`}></div>
                  <span className="text-sm font-medium text-text">
                    {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-hive ${
                  isEnabled 
                    ? 'bg-accent2/20 text-accent2' 
                    : 'bg-border text-subtle'
                }`}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-subtle">{description}</p>
            </div>
          );
        })}
      </div>
      
      {showOnlyDisabled && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-subtle text-center">
            These features are currently in development and will be enabled in future releases.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeatureStatus;
