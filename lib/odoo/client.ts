const ODOO_URL = process.env.ODOO_URL?.replace(/\/+$/, "");
const ODOO_DB = process.env.ODOO_DB;
const ODOO_API_KEY = process.env.ODOO_API_KEY;

export class OdooError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "OdooError";
    this.status = status;
  }
}

function assertConfigured() {
  if (!ODOO_URL) throw new OdooError("ODOO_URL is not configured.");
  if (!ODOO_API_KEY) throw new OdooError("ODOO_API_KEY is not configured.");
}

type Json2Envelope = {
  result?: unknown;
  error?: { message?: string };
  name?: string;
  message?: string;
  arguments?: unknown;
};

async function odooRequest<T>(
  model: string,
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  assertConfigured();

  const res = await fetch(`${ODOO_URL}/json/2/${model}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `bearer ${ODOO_API_KEY}`,
      ...(ODOO_DB ? { "X-Odoo-Database": ODOO_DB } : {}),
      "User-Agent": "compulink-eshop",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let reason = "";
    try {
      const parsed = JSON.parse(detail) as Json2Envelope;
      reason = parsed.message || parsed?.error?.message || "";
    } catch {
      reason = detail.slice(0, 200);
    }
    throw new OdooError(
      `Odoo ${model}.${method} failed (HTTP ${res.status})${reason ? `: ${reason}` : ""}`,
      res.status
    );
  }

  // JSON-2 returns the bare result on success; errors come back as an envelope.
  const raw = (await res.json()) as unknown;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const asEnvelope = raw as Json2Envelope;
    if (asEnvelope.error || asEnvelope.arguments) {
      throw new OdooError(
        `Odoo ${model}.${method} rejected: ${
          asEnvelope.error?.message || asEnvelope.message || "unknown error"
        }`
      );
    }
    if ("result" in asEnvelope) {
      return asEnvelope.result as T;
    }
  }

  return raw as T;
}

export type SearchReadOptions = {
  offset?: number;
  limit?: number;
  order?: string;
  context?: Record<string, unknown>;
};

export async function odooSearchRead<T extends Record<string, unknown>>(
  model: string,
  domain: unknown[][],
  fields: string[],
  options: SearchReadOptions = {}
): Promise<T[]> {
  return odooRequest<T[]>(model, "search_read", {
    domain,
    fields,
    offset: options.offset ?? 0,
    limit: options.limit ?? 100,
    order: options.order ?? "id",
    ...(options.context ? { context: options.context } : {}),
  });
}

export async function odooSearchReadAll<T extends Record<string, unknown>>(
  model: string,
  domain: unknown[][],
  fields: string[],
  pageSize = 100
): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  while (true) {
    const batch = await odooSearchRead<T>(model, domain, fields, {
      offset,
      limit: pageSize,
      order: "id",
    });
    all.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

export async function odooCount(
  model: string,
  domain: unknown[][],
  context?: Record<string, unknown>
): Promise<number> {
  return odooRequest<number>(model, "search_count", {
    domain,
    ...(context ? { context } : {}),
  });
}

let VERSION_CACHE:
  | { server_version: string; server_serie: string }
  | null
  | undefined;

export async function odooServerVersion(): Promise<{
  server_version: string;
  server_serie: string;
} | null> {
  if (VERSION_CACHE || VERSION_CACHE === null) return VERSION_CACHE;
  if (!ODOO_URL) return null;

  try {
    const res = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: { service: "common", method: "version", args: [] },
        id: 1,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: { server_version?: string; server_serie?: string };
    };
    VERSION_CACHE = {
      server_version: data?.result?.server_version || "unknown",
      server_serie: data?.result?.server_serie || "unknown",
    };
    return VERSION_CACHE;
  } catch {
    VERSION_CACHE = null;
    return null;
  }
}