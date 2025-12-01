import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import VimeoPlayer from '@vimeo/player';

interface VimeoPlayerProps {
  vimeoId: string;
  initialTime?: number;
  onProgress: (seconds: number, percent: number) => void;
  onEnded: () => void;
}

const Player: FC<VimeoPlayerProps> = ({ vimeoId, initialTime = 0, onProgress, onEnded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VimeoPlayer | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
  }, [onProgress, onEnded]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean DOM to prevent ghost players
    containerRef.current.innerHTML = '';

    const player = new VimeoPlayer(containerRef.current, {
      id: parseInt(vimeoId, 10),
      autoplay: false,
      responsive: true,
    });
    playerRef.current = player;

    // --- HANDLERS ---

    const handleTimeUpdate = (data: { seconds: number; percent: number }) => {
        const now = Date.now();
        // Only save every 30 seconds (Heartbeat)
        if (now - lastUpdateRef.current > 30000) { 
             onProgressRef.current(data.seconds, Math.round(data.percent * 100));
             lastUpdateRef.current = now;
        }
    };

    const handleImmediateSave = (data: { seconds: number; percent: number }) => {
        // Save immediately on Pause or Seek
        onProgressRef.current(data.seconds, Math.round(data.percent * 100));
    };

    const handleEnded = () => {
        onProgressRef.current(0, 100);
        onEndedRef.current();
    };

    // --- ATTACH & INIT ---
    player.ready().then(() => {
        player.on('pause', handleImmediateSave);
        player.on('seeked', handleImmediateSave);
        player.on('timeupdate', handleTimeUpdate);
        player.on('ended', handleEnded);

        if (initialTime > 0) {
            player.setCurrentTime(initialTime).catch(() => {});
        }
    }).catch(() => {});

    return () => {
        if (playerRef.current) {
            playerRef.current.off('pause');
            playerRef.current.off('seeked');
            playerRef.current.off('timeupdate');
            playerRef.current.off('ended');
            playerRef.current.destroy().catch(() => {});
        }
    };
  }, [vimeoId]);

  return <div ref={containerRef} className="w-full aspect-video bg-black" />;
};

export default Player;