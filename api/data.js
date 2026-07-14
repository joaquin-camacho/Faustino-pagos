const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!res.ok) throw new Error('No se pudo leer de la base de datos.');
  const data = await res.json();
  return data.result;
}

async function kvSet(key, value) {
  const res = await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error('No se pudo escribir en la base de datos.');
  return res.json();
}

export default async function handler(req, res) {
  try {
    if (!KV_URL || !KV_TOKEN) {
      return res.status(500).json({ error: 'Falta conectar la base de datos (Storage) en Vercel.' });
    }

    if (req.method === 'GET') {
      const raw = await kvGet('trans');
      const trans = raw ? JSON.parse(raw) : [];
      return res.status(200).json({ trans });
    }

    if (req.method === 'POST') {
      const pin = req.headers['x-app-pin'];
      const expected = process.env.APP_PIN;

      if (!expected) {
        return res.status(500).json({ error: 'APP_PIN no configurado en el servidor.' });
      }
      if (!pin || pin !== expected) {
        return res.status(401).json({ error: 'PIN incorrecto.' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { trans } = body || {};
      if (!Array.isArray(trans)) {
        return res.status(400).json({ error: 'Formato de datos invalido.' });
      }

      await kvSet('trans', JSON.stringify(trans));
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metodo no permitido.' });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor: ' + err.message });
  }
}
