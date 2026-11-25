// Anotações internas da AGE no painel (aba Reuniões).
// Só os e-mails abaixo leem e gravam. O texto fica no KV "NOTAS" do Cloudflare, nunca no data.json.
const AGE = ['amanda@agecriacao.com', 'gustavo@agecriacao.com', 'caio.jsrcriacao@gmail.com'];
const J = (o, st) => new Response(JSON.stringify(o), { status: st || 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export async function onRequest({ request, env, data }) {
  const email = String((data && data.email) || '').toLowerCase();
  const age = AGE.includes(email);
  const url = new URL(request.url);
  if (request.method === 'GET' && url.searchParams.has('eu')) return J({ age, ativo: !!env.NOTAS });
  if (!age) return J({ erro: 'sem acesso' }, 403);
  if (!env.NOTAS) return J({ erro: 'área de anotações não ativada' }, 503);
  const chave = 'nota:' + (url.searchParams.get('chave') || 'geral').replace(/[^\w:-]/g, '').slice(0, 60);
  if (request.method === 'GET') return J((await env.NOTAS.get(chave, 'json')) || { texto: '', por: null, em: null });
  if (request.method === 'PUT') {
    if (!(request.headers.get('Content-Type') || '').includes('application/json')) return J({ erro: 'formato' }, 415);
    const b = await request.json().catch(() => null);
    if (!b || typeof b.texto !== 'string' || b.texto.length > 50000) return J({ erro: 'texto inválido' }, 400);
    const v = { texto: b.texto, por: email, em: new Date().toISOString() };
    await env.NOTAS.put(chave, JSON.stringify(v));
    return J(v);
  }
  return J({ erro: 'método não permitido' }, 405);
}
