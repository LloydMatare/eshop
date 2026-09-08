import { put } from "@vercel/blob";

const BLOB_PREFIX = "odoo/";

function contentHash(base64: string): string {
  let hash = 5381;
  for (let i = 0; i < base64.length; i += 1024) {
    hash = ((hash * 33) ^ base64.charCodeAt(i)) >>> 0;
  }
  return Math.abs(hash).toString(36);
}

function parseBase64(base64: string): {
  mime: string;
  ext: string;
  buffer: Buffer;
} | null {
  if (!base64 || base64.length < 64) return null;

  const mimeMatch = base64.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,/);
  const mime = mimeMatch ? mimeMatch[1].toLowerCase() : "png";
  const ext = mime === "jpeg" || mime === "jpg" ? "jpg" : mime;

  const b64 = mimeMatch ? base64.slice(base64.indexOf(",") + 1) : base64;
  try {
    return { mime, ext, buffer: Buffer.from(b64, "base64") };
  } catch {
    return null;
  }
}

export function imageFingerprint(base64: string): {
  hash: string;
  ext: string;
} | null {
  const parsed = parseBase64(base64);
  if (!parsed) return null;
  return { hash: contentHash(base64), ext: parsed.ext };
}

export function buildImageUrl(input: {
  odooId: number;
  slug: string;
  base64: string;
}): string | null {
  const fingerprint = imageFingerprint(input.base64);
  if (!fingerprint) return null;
  return `${BLOB_PREFIX}${input.odooId}-${input.slug}-${fingerprint.hash}.${fingerprint.ext}`;
}

export async function uploadProductImage(input: {
  odooId: number;
  slug: string;
  base64: string;
}): Promise<string | null> {
  const parsed = parseBase64(input.base64);
  if (!parsed) return null;
  const hash = contentHash(input.base64);
  const pathname = `${BLOB_PREFIX}${input.odooId}-${input.slug}-${hash}.${parsed.ext}`;

  try {
    const blob = await put(pathname, parsed.buffer, {
      access: "public",
      contentType: `image/${parsed.ext}`,
      addRandomSuffix: false,
    });
    return blob.url;
  } catch {
    return null;
  }
}