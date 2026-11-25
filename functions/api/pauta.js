// Pautas de cada reunião (aba Reuniões): lista editável com check de "conversado".
// Todos os e-mails com acesso ao painel veem; só a AGE adiciona, edita, exclui e marca.
// Fica no KV "NOTAS" do Cloudflare, com a chave "pauta:<data da reunião>".
const AGE = ['amanda@agecriacao.com', 'gustavo@agecriacao.com', 'caio.jsrcriacao@gmail.com'];
const J = (o, st) => new Response(JSON.stringify(o), { status: st || 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequest({ request, env, data }) {
  const email = String((data && data.email) || '').toLowerCase();
  const age = AGE.includes(email);
  const url = new URL(request.url);
  const r = (url.searchParams.get('r') || '').replace(/[^\d-]/g, '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r)) return J({ erro: 'reunião inválida' }, 400);
  if (!env.NOTAS) return J({ erro: 'não ativado' }, 503);
  const chave = 'pauta:' + r;
  if (request.method === 'GET') {
    const v = (await env.NOTAS.get(chave, 'json')) || { itens: null, por: null, em: null };
    v.pode = age;
    return J(v);
  }
  if (request.method === 'PUT') {
    if (!age) return J({ erro: 'sem acesso' }, 403);
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) return J({ erro: 'formato' }, 415);
    const b = await request.json().catch(() => null);
    if (!b || !Array.isArray(b.itens) || b.itens.length > 60) return J({ erro: 'dados inválidos' }, 400);
    const itens = [];
    for (const x of b.itens) {
      if (!x || typeof x.t !== 'string') return J({ erro: 'dados inválidos' }, 400);
      const t = x.t.trim().slice(0, 400);
      if (!t) continue;
      const alvo = typeof x.alvo === 'string' && /^rn-[\w-]{1,20}$/.test(x.alvo) ? x.alvo : '';
      itens.push({ t, alvo, ok: x.ok === true });
    }
    const v = { itens, por: email, em: new Date().toISOString() };
    await env.NOTAS.put(chave, JSON.stringify(v));
    v.pode = true;
    return J(v);
  }
  return J({ erro: 'método não permitido' }, 405);
}
