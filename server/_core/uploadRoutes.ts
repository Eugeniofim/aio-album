import { Express, Request, Response } from "express";
import multer from "multer";
import { storagePut } from "../storage";
import { upsertTrack } from "../db";
import { ENV } from "./env";

// Sanitiza nome de arquivo: remove espaços e caracteres especiais que causam 403 no S3/CloudFront
function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9._-]/g, "-") // substitui caracteres especiais por hífen
    .replace(/-+/g, "-") // colapsa múltiplos hífens
    .replace(/^-|-$/g, ""); // remove hífens no início/fim
}

// Multer com armazenamento em memória (sem disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

function verifyAdminToken(req: Request, res: Response): boolean {
  const token = req.headers["x-admin-token"];
  const adminPassword = ENV.adminPassword || "1234";
  if (token !== adminPassword) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function registerUploadRoutes(app: Express) {
  // Upload de áudio
  app.post(
    "/api/upload/audio/:trackId",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!verifyAdminToken(req, res)) return;
      try {
        const trackId = parseInt(req.params.trackId);
        if (!req.file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }
        const safeName = sanitizeFileName(req.file.originalname);
        const key = `tracks/audio/${trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
        await upsertTrack({
          id: trackId,
          trackNumber: 0,
          title: "",
          composer: "",
          audioKey: key,
          audioUrl: url,
        });
        res.json({ key, url });
      } catch (err) {
        console.error("[Upload Audio]", err);
        res.status(500).json({ error: String(err) });
      }
    }
  );

  // Upload de capa
  app.post(
    "/api/upload/cover/:trackId",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!verifyAdminToken(req, res)) return;
      try {
        const trackId = parseInt(req.params.trackId);
        if (!req.file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }
        const safeName = sanitizeFileName(req.file.originalname);
        const key = `tracks/covers/${trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
        await upsertTrack({
          id: trackId,
          trackNumber: 0,
          title: "",
          composer: "",
          coverKey: key,
          coverUrl: url,
        });
        res.json({ key, url });
      } catch (err) {
        console.error("[Upload Cover]", err);
        res.status(500).json({ error: String(err) });
      }
    }
  );

  // Upload de vídeo
  app.post(
    "/api/upload/video/:trackId",
    upload.single("file"),
    async (req: Request, res: Response) => {
      if (!verifyAdminToken(req, res)) return;
      try {
        const trackId = parseInt(req.params.trackId);
        if (!req.file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }
        const safeName = sanitizeFileName(req.file.originalname);
        const key = `tracks/videos/${trackId}-${Date.now()}-${safeName}`;
        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
        await upsertTrack({
          id: trackId,
          trackNumber: 0,
          title: "",
          composer: "",
          videoKey: key,
          videoUrl: url,
        });
        res.json({ key, url });
      } catch (err) {
        console.error("[Upload Video]", err);
        res.status(500).json({ error: String(err) });
      }
    }
  );
}
