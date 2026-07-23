/**
 * Tests for AÍO album routers — tracks, musicians, videoclipes, settings
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock db helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllTracks: vi.fn().mockResolvedValue([]),
  getPublishedTracks: vi.fn().mockResolvedValue([]),
  getTrackById: vi.fn().mockResolvedValue(undefined),
  upsertTrack: vi.fn().mockResolvedValue(1),
  deleteTrack: vi.fn().mockResolvedValue(undefined),
  reorderTracks: vi.fn().mockResolvedValue(undefined),
  getAllMusicians: vi.fn().mockResolvedValue([]),
  upsertMusician: vi.fn().mockResolvedValue(1),
  deleteMusician: vi.fn().mockResolvedValue(undefined),
  getAllVideoclipes: vi.fn().mockResolvedValue([]),
  upsertVideoclipe: vi.fn().mockResolvedValue(1),
  deleteVideoclipe: vi.fn().mockResolvedValue(undefined),
  getAllSongbookAssets: vi.fn().mockResolvedValue([]),
  upsertSongbookAsset: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue(null),
  setSetting: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "/manus-storage/test-key" }),
}));

// ─── Context factories ────────────────────────────────────────────────────────
function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@aio.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@aio.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("album.tracks (public)", () => {
  it("returns published tracks for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.album.tracks();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns musicians for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.album.musicians();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns videoclipes for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.album.videoclipes();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns settings for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.album.settings();
    expect(result).toHaveProperty("quote");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("subtitle");
  });
});

describe("tracks (admin only)", () => {
  it("allows admin to upsert a track", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.tracks.upsert({
      trackNumber: 1,
      title: "Tema do Vento",
      composer: "Eugênio Fim",
      duration: "3:45",
      isPublished: true,
    });
    expect(result).toBeDefined();
  });

  it("blocks non-admin from upserting a track", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.tracks.upsert({ trackNumber: 1, title: "Test", composer: "Test" })
    ).rejects.toThrow();
  });

  it("blocks unauthenticated from upserting a track", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.tracks.upsert({ trackNumber: 1, title: "Test", composer: "Test" })
    ).rejects.toThrow();
  });

  it("allows admin to get all tracks (including unpublished)", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.album.allTracks();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("musicians (admin only)", () => {
  it("allows admin to upsert a musician", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.musicians.upsert({
      name: "Eugênio Fim",
      role: "Violão Baixo / Rabeca",
      instrument: "Violão Baixo",
      bio: "Compositor e multi-instrumentista.",
    });
    expect(result).toBeDefined();
  });

  it("blocks non-admin from upserting a musician", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.musicians.upsert({ name: "Test", role: "Test" })
    ).rejects.toThrow();
  });
});

describe("videoclipes (admin only)", () => {
  it("allows admin to upsert a videoclipe with YouTube URL", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.videoclipes.upsert({
      title: "Tema do Vento",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: "disponivel",
    });
    expect(result).toBeDefined();
  });

  it("blocks non-admin from upserting a videoclipe", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.videoclipes.upsert({ title: "Test" })
    ).rejects.toThrow();
  });
});

describe("settings (admin only)", () => {
  it("allows admin to set a setting", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.settings.set({ key: "quote", value: "A ancestralidade do som..." });
    expect(result).toBeUndefined();
  });

  it("blocks non-admin from setting a setting", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.settings.set({ key: "quote", value: "Test" })
    ).rejects.toThrow();
  });
});
