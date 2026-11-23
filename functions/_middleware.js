// Login do Painel Mondän: só entra quem fizer login com uma conta Google da lista abaixo.
// O segredo do Google (GOOGLE_CLIENT_SECRET) fica nas variáveis do projeto no Cloudflare, nunca no código.
// Sem o segredo configurado, o painel fica fechado para todos.

const CLIENT_ID = '';            // ID do cliente OAuth do Google (não é segredo)
const HOST = 'painel-mondan.pages.dev';
const REDIRECT = 'https://' + HOST + '/_auth/callback';
const DIAS = 30;                 // validade do login

const PERMITIDOS = [
  'amanda@agecriacao.com',
  'agecriacao.job@gmail.com',
  'alessandra@agecriacao.com',
  'anthonygklepp@gmail.com',
  'caio.jsrcriacao@gmail.com',
  'gustavo@agecriacao.com',
  'jessica.mondan@gmail.com',
  'rafaelruiz.machado@gmail.com',
  'victorcosta00mondan@gmail.com',
  'viniciusbcunha@gmail.com',
];

const COOKIE = '__Host-mondan';
const COOKIE_STATE = '__Host-mondan-state';

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uTexto = (s) => b64u(enc.encode(s));
const deB64u = (s) => {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
};

async function chave(env) {
  const base = env.SESSION_SECRET || ('painel-mondan-sessao:' + env.GOOGLE_CLIENT_SECRET);
  return crypto.subtle.importKey('raw', enc.encode(base), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function assinar(env, texto) {
  return b64u(await crypto.subtle.sign('HMAC', await chave(env), enc.encode(texto)));
}
function iguais(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function lerCookie(req, nome) {
  const c = req.headers.get('Cookie') || '';
  for (const p of c.split(';')) {
    const i = p.indexOf('=');
    if (i > -1 && p.slice(0, i).trim() === nome) return p.slice(i + 1).trim();
  }
  return null;
}
async function sessao(req, env) {
  const v = lerCookie(req, COOKIE);
  if (!v || v.indexOf('.') < 0) return null;
  const [dados, sig] = v.split('.');
  if (!iguais(sig, await assinar(env, dados))) return null;
  let s;
  try { s = JSON.parse(deB64u(dados)); } catch (e) { return null; }
  if (!s || !s.e || !s.x || s.x < Date.now() / 1000) return null;
  if (!PERMITIDOS.includes(String(s.e).toLowerCase())) return null;
  return s;
}

const SEG = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

function pagina(titulo, texto, botao, status) {
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Painel Clínica Mondän</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#FAF0E6;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#3B1E19;padding:24px}
.c{background:#fff;border:1px solid #DED8C5;border-radius:16px;padding:40px 36px;max-width:420px;width:100%;text-align:center}
.m{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#9D7B3E;margin:0 0 18px}
h1{font-size:22px;font-weight:600;margin:0 0 10px}p{font-size:15px;line-height:1.5;color:#5a423d;margin:0 0 26px}
a.b{display:inline-flex;align-items:center;gap:10px;background:#3B1E19;color:#FAF0E6;text-decoration:none;
padding:12px 22px;border-radius:999px;font-size:15px;font-weight:500}a.b:hover{background:#9D7B3E}
small{display:block;margin-top:22px;font-size:12px;color:#8a7a70}
</style></head><body><main class="c"><div class="m">Clínica Mondän</div><h1>${titulo}</h1><p>${texto}</p>${botao}
<small>Acesso restrito à equipe da Clínica Mondän e da AGE Criação.</small></main></body></html>`;
  return new Response(html, { status: status || 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...SEG } });
}
const BOTAO = (rotulo, conta) => `<a class="b" href="/_auth/login${conta ? '?conta=1' : ''}">${rotulo}</a>`;

export async function onRequest(ctx) {
  const { request: req, env, next } = ctx;
  const url = new URL(req.url);

  if (!env.GOOGLE_CLIENT_SECRET || !CLIENT_ID) {
    return pagina('Painel em configuração', 'O login ainda está sendo configurado. Tente novamente mais tarde.', '', 503);
  }

  // Login só no endereço principal (é o único cadastrado no Google)
  if (url.pathname.startsWith('/_auth/') && url.hostname !== HOST) {
    return Response.redirect('https://' + HOST + '/', 302);
  }

  if (url.pathname === '/_auth/login') {
    const state = b64u(crypto.getRandomValues(new Uint8Array(24)));
    const p = new URLSearchParams({
      client_id: CLIENT_ID, redirect_uri: REDIRECT, response_type: 'code',
      scope: 'openid email', state, prompt: 'select_account',
    });
    return new Response(null, { status: 302, headers: {
      Location: 'https://accounts.google.com/o/oauth2/v2/auth?' + p,
      'Set-Cookie': `${COOKIE_STATE}=${state}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=600`, ...SEG } });
  }

  if (url.pathname === '/_auth/callback') {
    const code = url.searchParams.get('code'), state = url.searchParams.get('state');
    const esperado = lerCookie(req, COOKIE_STATE);
    if (!code || !state || !esperado || !iguais(state, esperado)) {
      return pagina('Não foi possível entrar', 'O login expirou ou foi interrompido. Tente de novo.', BOTAO('Entrar com Google'), 400);
    }
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
    });
    const t = await r.json().catch(() => ({}));
    let id = null;
    try { id = JSON.parse(deB64u(t.id_token.split('.')[1])); } catch (e) {}
    const agora = Date.now() / 1000;
    const ok = id && id.aud === CLIENT_ID && ['accounts.google.com', 'https://accounts.google.com'].includes(id.iss)
      && id.exp > agora && id.email_verified === true;
    const email = ok ? String(id.email).toLowerCase() : '';
    if (!ok || !PERMITIDOS.includes(email)) {
      return pagina('Este e-mail não tem acesso',
        'Entre com o e-mail que foi cadastrado para ver o painel. Se precisar de acesso, fale com a AGE Criação.',
        BOTAO('Entrar com outra conta', true), 403);
    }
    const dados = b64uTexto(JSON.stringify({ e: email, x: Math.floor(agora + DIAS * 86400) }));
    const valor = dados + '.' + (await assinar(env, dados));
    const h = new Headers({ Location: '/', ...SEG });
    h.append('Set-Cookie', `${COOKIE}=${valor}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${DIAS * 86400}`);
    h.append('Set-Cookie', `${COOKIE_STATE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0`);
    return new Response(null, { status: 302, headers: h });
  }

  if (url.pathname === '/_auth/sair') {
    return new Response(null, { status: 302, headers: { Location: '/', ...SEG,
      'Set-Cookie': `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0` } });
  }

  const s = await sessao(req, env);
  if (!s) {
    const querHtml = (req.headers.get('Accept') || '').includes('text/html');
    if (!querHtml) return new Response('Acesso restrito', { status: 401, headers: SEG });
    return pagina('Painel de acompanhamento', 'Entre com a sua conta Google cadastrada para ver o painel.', BOTAO('Entrar com Google'), 401);
  }

  // Arquivos internos do repositório nunca são servidos
  if (/^\/(functions|robo|\.git)(\/|$)/.test(url.pathname) || /\.(md|py|txt)$/i.test(url.pathname)) {
    return new Response('Não encontrado', { status: 404, headers: SEG });
  }

  const resp = await next();
  const out = new Response(resp.body, resp);
  for (const [k, v] of Object.entries(SEG)) out.headers.set(k, v);
  return out;
}
