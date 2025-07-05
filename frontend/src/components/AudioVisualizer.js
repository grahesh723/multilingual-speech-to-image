import React from 'react';

/**
 * AudioVisualizer component for displaying audio recording visualization
 * @param {Object} props - Component props
 * @param {number[]} props.data - Audio visualization data
 * @param {boolean} props.isActive - Whether audio is currently active
 * @returns {JSX.Element} AudioVisualizer component
 */
export const AudioVisualizer = ({ data, isActive }) => {
  return (
    <div className="flex items-end justify-center gap-[2px] h-16 px-4">
      {data.map((height, index) => (
        <div
          key={index}
          className={`w-1 rounded-full transition-all duration-75 ${
            isActive 
              ? 'bg-gradient-to-t from-amber-600 via-yellow-500 to-amber-400' 
              : 'bg-gradient-to-t from-stone-200 to-stone-300'
          }`}
          style={{ 
            height: `${Math.max(isActive ? height : 2, 2)}px`,
            transform: isActive ? 'scaleY(1)' : 'scaleY(0.3)',
            transformOrigin: 'bottom',
            filter: isActive ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.4))' : 'none'
          }}
        />
      ))}
    </div>
  );
}; 