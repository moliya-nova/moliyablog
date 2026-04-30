import { useState, useEffect } from 'react';
import { siteSettingsApi } from '../services/api';
import { useImageUrl } from '../hooks/useImageUrl';

interface BackgroundProps {
  blur?: number;
  overlayOpacity?: number;
}

export function Background({ blur: propBlur, overlayOpacity: propOverlayOpacity }: BackgroundProps) {
  const [backgroundSettings, setBackgroundSettings] = useState({
    imageUrl: '',
    blur: 0,
    overlayOpacity: 0.3
  });

  const { url: backgroundImageUrl, loading } = useImageUrl(backgroundSettings.imageUrl || null);

  useEffect(() => {
    const loadBackgroundSettings = async () => {
      try {
        const response = await siteSettingsApi.getBackgroundSettings();
        if (response) {
          const settings = JSON.parse(response);
          if (settings && settings.imageUrl) {
            setBackgroundSettings(settings);
          }
        }
      } catch (e) {
        // Silently fail - background settings are optional
      }
    };

    loadBackgroundSettings();

    window.addEventListener('background-updated', loadBackgroundSettings);
    return () => window.removeEventListener('background-updated', loadBackgroundSettings);
  }, []);

  const blur = propBlur !== undefined ? propBlur : backgroundSettings.blur;
  const overlayOpacity = propOverlayOpacity !== undefined ? propOverlayOpacity : backgroundSettings.overlayOpacity;

  const showBackground = backgroundImageUrl && !loading;

  return (
    <>
      {showBackground ? (
        <>
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center bg-local"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              filter: `blur(${blur}px)`,
              transform: "scale(1.05)",
            }}
          />
          <div
            className="absolute inset-0 -z-10 bg-black/60"
            style={{ opacity: overlayOpacity }}
          />
        </>
      ) : (
        <div
          className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
        />
      )}
    </>
  );
}