// Checklist da pauta de cada reunião (aba Reuniões).
// Todos os e-mails com acesso ao painel veem o que já foi conversado; só a AGE marca e desmarca.
// Fica no mesmo KV "NOTAS" do Cloudflare, com a chave "pauta:<data da reunião>".
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
    const v = (await env.NOTAS.get(chave, 'json')) || { feitos: {}, por: null, em: null };
    v.pode = age;
    return J(v);
  }
  if (request.method === 'PUT') {
    if (!age) return J({ erro: 'sem acesso' }, 403);
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) return J({ erro: 'formato' }, 415);
    const b = await request.json().catch(() => null);
    if (!b || typeof b.feitos !== 'object' || Array.isArray(b.feitos)) return J({ erro: 'dados inválidos' }, 400);
    const feitos = {};
    Object.keys(b.feitos).slice(0, 60).forEach(k => { if (/^\d{1,2}$/.test(k) && b.feitos[k] === true) feitos[k] = true; });
    const v = { feitos, por: email, em: new Date().toISOString() };
    await env.NOTAS.put(chave, JSON.stringify(v));
    v.pode = true;
    return J(v);
  }
  return J({ erro: 'método não permitido' }, 405);
}
