import { useEffect, useRef } from 'react';

interface AudioConfig {
  volume?: number;
  preload?: 'auto' | 'metadata' | 'none';
}

export const useAudio = (src: string, config: AudioConfig = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      audioRef.current = new Audio(src);

      if (audioRef.current) {
        audioRef.current.volume = config.volume ?? 1;
        audioRef.current.preload = config.preload ?? 'auto';
      }
    } catch (error) {
      console.error(`Failed to initialize audio for ${src}:`, error);
    }
  }, [src, config.volume, config.preload]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  return { play };
};
