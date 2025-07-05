import React from 'react';
import { Modal } from './Modal';
import { StyleSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StyleSettings;
  onSettingsChange: (settings: StyleSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const handleChange = (key: keyof StyleSettings, value: string) => {
    onSettingsChange({
      ...settings,
      [key]: value as any,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generation Settings">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Image Style</label>
          <select 
            value={settings.imageStyle} 
            onChange={(e) => handleChange('imageStyle', e.target.value)}
            className="w-full p-3 border border-amber-200 rounded-lg bg-white text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          >
            <option value="realistic">Realistic</option>
            <option value="anime">Anime</option>
            <option value="artistic">Artistic</option>
            <option value="abstract">Abstract</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Art Style</label>
          <select 
            value={settings.artStyle} 
            onChange={(e) => handleChange('artStyle', e.target.value)}
            className="w-full p-3 border border-amber-200 rounded-lg bg-white text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          >
            <option value="classical">Classical</option>
            <option value="renaissance">Renaissance</option>
            <option value="baroque">Baroque</option>
            <option value="impressionist">Impressionist</option>
            <option value="modern">Modern</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Quality</label>
          <select 
            value={settings.quality}
            onChange={(e) => handleChange('quality', e.target.value)}
            className="w-full p-3 border border-amber-200 rounded-lg bg-white text-stone-800 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD (Pro)</option>
            <option value="4k">4K (Enterprise)</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-3 mt-8">
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </div>
    </Modal>
  );
}; 