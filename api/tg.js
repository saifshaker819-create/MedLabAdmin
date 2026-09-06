/* اختياري — وسيط تيليغرام على Vercel
   الفائدة: التوكن يبقى بمتغيرات البيئة على السيرفر ولا ينزل للمتصفح أبداً.
   الاستعمال: ارفع هذا الملف بمجلد api/ ثم أضف بإعدادات Vercel:
     TG_TOKEN = توكن البوت
     TG_CHAT  = الـ Chat ID (اختياري، يصير الافتراضي)
   وبعدها بلوحة التحكم → 📨 → خيارات متقدمة → رابط وسيط:  /api/tg
*/
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, description: 'POST only' });

  const token = process.env.TG_TOKEN;
  if (!token) return res.status(500).json({ ok: false, description: 'التوكن غير مضبوط بالإعدادات' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const chat_id = body.chat_id || process.env.TG_CHAT;
  if (!chat_id) return res.status(400).json({ ok: false, description: 'الايدي ناقص' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: String(body.text || '').slice(0, 4000),
        parse_mode: body.parse_mode || 'HTML',
        disable_web_page_preview: true
      })
    });
    const j = await r.json();
    return res.status(r.ok ? 200 : 502).json(j);
  } catch (e) {
    return res.status(502).json({ ok: false, description: String(e && e.message || e) });
  }
}
