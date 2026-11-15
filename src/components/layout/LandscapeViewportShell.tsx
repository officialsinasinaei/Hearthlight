import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface ViewportStageContextType {
  stageWidth: number;
  stageHeight: number;
  isPortrait: boolean;
  isRotatedPortrait: boolean;
  autoLandscapeEnabled: boolean;
  toggleAutoLandscape: () => void;
}

const ViewportStageContext = createContext<ViewportStageContextType>({
  stageWidth: 1024,
  stageHeight: 768,
  isPortrait: false,
  isRotatedPortrait: false,
  autoLandscapeEnabled: true,
  toggleAutoLandscape: () => {},
});

export function useViewportStage() {
  return useContext(ViewportStageContext);
}

interface LandscapeViewportShellProps {
  children: React.ReactNode;
}

export function LandscapeViewportShell({ children }: LandscapeViewportShellProps) {
  const [autoLandscapeEnabled, setAutoLandscapeEnabled] = useState(true);
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  const updateDimensions = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateDimensions, { passive: true });
    window.addEventListener('orientationchange', updateDimensions, { passive: true });

    // Attempt native orientation lock where supported (e.g. Android Chrome / PWA)
    const tryNativeOrientationLock = () => {
      try {
        const orientation = screen?.orientation;
        if (orientation && typeof orientation.lock === 'function') {
          orientation.lock('landscape').catch(() => {
            // Ignored on iOS Safari or browsers without lock permission
          });
        }
      } catch {
        // Safe no-op
      }
    };

    tryNativeOrientationLock();
    window.addEventListener('click', tryNativeOrientationLock, { once: true, passive: true });
    window.addEventListener('touchstart', tryNativeOrientationLock, { once: true, passive: true });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      window.removeEventListener('click', tryNativeOrientationLock);
      window.removeEventListener('touchstart', tryNativeOrientationLock);
    };
  }, [updateDimensions]);

  // Mobile portrait is when height > width on screens under 1024px
  const isPortrait = dimensions.height > dimensions.width && dimensions.width < 1024;
  const isRotatedPortrait = isPortrait && autoLandscapeEnabled;

  const stageWidth = isRotatedPortrait ? dimensions.height : dimensions.width;
  const stageHeight = isRotatedPortrait ? dimensions.width : dimensions.height;

  const toggleAutoLandscape = useCallback(() => {
    setAutoLandscapeEnabled((prev) => !prev);
  }, []);

  return (
    <ViewportStageContext.Provider
      value={{
        stageWidth,
        stageHeight,
        isPortrait,
        isRotatedPortrait,
        autoLandscapeEnabled,
        toggleAutoLandscape,
      }}
    >
      <div
        className={
          isRotatedPortrait
            ? 'landscape-forced-portrait'
            : 'relative w-full h-full overflow-hidden'
        }
        style={{
          width: isRotatedPortrait ? `${stageWidth}px` : '100dvw',
          height: isRotatedPortrait ? `${stageHeight}px` : '100dvh',
        }}
      >
        {children}

        {/* Subtle, dismissible pill for portrait users: docked at top-center of stage bezel */}
        {isPortrait && (
          <div className="fixed top-1 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto">
            <button
              type="button"
              onClick={toggleAutoLandscape}
              className="px-2 py-0.5 rounded-full bg-gradient-to-b from-[#2a170c]/90 to-[#120803]/90 border border-[#b8863b]/70 shadow-[0_2px_8px_rgba(0,0,0,0.85)] text-[9px] font-black uppercase tracking-wider text-[#fae6a2] hover:brightness-125 opacity-75 hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer backdrop-blur-xs"
              title="Toggle automatic 90-degree landscape stage rotation"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" />
              <span>{autoLandscapeEnabled ? 'Auto-Landscape' : 'Fit Screen'}</span>
            </button>
          </div>
        )}
      </div>
    </ViewportStageContext.Provider>
  );
}
