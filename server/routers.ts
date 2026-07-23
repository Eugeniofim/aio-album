import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { localAdminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  deleteMusician,
  deleteTrack,
  deleteVideoclipe,
  getAllMusicians,
  getAllSongbookAssets,
  getAllTracks,
  getAllVideoclipes,
  getPublishedTracks,
  getSetting,
  getTrackById,
  reorderTracks,
  setSetting,
  upsertMusician,
  upsertSongbookAsset,
  upsertTrack,
  upsertVideoclipe,
} from "./db";
import { storagePut } from "./storage";

const adminProcedure = localAdminProcedure;

// Sanitiza nome de arquivo: remove espaços e caracteres especiais que causam 403 no S3/CloudFront
function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, '-') // substitui caracteres especiais por hífen
    .replace(/-+/g, '-') // colapsa múltiplos hífens
    .replace(/^-|-$/g, ''); // remove hífens no início/fim
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  album: router({
    tracks: publicProcedure.query(() => getPublishedTracks()),
    allTracks: adminProcedure.query(() => getAllTracks()),
    musicians: publicProcedure.query(() => getAllMusicians()),
    videoclipes: publicProcedure.query(() => getAllVideoclipes()),
    songbookAssets: publicProcedure.query(() => getAllSongbookAssets()),
    settings: publicProcedure.query(async () => {
      const [quote, description, subtitle] = await Promise.all([
        getSetting("quote"),
        getSetting("description"),
        getSetting("subtitle"),
      ]);
      return { quote, description, subtitle };
    }),
  }),

  tracks: router({
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        trackNumber: z.number(),
        title: z.string().min(1),
        composer: z.string().min(1),
        duration: z.string().optional(),
        lyrics: z.string().optional(),
        chords: z.string().optional(),
        briefing: z.string().optional(),
        syncedLyrics: z.string().optional(),
        youtubeUrl: z.string().optional(),
        youtubeId: z.string().optional(),
        videoKey: z.string().optional(),
        videoUrl: z.string().optional(),
        audioKey: z.string().optional(),
        audioUrl: z.string().optional(),
        coverKey: z.string().optional(),
        coverUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => upsertTrack(input)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTrack(input.id)),

    reorder: adminProcedure
      .input(z.object({ orderedIds: z.array(z.number()) }))
      .mutation(({ input }) => reorderTracks(input.orderedIds)),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTrackById(input.id)),

    uploadAudio: adminProcedure
      .input(z.object({
        trackId: z.number(),
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const safeName = sanitizeFileName(input.fileName);
        const key = `tracks/audio/${input.trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertTrack({ id: input.trackId, trackNumber: 0, title: "", composer: "", audioKey: key, audioUrl: url });
        return { key, url };
      }),

    uploadCover: adminProcedure
      .input(z.object({
        trackId: z.number(),
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const safeName = sanitizeFileName(input.fileName);
        const key = `tracks/covers/${input.trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertTrack({ id: input.trackId, trackNumber: 0, title: "", composer: "", coverKey: key, coverUrl: url });
        return { key, url };
      }),

    uploadVideo: adminProcedure
      .input(z.object({
        trackId: z.number(),
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const safeName = sanitizeFileName(input.fileName);
        const key = `tracks/videos/${input.trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertTrack({ id: input.trackId, trackNumber: 0, title: "", composer: "", videoKey: key, videoUrl: url });
        return { key, url };
      }),

    setYoutube: adminProcedure
      .input(z.object({ trackId: z.number(), youtubeUrl: z.string() }))
      .mutation(async ({ input }) => {
        const youtubeId = extractYoutubeId(input.youtubeUrl) ?? undefined;
        await upsertTrack({ id: input.trackId, trackNumber: 0, title: "", composer: "", youtubeUrl: input.youtubeUrl, youtubeId });
        return { youtubeId };
      }),

    generateCover: adminProcedure
      .input(z.object({
        trackId: z.number(),
        title: z.string(),
        composer: z.string().optional(),
        briefing: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");
        const prompt = `Album cover art for the Brazilian song "${input.title}" by ${input.composer || 'Eugênio Fim'}. Viola caipira, percussion, bass. Aquatic minimalism, cyan tones, geometric shapes, folk art. ${input.briefing || ''}`.trim();
        const { url } = await generateImage({ prompt });
        await upsertTrack({ id: input.trackId, trackNumber: 0, title: "", composer: "", coverUrl: url });
        return { url };
      }),
  }),

  musicians: router({
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        role: z.string().min(1),
        instrument: z.string().optional(),
        bio: z.string().optional(),
        photoKey: z.string().optional(),
        photoUrl: z.string().optional(),
        website: z.string().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => upsertMusician(input)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteMusician(input.id)),

    uploadPhoto: adminProcedure
      .input(z.object({
        musicianId: z.number(),
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `musicians/${input.musicianId}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertMusician({ id: input.musicianId, name: "", role: "", photoKey: key, photoUrl: url });
        return { key, url };
      }),
  }),

  videoclipes: router({
    upsert: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        trackId: z.number().optional(),
        title: z.string().min(1),
        composer: z.string().optional(),
        youtubeUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        status: z.enum(["em_producao", "disponivel", "em_breve"]).optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const youtubeId = input.youtubeUrl ? (extractYoutubeId(input.youtubeUrl) ?? undefined) : undefined;
        const thumbnailUrl = youtubeId
          ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
          : input.thumbnailUrl;
        return upsertVideoclipe({ ...input, youtubeId, thumbnailUrl });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteVideoclipe(input.id)),
  }),

  settings: router({
    set: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(({ input }) => setSetting(input.key, input.value)),
  }),

  songbook: router({
    uploadAsset: adminProcedure
      .input(z.object({
        type: z.enum(["pdf_songbook", "zip_album", "pdf_dolby"]),
        fileName: z.string(),
        base64: z.string(),
        mimeType: z.string(),
        label: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `songbook/${input.type}-${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertSongbookAsset(input.type, key, url, input.label);
        return { key, url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
