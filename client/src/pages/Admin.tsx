/**
 * Admin Page — AÍO
 * Senha simples: "1234" (sessionStorage)
 * Editor dedicado por faixa: Áudio, Videoclipe, Capa+IA, Briefing, Cifra, Letra, Letra Sincronizada
 */

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Music,
  Users,
  FileText,
  Plus,
  Trash2,
  Save,
  Upload,
  Eye,
  EyeOff,
  LogOut,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Youtube,
  Video,
  CheckCircle2,
} from 'lucide-react';

// ─── Password Guard ────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = '1234';
const SESSION_KEY = 'aio_admin_auth';

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError('Senha incorreta.');
      setPwd('');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, oklch(0.94 0.06 210) 0%, oklch(0.88 0.10 215) 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-2xl shadow-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'oklch(0.55 0.15 220)' }}
          >
            <Music size={36} color="white" />
          </div>
          <h1
            className="text-4xl font-bold mb-1"
            style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}
          >
            AÍO
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.50 0.10 220)' }}>
            Área Administrativa
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 shadow-xl"
          style={{ background: 'white', border: '1px solid oklch(0.88 0.08 200)' }}
        >
          <label className="block text-xs font-semibold tracking-widest mb-2" style={{ color: 'oklch(0.45 0.12 220)' }}>
            SENHA
          </label>
          <div className="relative mb-4">
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setError(''); }}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border text-lg tracking-widest outline-none transition-all"
              style={{
                borderColor: error ? 'oklch(0.577 0.245 27)' : 'oklch(0.88 0.08 200)',
                color: 'oklch(0.15 0.02 220)',
              }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'oklch(0.60 0.10 220)' }}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && (
            <p className="text-xs mb-3" style={{ color: 'oklch(0.577 0.245 27)' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TrackRow {
  id: number;
  trackNumber: number;
  title: string;
  composer: string;
  duration: string | null;
  lyrics: string | null;
  chords: string | null;
  briefing: string | null;
  syncedLyrics: string | null;
  youtubeUrl: string | null;
  youtubeId: string | null;
  videoKey: string | null;
  videoUrl: string | null;
  audioKey: string | null;
  audioUrl: string | null;
  coverKey: string | null;
  coverUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  color,
  icon,
  title,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px dashed ${color}`, background: 'white' }}
    >
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${color}20` }}>
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color }}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Track Detail Editor ───────────────────────────────────────────────────────

