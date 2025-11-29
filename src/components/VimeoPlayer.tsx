// FILE: ./src/components/VimeoPlayer.tsx
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import VimeoPlayer from '@vimeo/player';

interface VimeoPlayerProps {
  vimeoId: string;
  onEnded?: () => void;
}

const Player: FC<VimeoPlayerProps> = ({ vimeoId, onEnded }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize the Vimeo player
    playerRef.current = new VimeoPlayer(videoRef.current, {
      id: parseInt(vimeoId, 10),
      autoplay: true,
      responsive: true,
    });

    // Attach the 'ended' event listener
    const handleEnded = () => {
      if (onEnded) {
        onEnded();
      }
    };

    playerRef.current.on('ended', handleEnded);

    // Cleanup on component unmount
    return () => {
      playerRef.current?.off('ended', handleEnded);
      playerRef.current?.destroy();
    };
  }, [vimeoId, onEnded]); // Re-run effect if vimeoId changes

  return <div ref={videoRef} className="w-full h-full" />;
};

export default Player;