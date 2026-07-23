import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Album Settings ──────────────────────────────────────────────────────────
export const albumSettings = pgTable("album_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AlbumSetting = typeof albumSettings.$inferSelect;

// ─── Tracks ──────────────────────────────────────────────────────────────────
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  trackNumber: integer("trackNumber").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  composer: varchar("composer", { length: 256 }).notNull(),
  duration: varchar("duration", { length: 16 }).default("0:00"),
  lyrics: text("lyrics"),
  chords: text("chords"),
  briefing: text("briefing"),
  syncedLyrics: text("syncedLyrics"),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  youtubeId: varchar("youtubeId", { length: 64 }),
  videoKey: varchar("videoKey", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 1024 }),
  audioKey: varchar("audioKey", { length: 512 }),
  audioUrl: varchar("audioUrl", { length: 1024 }),
  coverKey: varchar("coverKey", { length: 512 }),
  coverUrl: varchar("coverUrl", { length: 1024 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

// ─── Musicians ───────────────────────────────────────────────────────────────
export const musicians = pgTable("musicians", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  role: varchar("role", { length: 256 }).notNull(),
  instrument: varchar("instrument", { length: 128 }),
  bio: text("bio"),
  photoKey: varchar("photoKey", { length: 512 }),
  photoUrl: varchar("photoUrl", { length: 1024 }),
  website: varchar("website", { length: 512 }),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Musician = typeof musicians.$inferSelect;
export type InsertMusician = typeof musicians.$inferInsert;

// ─── Videoclipes ─────────────────────────────────────────────────────────────
export const videoclipeStatusEnum = pgEnum("videoclipe_status", ["em_producao", "disponivel", "em_breve"]);

export const videoclipes = pgTable("videoclipes", {
  id: serial("id").primaryKey(),
  trackId: integer("trackId"),
  title: varchar("title", { length: 256 }).notNull(),
  composer: varchar("composer", { length: 256 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  youtubeId: varchar("youtubeId", { length: 64 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1024 }),
  status: videoclipeStatusEnum("status").default("em_producao").notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Videoclipe = typeof videoclipes.$inferSelect;
export type InsertVideoclipe = typeof videoclipes.$inferInsert;

// ─── Songbook Assets ──────────────────────────────────────────────────────────
export const songbookAssetTypeEnum = pgEnum("songbook_asset_type", ["pdf_songbook", "zip_album", "pdf_dolby"]);

export const songbookAssets = pgTable("songbook_assets", {
  id: serial("id").primaryKey(),
  type: songbookAssetTypeEnum("type").notNull().unique(),
  fileKey: varchar("fileKey", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 1024 }),
  label: varchar("label", { length: 256 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SongbookAsset = typeof songbookAssets.$inferSelect;