function TrackDetailEditor({
  track,
  onBack,
}: {
  track: TrackRow;
  onBack: () => void;
}) {
  const utils = trpc.useUtils();

  const [title, setTitle] = useState(track.title);
  const [composer, setComposer] = useState(track.composer);
  const [duration, setDuration] = useState(track.duration || '');
  const [lyrics, setLyrics] = useState(track.lyrics || '');
  const [chords, setChords] = useState(track.chords || '');
  const [briefing, setBriefing] = useState(track.briefing || '');
  const [syncedLyrics, setSyncedLyrics] = useState(track.syncedLyrics || '');
  const [youtubeInput, setYoutubeInput] = useState(track.youtubeUrl || '');
  const [audioUrl, setAudioUrl] = useState(track.audioUrl || '');
  const [coverUrl, setCoverUrl] = useState(track.coverUrl || '');
  const [videoUrl, setVideoUrl] = useState(track.videoUrl || '');
  const [isPublished, setIsPublished] = useState(track.isPublished);
  const [generatingCover, setGeneratingCover] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const upsertTrack = trpc.tracks.upsert.useMutation({
    onSuccess: () => {
      toast.success('Alterações salvas!');
      utils.album.tracks.invalidate();
      utils.album.allTracks.invalidate();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const uploadAudio = trpc.tracks.uploadAudio.useMutation({
    onSuccess: (data) => {
      setAudioUrl(data.url);
      toast.success('Áudio enviado com sucesso!');
      utils.album.tracks.invalidate();
    },
    onError: (e) => toast.error(`Erro no upload: ${e.message}`),
  });

  const uploadCover = trpc.tracks.uploadCover.useMutation({
    onSuccess: (data) => {
      setCoverUrl(data.url);
      toast.success('Capa enviada!');
      utils.album.tracks.invalidate();
    },
    onError: (e) => toast.error(`Erro no upload: ${e.message}`),
  });

  const uploadVideo = trpc.tracks.uploadVideo.useMutation({
    onSuccess: (data) => {
      setVideoUrl(data.url);
      toast.success('Vídeo enviado!');
      utils.album.tracks.invalidate();
    },
    onError: (e) => toast.error(`Erro no upload: ${e.message}`),
  });

  const setYoutube = trpc.tracks.setYoutube.useMutation({
    onSuccess: () => {
      toast.success('URL do YouTube salva!');
      utils.album.tracks.invalidate();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const generateCoverMutation = trpc.tracks.generateCover.useMutation({
    onSuccess: (data: { url: string | undefined }) => {
      setCoverUrl(data.url ?? '');
      setGeneratingCover(false);
      toast.success('Capa gerada com IA!');
      utils.album.tracks.invalidate();
    },
    onError: (e: { message: string }) => {
      setGeneratingCover(false);
      toast.error(`Erro ao gerar capa: ${e.message}`);
    },
  });

  const handleSave = () => {
    upsertTrack.mutate({
      id: track.id,
      trackNumber: track.trackNumber,
      title,
      composer,
      duration,
      lyrics,
      chords,
      briefing,
      syncedLyrics,
      isPublished,
    });
  };

  // Upload via multipart/form-data (mais robusto que base64 para arquivos grandes)
  const uploadFileMultipart = async (
    file: File,
    type: 'audio' | 'cover' | 'video',
    onSuccess: (url: string) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch(`/api/upload/${type}/${track.id}`, {
        method: 'POST',
        headers: { 'x-admin-token': '1234' },
        body: formData,
        credentials: 'include',
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || 'Upload falhou');
      }
      const data = await resp.json();
      onSuccess(data.url);
      utils.album.tracks.invalidate();
      utils.album.allTracks.invalidate();
    } catch (err) {
      toast.error(`Erro no upload: ${String(err)}`);
    }
  };

  const handleAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading('Enviando áudio...', { id: 'upload-audio' });
    uploadFileMultipart(file, 'audio', (url) => {
      setAudioUrl(url);
      toast.success('Áudio enviado com sucesso!', { id: 'upload-audio' });
    }).catch(() => toast.dismiss('upload-audio'));
    // Reset input para permitir re-upload do mesmo arquivo
    e.target.value = '';
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading('Enviando capa...', { id: 'upload-cover' });
    uploadFileMultipart(file, 'cover', (url) => {
      setCoverUrl(url);
      toast.success('Capa enviada!', { id: 'upload-cover' });
    }).catch(() => toast.dismiss('upload-cover'));
    e.target.value = '';
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading('Enviando vídeo...', { id: 'upload-video' });
    uploadFileMultipart(file, 'video', (url) => {
      setVideoUrl(url);
      toast.success('Vídeo enviado!', { id: 'upload-video' });
    }).catch(() => toast.dismiss('upload-video'));
    e.target.value = '';
  };

  const handleGenerateCover = () => {
    setGeneratingCover(true);
    generateCoverMutation.mutate({
      trackId: track.id,
      title,
      composer,
      briefing,
    });
  };

  const handleSaveYoutube = () => {
    if (!youtubeInput.trim()) return;
    setYoutube.mutate({ trackId: track.id, youtubeUrl: youtubeInput });
  };

  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.97 0.02 220)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-4 h-14 flex items-center justify-between"
        style={{ background: 'white', borderColor: 'oklch(0.88 0.08 200)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-70"
          style={{ color: 'oklch(0.45 0.12 220)' }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <span className="font-semibold text-sm" style={{ color: 'oklch(0.15 0.02 220)' }}>
          Faixa {track.trackNumber}: {title || 'Sem título'}
        </span>
        <button
          onClick={handleSave}
          disabled={upsertTrack.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
        >
          <Save size={14} /> Salvar
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Auto-save notice */}
        <div
          className="text-xs px-4 py-2 rounded-xl"
          style={{ background: 'oklch(0.96 0.04 50)', color: 'oklch(0.50 0.15 50)', border: '1px solid oklch(0.88 0.12 50)' }}
        >
          As alterações são salvas automaticamente e aparecem no player e no encarte em tempo real.
        </div>

        {/* Áudio do Player */}
        <SectionCard color="oklch(0.65 0.20 30)" icon={<Music size={16} />} title="Áudio do Player">
          {audioUrl ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'oklch(0.35 0.15 30)' }}>
                <CheckCircle2 size={16} />
                <span>Áudio carregado no player</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  disabled={uploadAudio.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-orange-50"
                  style={{ borderColor: 'oklch(0.65 0.20 30)', color: 'oklch(0.50 0.20 30)' }}
                >
                  <Upload size={12} /> Substituir
                </button>
                <button
                  onClick={() => setAudioUrl('')}
                  className="p-1.5 rounded-lg border transition-all hover:bg-red-50"
                  style={{ borderColor: 'oklch(0.80 0.15 27)', color: 'oklch(0.577 0.245 27)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm mb-3" style={{ color: 'oklch(0.55 0.10 220)' }}>
                Nenhum áudio carregado. Envie um arquivo WAV ou MP3.
              </p>
              <button
                onClick={() => audioInputRef.current?.click()}
                disabled={uploadAudio.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mx-auto border transition-all hover:bg-orange-50"
                style={{ borderColor: 'oklch(0.65 0.20 30)', color: 'oklch(0.50 0.20 30)' }}
              >
                <Upload size={14} />
                {uploadAudio.isPending ? 'Enviando...' : 'Enviar WAV / MP3'}
              </button>
            </div>
          )}
          <input ref={audioInputRef} type="file" accept=".wav,.mp3,audio/*" className="hidden" onChange={handleAudioFile} />
        </SectionCard>

        {/* Videoclipe */}
        <SectionCard color="oklch(0.50 0.20 260)" icon={<Video size={16} />} title="Videoclipe">
          {/* YouTube URL */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Youtube size={14} style={{ color: 'oklch(0.577 0.245 27)' }} />
              <span className="text-xs font-semibold" style={{ color: 'oklch(0.50 0.20 260)' }}>URL do YouTube</span>
            </div>
            <div className="flex gap-2">
              <input
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
              />
              <button
                onClick={handleSaveYoutube}
                disabled={setYoutube.isPending}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'oklch(0.50 0.20 260)', color: 'white' }}
              >
                Salvar
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.08 220)' }}>
              Cole o link do YouTube e clique Salvar. Aparece automaticamente na galeria de vídeos do site.
            </p>
          </div>

          {/* Upload de vídeo */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.50 0.20 260)' }}>Ou envie um arquivo de vídeo:</p>
            {videoUrl ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'oklch(0.95 0.04 260)' }}>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'oklch(0.35 0.15 260)' }}>
                  <CheckCircle2 size={16} />
                  <span>Vídeo carregado</span>
                </div>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadVideo.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={{ borderColor: 'oklch(0.50 0.20 260)', color: 'oklch(0.50 0.20 260)' }}
                >
                  <Upload size={12} /> Substituir
                </button>
              </div>
            ) : (
              <div
                className="text-center py-6 rounded-xl border-2 border-dashed"
                style={{ borderColor: 'oklch(0.80 0.10 260)' }}
              >
                <p className="text-sm mb-3" style={{ color: 'oklch(0.55 0.10 220)' }}>
                  Nenhum clipe carregado. Envie um arquivo MP4, MOV ou WebM.
                </p>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadVideo.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mx-auto transition-all hover:opacity-90"
                  style={{ background: 'oklch(0.50 0.20 260)', color: 'white' }}
                >
                  <Upload size={14} />
                  {uploadVideo.isPending ? 'Enviando...' : 'Enviar MP4 / MOV / WebM'}
                </button>
              </div>
            )}
            <input ref={videoInputRef} type="file" accept="video/*,.mp4,.mov,.webm" className="hidden" onChange={handleVideoFile} />
          </div>
        </SectionCard>

        {/* Nome, Compositor, Duração */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: 'white', border: '1px solid oklch(0.90 0.06 210)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold tracking-widest block mb-1" style={{ color: 'oklch(0.55 0.12 220)' }}>Nome da Faixa</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest block mb-1" style={{ color: 'oklch(0.55 0.12 220)' }}>Compositor(es)</label>
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold tracking-widest block mb-1" style={{ color: 'oklch(0.55 0.12 220)' }}>Duração</label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="3:45"
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span
                  className="text-sm font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: isPublished ? 'oklch(0.90 0.12 150)' : 'oklch(0.92 0.04 220)',
                    color: isPublished ? 'oklch(0.35 0.15 150)' : 'oklch(0.50 0.08 220)',
                  }}
                >
                  {isPublished ? '✓ Publicada' : 'Rascunho'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Capa da Faixa */}
        <SectionCard color="oklch(0.55 0.15 280)" icon={<FileText size={16} />} title="Capa da Faixa">
          <div className="flex gap-4 items-start">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Capa"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: 'oklch(0.92 0.06 280)' }}
              >
                <Music size={28} style={{ color: 'oklch(0.55 0.15 280)' }} />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <button
                onClick={handleGenerateCover}
                disabled={generatingCover || generateCoverMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'oklch(0.55 0.15 280)', color: 'white' }}
              >
                <Sparkles size={14} />
                {generatingCover ? 'Gerando com IA...' : 'Recriar Capa com IA'}
              </button>
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadCover.isPending}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border transition-all hover:bg-gray-50"
                style={{ borderColor: 'oklch(0.80 0.10 280)', color: 'oklch(0.45 0.15 280)' }}
              >
                <Upload size={12} /> Upload manual
              </button>
              {coverUrl && (
                <p className="text-xs truncate" style={{ color: 'oklch(0.60 0.08 220)' }}>{coverUrl}</p>
              )}
              <p className="text-xs" style={{ color: 'oklch(0.60 0.12 280)' }}>
                A IA gera uma capa baseada no nome, compositor e briefing da faixa. Pode levar 10-20 segundos.
              </p>
            </div>
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
        </SectionCard>

        {/* Briefing */}
        <SectionCard color="oklch(0.55 0.18 50)" icon={<FileText size={16} />} title="Briefing da Música">
          <textarea
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            rows={4}
            placeholder="Descrição da música, história por trás da composição, instruções para os músicos..."
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-y"
            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.08 220)' }}>
            Exibido no player ao clicar na faixa. Visível para todos os visitantes.
          </p>
        </SectionCard>

        {/* Cifra / Acordes */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: 'white', border: '1px solid oklch(0.90 0.06 210)' }}>
          <label className="text-sm font-semibold block" style={{ color: 'oklch(0.30 0.04 220)' }}>Cifra / Acordes</label>
          <textarea
            value={chords}
            onChange={(e) => setChords(e.target.value)}
            rows={5}
            placeholder="Cole aqui a cifra completa..."
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-y font-mono"
            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
          />
        </div>

        {/* Letra Completa */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: 'white', border: '1px solid oklch(0.90 0.06 210)' }}>
          <label className="text-sm font-semibold block" style={{ color: 'oklch(0.30 0.04 220)' }}>Letra Completa</label>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={8}
            placeholder="Cole a letra completa aqui..."
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-y"
            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
          />
        </div>

        {/* Letra Sincronizada (Karaokê) */}
        <SectionCard color="oklch(0.45 0.20 150)" icon={<Music size={16} />} title="Letra Sincronizada (Karaokê)">
          <div className="mb-3 space-y-1">
            <p className="text-xs" style={{ color: 'oklch(0.45 0.20 150)' }}>
              Cole a letra com timestamps no formato <code className="font-mono bg-green-50 px-1 rounded">[m:ss]</code> no início de cada linha.
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.45 0.20 150)' }}>
              Exemplo: <code className="font-mono bg-green-50 px-1 rounded">[0:15] Primeira linha da letra</code>
            </p>
            <p className="text-xs" style={{ color: 'oklch(0.45 0.20 150)' }}>
              O player destacará cada linha automaticamente enquanto a música toca.
            </p>
          </div>
          <textarea
            value={syncedLyrics}
            onChange={(e) => setSyncedLyrics(e.target.value)}
            rows={10}
            placeholder={`[0:00] Primeira linha\n[0:30] Segunda linha\n[0:37] Terceira linha...`}
            className="w-full px-3 py-2 rounded-xl border text-sm outline-none resize-y font-mono"
            style={{
              borderColor: 'oklch(0.75 0.15 150)',
              color: 'oklch(0.15 0.02 220)',
              background: 'oklch(0.97 0.03 150)',
            }}
          />
        </SectionCard>

        {/* Salvar */}
        <button
          onClick={handleSave}
          disabled={upsertTrack.isPending}
          className="w-full py-3 rounded-2xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
        >
          {upsertTrack.isPending ? 'Salvando...' : 'Salvar Todas as Alterações'}
        </button>
      </div>
    </div>
  );
}

