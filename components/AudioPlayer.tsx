import React, { useEffect, useRef, useState } from 'react';
import { audioBufferToMp3, audioBufferToWav } from '../utils/audioUtils';
import { ExamConfig } from '../types';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  config: ExamConfig;
  script: string;
  onSave?: (data: { audioUrl: string; mp3Url?: string }) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, config, script, onSave }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

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
    onSave?.({ audioUrl: url });
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  const handleDownloadMp3 = async () => {
    if (!audioBuffer) return;
    setIsExporting(true);
    try {
      const blob = await audioBufferToMp3(audioBuffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = blob.type.includes('mpeg') ? 'exam_audio.mp3' : 'exam_audio.webm';
      a.click();
      onSave?.({ audioUrl: url, mp3Url: url });
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      console.error('Failed to export mp3', e);
      alert('Browser does not support MP3/WebM export. WAV download remains available.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveTranscript = () => {
    const blob = new Blob([
      `Topic: ${config.topic}\nType: ${config.type}\nLevel: ${config.level}\nScript:\n${script}`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listening_exam.txt';
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-medium tracking-wider text-indigo-200 uppercase">Audio Preview</span>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-indigo-900 hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            WAV
          </button>
          <button
            onClick={handleDownloadMp3}
            disabled={isExporting}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-50 ${isExporting ? 'opacity-60 cursor-wait' : 'hover:bg-indigo-800'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-2v13"></path></svg>
            {isExporting ? 'Encoding…' : 'MP3/WebM'}
          </button>
          <button
            onClick={handleSaveTranscript}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-800 text-indigo-50 hover:bg-indigo-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-6 4h6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-3l-1-2H9L8 5H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Save TXT
          </button>
        </div>
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
