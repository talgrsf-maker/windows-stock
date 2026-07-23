/** Vercel same-origin proxy. Store both values only in Vercel environment variables. */
declare const process: { env: Record<string, string | undefined> };
export default async function handler(req: { method?: string; query?: Record<string, string>; body?: unknown }, res: { status: (n: number) => { json: (b: unknown) => void } }) {
  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  const serviceToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
  const adminPassword = process.env.APP_ACCESS_PASSWORD;
  const userPins = JSON.parse(process.env.INVENTORY_USER_PINS ?? '{}') as Record<string, string>;
  if (!endpoint || !serviceToken) return res.status(500).json({ ok: false, error: 'Google Sheets אינו מוגדר בשרת.' });
  const headers = (req as { headers?: Record<string, string | undefined> }).headers ?? {};
  const userId = headers['x-inventory-user-id'];
  const pin = headers['x-inventory-user-pin'];
  const roles: Record<string, string> = { u1: 'viewer', u2: 'bending_manager', u3: 'windows_manager', u4: 'admin' };
  const expectedPin = userId === 'u4' ? adminPassword : userId ? userPins[userId] : undefined;
  if (!expectedPin || pin !== expectedPin || !userId || !roles[userId]) return res.status(401).json({ ok: false, error: 'קוד הגישה שגוי.' });
  const action = req.method === 'GET' ? req.query?.action : (req.body as { action?: string } | undefined)?.action;
  const payload = (req.body as { payload?: { createdBy?: string; userRole?: string } } | undefined)?.payload;
  if (action === 'addEvent' && (payload?.createdBy !== userId || payload.userRole !== roles[userId])) return res.status(403).json({ ok: false, error: 'אין הרשאה לדווח בשם משתמש אחר.' });
  if ((action === 'saveStore' || action === 'reset') && roles[userId] !== 'admin') return res.status(403).json({ ok: false, error: 'פעולה זו זמינה למנהל מערכת בלבד.' });
  try {
    const target = action === 'load' ? `${endpoint}?action=load&token=${encodeURIComponent(serviceToken)}` : endpoint;
    const body = req.method === 'GET' ? undefined : JSON.stringify({ ...(req.body as object), token: serviceToken });
    const upstream = await fetch(target, body ? { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body } : undefined);
    const data = await upstream.json();
    return res.status(upstream.ok ? 200 : 502).json(data);
  } catch { return res.status(502).json({ ok: false, error: 'לא ניתן להגיע לשירות Google Sheets.' }); }
}
