import { isAuthed, notFound404 } from "../../../lib/auth";
import { getConfig, saveConfig } from "../../../lib/config";
import { headerOk, webhookTargetOk } from "../../../lib/webhook";
export const dynamic = "force-dynamic";
// One-time webhook setup, done by the USER in the browser (cookie required). The bot never sees these values.
// GET -> { configured }   POST { url, key, header? } -> { ok, configured }. Never echoes a value back.
export async function GET() {
  if (!(await isAuthed())) return notFound404();
  const c = await getConfig();
  return Response.json({ configured: !!(c.url && c.key && webhookTargetOk(c.url)) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: Request) {
  if (!(await isAuthed())) return notFound404();
  let b: any = null;
  try { b = await req.json(); } catch {}
  const url = String(b?.url || "").trim();
  const key = String(b?.key || "").trim();
  const header = String(b?.header || "").trim() || "Authorization";
  if (!webhookTargetOk(url)) return Response.json({ ok: false, error: "The webhook URL must be https:// on a public host" }, { status: 400 });
  if (key.length < 8 || key.length > 4000 || /\s/.test(key)) return Response.json({ ok: false, error: "The sender key looks wrong" }, { status: 400 });
  if (!headerOk(header)) return Response.json({ ok: false, error: "Bad header name" }, { status: 400 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ ok: false, error: "Storage is not connected" }, { status: 503 });
  await saveConfig({ url, key, header });
  return Response.json({ ok: true, configured: true });
}
