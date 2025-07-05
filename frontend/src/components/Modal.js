import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component for settings, history, and pricing modals
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.maxWidth - Maximum width class
 * @param {string} props.maxHeight - Maximum height class
 * @returns {JSX.Element|null} Modal component
 */
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md',
  maxHeight = 'max-h-[80vh]'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-gradient-to-b from-stone-50 to-amber-50 rounded-2xl p-8 ${maxWidth} w-full mx-4 shadow-2xl border border-amber-200 ${maxHeight} overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-stone-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-stone-600 hover:text-stone-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}; 