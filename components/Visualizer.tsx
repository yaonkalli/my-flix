
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ audioRef, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    // Configuration de la fidélité
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    try {
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyser);
        analyser.connect(audioContext.destination);
      }
    } catch (e) {
      console.log("Audio source already connected");
    }

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const render = () => {
      if (!canvas || !ctx || !analyserRef.current || !dataArrayRef.current) return;

      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

      // Fond avec traînée pour effet de mouvement
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.25;

      // Calcul de l'énergie moyenne (Bass energy)
      let sum = 0;
      for (let i = 0; i < 10; i++) sum += dataArrayRef.current[i];
      const bassIntensity = sum / 10 / 255;
      const pulseRadius = baseRadius + (bassIntensity * 50);

      // Dessiner les ondes circulaires réactives
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArrayRef.current[i] * 1.5;
        const angle = (i * Math.PI * 2) / bufferLength;

        // Palette "African Gold & Earth"
        const hue = 15 + (i * 0.5); // Or à Rouge
        const saturation = 80 + (bassIntensity * 20);
        const lightness = 40 + (barHeight / 10);

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 + bassIntensity})`;
        ctx.lineWidth = 2 + (bassIntensity * 4);

        const x1 = centerX + Math.cos(angle) * pulseRadius;
        const y1 = centerY + Math.sin(angle) * pulseRadius;
        const x2 = centerX + Math.cos(angle) * (pulseRadius + barHeight);
        const y2 = centerY + Math.sin(angle) * (pulseRadius + barHeight);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Particules orbitales
        if (i % 8 === 0 && isPlaying) {
          const pAngle = angle + (Date.now() * 0.001);
          const pDist = pulseRadius + barHeight + 50;
          ctx.fillStyle = `hsla(${hue + 40}, 100%, 70%, 0.8)`;
          ctx.beginPath();
          ctx.arc(centerX + Math.cos(pAngle) * pDist, centerY + Math.sin(pAngle) * pDist, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Halo central
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
      gradient.addColorStop(0, 'rgba(229, 9, 20, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      animationRef.current = requestAnimationFrame(render);
    };

    if (isPlaying) {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      render();
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 mix-blend-screen"
    />
  );
};

export default Visualizer;
