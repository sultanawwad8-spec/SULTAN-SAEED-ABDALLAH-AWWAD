import React, { useEffect, useRef, useState } from 'react';
import { audioBufferToWav } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
      // Reset state when new buffer arrives
      stop();
      setCurrentTime(0);
      pauseTimeRef.current = 0;
    }
  }, [audioBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const updateProgress = () => {
    if (!audioContextRef.current) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current + pauseTimeRef.current;
    
    if (elapsed >= duration) {
        setIsPlaying(false);
        setCurrentTime(duration);
        pauseTimeRef.current = 0; // Reset for replay
        return;
    }
    
    setCurrentTime(elapsed);
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const play = async () => {
    if (!audioBuffer) return;
    
    const ctx = initAudioContext();
    
    // Create source
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    // Calculate start position
    // If we finished playing, restart. If paused, resume.
    if (currentTime >= duration) {
        pauseTimeRef.current = 0;
    }

    source.start(0, pauseTimeRef.current);
    
    startTimeRef.current = ctx.currentTime;
    sourceRef.current = source;
    
    source.onended = () => {
       // Only handle natural end, stop() handles manual stop
    };

    setIsPlaying(true);
    updateProgress();
  };

  const pause = () => {
    if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
    }
    if (audioContextRef.current) {
        // Calculate where we paused
        pauseTimeRef.current += audioContextRef.current.currentTime - startTimeRef.current;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const stop = () => {
    if (sourceRef.current) {
        try {
            sourceRef.current.stop();
        } catch (e) { /* ignore if already stopped */ }
        sourceRef.current = null;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const wasPlaying = isPlaying;
    
    if (wasPlaying) pause();
    
    setCurrentTime(newTime);
    pauseTimeRef.current = newTime;
    
    if (wasPlaying) play();
  };

  const handleDownload = () => {
    if (!audioBuffer) return;
    const blob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exam_audio.wav';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioBuffer) return null;

  return (
    <div className="bg-indigo-900 text-white p-4 rounded-xl shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider text-indigo-200 uppercase">Audio Preview</span>
        <button 
          onClick={handleDownload}
          className="text-xs flex items-center gap-1 hover:text-indigo-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download WAV
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={isPlaying ? pause : play}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-indigo-900 hover:bg-indigo-50 transition-colors"
        >
          {isPlaying ? (
             <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
             <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-indigo-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
          <div className="flex justify-between text-xs text-indigo-300 mt-1 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
