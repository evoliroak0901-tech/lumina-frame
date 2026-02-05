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

  // Image history for back/forward navigation
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Refs for timers and wake lock
  const slideshowTimerRef = useRef<number | null>(null);
  const controlsTimerRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isGeneratingRef = useRef<boolean>(false);

  // Double-tap detection
  const lastTapTimeRef = useRef<number>(0);
  const lastTapSideRef = useRef<'left' | 'right' | null>(null);
  const singleTapTimerRef = useRef<number | null>(null);

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
        setCurrentImage((prevImage) => {
          if (prevImage) {
            // Update history: truncate any forward history if we were in the middle
            setImageHistory(prev => {
              const newHistory = prev.slice(0, historyIndex + 1);
              return [...newHistory, prevImage];
            });
            setHistoryIndex(prev => prev + 1);
          }
          return imageUrl;
        });
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

  }, [config.genre, historyIndex]);

  const loadPreviousImage = useCallback(() => {
    if (historyIndex >= 0 && imageHistory.length > 0) {
      const prevImage = imageHistory[historyIndex];

      // Save current image to history for forward navigation (technically simply not removing it allows "forward" if we implemented it, 
      // but here we just want to go back. For full browser-like history, we'd need more complex index management).
      // For this simple "Back" feature:

      setCurrentImage((current) => {
        // Push current back to potential "next" slot if we wanted a redo, 
        // but simple "back" just swaps. 
        // Actually, standard history: current becomes "next", history[index] becomes current.
        return prevImage;
      });

      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex, imageHistory]);

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
  const handleInteraction = (e: React.MouseEvent) => {
    e.persist();
    const clientX = e.clientX;
    const width = window.innerWidth;
    let side: 'left' | 'right' | 'center' = 'center';

    if (clientX < width * 0.35) side = 'left';
    else if (clientX > width * 0.65) side = 'right';

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTimeRef.current;

    // Check if this is a Double Tap
    if (tapLength < 300 && tapLength > 0 && lastTapSideRef.current === side && side !== 'center') {
      // Double Tap Detected!
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }

      // Execute Action
      if (side === 'right') {
        loadNewImage();
      } else if (side === 'left') {
        loadPreviousImage();
      }

      // Reset
      lastTapTimeRef.current = 0;
      lastTapSideRef.current = null;
    } else {
      // Potential Single Tap
      lastTapTimeRef.current = currentTime;
      lastTapSideRef.current = side;

      // Clear any existing timer just in case
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);

      // Set timer for Single Tap Action
      singleTapTimerRef.current = window.setTimeout(() => {
        // Single Tap Action: Toggle/Close Menu
        if (showControls) {
          setShowControls(false);
        } else {
          setShowControls(true);

          // Auto hide logic for new controls display
          if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
          controlsTimerRef.current = window.setTimeout(() => {
            setShowControls(false);
          }, 4000);
        }
        singleTapTimerRef.current = null;
      }, 300);
    }
  };

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    // Don't auto-hide when interacting with controls
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);

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