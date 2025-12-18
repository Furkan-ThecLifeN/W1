import { useState, useEffect, useRef } from 'react';

const useAudioAnalysis = (stream) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!stream || !stream.active || stream.getAudioTracks().length === 0) {
      setIsSpeaking(false);
      return;
    }

    // AudioContext'i başlat
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.1;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Ses seviyesini hesapla (Ortalama)
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // EŞİK DEĞERİ (Hassasiyeti buradan ayarla: 10-20 arası idealdir)
      const threshold = 12; 
      
      // Ses varsa true, yoksa false
      const speakingNow = average > threshold;
      
      // State güncellemesini azaltmak için (React render'ı boğmamak için)
      setIsSpeaking(prev => {
          if (prev !== speakingNow) return speakingNow;
          return prev;
      });

      frameIdRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream]);

  return isSpeaking;
};

export default useAudioAnalysis;