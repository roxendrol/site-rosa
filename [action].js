const crypto = require('crypto');
const U = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const T = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = process.env.ADMIN_SETUP_KEY || '';
const redis = async (...c) => {
  const x = await fetch(U, { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(c) });
  const j = await x.json(); if (j.error) throw new Error(j.error); return j.result;
};
const send = (res, s, o) => res.status(s).json(o);
const eq = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const getAdmin = async () => { const x = await redis('GET', 'admin'); return x ? JSON.parse(x) : null; };
const sign = (ad, p) => crypto.createHmac('sha256', KEY + ad.hash).update(p).digest('base64url');
async function isAuthed(req) {
  const ad = await getAdmin(); if (!ad) return false;
  const m = (req.headers.cookie || '').match(/rb=([\w.-]+)/); if (!m) return false;
  const [p, s] = m[1].split('.'); if (!p || !s || !eq(sign(ad, p), s)) return false;
  try { return JSON.parse(Buffer.from(p, 'base64url')).x > Date.now(); } catch { return false; }
}
async function limited(req) {
  const ip = String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  const k = 'rl:' + ip, n = await redis('INCR', k);
  if (n === 1) await redis('EXPIRE', k, 900);
  return n > 8;
}
const str = (v, n) => String(v ?? '').slice(0, n);
const num = v => Math.max(0, Math.min(100000, Number(v) || 0));
const okImg = u => /^(\/img\/[\w.-]+|\/logo\.png|\/api\/img\?id=[a-f0-9]{24})$/.test(u);

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const a = req.query.action, m = req.method;
  try {
    if (!U || !T) return send(res, 500, { error: 'Banco de dados ainda não conectado na Vercel.' });
    if (a === 'img' && m === 'GET') {
      const d = await redis('GET', 'img:' + str(req.query.id, 40).replace(/[^a-f0-9]/g, ''));
      const x = d && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(d);
      if (!x) return res.status(404).end();
      res.setHeader('Content-Type', x[1]); res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.status(200).send(Buffer.from(x[2], 'base64'));
    }
    if (a === 'store' && m === 'GET') { const s = await redis('GET', 'store'); return send(res, 200, s ? JSON.parse(s) : null); }
    if (a === 'me' && m === 'GET') return send(res, 200, { authed: await isAuthed(req), setup: !!(await getAdmin()) });
    if (m !== 'POST' && m !== 'PUT') return send(res, 405, { error: 'Método inválido.' });
    if (!String(req.headers['content-type'] || '').includes('application/json')) return send(res, 400, { error: 'Requisição inválida.' });
    const b = req.body || {};
    if (a === 'logout') { res.setHeader('Set-Cookie', 'rb=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'); return send(res, 200, { ok: true }); }
    if (a === 'setup' || a === 'login') {
      if (await limited(req)) return send(res, 429, { error: 'Muitas tentativas. Aguarde 15 minutos.' });
      const email = str(b.email, 120).trim().toLowerCase(), pw = str(b.password, 200);
      let ad;
      if (a === 'setup') {
        if (!KEY || !eq(str(b.key, 200), KEY)) return send(res, 403, { error: 'Código de configuração incorreto.' });
        if (!/^\S+@\S+\.\S+$/.test(email) || pw.length < 10) return send(res, 400, { error: 'E-mail válido e senha com 10+ caracteres.' });
        const salt = crypto.randomBytes(16).toString('hex'); ad = { email, salt, hash: hashPw(pw, salt) };
        if ((await redis('SET', 'admin', JSON.stringify(ad), 'NX')) !== 'OK') return send(res, 409, { error: 'O administrador já foi criado.' });
      } else {
        ad = await getAdmin();
        if (!ad || !eq(email, ad.email) || !eq(hashPw(pw, ad.salt), ad.hash)) return send(res, 401, { error: 'E-mail ou senha incorretos.' });
      }
      const p = Buffer.from(JSON.stringify({ x: Date.now() + 7 * 864e5 })).toString('base64url');
      res.setHeader('Set-Cookie', `rb=${p}.${sign(ad, p)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`);
      return send(res, 200, { ok: true });
    }
    if (!(await isAuthed(req))) return send(res, 401, { error: 'Sessão expirada. Entre novamente.' });
    if (a === 'upload') {
      const d = str(b.data, 700000);
      if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(d) || d.length >= 700000) return send(res, 400, { error: 'Imagem inválida ou muito grande.' });
      const id = crypto.randomBytes(12).toString('hex'); await redis('SET', 'img:' + id, d);
      return send(res, 200, { url: '/api/img?id=' + id });
    }
    if (a === 'store' && m === 'PUT') {
      if (!Array.isArray(b.cats) || !Array.isArray(b.prods) || b.cats.length > 30 || b.prods.length > 300) return send(res, 400, { error: 'Dados inválidos.' });
      const cats = b.cats.map(c => ({ id: str(c.id, 20).replace(/\W/g, ''), name: str(c.name, 40) }));
      const prods = b.prods.map(p => ({ id: str(p.id, 20).replace(/\W/g, ''), name: str(p.name, 80), price: num(p.price), promo: num(p.promo), cat: str(p.cat, 20), img: okImg(p.img) ? p.img : '/logo.png' }));
      await redis('SET', 'store', JSON.stringify({ cats, prods }));
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: 'Não encontrado.' });
  } catch (e) { return send(res, 500, { error: 'Erro no servidor.' }); }
};