// ─── Track List Item ───────────────────────────────────────────────────────────

function TrackListItem({
  track,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  track: TrackRow;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:shadow-sm transition-all"
      style={{ background: 'white', border: '1px solid oklch(0.90 0.06 210)' }}
      onClick={onEdit}
    >
      {track.coverUrl ? (
        <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
          style={{ background: 'oklch(0.92 0.08 210)', color: 'oklch(0.45 0.15 220)' }}
        >
          {track.trackNumber}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: 'oklch(0.15 0.02 220)' }}>
          {track.title || 'Sem título'}
        </p>
        <p className="text-xs truncate" style={{ color: 'oklch(0.55 0.10 220)' }}>
          {track.composer} {track.duration && `· ${track.duration}`}
        </p>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
          style={{ color: 'oklch(0.55 0.10 220)' }}
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
          style={{ color: 'oklch(0.55 0.10 220)' }}
        >
          <ArrowDown size={14} />
        </button>
        <div
          className={`w-2 h-2 rounded-full mx-1 ${track.isPublished ? '' : 'opacity-25'}`}
          style={{ background: 'oklch(0.55 0.15 150)' }}
          title={track.isPublished ? 'Publicada' : 'Rascunho'}
        />
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
          style={{ color: 'oklch(0.577 0.245 27)' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin ────────────────────────────────────────────────────────────────

type AdminTab = 'tracks' | 'musicians' | 'assets';

export default function Admin() {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  if (!isAuthed) return <PasswordGate onAuth={() => setIsAuthed(true)} />;
  return <AdminPanel onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setIsAuthed(false); }} />;
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>('tracks');
  const [editingTrack, setEditingTrack] = useState<TrackRow | null>(null);
  const utils = trpc.useUtils();

  const { data: tracks, refetch: refetchTracks } = trpc.album.allTracks.useQuery();
  const { data: musicians, refetch: refetchMusicians } = trpc.album.musicians.useQuery();

  const upsertTrack = trpc.tracks.upsert.useMutation({
    onSuccess: () => { refetchTracks(); utils.album.tracks.invalidate(); },
  });
  const deleteTrack = trpc.tracks.delete.useMutation({
    onSuccess: () => { toast.success('Faixa excluída.'); refetchTracks(); utils.album.tracks.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const reorderTracks = trpc.tracks.reorder.useMutation({
    onSuccess: () => { refetchTracks(); utils.album.tracks.invalidate(); },
  });
  const upsertMusician = trpc.musicians.upsert.useMutation({
    onSuccess: () => { toast.success('Músico salvo!'); refetchMusicians(); utils.album.musicians.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const deleteMusician = trpc.musicians.delete.useMutation({
    onSuccess: () => { toast.success('Músico excluído.'); refetchMusicians(); utils.album.musicians.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const handleAddTrack = () => {
    const maxNum = tracks ? Math.max(0, ...tracks.map((t) => t.trackNumber)) : 0;
    upsertTrack.mutate(
      { trackNumber: maxNum + 1, title: `Faixa ${maxNum + 1}`, composer: 'Eugênio Fim', isPublished: true },
      {
        onSuccess: () => {
          toast.success('Nova faixa criada!');
          refetchTracks();
        },
      }
    );
  };

  const handleMoveTrack = (idx: number, dir: 'up' | 'down') => {
    if (!tracks) return;
    const sorted = [...tracks].sort((a, b) => a.sortOrder - b.sortOrder);
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= sorted.length) return;
    const ids = sorted.map((t) => t.id);
    [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
    reorderTracks.mutate({ orderedIds: ids });
  };

  const sortedTracks = tracks ? [...tracks].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  // Musician forms
  const [musicianForms, setMusicianForms] = useState<{
    id?: number; name: string; role: string; instrument: string; bio: string; website: string; photoUrl?: string;
  }[]>([]);
  const [musicianExpanded, setMusicianExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (musicians && musicianForms.length === 0) {
      setMusicianForms(musicians.map((m) => ({
        id: m.id, name: m.name, role: m.role, instrument: m.instrument || '',
        bio: m.bio || '', website: m.website || '', photoUrl: m.photoUrl || '',
      })));
    }
  }, [musicians]);

  const tabs = [
    { key: 'tracks' as AdminTab, label: 'Faixas', icon: <Music size={16} /> },
    { key: 'musicians' as AdminTab, label: 'Músicos', icon: <Users size={16} /> },
    { key: 'assets' as AdminTab, label: 'Assets', icon: <FileText size={16} /> },
  ];

  // If editing a track, show the detail editor
  if (editingTrack) {
    return (
      <TrackDetailEditor
        track={editingTrack}
        onBack={() => { setEditingTrack(null); refetchTracks(); }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'oklch(0.97 0.02 220)' }}>
      <header
        className="sticky top-0 z-40 border-b px-4 h-14 flex items-center justify-between"
        style={{ background: 'white', borderColor: 'oklch(0.88 0.08 200)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.55 0.15 220)' }}
          >
            <Music size={16} color="white" />
          </div>
          <span className="font-bold" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>AÍO</span>
          <span className="text-xs" style={{ color: 'oklch(0.55 0.10 220)' }}>Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-gray-50"
            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.45 0.12 220)' }}
          >
            Ver Site
          </a>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all hover:bg-red-50"
            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.55 0.10 220)' }}
          >
            <LogOut size={12} /> Sair
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'oklch(0.92 0.06 210)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: tab === t.key ? 'white' : 'transparent',
                color: tab === t.key ? 'oklch(0.45 0.15 220)' : 'oklch(0.50 0.10 220)',
                boxShadow: tab === t.key ? '0 1px 4px oklch(0.75 0.12 220 / 0.15)' : 'none',
              }}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* FAIXAS */}
        {tab === 'tracks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>
                Faixas do Álbum
              </h2>
              <button
                onClick={handleAddTrack}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
              >
                <Plus size={14} /> Nova Faixa
              </button>
            </div>
            {sortedTracks.length === 0 ? (
              <div
                className="text-center py-12 rounded-xl border"
                style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'white' }}
              >
                <Music size={32} className="mx-auto mb-3" style={{ color: 'oklch(0.75 0.10 220)' }} />
                <p className="text-sm" style={{ color: 'oklch(0.55 0.10 220)' }}>
                  Nenhuma faixa. Clique em "Nova Faixa" para começar.
                </p>
              </div>
            ) : (
              sortedTracks.map((t, i) => (
                <TrackListItem
                  key={t.id}
                  track={t as TrackRow}
                  onEdit={() => setEditingTrack(t as TrackRow)}
                  onDelete={() => t.id && deleteTrack.mutate({ id: t.id })}
                  onMoveUp={() => handleMoveTrack(i, 'up')}
                  onMoveDown={() => handleMoveTrack(i, 'down')}
                  isFirst={i === 0}
                  isLast={i === sortedTracks.length - 1}
                />
              ))
            )}
          </div>
        )}

        {/* MÚSICOS */}
        {tab === 'musicians' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>
                Músicos
              </h2>
              <button
                onClick={() => {
                  setMusicianForms((f) => [...f, { name: '', role: '', instrument: '', bio: '', website: '' }]);
                  setMusicianExpanded(musicianForms.length);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
              >
                <Plus size={14} /> Novo Músico
              </button>
            </div>
            {musicianForms.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'oklch(0.88 0.08 200)', background: 'white' }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setMusicianExpanded(musicianExpanded === i ? null : i)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'oklch(0.92 0.08 210)', color: 'oklch(0.45 0.15 220)' }}
                  >
                    {m.name ? m.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'oklch(0.15 0.02 220)' }}>
                      {m.name || 'Novo Músico'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'oklch(0.55 0.10 220)' }}>
                      {m.instrument || m.role}
                    </p>
                  </div>
                  {musicianExpanded === i ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </div>
                {musicianExpanded === i && (
                  <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'oklch(0.92 0.06 210)' }}>
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      {[
                        { key: 'name', label: 'NOME' },
                        { key: 'instrument', label: 'INSTRUMENTO' },
                        { key: 'role', label: 'PAPEL' },
                        { key: 'website', label: 'WEBSITE' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label
                            className="text-xs font-semibold tracking-widest block mb-1"
                            style={{ color: 'oklch(0.55 0.12 220)' }}
                          >
                            {label}
                          </label>
                          <input
                            value={String((m as Record<string, unknown>)[key] ?? '')}
                            onChange={(e) => {
                              const u = [...musicianForms];
                              u[i] = { ...u[i], [key]: e.target.value };
                              setMusicianForms(u);
                            }}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                            style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label
                        className="text-xs font-semibold tracking-widest block mb-1"
                        style={{ color: 'oklch(0.55 0.12 220)' }}
                      >
                        BIO
                      </label>
                      <textarea
                        value={m.bio}
                        onChange={(e) => {
                          const u = [...musicianForms];
                          u[i] = { ...u[i], bio: e.target.value };
                          setMusicianForms(u);
                        }}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-y"
                        style={{ borderColor: 'oklch(0.88 0.08 200)', color: 'oklch(0.15 0.02 220)' }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => {
                          if (m.id) deleteMusician.mutate({ id: m.id });
                          setMusicianForms((f) => f.filter((_, j) => j !== i));
                        }}
                        className="flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg transition-all hover:bg-red-50"
                        style={{ color: 'oklch(0.577 0.245 27)' }}
                      >
                        <Trash2 size={13} /> Excluir
                      </button>
                      <button
                        onClick={() =>
                          upsertMusician.mutate({
                            id: m.id,
                            name: m.name,
                            role: m.role,
                            instrument: m.instrument,
                            bio: m.bio,
                            website: m.website,
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: 'oklch(0.55 0.15 220)', color: 'white' }}
                      >
                        <Save size={14} /> Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ASSETS */}
        {tab === 'assets' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'oklch(0.15 0.02 220)', fontFamily: "'Crimson Text', serif" }}>
              Assets do Álbum
            </h2>
            <AssetUploadCard
              type="pdf_songbook"
              label="Songbook PDF"
              description="Arquivo PDF com cifras e letras de todas as faixas"
              accept=".pdf"
            />
            <AssetUploadCard
              type="zip_album"
              label="Álbum WAV (ZIP)"
              description="Arquivo ZIP com todas as faixas em WAV 24bit"
              accept=".zip"
            />
            <AssetUploadCard
              type="pdf_dolby"
              label="Notas Dolby Atmos"
              description="PDF com informações sobre a mixagem Dolby Atmos"
              accept=".pdf"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Asset Upload Card ─────────────────────────────────────────────────────────

function AssetUploadCard({
  type,
  label,
  description,
  accept,
}: {
  type: 'pdf_songbook' | 'zip_album' | 'pdf_dolby';
  label: string;
  description: string;
  accept: string;
}) {
  const utils = trpc.useUtils();
  const { data: assets } = trpc.album.songbookAssets.useQuery();
  const existing = assets?.find((a) => a.type === type);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadAsset = trpc.songbook.uploadAsset.useMutation({
    onSuccess: () => { toast.success(`${label} enviado!`); utils.album.songbookAssets.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadAsset.mutate({ type, fileName: file.name, base64, mimeType: file.type, label });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="rounded-xl p-4 flex items-center justify-between gap-4"
      style={{ background: 'white', border: '1px solid oklch(0.90 0.06 210)' }}
    >
      <div>
        <p className="font-semibold text-sm" style={{ color: 'oklch(0.15 0.02 220)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.10 220)' }}>{description}</p>
        {existing && (
          <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.15 150)' }}>
            ✓ Arquivo carregado
          </p>
        )}
      </div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploadAsset.isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50 flex-shrink-0"
        style={{ borderColor: 'oklch(0.75 0.12 220)', color: 'oklch(0.45 0.12 220)' }}
      >
        <Upload size={14} />
        {uploadAsset.isPending ? 'Enviando...' : existing ? 'Substituir' : 'Upload'}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  );
}
