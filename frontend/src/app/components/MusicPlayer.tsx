import React, { useState, useRef, useEffect } from "react";

interface MusicItem {
  name: string;
  artist: string;
  src: string;
}

const musicList: MusicItem[] = [
  {
    name: "小酌",
    artist: "音乐人",
    src: "/music/小酌.mp3"
  },
  {
    name: "屋檐下面",
    artist: "音乐人",
    src: "/music/屋檐下面.mp3"
  },
  {
    name: "远方的鲸",
    artist: "音乐人",
    src: "/music/远方的鲸.mp3"
  },
  {
    name: "不如遗忘",
    artist: "音乐人",
    src: "/music/不如遗忘.mp3"
  }
];

interface MusicPlayerContextType {
  currentTrack: MusicItem;
  isPlaying: boolean;
  progress: number;
  duration: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
}

const MusicPlayerContext = React.createContext<MusicPlayerContextType | null>(null);

export function useMusicPlayer() {
  const context = React.useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
}

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = musicList[currentIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.src);
      audioRef.current.loop = false;
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // 播放下一首
      next();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(!isPlaying);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % musicList.length);
    setProgress(0);
  };

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + musicList.length) % musicList.length);
    setProgress(0);
  };

  // 当曲目改变时，重新加载音频源
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.load();

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentIndex, currentTrack.src]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        play,
        pause,
        togglePlay,
        next,
        previous
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}
