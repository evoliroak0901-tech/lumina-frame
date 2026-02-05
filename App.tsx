import React, { useState, useEffect, useCallback, useRef } from 'react';
import ArtFrame from './components/ArtFrame';
import Controls from './components/Controls';
import { AppConfig, FrameStyle, Genre, FilterPreset } from './types';
import { generateArtImage } from './services/geminiService';

const INITIAL_CONFIG: AppConfig = {
  genre: Genre.Nature,
  interval: 30,
  isSlideshow: false, // Default to single image mode
  frameStyle: FrameStyle.None,
  filterPreset: FilterPreset.Original,
  frameWidth: 20 // Default frame width in pixels
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Refs for timers and wake lock
  const slideshowTimerRef = useRef<number | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  // --- WAKE LOCK (Keep Screen On) ---
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Wake lock might be blocked by policy or battery saver
      }
    };

    requestWakeLock();

    // Re-acquire on visibility change (e.g. switching tabs/apps)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLockRef.current?.release();
    };
  }, []);

  // --- IMAGE LOADING LOGIC ---
  const loadNewImage = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setLoading(true);

    // Call the service which now strictly uses Stock photos (No API)
    const imageUrl = await generateArtImage(config.genre);

    if (imageUrl) {
      // Preload image object to ensure smooth transition
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setCurrentImage(imageUrl);
        setLoading(false);
        isGeneratingRef.current = false;
      };
      img.onerror = () => {
        setLoading(false);
        isGeneratingRef.current = false;
      };
    } else {
      setLoading(false);
      isGeneratingRef.current = false;
    }

  }, [config.genre]);

  // --- SLIDESHOW TIMER & INITIAL LOAD ---
  useEffect(() => {
    // Trigger initial load if no image is present, regardless of slideshow setting
    if (!currentImage && !isGeneratingRef.current) {
      loadNewImage();
    }

    if (config.isSlideshow) {
      // Clear existing
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);

      // Set interval
      slideshowTimerRef.current = window.setInterval(() => {
        loadNewImage();
      }, config.interval * 1000);
    } else {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    }

    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [config.isSlideshow, config.interval, config.genre, loadNewImage, currentImage]);


  // --- USER INTERACTION ---
  const handleInteraction = () => {
    setShowControls(true);

    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);

    // Auto hide after 4 seconds of inactivity
    controlsTimerRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    handleInteraction(); // Keep controls alive while interacting

    // If genre changed, load immediately to give feedback
    if (newConfig.genre && newConfig.genre !== config.genre) {
      // Short timeout to allow state to settle
      setTimeout(() => loadNewImage(), 100);
    }
  };

  return (
    <div
      className="relative w-screen h-screen bg-black overflow-hidden cursor-none"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {/* Main View */}
      <ArtFrame
        imageUrl={currentImage}
        loading={loading}
        frameStyle={config.frameStyle}
        filterPreset={config.filterPreset}
        frameWidth={config.frameWidth}
      />

      {/* Control Layer */}
      <Controls
        visible={showControls}
        config={config}
        onUpdate={updateConfig}
        onInteraction={handleInteraction}
        onNext={loadNewImage}
        onClose={() => setShowControls(false)}
      />
    </div>
  );
};

export default App;