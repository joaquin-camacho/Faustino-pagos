const BLOB_API_URL = 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';
const MAX_BYTES = 2 * 1024 * 1024; // 2MB de archivo (~2.7MB en base64, con margen del limite de 4.5MB de Vercel)

function parseStoreId(token) {
  const parts = (token || '').split('_');
  return parts[3] || '';
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Metodo no permitido.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { pin, filename, contentType, dataBase64 } = body || {};

    if (!pin || pin !== process.env.APP_PIN) {
      return res.status(401).json({ error: 'PIN incorrecto.' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'Falta configurar BLOB_READ_WRITE_TOKEN en el servidor.' });
    }
    if (!dataBase64) {
      return res.status(400).json({ error: 'Falta el archivo.' });
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    if (buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'El archivo es muy pesado (maximo 4MB).' });
    }

    const storeId = parseStoreId(token);
    const safeName = (filename || 'comprobante').replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = 'comprobantes/' + Date.now() + '-' + safeName;

    const uploadRes = await fetch(
      BLOB_API_URL + '/?' + new URLSearchParams({ pathname }).toString(),
      {
        method: 'PUT',
        headers: {
          authorization: 'Bearer ' + token,
          'x-api-version': BLOB_API_VERSION,
          'x-vercel-blob-store-id': storeId,
          'x-vercel-blob-access': 'public',
          'x-content-type': contentType || 'application/octet-stream',
          'x-add-random-suffix': '1'
        },
        body: buffer
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text().catch(() => '');
      return res.status(uploadRes.status).json({ error: 'Error al subir el archivo: ' + errText });
    }

    const data = await uploadRes.json();
    return res.status(200).json({ url: data.url });
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor: ' + error.message });
  }
}
