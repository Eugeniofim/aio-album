/**
 * Home Page — AÍO Album App
 * Design: Aquatic Minimalism — Viola Caipira · Percussão · Baixo
 * Player: Inline profissional com timeline, controles circulares, volume, compartilhamento
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { albumData, ENCARTE_FRENTE, ENCARTE_CONTRACAPA } from '@/lib/albumData';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  BookOpen,
  Music,
  Download,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle,
  Menu,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Track {
  id: number;
  trackNumber: number;
  title: string;
  composer: string;
  duration?: string | null;
  lyrics?: string | null;
  chords?: string | null;
  briefing?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
  syncedLyrics?: string | null;
  youtubeUrl?: string | null;
}

interface Musician {
  id: number;
  name: string;
  role: string;
  instrument?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  website?: string | null;
}

interface Videoclipe {
  id: number;
  title: string;
  composer?: string | null;
  youtubeId?: string | null;
  thumbnailUrl?: string | null;
  youtubeUrl?: string | null;
  status?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function parseDuration(dur?: string | null): number {
  if (!dur) return 0;
  const [m, s] = dur.split(':').map(Number);
  return (m || 0) * 60 + (s || 0);
}

// Parse synced lyrics: "[0:15] linha da letra"
function parseSyncedLyrics(raw?: string | null): Array<{ time: number; text: string }> {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => {
      const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)/);
      if (!match) return null;
      const time = parseInt(match[1]) * 60 + parseInt(match[2]);
      return { time, text: match[3] };
    })
    .filter(Boolean) as Array<{ time: number; text: string }>;
}

// ─── WaveDecor ────────────────────────────────────────────────────────────────

function WaveDecor({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}
      style={{ height: 56 }}
    >
      <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0,28 C240,56 480,0 720,28 C960,56 1200,0 1440,28 L1440,56 L0,56 Z"
          fill="oklch(0.88 0.08 200 / 0.4)"
        />
      </svg>
    </div>
  );
}

// ─── Inline Player ────────────────────────────────────────────────────────────

function InlinePlayer({ tracks, externalIdx }: { tracks: Track[]; externalIdx?: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  // Sync with external index (from songbook "Ouvir" button)
  useEffect(() => {
    if (externalIdx != null && externalIdx !== idx) {
      setIdx(externalIdx);
      setTimeout(() => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
      }, 150);
    }
  }, [externalIdx]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeLyricIdx, setActiveLyricIdx] = useState(-1);
  const [liked, setLiked] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  const track = tracks[idx];
  const syncedLines = parseSyncedLyrics(track?.syncedLyrics);
  const hasSyncedLyrics = syncedLines.length > 0;

  // Load new track — also reacts when audioUrl arrives from DB
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const newSrc = track?.audioUrl || '';
    if (!newSrc) return; // Don't overwrite with empty src
    // Browser normalizes relative URLs to absolute, so compare by suffix
    const currentSrcPath = audio.src ? new URL(audio.src).pathname : '';
    const newSrcPath = newSrc.startsWith('http') ? new URL(newSrc).pathname : newSrc;
    if (currentSrcPath !== newSrcPath) {
      audio.src = newSrc;
      audio.load(); // Force reload
      setCurrentTime(0);
      setDuration(parseDuration(track?.duration));
      setActiveLyricIdx(-1);
      setAudioError(false);
    }
  }, [idx, track?.audioUrl]);

  // Sync lyrics highlight
  useEffect(() => {
    if (!hasSyncedLyrics) return;
    let active = -1;
    for (let i = 0; i < syncedLines.length; i++) {
      if (currentTime >= syncedLines[i].time) active = i;
    }
    if (active !== activeLyricIdx) {
      setActiveLyricIdx(active);
      // Auto-scroll lyrics
      if (active >= 0 && lyricsRef.current) {
        const el = lyricsRef.current.querySelector(`[data-line="${active}"]`);
        if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [currentTime, syncedLines, hasSyncedLyrics]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const handlePrev = () => setIdx((i) => (i > 0 ? i - 1 : tracks.length - 1));
  const handleNext = () => setIdx((i) => (i < tracks.length - 1 ? i + 1 : 0));

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleEnded = () => handleNext();

  // Click on progress bar
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * (duration || parseDuration(track?.duration) || 100);
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const dur = duration || parseDuration(track?.duration) || 100;
  const progress = dur > 0 ? Math.min((currentTime / dur) * 100, 100) : 0;

  const shareLinks = [
    { label: 'Spotify', icon: '🎵', color: 'oklch(0.55 0.18 150)', url: '#' },
    { label: 'Apple Music', icon: '🎵', color: 'oklch(0.55 0.18 10)', url: '#' },
    { label: 'YouTube Music', icon: '🎵', color: 'oklch(0.50 0.20 20)', url: '#' },
  ];

  return (
    <section
      id="player"
      className="py-12 md:py-16"
      style={{ background: 'oklch(0.99 0.01 220)' }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* ── Player Card ── */}
        <div
          className="rounded-2xl overflow-hidden shadow-xl border"
          style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'white' }}
        >
          {/* Top: cover + info + controls */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Cover */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={track?.coverUrl || ENCARTE_FRENTE}
                    alt={track?.title || 'AÍO'}
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl object-cover shadow-lg"
                    style={{ border: '3px solid oklch(0.88 0.08 200)' }}
                  />
                  {isPlaying && (
                    <div
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: 'oklch(0.55 0.15 220)' }}
                    >
                      <Music size={14} className="text-white animate-pulse" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info + Controls */}
              <div className="flex-1 min-w-0">
                {/* Track info */}
                <div className="mb-4">
                  <p
                    className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
                    style={{ color: 'oklch(0.65 0.15 220)' }}
                  >
                    FAIXA {track?.trackNumber} DE {tracks.length}
                  </p>
                  <h3
                    className="text-2xl sm:text-3xl font-bold leading-tight mb-1"
                    style={{ color: 'oklch(0.12 0.02 220)', fontFamily: "'Crimson Text', serif" }}
                  >
                    {track?.title || 'Faixa'}
                  </h3>
                  <p className="text-sm" style={{ color: 'oklch(0.50 0.10 220)' }}>
                    {track?.composer || 'Eugênio Fim'}
                  </p>
                  {track?.briefing && (
                    <p
                      className="text-xs leading-relaxed mt-2 italic line-clamp-2"
                      style={{ color: 'oklch(0.55 0.08 220)' }}
                    >
                      {track.briefing}
                    </p>
                  )}
                  {audioError && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                      style={{ background: 'oklch(0.96 0.04 20)', color: 'oklch(0.45 0.18 20)', border: '1px solid oklch(0.88 0.10 20)' }}
                    >
                      <span className="font-bold">!</span>
                      <span>Arquivo de áudio indisponível. Faça o upload novamente no <a href="/admin" className="underline font-semibold">Admin</a>.</span>
                    </div>
                  )}
                </div>

                {/* ── Progress Bar ── */}
                <div className="mb-3">
                  {/* Track */}
                  <div
                    ref={progressRef}
                    className="relative h-2 rounded-full cursor-pointer group"
                    style={{ background: 'oklch(0.90 0.06 210)' }}
                    onClick={handleProgressClick}
                  >
                    {/* Filled */}
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-none"
                      style={{ width: `${progress}%`, background: 'oklch(0.55 0.15 220)' }}
                    />
                    {/* Thumb */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md transition-transform group-hover:scale-125"
                      style={{
                        left: `calc(${progress}% - 8px)`,
                        background: 'oklch(0.55 0.15 220)',
                        border: '2px solid white',
                      }}
                    />
                    {/* Invisible range for keyboard/drag */}
                    <input
                      type="range"
                      min={0}
                      max={dur}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => {
                        const t = parseFloat(e.target.value);
                        if (audioRef.current) audioRef.current.currentTime = t;
                        setCurrentTime(t);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {/* Times */}
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs font-mono tabular-nums" style={{ color: 'oklch(0.55 0.15 220)' }}>
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-xs font-mono tabular-nums" style={{ color: 'oklch(0.65 0.08 220)' }}>
                      {track?.duration || formatTime(dur)}
                    </span>
                  </div>
                </div>

                {/* ── Transport Controls ── */}
                <div className="flex items-center justify-between">
                  {/* Left: prev / play / next + volume */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
                      style={{ color: 'oklch(0.45 0.12 220)' }}
                      title="Anterior"
                    >
                      <SkipBack size={18} />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
                      style={{ background: audioError ? 'oklch(0.55 0.18 20)' : 'oklch(0.55 0.15 220)', color: 'white' }}
                      title={audioError ? 'Erro ao carregar áudio — faça o upload novamente no Admin' : (isPlaying ? 'Pausar' : 'Reproduzir')}
                    >
                      {audioError ? <span className="text-xs font-bold">!</span> : (isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />)}
                    </button>

                    <button
                      onClick={handleNext}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 active:scale-95"
                      style={{ color: 'oklch(0.45 0.12 220)' }}
                      title="Próxima"
                    >
                      <SkipForward size={18} />
                    </button>

                    {/* Volume */}
                    <div className="hidden sm:flex items-center gap-2 ml-1">
                      <button
                        onClick={toggleMute}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
                        style={{ color: 'oklch(0.50 0.10 220)' }}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <div className="relative w-20 h-2 rounded-full cursor-pointer" style={{ background: 'oklch(0.88 0.06 210)' }}>
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ width: `${isMuted ? 0 : volume * 100}%`, background: 'oklch(0.65 0.12 220)' }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
                          style={{
                            left: `calc(${isMuted ? 0 : volume * 100}% - 6px)`,
                            background: 'oklch(0.55 0.15 220)',
                            border: '2px solid white',
                          }}
                        />
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Ver letra + like */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLyrics((v) => !v)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm"
                      style={{
                        borderColor: showLyrics ? 'oklch(0.55 0.15 220)' : 'oklch(0.80 0.08 210)',
                        color: showLyrics ? 'oklch(0.55 0.15 220)' : 'oklch(0.45 0.10 220)',
                        background: showLyrics ? 'oklch(0.94 0.06 210)' : 'transparent',
                      }}
                    >
                      <BookOpen size={12} />
                      Ver letra
                    </button>
                    <button
                      onClick={() => setLiked((v) => !v)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-red-50"
                      style={{ color: liked ? 'oklch(0.55 0.20 15)' : 'oklch(0.65 0.08 220)' }}
                    >
                      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Lyrics Panel ── */}
            {showLyrics && (
              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: 'oklch(0.90 0.06 210)' }}
              >
                {hasSyncedLyrics ? (
                  <div ref={lyricsRef} className="max-h-48 overflow-y-auto space-y-1 pr-2">
                    {syncedLines.map((line, i) => (
                      <p
                        key={i}
                        data-line={i}
                        className="text-sm leading-relaxed transition-all duration-300 px-2 py-0.5 rounded"
                        style={{
                          color: i === activeLyricIdx ? 'oklch(0.30 0.10 220)' : 'oklch(0.65 0.06 220)',
                          fontWeight: i === activeLyricIdx ? '600' : '400',
                          background: i === activeLyricIdx ? 'oklch(0.94 0.06 210)' : 'transparent',
                          fontSize: i === activeLyricIdx ? '1rem' : '0.875rem',
                        }}
                      >
                        {line.text}
                      </p>
                    ))}
                  </div>
                ) : track?.lyrics ? (
                  <pre
                    className="text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-48 overflow-y-auto"
                    style={{ color: 'oklch(0.35 0.06 220)', fontFamily: "'Crimson Text', serif", fontSize: '1rem' }}
                  >
                    {track.lyrics}
                  </pre>
                ) : (
                  <p className="text-sm italic text-center py-4" style={{ color: 'oklch(0.60 0.08 220)' }}>
                    Letra não disponível ainda.
                  </p>
                )}
              </div>
            )}

            {/* ── Share / Download Row ── */}
            <div
              className="mt-5 pt-4 flex flex-wrap items-center gap-3 border-t"
              style={{ borderColor: 'oklch(0.90 0.06 210)' }}
            >
              <div className="flex items-center gap-1.5">
                <Download size={14} style={{ color: 'oklch(0.55 0.12 220)' }} />
                <span className="text-xs font-medium" style={{ color: 'oklch(0.45 0.10 220)' }}>Baixar</span>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0.08 220)' }}>Compartilhar:</span>

              {/* Platform icons */}
              {[
                { label: 'Spotify', bg: 'oklch(0.55 0.18 150)', icon: '♪' },
                { label: 'Apple', bg: 'oklch(0.50 0.15 10)', icon: '♫' },
                { label: 'YouTube', bg: 'oklch(0.50 0.20 20)', icon: '▶' },
                { label: 'Mensagem', bg: 'oklch(0.55 0.15 150)', icon: '💬' },
                { label: 'Curtir', bg: 'oklch(0.55 0.20 15)', icon: '♥' },
                { label: 'Link', bg: 'oklch(0.55 0.12 220)', icon: '🔗' },
                { label: 'Mais', bg: 'oklch(0.65 0.10 220)', icon: '⋯' },
              ].map((p) => (
                <button
                  key={p.label}
                  title={p.label}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all hover:scale-110 hover:shadow-md active:scale-95"
                  style={{ background: p.bg }}
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tracklist ── */}
          <div
            className="border-t"
            style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'oklch(0.99 0.005 220)' }}
          >
            <div className="px-6 py-3 border-b" style={{ borderColor: 'oklch(0.90 0.06 210)' }}>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'oklch(0.55 0.15 220)' }}>
                FAIXAS DO ÁLBUM
              </p>
            </div>
            <div>
              {tracks.map((t, i) => {
                const isActive = i === idx;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setIdx(i);
                      if (!isPlaying) {
                        setTimeout(() => {
                          audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
                        }, 100);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 transition-all text-left"
                    style={{
                      background: isActive ? 'oklch(0.55 0.15 220)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.94 0.04 215)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }}
                  >
                    {/* Number / playing indicator */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: isActive ? 'oklch(0.45 0.15 220)' : 'oklch(0.90 0.06 210)',
                        color: isActive ? 'white' : 'oklch(0.45 0.12 220)',
                      }}
                    >
                      {isActive && isPlaying ? <Music size={12} className="animate-pulse" /> : t.trackNumber}
                    </div>

                    {/* Cover thumb */}
                    <img
src={t.coverUrl || ENCARTE_CONTRACAPA}
                       alt={t.title}
                      className="w-10 h-10 rounded-md object-cover flex-shrink-0"
                      style={{ border: isActive ? '2px solid oklch(0.45 0.15 220)' : '2px solid oklch(0.88 0.08 200)' }}
                    />

                    {/* Title + composer */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: isActive ? 'white' : 'oklch(0.15 0.02 220)' }}
                      >
                        {t.title}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: isActive ? 'oklch(0.85 0.06 220)' : 'oklch(0.55 0.10 220)' }}
                      >
                        {t.composer}
                      </p>
                    </div>

                    {/* Duration */}
                    <span
                      className="text-xs flex-shrink-0 font-mono tabular-nums"
                      style={{ color: isActive ? 'oklch(0.85 0.06 220)' : 'oklch(0.60 0.08 220)' }}
                    >
                      {t.duration || '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => { setAudioError(true); setIsPlaying(false); }}
        onCanPlay={() => setAudioError(false)}
      />
    </section>
  );
}

// ─── SongbookModal ────────────────────────────────────────────────────────────

function SongbookModal({
  tracks,
  initialIndex,
  onClose,
  onPlayTrack,
}: {
  tracks: Track[];
  initialIndex: number;
  onClose: () => void;
  onPlayTrack: (idx: number) => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const track = tracks[idx];

  useEffect(() => setIdx(initialIndex), [initialIndex]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5, 15, 35, 0.95)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ background: 'white', maxHeight: '94vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'oklch(0.88 0.08 200)' }}>
          <div className="flex items-center gap-3">
            <BookOpen size={20} style={{ color: 'oklch(0.55 0.15 220)' }} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'oklch(0.15 0.02 220)' }}>
                Songbook — AÍO
              </h2>
              <p className="text-xs" style={{ color: 'oklch(0.55 0.10 220)' }}>
                Viola Caipira · Percussão · Baixo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100"
            style={{ color: 'oklch(0.45 0.08 220)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className="w-56 flex-shrink-0 border-r overflow-y-auto"
            style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'oklch(0.97 0.02 220)' }}
          >
            <div className="p-3">
              <img src={ENCARTE_FRENTE} alt="AÍO" className="w-full rounded-lg shadow-md mb-4" />
            </div>
            {tracks.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setIdx(i)}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-all border-l-2 ${
                  i === idx ? 'border-l-current bg-white' : 'border-transparent hover:bg-white/70'
                }`}
                style={{ borderLeftColor: i === idx ? 'oklch(0.65 0.15 220)' : undefined }}
              >
                <span className="text-xs font-bold w-5 flex-shrink-0" style={{ color: i === idx ? 'oklch(0.55 0.15 220)' : 'oklch(0.65 0.10 220)' }}>
                  {t.trackNumber}
                </span>
                <span className="text-sm truncate" style={{ color: i === idx ? 'oklch(0.15 0.02 220)' : 'oklch(0.40 0.08 220)' }}>
                  {t.title}
                </span>
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'oklch(0.65 0.15 220)' }}>
                  FAIXA {track?.trackNumber} DE {tracks.length}
                </p>
                <h3 className="text-3xl font-bold mb-1" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>
                  {track?.title}
                </h3>
                <p className="text-base" style={{ color: 'oklch(0.45 0.10 220)' }}>
                  {track?.composer}
                </p>
              </div>
              <button
                onClick={() => { onPlayTrack(idx); onClose(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{ background: 'oklch(0.75 0.12 220)', color: 'white' }}
              >
                <Play size={14} />
                Ouvir
              </button>
            </div>

            {track?.briefing && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'oklch(0.94 0.06 210)' }}>
                <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'oklch(0.55 0.15 220)' }}>FICHA TÉCNICA</p>
                <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.25 0.04 220)' }}>{track.briefing}</p>
              </div>
            )}

            {track?.lyrics && (
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'oklch(0.55 0.15 220)' }}>LETRA</p>
                <pre className="text-base leading-loose whitespace-pre-wrap" style={{ color: 'oklch(0.20 0.03 220)', fontFamily: "'Crimson Text', serif", fontSize: '1.1rem' }}>
                  {track.lyrics}
                </pre>
              </div>
            )}

            {track?.chords && (
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'oklch(0.55 0.15 220)' }}>CIFRA</p>
                <pre className="text-sm leading-relaxed font-mono p-4 rounded-xl" style={{ background: 'oklch(0.97 0.02 220)', color: 'oklch(0.25 0.04 220)' }}>
                  {track.chords}
                </pre>
              </div>
            )}

            {!track?.lyrics && !track?.chords && !track?.briefing && (
              <div className="text-center py-16">
                <BookOpen size={40} className="mx-auto mb-4" style={{ color: 'oklch(0.80 0.08 220)' }} />
                <p className="text-sm" style={{ color: 'oklch(0.55 0.10 220)' }}>
                  Conteúdo em breve — adicione via área administrativa.
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t" style={{ borderColor: 'oklch(0.88 0.08 200)' }}>
              <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="flex items-center gap-2 text-sm transition-all disabled:opacity-30" style={{ color: 'oklch(0.55 0.15 220)' }}>
                <SkipBack size={14} /> Anterior
              </button>
              <button onClick={() => setIdx((i) => Math.min(tracks.length - 1, i + 1))} disabled={idx === tracks.length - 1} className="flex items-center gap-2 text-sm transition-all disabled:opacity-30" style={{ color: 'oklch(0.55 0.15 220)' }}>
                Próxima <SkipForward size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Home ────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: dbTracks } = trpc.album.tracks.useQuery();
  const { data: dbMusicians } = trpc.album.musicians.useQuery();
  const { data: dbVideoclipes } = trpc.album.videoclipes.useQuery();
  const { data: dbAssets } = trpc.album.songbookAssets.useQuery();

  const tracks: Track[] = (dbTracks && dbTracks.length > 0)
    ? dbTracks.map((t) => ({
        id: t.id,
        trackNumber: t.trackNumber,
        title: t.title,
        composer: t.composer,
        duration: t.duration,
        lyrics: t.lyrics,
        chords: t.chords,
        briefing: t.briefing,
        audioUrl: t.audioUrl,
        coverUrl: t.coverUrl,
        syncedLyrics: (t as any).syncedLyrics,
        youtubeUrl: (t as any).youtubeUrl,
      }))
    : albumData.tracks.map((t) => ({ ...t, coverUrl: t.coverImage }));

  const musicians: Musician[] = (dbMusicians && dbMusicians.length > 0)
    ? dbMusicians.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        instrument: m.instrument,
        bio: m.bio,
        photoUrl: m.photoUrl,
        website: m.website,
      }))
    : albumData.musicians.map((m) => ({ ...m, photoUrl: m.photo }));

  const videoclipes: Videoclipe[] = (dbVideoclipes && dbVideoclipes.length > 0)
    ? dbVideoclipes.map((v) => ({
        id: v.id,
        title: v.title,
        composer: v.composer,
        youtubeId: v.youtubeId,
        thumbnailUrl: v.thumbnailUrl,
        youtubeUrl: v.youtubeUrl,
        status: v.status,
      }))
    : [];

  const [songbookOpen, setSongbookOpen] = useState(false);
  const [songbookIdx, setSongbookIdx] = useState(0);
  // For songbook "Ouvir" button — scroll to player and set track
  const [playerFocusIdx, setPlayerFocusIdx] = useState<number | null>(null);
  const [playerExternalIdx, setPlayerExternalIdx] = useState<number | null>(null);

  const openSongbook = (idx: number) => {
    setSongbookIdx(idx);
    setSongbookOpen(true);
  };

  const pdfAsset = dbAssets?.find((a) => a.type === 'pdf_songbook');
  const zipAsset = dbAssets?.find((a) => a.type === 'zip_album');
  const pdfUrl = pdfAsset?.fileUrl;
  const zipUrl = zipAsset?.fileUrl;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ background: 'oklch(0.12 0.04 230 / 0.96)', backdropFilter: 'blur(12px)', borderColor: 'oklch(0.20 0.06 230)' }}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img
              src={ENCARTE_FRENTE}
              alt="AÍO"
              className="w-9 h-9 rounded-md object-cover shadow"
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
                AÍO
              </span>
              <span className="hidden sm:inline text-xs ml-2" style={{ color: 'oklch(0.65 0.10 220)' }}>
                Viola Caipira · Percussão · Baixo
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="#player" className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-white/10 text-white/80 hover:text-white">
              Ouvir
            </a>
            <button onClick={() => openSongbook(0)} className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-white/10 text-white/80 hover:text-white">
              Songbook
            </button>
            <a href="/press" className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-white/10 text-white/80 hover:text-white">
              Imprensa
            </a>
            <a href="/admin" className="px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-white/10 text-white/80 hover:text-white">
              Admin
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-all hover:bg-white/10 text-white"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 flex flex-col gap-2"
            style={{ background: 'oklch(0.10 0.04 230)', borderColor: 'oklch(0.20 0.06 230)' }}
          >
            <a href="#player" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
              Ouvir
            </a>
            <button onClick={() => { openSongbook(0); setMobileMenuOpen(false); }} className="text-left px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
              Songbook
            </button>
            <a href="/press" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
              Imprensa
            </a>
            <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all">
              Admin
            </a>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, oklch(0.10 0.05 230) 0%, oklch(0.14 0.08 235) 50%, oklch(0.18 0.10 240) 100%)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, oklch(0.55 0.20 200), transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, oklch(0.45 0.18 220), transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:justify-start">
              <div className="relative group">
                <div className="absolute -inset-4 rounded-2xl opacity-30 blur-xl" style={{ background: 'oklch(0.75 0.12 220)' }} />
                <img
                  src={ENCARTE_FRENTE}
                  alt="AÍO — Disco"
                  className="relative w-72 md:w-80 rounded-2xl shadow-2xl object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => openSongbook(0)}
                />
                <a
                  href="#player"
                  className="absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110"
                  style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
                >
                  <Play size={22} className="ml-1" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] mb-3 uppercase" style={{ color: 'oklch(0.65 0.15 200)' }}>
                  ÁLBUM DE EUGÊNIO FIM
                </p>
                <h1 className="text-6xl md:text-7xl font-bold mb-3 leading-none text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
                  AÍO
                </h1>
                <p className="text-lg font-medium" style={{ color: 'oklch(0.75 0.12 200)' }}>
                  Viola Caipira · Percussão · Baixo
                </p>
              </div>

              <p className="text-base leading-relaxed max-w-md" style={{ color: 'oklch(0.80 0.06 220)' }}>
                {albumData.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#player"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:scale-105"
                  style={{ background: 'oklch(0.55 0.20 200)', color: 'white' }}
                >
                  <Play size={16} />
                  Ouvir Agora
                </a>
                <button
                  onClick={() => openSongbook(0)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2 transition-all hover:shadow-md hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white', background: 'transparent' }}
                >
                  <BookOpen size={16} />
                  Songbook
                </button>
              </div>

              {(pdfUrl || zipUrl) && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {pdfUrl && (
                    <a href={pdfUrl} download className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
                      <Download size={13} /> Songbook PDF
                    </a>
                  )}
                  {zipUrl && (
                    <a href={zipUrl} download className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border transition-all hover:bg-white/10" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)' }}>
                      <Download size={13} /> Álbum WAV
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <WaveDecor />
      </section>

      {/* ── Inline Player ── */}
      <InlinePlayer tracks={tracks} externalIdx={playerExternalIdx} />

      {/* ── Songbook CTA ── */}
      <section className="py-14" style={{ background: 'linear-gradient(135deg, oklch(0.55 0.15 220) 0%, oklch(0.40 0.18 220) 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen size={36} className="mx-auto mb-4" style={{ color: 'oklch(0.85 0.08 220)' }} />
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white" style={{ fontFamily: "'Crimson Text', serif" }}>
            Songbook Interativo
          </h2>
          <p className="text-base mb-6 max-w-xl mx-auto" style={{ color: 'oklch(0.85 0.08 220)' }}>
            Clique em qualquer faixa para ver a letra, cifra e ficha técnica — com player integrado.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => openSongbook(0)} className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105" style={{ background: 'white', color: 'oklch(0.45 0.15 220)' }}>
              <BookOpen size={16} /> Abrir Songbook
            </button>
            {pdfUrl && (
              <a href={pdfUrl} download className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm border-2 border-white text-white transition-all hover:bg-white/10">
                <Download size={16} /> Baixar PDF
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Videoclipes ── */}
      {videoclipes.length > 0 && (
        <section className="py-16 md:py-20" style={{ background: 'oklch(0.97 0.02 220)' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'oklch(0.65 0.15 220)' }}>AUDIOVISUAL</p>
              <h2 className="text-3xl font-bold" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>Videoclipes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoclipes.map((v) => (
                <div key={v.id} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border" style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'white' }}>
                  <div className="relative aspect-video overflow-hidden">
                    {v.thumbnailUrl ? (
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'oklch(0.88 0.08 200)' }}>
                        <Music size={32} style={{ color: 'oklch(0.65 0.12 220)' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center">
                      {v.youtubeUrl ? (
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'oklch(0.75 0.12 220)' }}>
                          <Play size={22} className="text-white ml-1" />
                        </a>
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.75 0.12 220 / 0.7)' }}>
                          <Play size={22} className="text-white ml-1" />
                        </div>
                      )}
                    </div>
                    {v.status && (
                      <div className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full" style={{ background: v.status === 'disponivel' ? 'oklch(0.55 0.15 150)' : 'oklch(0.65 0.15 50)', color: 'white' }}>
                        {v.status === 'disponivel' ? 'Disponível' : v.status === 'em_producao' ? 'Em Produção' : 'Em Breve'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold mb-1" style={{ color: 'oklch(0.15 0.02 220)' }}>{v.title}</h4>
                    {v.composer && <p className="text-sm" style={{ color: 'oklch(0.55 0.10 220)' }}>{v.composer}</p>}
                    {v.youtubeUrl && (
                      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1 text-xs font-medium transition-all" style={{ color: 'oklch(0.55 0.15 220)' }}>
                        <ExternalLink size={12} /> Assistir no YouTube
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Músicos ── */}
      <section className="py-16 md:py-20" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'oklch(0.65 0.15 220)' }}>INTÉRPRETES</p>
            <h2 className="text-3xl font-bold" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>Os Músicos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {musicians.map((m) => (
              <div key={m.id} className="rounded-2xl overflow-hidden border transition-all hover:shadow-lg" style={{ borderColor: 'oklch(0.88 0.08 200)' }}>
                <div className="aspect-square overflow-hidden" style={{ background: 'oklch(0.92 0.08 210)' }}>
                  <img src={m.photoUrl || ENCARTE_CONTRACAPA} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'oklch(0.65 0.15 220)' }}>{m.instrument || m.role}</p>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>{m.name}</h3>
                  {m.bio && <p className="text-sm leading-relaxed mb-4" style={{ color: 'oklch(0.40 0.06 220)' }}>{m.bio}</p>}
                  {m.website && (
                    <a href={m.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium transition-all" style={{ color: 'oklch(0.55 0.15 220)' }}>
                      <ExternalLink size={12} /> Site
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Section ── */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, oklch(0.10 0.05 230) 0%, oklch(0.14 0.08 235) 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)' }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="text-8xl font-bold mb-6 leading-none" style={{ color: 'oklch(0.55 0.20 200)', fontFamily: "'Crimson Text', serif", opacity: 0.6 }}>““</div>
          <blockquote className="text-2xl md:text-3xl font-light leading-relaxed text-white mb-6" style={{ fontFamily: "'Crimson Text', serif" }}>
            A <strong className="font-bold" style={{ color: 'oklch(0.75 0.18 200)' }}>ancestralidade</strong> do som e da natureza
            causam um <strong className="font-bold" style={{ color: 'oklch(0.75 0.18 200)' }}>efeito que reverbera</strong>.
          </blockquote>
          <p className="text-lg font-bold tracking-widest" style={{ color: 'oklch(0.65 0.15 200)', fontFamily: "'Crimson Text', serif" }}>AÍO</p>
        </div>
      </section>

      {/* ── Sobre o Álbum + Lançamento ── */}
      <section className="py-16" style={{ background: 'oklch(0.96 0.03 215)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Sobre */}
            <div>
              <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'oklch(0.55 0.15 220)' }}>SOBRE O ÁLBUM</p>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>AÍO</h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'oklch(0.30 0.04 220)' }}>
                AÍO é um projeto com 7 faixas inéditas de Eugênio Fim. O som da viola caipira encontra a percussão e o baixo num diálogo ancestral e contemporâneo.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.40 0.04 220)' }}>
                Participam do projeto <strong>Vina Lacerda</strong> (percussão), <strong>Fernando Lobo</strong> (percussão) e <strong>Leo Mariste</strong> (baixo).
              </p>
            </div>
            {/* Lançamento */}
            <div>
              <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'oklch(0.55 0.15 220)' }}>LANÇAMENTO</p>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>
                Lançamento previsto: 14 de junho de 2026
              </h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'oklch(0.30 0.04 220)' }}>
                Produção musical de Eugênio Fim, com participações especiais de grandes artistas nacionais e internacionais.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.40 0.04 220)' }}>
                Videoclipes em produção. Os clipes serão lançados ao longo de 2026 nas principais plataformas digitais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'oklch(0.10 0.04 230)' }}>
        {/* Social + Links */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={ENCARTE_FRENTE} alt="AÍO" className="w-12 h-12 rounded-xl object-cover shadow" />
                <div>
                  <p className="font-bold text-white text-lg" style={{ fontFamily: "'Crimson Text', serif" }}>AÍO</p>
                  <p className="text-xs" style={{ color: 'oklch(0.55 0.10 220)' }}>Eugênio Fim</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.50 0.08 220)' }}>
                Viola Caipira · Percussão · Baixo
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest mb-4 text-white">NAVEGAÇÃO</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#player" className="transition-colors hover:text-white" style={{ color: 'oklch(0.55 0.08 220)' }}>Ouvir</a></li>
                <li><button onClick={() => openSongbook(0)} className="transition-colors hover:text-white" style={{ color: 'oklch(0.55 0.08 220)' }}>Songbook</button></li>
                <li><a href="/press" className="transition-colors hover:text-white" style={{ color: 'oklch(0.55 0.08 220)' }}>Imprensa</a></li>
                <li><a href="/admin" className="transition-colors hover:text-white" style={{ color: 'oklch(0.55 0.08 220)' }}>Admin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-widest mb-4 text-white">REDES SOCIAIS</h4>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'oklch(0.55 0.20 330)', color: 'white' }}>
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'oklch(0.50 0.20 20)', color: 'white' }}>
                  <Youtube size={16} />
                </a>
                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: 'oklch(0.45 0.15 250)', color: 'white' }}>
                  <Facebook size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Patrocinadores */}
          <div className="border-t pt-8" style={{ borderColor: 'oklch(0.20 0.05 230)' }}>
            <p className="text-xs font-semibold tracking-widest mb-6 text-center" style={{ color: 'oklch(0.45 0.08 220)' }}>REALIZAÇÃO E APOIO</p>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              {/* PNAB */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'oklch(0.25 0.06 230)', color: 'oklch(0.75 0.15 200)' }}>PNAB</div>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.06 220)' }}>Programa Nacional</span>
              </div>
              {/* FCC */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'oklch(0.25 0.06 230)', color: 'oklch(0.75 0.15 200)' }}>FCC</div>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.06 220)' }}>Fundação Cultural</span>
              </div>
              {/* Prefeitura de Curitiba */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'oklch(0.25 0.06 230)', color: 'oklch(0.75 0.15 200)' }}>PMC</div>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.06 220)' }}>Prefeitura de Curitiba</span>
              </div>
              {/* Ministério da Cultura */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'oklch(0.25 0.06 230)', color: 'oklch(0.75 0.15 200)' }}>MinC</div>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.06 220)' }}>Ministério da Cultura</span>
              </div>
              {/* Governo Federal */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: 'oklch(0.25 0.06 230)', color: 'oklch(0.75 0.15 200)' }}>GOV.BR</div>
                <span className="text-xs" style={{ color: 'oklch(0.45 0.06 220)' }}>Governo Federal</span>
              </div>
            </div>

            <div className="text-center text-xs" style={{ color: 'oklch(0.35 0.05 220)' }}>
              <p className="mb-1">© 2026 Eugênio Fim · AÍO · Todos os direitos reservados.</p>
              <p>Eugênio Fim (Viola Caipira) · Vina Lacerda (Percussão) · Fernando Lobo (Percussão) · Leo Mariste (Baixo)</p>
              <p className="mt-2" style={{ color: 'oklch(0.30 0.04 220)' }}>PROJETO REALIZADO COM RECURSOS DO PROGRAMA DE APOIO E INCENTIVO À CULTURA · FUNDAÇÃO CULTURAL DE CURITIBA · PREFEITURA MUNICIPAL DE CURITIBA · MINISTÉRIO DA CULTURA · GOVERNO FEDERAL</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Songbook Modal ── */}
      {songbookOpen && (
        <SongbookModal
          tracks={tracks}
          initialIndex={songbookIdx}
          onClose={() => setSongbookOpen(false)}
          onPlayTrack={(i) => {
            setSongbookOpen(false);
            setPlayerExternalIdx(i);
            // scroll to player
            setTimeout(() => {
              document.getElementById('player')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      )}
    </div>
  );
}
