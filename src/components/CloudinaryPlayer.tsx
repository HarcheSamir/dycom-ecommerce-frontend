// src/components/CloudinaryPlayer.tsx

import { useEffect, useRef } from 'react';
import type { FC } from 'react';


interface CloudinaryPlayerProps {
  src: string; 
  onEnded?: () => void;
}

const CloudinaryPlayer: FC<CloudinaryPlayerProps> = ({ src, onEnded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.load();

    const handleEnded = () => {
      if (onEnded) onEnded();
    };

    videoElement.addEventListener('ended', handleEnded);
    return () => videoElement.removeEventListener('ended', handleEnded);
  }, [src, onEnded]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      width="100%"
      height="100%"
      className="rounded-lg"
      playsInline // Important for iOS devices
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default CloudinaryPlayer;