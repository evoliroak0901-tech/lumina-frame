import React, { useMemo } from 'react';
import { FrameStyle, FilterPreset } from '../types';

interface ArtFrameProps {
  imageUrl: string | null;
  loading: boolean;
  frameStyle: FrameStyle;
  filterPreset: FilterPreset;
  frameWidth: number;
  brightness: number;
}

const ArtFrame: React.FC<ArtFrameProps> = ({ imageUrl, loading, frameStyle, filterPreset, frameWidth, brightness }) => {

  // Calculate Frame CSS with dynamic frame width
  const frameClasses = useMemo(() => {
    const base = "relative transition-all duration-700 ease-in-out w-full h-full flex items-center justify-center overflow-hidden";
    const borderWidth = `border-[${frameWidth}px]`;

    switch (frameStyle) {
      case FrameStyle.ModernBlack:
        return `${base} bg-gray-900 ${borderWidth} border-black shadow-2xl`;
      case FrameStyle.GalleryWhite:
        return `${base} bg-gray-100 ${borderWidth} border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]`;
      case FrameStyle.Wood:
        // Simulating wood with color for simplicity
        return `${base} bg-[#2c1b10] ${borderWidth} border-[#5c4033] outline outline-2 outline-[#3e2b22] shadow-2xl`;
      case FrameStyle.None:
      default:
        return `${base} bg-black`;
    }
  }, [frameStyle, frameWidth]);

  // Calculate Image Filters based on Preset
  const filterStyle = useMemo(() => {
    let filterString = '';

    switch (filterPreset) {
      case FilterPreset.Noir:
        filterString = 'grayscale(100%) contrast(120%) brightness(90%)';
        break;
      case FilterPreset.Vivid:
        filterString = 'saturate(150%) contrast(110%)';
        break;
      case FilterPreset.Warm:
        filterString = 'sepia(30%) saturate(120%) brightness(105%)';
        break;
      case FilterPreset.Cool:
        filterString = 'hue-rotate(180deg) sepia(20%) saturate(80%)'; // Simple cool effect
        break;
      case FilterPreset.Cinematic:
        filterString = 'contrast(120%) saturate(80%) brightness(95%)';
        break;
      case FilterPreset.Fade:
        filterString = 'opacity(80%) contrast(90%) brightness(110%)';
        break;
      case FilterPreset.Original:
      default:
        filterString = 'none';
        break;
    }

    return {
      filter: filterString,
      transition: 'filter 0.8s ease-out',
    };
  }, [filterPreset]);

  // Inner matte styling for Gallery look
  const matteStyle = frameStyle !== FrameStyle.None ? "p-[2vmin] md:p-[4vmin] bg-transparent" : "";

  // Combine preset filters with global brightness
  // Note: brightness filter on parent might affect everything, usually desired for "screen brightness" simulation

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ filter: `brightness(${brightness})` }}
    >
      <div className={frameClasses}>
        <div className={`w-full h-full relative flex items-center justify-center ${matteStyle}`}>
          {/* Image Container - fullscreen landscape display */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Art"
                className={`w-full h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-50 blur-sm scale-105' : 'opacity-100 scale-100'}`}
                style={filterStyle}
              />
            )}

            {/* Loading Indicator */}
            {loading && !imageUrl && (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 animate-pulse">
                <span className="text-sm tracking-widest font-light">CURATING...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtFrame;