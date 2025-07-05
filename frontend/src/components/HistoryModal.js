import React from 'react';
import { Modal } from './Modal';

/**
 * HistoryModal component for displaying generated image history
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Array} props.imageHistory - Array of generated images
 * @returns {JSX.Element} HistoryModal component
 */
export const HistoryModal = ({
  isOpen,
  onClose,
  imageHistory,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Image History"
      maxWidth="max-w-4xl"
      maxHeight="max-h-[80vh]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {imageHistory.map((item) => (
          <div key={item.id} className="bg-white/80 rounded-xl p-4 border border-amber-200 hover:shadow-lg transition-shadow">
            <img 
              src={item.image} 
              alt={item.prompt} 
              className="w-full h-32 object-cover rounded-lg mb-3" 
            />
            <p className="text-sm text-stone-700 mb-2 truncate">{item.prompt}</p>
            <p className="text-xs text-stone-500">{item.created}</p>
            {item.model_name && (
              <p className="text-xs text-amber-600 mt-1">
                {item.selected_style} • {item.model_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}; 