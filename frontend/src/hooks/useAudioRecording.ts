import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAudioRecordingReturn {
  isRecording: boolean;
  recordingTime: number;
  audioData: number[];
  hasRecordingData: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecording: () => void;
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>(Array(40).fill(2));
  const [hasRecordingData, setHasRecordingData] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect for recording
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Audio visualizer simulation
  useEffect(() => {
    if (isRecording) {
      visualizerIntervalRef.current = setInterval(() => {
        setAudioData(prev => 
          prev.map((_, index) => {
            const baseFreq = Math.sin(Date.now() * 0.001 + index * 0.1) * 0.5 + 0.5;
            const noise = Math.random() * 0.3;
            const amplitude = (baseFreq + noise) * 0.7;
            const speechPattern = index % 7 === 0 ? amplitude * 1.5 : amplitude;
            return Math.min(speechPattern * 80 + 5, 80);
          })
        );
      }, 80);
    } else {
      setAudioData(Array(40).fill(2));
    }
    
    return () => {
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setHasRecordingData(false);
    setRecordingTime(0);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setHasRecordingData(true);
  }, []);

  const clearRecording = useCallback(() => {
    setIsRecording(false);
    setHasRecordingData(false);
    setRecordingTime(0);
    setAudioData(Array(40).fill(2));
  }, []);

  return {
    isRecording,
    recordingTime,
    audioData,
    hasRecordingData,
    startRecording,
    stopRecording,
    clearRecording,
  };
}; 