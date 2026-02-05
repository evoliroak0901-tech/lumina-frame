import React, { useState } from 'react';
import { AppConfig, FrameStyle, Genre, FilterPreset } from '../types';
import { 
  Palette, 
  Layout, 
  Play, 
  Pause, 
  Sun,
  ImageIcon
} from './Icon';

interface ControlsProps {
  visible: boolean;
  config: AppConfig;
  onUpdate: (newConfig: Partial<AppConfig>) => void;
  onInteraction: () => void;
  onNext: () => void;
}

const Controls: React.FC<ControlsProps> = ({ visible, config, onUpdate, onInteraction, onNext }) => {
  const [activeTab, setActiveTab] = useState<'genre' | 'style' | 'filter'>('genre');

  // Prevent clicks from propagating to the dismiss handler
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteraction();
  };

  if (!visible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-in-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      onClick={handleContainerClick}
    >
      {/* Blur Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />

      {/* Content */}
      <div className="relative safe-area-padding pb-8 pt-4 px-6 md:px-12 text-white/90 max-w-4xl mx-auto">
        
        {/* Top Bar: Play/Pause, Next & Tab Selectors */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-6">
             <button 
              onClick={() => setActiveTab('genre')}
              className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'genre' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Layout size={20} />
              <span className="text-[10px] uppercase tracking-wider">Genre</span>
            </button>
            <button 
              onClick={() => setActiveTab('style')}
              className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'style' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Palette size={20} />
              <span className="text-[10px] uppercase tracking-wider">Style</span>
            </button>
            <button 
              onClick={() => setActiveTab('filter')}
              className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'filter' ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Sun size={20} />
              <span className="text-[10px] uppercase tracking-wider">Filter</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
             {/* Manual Next Button (useful when slideshow is off) */}
             <button 
              onClick={onNext}
              className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition active:scale-95"
            >
              <ImageIcon size={16} />
              <span className="text-xs font-medium">NEXT</span>
            </button>

            <button 
              onClick={() => onUpdate({ isSlideshow: !config.isSlideshow })}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition active:scale-95 ${config.isSlideshow ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {config.isSlideshow ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="min-h-[140px]">
          
          {/* GENRE TAB */}
          {activeTab === 'genre' && (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
              {Object.values(Genre).map((g) => (
                <button
                  key={g}
                  onClick={() => onUpdate({ genre: g })}
                  className={`p-3 rounded-lg text-xs font-medium border transition-all ${config.genre === g ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* STYLE TAB (Frame & Interval) */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Frame Selector */}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">Frame Style</label>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.values(FrameStyle).map((style) => (
                    <button
                      key={style}
                      onClick={() => onUpdate({ frameStyle: style })}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-xs border whitespace-nowrap ${config.frameStyle === style ? 'border-white bg-white text-black' : 'border-white/20 hover:border-white/50'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interval Slider - Only show if slideshow is enabled */}
              {config.isSlideshow && (
                <div className="animate-fade-in">
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-3 block flex items-center justify-between">
                    <span>Change Every</span>
                    <span className="text-white">{config.interval}s</span>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="60" 
                    step="5"
                    value={config.interval}
                    onChange={(e) => onUpdate({ interval: parseInt(e.target.value) })}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* FILTER TAB - PRESETS */}
          {activeTab === 'filter' && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-3 block">Filter Presets</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {Object.values(FilterPreset).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => onUpdate({ filterPreset: preset })}
                    className={`px-3 py-4 rounded-lg text-xs font-medium border transition-all flex flex-col items-center space-y-1 ${config.filterPreset === preset ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full border border-white/20 mb-1`} 
                         style={{ 
                            background: preset === FilterPreset.Original ? '#fff' : 
                                        preset === FilterPreset.Noir ? '#333' : 
                                        preset === FilterPreset.Vivid ? '#f0f' : 
                                        preset === FilterPreset.Warm ? '#fb3' : 
                                        preset === FilterPreset.Cool ? '#3bf' : '#888'
                         }} 
                    />
                    <span>{preset}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;