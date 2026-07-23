-- Schema
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE videoclipe_status AS ENUM ('em_producao', 'disponivel', 'em_breve');
CREATE TYPE songbook_asset_type AS ENUM ('pdf_songbook', 'zip_album', 'pdf_dolby');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role role NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE album_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(128) NOT NULL UNIQUE,
  value TEXT,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  "trackNumber" INTEGER NOT NULL,
  title VARCHAR(256) NOT NULL,
  composer VARCHAR(256) NOT NULL,
  duration VARCHAR(16) DEFAULT '0:00',
  lyrics TEXT,
  chords TEXT,
  briefing TEXT,
  "syncedLyrics" TEXT,
  "youtubeUrl" VARCHAR(512),
  "youtubeId" VARCHAR(64),
  "videoKey" VARCHAR(512),
  "videoUrl" VARCHAR(1024),
  "audioKey" VARCHAR(512),
  "audioUrl" VARCHAR(1024),
  "coverKey" VARCHAR(512),
  "coverUrl" VARCHAR(1024),
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE musicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  role VARCHAR(256) NOT NULL,
  instrument VARCHAR(128),
  bio TEXT,
  "photoKey" VARCHAR(512),
  "photoUrl" VARCHAR(1024),
  website VARCHAR(512),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE videoclipes (
  id SERIAL PRIMARY KEY,
  "trackId" INTEGER,
  title VARCHAR(256) NOT NULL,
  composer VARCHAR(256),
  "youtubeUrl" VARCHAR(512),
  "youtubeId" VARCHAR(64),
  "thumbnailUrl" VARCHAR(1024),
  status videoclipe_status NOT NULL DEFAULT 'em_producao',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE songbook_assets (
  id SERIAL PRIMARY KEY,
  type songbook_asset_type NOT NULL UNIQUE,
  "fileKey" VARCHAR(512),
  "fileUrl" VARCHAR(1024),
  label VARCHAR(256),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
