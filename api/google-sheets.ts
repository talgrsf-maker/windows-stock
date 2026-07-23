/** Vercel same-origin proxy. Store both values only in Vercel environment variables. */
declare const process: { env: Record<string, string | undefined> };
export default async function handler(req: { method?: string; query?: Record<string, string>; body?: unknown }, res: { status: (n: number) => { json: (b: unknown) => void } }) {
  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  const token = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
  if (!endpoint || !token) return res.status(500).json({ ok: false, error: 'Google Sheets אינו מוגדר בשרת.' });
  const action = req.method === 'GET' ? req.query?.action : (req.body as { action?: string } | undefined)?.action;
  try {
    const target = action === 'load' ? `${endpoint}?action=load&token=${encodeURIComponent(token)}` : endpoint;
    const body = req.method === 'GET' ? undefined : JSON.stringify({ ...(req.body as object), token });
    const upstream = await fetch(target, body ? { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body } : undefined);
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch { return res.status(502).json({ ok: false, error: 'לא ניתן להגיע לשירות Google Sheets.' }); }
}
