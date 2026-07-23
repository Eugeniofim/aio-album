import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  albumSettings,
  InsertMusician,
  InsertTrack,
  InsertVideoclipe,
  InsertUser,
  musicians,
  songbookAssets,
  tracks,
  users,
  videoclipes,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Tracks ──────────────────────────────────────────────────────────────────
export async function getAllTracks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tracks).orderBy(asc(tracks.sortOrder), asc(tracks.trackNumber));
}

export async function getPublishedTracks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tracks)
    .where(eq(tracks.isPublished, true))
    .orderBy(asc(tracks.sortOrder), asc(tracks.trackNumber));
}

export async function getTrackById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
  return result[0];
}

export async function upsertTrack(data: InsertTrack & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.id) {
    const { id, trackNumber, title, composer, ...rest } = data;
    // Only include non-undefined fields to avoid overwriting existing data
    const updatePayload: Record<string, unknown> = { updatedAt: new Date() };
    // Only update title/composer/trackNumber if they are non-empty strings
    if (title && title.trim()) updatePayload.title = title;
    if (composer && composer.trim()) updatePayload.composer = composer;
    if (trackNumber && trackNumber > 0) updatePayload.trackNumber = trackNumber;
    // For all other fields, include if not undefined
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) updatePayload[k] = v;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(tracks).set(updatePayload as any).where(eq(tracks.id, id));
    return id;
  } else {
    const result = await db.insert(tracks).values(data).returning({ id: tracks.id });
    return result[0]?.id as number;
  }
}

export async function deleteTrack(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tracks).where(eq(tracks.id, id));
}

export async function reorderTracks(orderedIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < orderedIds.length; i++) {
    await db.update(tracks).set({ sortOrder: i, trackNumber: i + 1 }).where(eq(tracks.id, orderedIds[i]));
  }
}

// ─── Musicians ───────────────────────────────────────────────────────────────
export async function getAllMusicians() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(musicians).orderBy(asc(musicians.sortOrder));
}

export async function upsertMusician(data: InsertMusician & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(musicians).set({ ...rest, updatedAt: new Date() }).where(eq(musicians.id, id));
    return id;
  } else {
    const result = await db.insert(musicians).values(data).returning({ id: musicians.id });
    return result[0]?.id as number;
  }
}

export async function deleteMusician(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(musicians).where(eq(musicians.id, id));
}

// ─── Videoclipes ─────────────────────────────────────────────────────────────
export async function getAllVideoclipes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoclipes).orderBy(asc(videoclipes.sortOrder));
}

export async function upsertVideoclipe(data: InsertVideoclipe & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (data.id) {
    const { id, ...rest } = data;
    await db.update(videoclipes).set({ ...rest, updatedAt: new Date() }).where(eq(videoclipes.id, id));
    return id;
  } else {
    const result = await db.insert(videoclipes).values(data).returning({ id: videoclipes.id });
    return result[0]?.id as number;
  }
}

export async function deleteVideoclipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(videoclipes).where(eq(videoclipes.id, id));
}

// ─── Album Settings ──────────────────────────────────────────────────────────
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(albumSettings).where(eq(albumSettings.key, key)).limit(1);
  return result[0]?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(albumSettings).values({ key, value }).onConflictDoUpdate({
    target: albumSettings.key,
    set: { value, updatedAt: new Date() },
  });
}

// ─── Songbook Assets ──────────────────────────────────────────────────────────
export async function getAllSongbookAssets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(songbookAssets);
}

export async function upsertSongbookAsset(
  type: "pdf_songbook" | "zip_album" | "pdf_dolby",
  fileKey: string,
  fileUrl: string,
  label: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(songbookAssets).values({ type, fileKey, fileUrl, label })
    .onConflictDoUpdate({
      target: songbookAssets.type,
      set: { fileKey, fileUrl, label, updatedAt: new Date() },
    });
}
