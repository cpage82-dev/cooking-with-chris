/**
 * CharacterCounter Component
 * Displays character count with visual feedback
 */
import React from 'react';

const CharacterCounter = ({ current, max, className = '' }) => {
  const remaining = max - current;
  const percentage = (current / max) * 100;
  
  // Determine color based on usage
  const getColor = () => {
    if (percentage >= 100) return 'text-red-600 font-semibold';
    if (percentage >= 90) return 'text-orange-600 font-medium';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-gray-500';
  };

  return (
    <div className={`text-sm ${getColor()} ${className}`}>
      {current}/{max}
      {remaining < 0 && (
        <span className="ml-1 text-red-600 font-semibold">
          ({Math.abs(remaining)} over limit)
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;