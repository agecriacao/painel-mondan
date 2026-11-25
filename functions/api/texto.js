// Textos curtos editáveis do painel (ex.: considerações de cada semana em Mídia paga).
// Todos os e-mails com acesso ao painel leem; só a AGE grava. Fica no KV "NOTAS", chave "texto:<chave>".
const AGE = ['amanda@agecriacao.com', 'gustavo@agecriacao.com', 'caio.jsrcriacao@gmail.com'];
const J = (o, st) => new Response(JSON.stringify(o), { status: st || 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequest({ request, env, data }) {
  const email = String((data && data.email) || '').toLowerCase();
  const age = AGE.includes(email);
  const url = new URL(request.url);
  const k = (url.searchParams.get('chave') || '').replace(/[^\w:-]/g, '').slice(0, 60);
  if (!k) return J({ erro: 'chave inválida' }, 400);
  if (!env.NOTAS) return J({ erro: 'não ativado' }, 503);
  const chave = 'texto:' + k;
  if (request.method === 'GET') {
    const v = (await env.NOTAS.get(chave, 'json')) || { texto: null, por: null, em: null };
    v.pode = age;
    return J(v);
  }
  if (request.method === 'PUT') {
    if (!age) return J({ erro: 'sem acesso' }, 403);
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) return J({ erro: 'formato' }, 415);
    const b = await request.json().catch(() => null);
    if (!b || typeof b.texto !== 'string' || b.texto.length > 10000) return J({ erro: 'texto inválido' }, 400);
    const v = { texto: b.texto, por: email, em: new Date().toISOString() };
    await env.NOTAS.put(chave, JSON.stringify(v));
    v.pode = true;
    return J(v);
  }
  return J({ erro: 'método não permitido' }, 405);
}
