import React, { useState, useEffect, useRef } from "react";
import { Music, VolumeX } from "lucide-react";
import "./GlobalMusicToggle.css";

const GlobalMusicToggle: React.FC = () => {
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Global function to stop all audio instances (in case of duplicates)
  const stopAllAudio = () => {
    // Stop all audio elements on the page
    const allAudio = document.querySelectorAll('audio');
    allAudio.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    console.log('Stopped all audio instances on page');
  };

  // Initialize audio elements
  useEffect(() => {
    if (!audioInitialized) {
      try {
        // Clean up any existing audio instances first
        stopAllAudio();
        
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current = null;
        }
        
        backgroundMusicRef.current = new Audio('/audio/music.mp3');
        
        // Configure background music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.loop = true;
          backgroundMusicRef.current.volume = 0.3;
          backgroundMusicRef.current.preload = 'auto';
          
          // Add event listeners for debugging
          backgroundMusicRef.current.addEventListener('canplay', () => {
            console.log('Background music can play');
          });
          backgroundMusicRef.current.addEventListener('error', (e) => {
            console.error('Background music error:', e);
          });
        }
        
        console.log('Audio elements initialized');
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        setAudioInitialized(true); // Still set to true to prevent retrying
      }
    }
    
    // Cleanup function
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Audio control functions
  const playBackgroundMusic = async () => {
    if (backgroundMusicRef.current && musicEnabled) {
      try {
        // Check if audio is already playing to prevent overlapping
        if (!backgroundMusicRef.current.paused) {
          console.log('Background music already playing');
          return;
        }
        
        console.log('Attempting to play background music...');
        
        // Make sure we're starting from the beginning if the music ended
        if (backgroundMusicRef.current.ended) {
          backgroundMusicRef.current.currentTime = 0;
        }
        
        await backgroundMusicRef.current.play();
        console.log('Background music started successfully');
      } catch (error) {
        console.error('Failed to play background music:', error);
        
        // If it's an autoplay policy error, show a message to the user
        if (error instanceof Error && error.name === 'NotAllowedError') {
          console.log('Autoplay blocked - user interaction required');
        }
      }
    }
  };

  const stopBackgroundMusic = () => {
    // First stop all audio to prevent duplicates
    stopAllAudio();
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      console.log('Background music stopped');
    }
  };

  // Monitor music enabled state and play/stop music accordingly
  useEffect(() => {
    if (audioInitialized && backgroundMusicRef.current) {
      if (musicEnabled) {
        playBackgroundMusic();
      } else {
        stopBackgroundMusic();
      }
    }
  }, [musicEnabled, audioInitialized]);

  const handleAudioChoice = (enableMusic: boolean) => {
    setMusicEnabled(enableMusic);
    setShowAudioPopup(false);
    console.log('User chose music:', enableMusic);
  };

  const toggleBackgroundMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    console.log('Toggling background music to:', newState);
  };

  // Component for medieval audio popup
  const AudioPopup: React.FC = () => {
    return (
      <div className={`global-audio-popup ${showAudioPopup ? 'show' : ''}`}>
        <div className="global-audio-popup-content">
          <div className="global-audio-popup-header">
            <h2 className="global-audio-title">🎵 Hark, Noble Adventurer! 🎵</h2>
            <div className="global-audio-subtitle">
              Dost thou desire the mystical melodies to accompany thy mathematical quest?
            </div>
          </div>
          
          <div className="global-audio-question">
            <p className="global-medieval-text">
              The ancient bards await thy command...<br/>
              Shall their enchanting music guide thee through this realm of numbers?
            </p>
          </div>
          
          <div className="global-audio-buttons">
            <button 
              className="global-audio-btn global-yes-btn"
              onClick={() => handleAudioChoice(true)}
            >
              <span className="global-btn-icon">🎼</span>
              <span className="global-btn-text">Aye, Play Music!</span>
              <span className="global-btn-subtext">Let the bards sing</span>
            </button>
            
            <button 
              className="global-audio-btn global-no-btn"
              onClick={() => handleAudioChoice(false)}
            >
              <span className="global-btn-icon">🔇</span>
              <span className="global-btn-text">Nay, Silence Please</span>
              <span className="global-btn-subtext">Quest in quiet</span>
            </button>
          </div>
          
          <div className="global-audio-note">
            <span className="global-note-icon">ℹ️</span>
            <span className="global-note-text">Thou canst change this choice anytime using the music control</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Global Music Toggle Button */}
      <button 
        className={`global-music-toggle ${musicEnabled ? 'enabled' : 'disabled'}`}
        onClick={toggleBackgroundMusic}
        title={musicEnabled ? 'Disable Music' : 'Enable Music'}
      >
        {musicEnabled ? (
          <Music size={24} />
        ) : (
          <VolumeX size={24} />
        )}
      </button>

      {/* Audio Popup */}
      <AudioPopup />
    </>
  );
};

export default GlobalMusicToggle;
