(function(){
'use strict';

/* =========================================================
   Utilidades
   ========================================================= */
var nf0 = new Intl.NumberFormat('pt-BR', {maximumFractionDigits:0});
var nf1 = new Intl.NumberFormat('pt-BR', {minimumFractionDigits:1, maximumFractionDigits:1});
var brl0 = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0});
var brl2 = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL', minimumFractionDigits:2, maximumFractionDigits:2});
var MES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var MES3 = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function nbsp(s){ return s.replace(/\s/g, ' '); }

function fmt(v, tipo){
  if (v === null || v === undefined || isNaN(v)) return '—';
  if (tipo === 'brl0') return nbsp(brl0.format(v));
  if (tipo === 'brl2') return nbsp(brl2.format(v));
  if (tipo === 'pct') return nf1.format(v) + '%';
  if (tipo === 'dias') return nf1.format(v) + (v === 1 ? ' dia' : ' dias');
  if (tipo === 'n1') return nf1.format(v);
  if (tipo === 'min') return v < 60 ? nf0.format(v) + ' min' : nf1.format(v / 60) + ' h';
  if (tipo === 'k') return v >= 10000 ? nf1.format(v / 1000) + ' mil' : nf0.format(v);
  return nf0.format(v);
}
function compacto(v, tipo){
  if (v === null || v === undefined) return '';
  if (tipo === 'brl0' || tipo === 'brl2'){
    if (v >= 1000) return 'R$' + nf1.format(v / 1000) + 'k';
    return 'R$' + (tipo === 'brl2' ? nf1.format(v) : nf0.format(v));
  }
  if (tipo === 'pct') return nf0.format(v) + '%';
  if (tipo === 'n1' && v < 100) return nf1.format(v);
  if (v >= 10000) return nf0.format(v / 1000) + 'k';
  if (v >= 1000) return nf1.format(v / 1000) + 'k';
  return nf0.format(v);
}

/* datas em ISO (AAAA-MM-DD), sempre em UTC para não sofrer com fuso */
function toD(s){ return new Date(s + 'T00:00:00Z'); }
function iso(d){ return d.toISOString().slice(0, 10); }
function addD(s, n){ var d = toD(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
function ndias(a, b){ return Math.round((toD(b) - toD(a)) / 864e5) + 1; }
function mesDe(s){ return s.slice(0, 7); }
function fimMes(m){ var y = +m.slice(0, 4), mo = +m.slice(5, 7); return iso(new Date(Date.UTC(y, mo, 0))); }
function mesAnt(m, n){ var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 - (n || 1); var d = new Date(Date.UTC(y, mo, 1)); return iso(d).slice(0, 7); }
function nomeMes(m, curto){ var i = +m.slice(5, 7) - 1; return curto ? MES3[i] : MES[i]; }
function dm(s){ return s.slice(8, 10) + '/' + s.slice(5, 7); }
function dmy(s){ return dm(s) + '/' + s.slice(0, 4); }
function semanaIni(s){ var d = toD(s), w = (d.getUTCDay() + 6) % 7; return addD(s, -w); }
function rotPeriodo(a, b){
  if (a === b) return dmy(a);
  if (a.slice(0, 7) === b.slice(0, 7) && a.slice(8) === '01' && b === fimMes(mesDe(a))) return cap(nomeMes(mesDe(a))) + ' ' + a.slice(0, 4);
  if (a.slice(0, 4) === b.slice(0, 4)) return dm(a) + ' a ' + dmy(b);
  return dmy(a) + ' a ' + dmy(b);
}

function h(tag, attrs, kids){
  var el = document.createElement(tag);
  if (attrs) for (var k in attrs){
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  (kids || []).forEach(function(c){
    if (c === null || c === undefined || c === false) return;
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  });
  return el;
}
var SVGNS = 'http://www.w3.org/2000/svg';
function s(tag, attrs, txt){
  var el = document.createElementNS(SVGNS, tag);
  if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) el.setAttribute(k, attrs[k]);
  if (txt !== undefined) el.textContent = txt;
  return el;
}
/* ícones (traço simples) */
var IC = {
  geral:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  agenda:'<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18M8 14h3M8 17h6"/>',
  midia:'<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
  remarketing:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  evolucao:'<path d="M3 17l5-6 4 3 8-9"/><path d="M15 5h5v5"/>',
  conteudo:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M10 8.5v5l4-2.5z"/><path d="M7 21h10"/>',
  kommo:'<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12.5h5"/>',
  google:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
  reunioes:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2A4.6 4.6 0 0 1 21 18.5"/>',
  alerta:'<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>'
};
function icone(nome){ var e = document.createElementNS(SVGNS, 'svg'); e.setAttribute('viewBox', '0 0 24 24'); e.setAttribute('aria-hidden', 'true'); e.innerHTML = IC[nome]; return e; }

/* tooltip único */
var TIP = null;
function tipShow(ev, titulo, linhas, sub){
  TIP.textContent = '';
  TIP.appendChild(h('div', {class:'tt', text:titulo}));
  (linhas || []).forEach(function(l){
    TIP.appendChild(h('div', {class:'tr'}, [h('span', null, [l.cor ? h('i', {style:'background:' + l.cor}) : null, l.k]), h('b', {text:l.v})]));
  });
  if (sub) TIP.appendChild(h('div', {class:'ts', text:sub}));
  var x = ev.clientX + 14, y = ev.clientY + 14, w = TIP.offsetWidth || 200, hh = TIP.offsetHeight || 60;
  if (x + w > window.innerWidth - 8) x = ev.clientX - w - 14;
  if (y + hh > window.innerHeight - 8) y = ev.clientY - hh - 14;
  TIP.style.left = x + 'px'; TIP.style.top = y + 'px'; TIP.style.opacity = 1;
}
function tipHide(){ if (TIP) TIP.style.opacity = 0; }

/* =========================================================
   Dados e estado
   ========================================================= */
var D, HOJE, KOMMO_LIDO, KOMMO_INI = '2026-07-01', MESES_DISP = [];
var sel = {modo:'periodo', mes:null, cmp:null, preset:'este_mes', ini:null, fim:null, cmpOn:true, esp:'todas', pag:'geral'};

var ESP_NOME = {derm:'Dermatologia', cap:'Capilar', blef:'Blefaroplastia', gine:'Ginecologia', endo:'Endocrinologia', proc:'Proctologia', uro:'Urologia', vasc:'Vascular', outras:'Outras'};
var ESP_ORDEM = ['derm','cap','blef','gine','endo','proc','uro','vasc','outras'];
var FILTRO_ESP = [['todas','Todas as especialidades'],['derm','Dermatologia'],['cap','Capilar'],['blef','Blefaroplastia'],['gine','Ginecologia'],['outras','Demais especialidades']];
var FILTRO_LISTA = {todas:null, derm:['derm'], cap:['cap'], blef:['blef'], gine:['gine'], outras:['endo','proc','uro','vasc','outras']};
var ORI_NOME = {anuncio:'Anúncio Mondän', ig_medico:'Instagram do(a) médico(a)', ig_clinica:'Instagram da clínica', indicacao:'Indicação', remarketing:'Remarketing', nao_identificado:'Não identificado', outras:'Outras / sem origem'};
var ST = [
  ['comp','Compareceram','var(--st-comp)'],
  ['falta','Faltaram','var(--st-falta)'],
  ['canc','Cancelaram','var(--st-canc)'],
  ['remarc','Remarcaram','var(--st-remarc)'],
  ['sem','Sem registro de presença','var(--st-sem)'],
  ['fut','Ainda vão acontecer','var(--st-fut)']
];
/* Avaliação cortesia: a clínica passou a cobrar sinal. A data exata pode ser preenchida em AVAL_SINAL_DESDE (AAAA-MM-DD). */
var AVAL_SINAL_DESDE = '2026-11-18', AVAL_ULTIMO_MES = '2026-11';
var NOTA_PRES = 'Comparecimento, faltas e cancelamentos dependem do registro feito pelo atendimento da clínica na planilha (aba Agendamentos Kommo, coluna Comparecimento).';
function avalVisivel(r){ return r.ini <= fimMes(AVAL_ULTIMO_MES); }
function avalNota(){ return (AVAL_SINAL_DESDE ? 'A partir de ' + dmy(AVAL_SINAL_DESDE) : 'Desde novembro de 2026') + ', a avaliação de dermatologia deixou de ser cortesia e passou a exigir sinal. Este quadro acompanha as avaliações cortesia que ainda estavam marcadas.'; }
var PAGS = [['geral','Visão geral'],['reunioes','Reuniões'],['agenda','Agenda e consultas'],['midia','Mídia paga'],['instagram','Instagram'],['conteudo','Análise de conteúdo'],['kommo','Kommo'],['google','Google Ads'],['evolucao','Evolução 2026']];
var PRESETS = [['este_mes','Este mês'],['mes_passado','Mês passado'],['semana_passada','Semana passada'],['7d','7 dias'],['30d','30 dias']];

function espOk(e){ var l = FILTRO_LISTA[sel.esp]; return !l || l.indexOf(e) >= 0; }

/* ---------- períodos ---------- */
function usaMes(m){
  sel.modo = 'periodo'; sel.cmpOn = true;
  if (m === mesDe(HOJE)) sel.preset = 'este_mes';
  else if (m === mesAnt(mesDe(HOJE))) sel.preset = 'mes_passado';
  else sel.preset = 'custom';
  var r = sel.preset === 'custom' ? [m + '-01', fimMes(m) > HOJE ? HOJE : fimMes(m)] : intervaloPreset(sel.preset);
  sel.ini = r[0]; sel.fim = r[1];
}
function intervaloPreset(p){
  if (p === '7d') return [addD(HOJE, -6), HOJE];
  if (p === '30d') return [addD(HOJE, -29), HOJE];
  if (p === 'semana') return [semanaIni(HOJE), HOJE];
  if (p === 'semana_passada'){ var w = semanaIni(HOJE); return [addD(w, -7), addD(w, -1)]; }
  if (p === 'este_mes') return [mesDe(HOJE) + '-01', HOJE];
  if (p === 'mes_passado'){ var m = mesAnt(mesDe(HOJE)); return [m + '-01', fimMes(m)]; }
  return null;
}
function periodoA(){
  if (sel.modo === 'mes'){
    var m = sel.mes, f = fimMes(m), parcial = f > HOJE;
    return {ini:m + '-01', fim:f, ate:parcial ? HOJE : f, rot:cap(nomeMes(m)) + ' ' + m.slice(0, 4), mes:m, parcial:parcial};
  }
  var mm = mesDe(sel.ini), inteiro = sel.ini === mm + '-01' && mesDe(sel.fim) === mm && (sel.fim === fimMes(mm) || sel.fim === HOJE);
  if (inteiro){ var parc = sel.fim < fimMes(mm); return {ini:sel.ini, fim:sel.fim, ate:sel.fim, rot:cap(nomeMes(mm)) + ' ' + mm.slice(0, 4), mes:mm, parcial:parc, dias:ndias(sel.ini, sel.fim)}; }
  return {ini:sel.ini, fim:sel.fim, rot:rotPeriodo(sel.ini, sel.fim), dias:ndias(sel.ini, sel.fim)};
}
function periodoB(){
  if (sel.modo === 'mes'){
    var m = sel.cmp; return {ini:m + '-01', fim:fimMes(m), rot:cap(nomeMes(m)) + ' ' + m.slice(0, 4), mes:m};
  }
  if (!sel.cmpOn) return null;
  if (sel.preset === 'este_mes'){
    var pm = mesAnt(mesDe(HOJE)), dia = +HOJE.slice(8), fimp = pm + '-' + ('0' + Math.min(dia, +fimMes(pm).slice(8))).slice(-2);
    return {ini:pm + '-01', fim:fimp, rot:rotPeriodo(pm + '-01', fimp)};
  }
  if (sel.preset === 'mes_passado'){
    var mm = mesAnt(mesDe(HOJE), 2); return {ini:mm + '-01', fim:fimMes(mm), rot:rotPeriodo(mm + '-01', fimMes(mm))};
  }
  var n = ndias(sel.ini, sel.fim), fimB = addD(sel.ini, -1), iniB = addD(fimB, -(n - 1));
  return {ini:iniB, fim:fimB, rot:rotPeriodo(iniB, fimB)};
}

/* ---------- motor de agregação ---------- */
var CACHE = {};
function meses(ini, fim){ var out = [], m = mesDe(ini); while (m <= mesDe(fim)){ out.push(m); m = mesAnt(m, -1); } return out; }
function mesCoberto(m, r){
  var info = D.meses[m]; if (!info) return false;
  var lim = info.parcial && info.ate ? info.ate : fimMes(m);
  return r.ini <= m + '-01' && (r.fim >= lim || r.fim >= fimMes(m));
}
function porMes(r, pega){
  var ms = meses(r.ini, r.fim), tot = 0;
  for (var i = 0; i < ms.length; i++){
    if (!mesCoberto(ms[i], r)) return null;
    var v = pega(D.meses[ms[i]]); if (v === null || v === undefined) return null; tot += v;
  }
  return tot;
}
function zeraSt(){ return {comp:0, falta:0, canc:0, remarc:0, sem:0, fut:0}; }
function totSt(o){ return o.comp + o.falta + o.canc + o.remarc + o.sem + o.fut; }
function presenca(o){
  var base = o.comp + o.falta;
  if (!base) return {v:null, valida:false};
  var v = o.comp / base * 100, valida = o.sem / (base + o.sem) <= 0.2;
  return {v:v, valida:valida};
}
function mediana(a){ if (!a.length) return null; var b = a.slice().sort(function(x, y){ return x - y; }), k = Math.floor(b.length / 2); return b.length % 2 ? b[k] : (b[k - 1] + b[k]) / 2; }

function agg(r){
  var key = r.ini + '|' + r.fim + '|' + sel.esp;
  if (CACHE[key]) return CACHE[key];
  var o = {r:r, agend:0, ori:{}, espA:{}, avalA:{}, cons:zeraSt(), espC:{}, aval:{}, diasL:[], ads:{},
           spend:0, cliques:0, conversas:0, spendLead:0, metaDias:0};
  ESP_ORDEM.forEach(function(e){ o.espA[e] = 0; o.espC[e] = zeraSt(); o.aval[e] = zeraSt(); o.avalA[e] = 0; });
  D.diario.agend.forEach(function(x){
    var d = x[0], e = x[1], sv = x[2], or = x[3], n = x[4];
    if (d < r.ini || d > r.fim || !espOk(e)) return;
    o.agend += n; o.espA[e] += n; o.ori[or] = (o.ori[or] || 0) + n; if (sv === 'aval') o.avalA[e] += n;
  });
  (D.diario.ajustes_mes || []).forEach(function(a){
    if (!espOk(a.esp) || !mesCoberto(a.mes, r)) return;
    o.agend += 1; o.espA[a.esp] += 1; o.ori[a.ori] = (o.ori[a.ori] || 0) + 1; if (a.serv === 'aval') o.avalA[a.esp] += 1;
  });
  D.diario.cons.forEach(function(x){
    var d = x[0], e = x[1], sv = x[2], st = x[3], n = x[4];
    if (d < r.ini || d > r.fim || !espOk(e)) return;
    if (st === 'aguard') st = d < KOMMO_LIDO ? 'sem' : 'fut';
    o.cons[st] += n; o.espC[e][st] += n; if (sv === 'aval') o.aval[e][st] += n;
  });
  D.diario.dias.forEach(function(x){ if (x[0] >= r.ini && x[0] <= r.fim && espOk(x[1])) o.diasL = o.diasL.concat(x[2]); });
  D.diario.anuncios.forEach(function(x){
    if (x[0] < r.ini || x[0] > r.fim || !espOk(x[1])) return;
    var k = x[1] + '|' + x[2]; o.ads[k] = (o.ads[k] || 0) + x[3];
  });
  var d = r.ini;
  while (d <= r.fim && d <= HOJE){
    var m = D.diario.meta[d];
    if (m){ o.spend += m[0]; o.cliques += m[1]; o.conversas += m[2]; o.spendLead += (m[3] === undefined ? m[0] : m[3]); }
    o.metaDias++; d = addD(d, 1);
  }
  o.realizadas = o.cons.comp;
  o.consTot = totSt(o.cons);
  o.pres = presenca(o.cons);
  o.mediana = mediana(o.diasL);
  o.kommo = r.fim < KOMMO_INI ? 'nenhum' : (r.ini < KOMMO_INI ? 'parcial' : 'ok');
  if (o.kommo === 'nenhum'){ o.agend = null; o.realizadas = null; o.consTot = null; o.pres = {v:null, valida:false}; }
  o.leads = sel.esp === 'todas' ? porMes(r, function(x){ return x.leads; }) : null;
  o.medicos = porMes(r, function(x){ return x.midia.leads_formulario_medicos; });
  o.cpc = o.conversas ? o.spendLead / o.conversas : null;
  o.avalDerm = o.aval.derm; o.avalDermTot = totSt(o.aval.derm); o.avalDermA = o.avalA.derm;
  CACHE[key] = o;
  return o;
}

/* séries para minigráficos e gráficos de colunas */
function baldes(r){
  var n = ndias(r.ini, r.fim), out = [];
  if (n <= 45){
    for (var d = r.ini; d <= r.fim; d = addD(d, 1)) out.push({ini:d, fim:d, l:d.slice(8), t:dmy(d)});
  } else if (n <= 200){
    var w = semanaIni(r.ini);
    while (w <= r.fim){
      var a = w < r.ini ? r.ini : w, b = addD(w, 6) > r.fim ? r.fim : addD(w, 6);
      out.push({ini:a, fim:b, l:dm(a), t:'Semana de ' + dm(a) + ' a ' + dm(b)}); w = addD(w, 7);
    }
  } else {
    meses(r.ini, r.fim).forEach(function(m){
      var a = m + '-01' < r.ini ? r.ini : m + '-01', b = fimMes(m) > r.fim ? r.fim : fimMes(m);
      out.push({ini:a, fim:b, l:nomeMes(m, true), t:cap(nomeMes(m)) + ' ' + m.slice(0, 4)});
    });
  }
  return out;
}
function mesesSerie(){ return MESES_DISP.map(function(m){ return {ini:m + '-01', fim:fimMes(m), l:nomeMes(m, true), t:cap(nomeMes(m)) + ' ' + m.slice(0, 4), mes:m}; }); }

/* =========================================================
   Componentes
   ========================================================= */
function chipDelta(a, b, sentido, pp, tipo){
  if (a === null || a === undefined || b === null || b === undefined) return null;
  var d, txt;
  if (pp){ d = a - b; txt = (d > 0 ? '+' : '') + nf1.format(d) + ' p.p.'; }
  else if ((tipo === 'n' || tipo === undefined) && Math.abs(b) < 10){ d = a - b; if (!d) return h('span', {class:'dl neu', text:'igual'}); txt = (d > 0 ? '+' : '') + nf0.format(d); }
  else { if (!b) return null; d = (a - b) / Math.abs(b) * 100; txt = (d > 0 ? '+' : '') + nf1.format(d) + '%'; }
  var cls = 'neu';
  if (Math.abs(d) >= 0.5 && sentido !== 'neutro') cls = (sentido === 'menor' ? d < 0 : d > 0) ? 'up' : 'down';
  var seta = d > 0 ? '↑' : (d < 0 ? '↓' : '');
  return h('span', {class:'dl ' + cls, text:(seta ? seta + ' ' : '') + txt.replace('+', '').replace('-', ''), title:'Diferença em relação ao período de comparação',
    'aria-label':(d >= 0 ? 'alta de ' : 'queda de ') + txt.replace('+', '').replace('-', '')});
}

/* tile: rótulo, valor, comparação, minigráfico */
function tile(o){
  var el = h('div', {class:'st' + (o.hero ? ' hero' : '') + (o.espera ? ' espera' : '')});
  el.appendChild(h('div', {class:'st-l'}, [h('span', {text:o.rot}), o.fonte ? h('small', {text:o.fonte}) : null]));
  var vazio = o.v === null || o.v === undefined;
  el.appendChild(h('div', {class:'st-v' + (o.txt ? ' peq' : ''), text:o.txt || (vazio ? '—' : fmt(o.v, o.tipo))}));
  if (!o.txt && !vazio && o.bRot){
    var c = h('div', {class:'st-c'});
    if (o.b === null || o.b === undefined) c.appendChild(h('span', {text:'sem dado em ' + o.bRot}));
    else { c.appendChild(h('span', {text:o.bRot + ':'})); c.appendChild(h('b', {text:fmt(o.b, o.tipo)})); var ch = o.semDelta ? null : chipDelta(o.v, o.b, o.sentido, o.pp, o.tipo); if (ch) c.appendChild(ch); }
    el.appendChild(c);
  }
  if (o.nota) el.appendChild(h('div', {class:'st-n', text:o.nota}));
  if (o.serie) el.appendChild(spark(o.serie, o.tipo, o.hero));
  return el;
}

function spark(serie, tipo, claro){
  var box = h('div', {class:'st-spark'});
  var vals = serie.map(function(p){ return p.v; }), ok = vals.filter(function(v){ return v !== null && v !== undefined; });
  if (ok.length < 2) return box;
  var W = 200, H = 32, mx = Math.max.apply(null, ok), mn = Math.min.apply(null, ok.concat([0]));
  if (mx === mn) mx = mn + 1;
  var n = serie.length, X = function(i){ return n === 1 ? W / 2 : i / (n - 1) * W; }, Y = function(v){ return H - 3 - (v - mn) / (mx - mn) * (H - 6); };
  var g = s('svg', {viewBox:'0 0 ' + W + ' ' + H, preserveAspectRatio:'none', role:'img', 'aria-label':'Tendência'});
  var cor = claro ? 'rgba(255,255,255,.55)' : '#C9B99F', ac = claro ? '#fff' : 'var(--madeira)';
  var dpath = '', on = false;
  serie.forEach(function(p, i){
    if (p.v === null || p.v === undefined){ on = false; return; }
    dpath += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.v).toFixed(1); on = true;
  });
  g.appendChild(s('path', {d:dpath, fill:'none', stroke:cor, 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round', 'vector-effect':'non-scaling-stroke'}));
  var pontos = [];
  serie.forEach(function(p, i){
    if (p.v === null || p.v === undefined || !p.hl) return;
    /* bolinhas em HTML: não esticam quando o gráfico fica largo */
    pontos.push(h('span', {class:'sp-dot', style:'left:' + (X(i) / W * 100).toFixed(2) + '%;top:' + Y(p.v).toFixed(1) + 'px;background:' + (p.hl === 'a' ? ac : (claro ? 'rgba(255,255,255,.75)' : 'var(--dourado)'))}));
  });
  var hit = s('rect', {x:0, y:0, width:W, height:H, fill:'transparent'});
  hit.addEventListener('pointermove', function(ev){
    var b = g.getBoundingClientRect(), i = Math.round((ev.clientX - b.left) / b.width * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
    tipShow(ev, serie[i].t, [{k:'', v:fmt(serie[i].v, tipo)}]);
  });
  hit.addEventListener('pointerleave', tipHide);
  g.appendChild(hit);
  box.appendChild(h('div', {class:'sp-wrap'}, [g].concat(pontos)));
  return box;
}

function niceMax(v){
  if (!v || v <= 0) return 1;
  var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
  var n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * p;
}
/* colunas: pts [{l, t, v, hl:'a'|'b'|''}] */
function colunas(host, pts, opt){
  opt = opt || {};
  var wrap = h('div', {class:'ch'}); host.appendChild(wrap);
  function draw(){
    wrap.textContent = '';
    var W = Math.max(wrap.clientWidth, 260), H = opt.altura || 190, m = {t:18, r:6, b:24, l:opt.semEixo ? 6 : 44};
    var vals = pts.map(function(p){ return p.v; }).filter(function(v){ return v !== null && v !== undefined; });
    var vmax = Math.max.apply(null, vals.concat([0])), ymax = niceMax(vmax || 1);
    var iw = W - m.l - m.r, ih = H - m.t - m.b, n = pts.length, slot = iw / n, bw = Math.max(3, Math.min(24, slot * 0.62));
    var g = s('svg', {viewBox:'0 0 ' + W + ' ' + H, height:H, role:'img', 'aria-label':opt.aria || ''});
    if (!opt.semEixo){
      [0, 0.5, 1].forEach(function(f){
        var y = m.t + ih - f * ih;
        g.appendChild(s('line', {x1:m.l, x2:W - m.r, y1:y, y2:y, stroke:'#EFE9E0', 'stroke-width':1}));
        g.appendChild(s('text', {x:m.l - 8, y:y + 4, 'text-anchor':'end', 'font-size':11, fill:'#988C82'}, compacto(ymax * f, opt.tipo)));
      });
    } else {
      g.appendChild(s('line', {x1:m.l, x2:W - m.r, y1:m.t + ih, y2:m.t + ih, stroke:'#ECE4D8', 'stroke-width':1}));
    }
    var passo = Math.ceil(n / Math.floor(iw / 34));
    pts.forEach(function(p, i){
      var cx = m.l + slot * i + slot / 2;
      if (p.v !== null && p.v !== undefined){
        var hh = Math.max(p.v / ymax * ih, p.v > 0 ? 2 : 0), x = cx - bw / 2, y = m.t + ih - hh, r = Math.min(4, bw / 2, hh);
        var cor = p.hl === 'a' ? 'var(--madeira)' : p.hl === 'b' ? 'var(--dourado)' : (opt.cor || '#E1D3BC');
        if (hh > 0) g.appendChild(s('path', {d:'M' + x + ' ' + (m.t + ih) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + bw - r) + 'Q' + (x + bw) + ' ' + y + ' ' + (x + bw) + ' ' + (y + r) + 'V' + (m.t + ih) + 'Z', fill:cor}));
        if (opt.rotulos && (p.hl || (opt.seletivo ? p.v === vmax : n <= 12))) g.appendChild(s('text', {x:cx, y:y - 6, 'text-anchor':'middle', 'font-size':10.5, 'font-weight':p.hl ? 600 : 500, fill:p.hl ? '#2A1A16' : '#6B5F57'}, compacto(p.v, opt.tipo)));
      } else if (opt.marcaVazio){
        g.appendChild(s('text', {x:cx, y:m.t + ih - 4, 'text-anchor':'middle', 'font-size':10, fill:'#C9BFB3'}, '–'));
      }
      if (i % passo === 0 || p.hl) g.appendChild(s('text', {x:cx, y:H - 6, 'text-anchor':'middle', 'font-size':11, 'font-weight':p.hl === 'a' ? 600 : 400, fill:p.hl === 'a' ? '#2A1A16' : '#988C82'}, p.l));
      var hit = s('rect', {x:m.l + slot * i, y:m.t, width:slot, height:ih + 4, fill:'transparent'});
      hit.addEventListener('pointermove', function(ev){ tipShow(ev, p.t, [{k:opt.nome || '', v:p.v === null || p.v === undefined ? 'sem dado' : fmt(p.v, opt.tipo)}], p.sub); });
      hit.addEventListener('pointerleave', tipHide);
      if (opt.clique && p.mes){ hit.style.cursor = 'pointer'; hit.addEventListener('click', function(){ tipHide(); opt.clique(p); }); }
      g.appendChild(hit);
    });
    wrap.appendChild(g);
  }
  draw();
  observa(wrap, draw);
}
/* linhas (várias séries no mesmo eixo) */
function linhas(host, rot, series, opt){
  opt = opt || {};
  var wrap = h('div', {class:'ch'}); host.appendChild(wrap);
  function draw(){
    wrap.textContent = '';
    var W = Math.max(wrap.clientWidth, 280), H = opt.altura || 220, m = {t:14, r:16, b:26, l:48}, n = rot.length;
    var all = []; series.forEach(function(sr){ sr.v.forEach(function(v){ if (v !== null) all.push(v); }); });
    var ymax = niceMax(Math.max.apply(null, all.concat([1])));
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var X = function(i){ return m.l + (n === 1 ? iw / 2 : i * iw / (n - 1)); }, Y = function(v){ return m.t + ih - v / ymax * ih; };
    var g = s('svg', {viewBox:'0 0 ' + W + ' ' + H, height:H, role:'img', 'aria-label':opt.aria || ''});
    [0, 0.25, 0.5, 0.75, 1].forEach(function(f){
      g.appendChild(s('line', {x1:m.l, x2:W - m.r, y1:Y(ymax * f), y2:Y(ymax * f), stroke:'#EFE9E0'}));
      g.appendChild(s('text', {x:m.l - 8, y:Y(ymax * f) + 4, 'text-anchor':'end', 'font-size':11, fill:'#988C82'}, compacto(ymax * f, opt.tipo)));
    });
    rot.forEach(function(r, i){ g.appendChild(s('text', {x:X(i), y:H - 6, 'text-anchor':'middle', 'font-size':11, fill:'#988C82'}, r)); });
    series.forEach(function(sr){
      var d = '', on = false;
      sr.v.forEach(function(v, i){ if (v === null){ on = false; return; } d += (on ? 'L' : 'M') + X(i) + ' ' + Y(v); on = true; });
      g.appendChild(s('path', {d:d, fill:'none', stroke:sr.cor, 'stroke-width':2, 'stroke-linejoin':'round', 'stroke-linecap':'round'}));
      sr.v.forEach(function(v, i){ if (v !== null && (i === n - 1 || sr.v[i + 1] === null || (i > 0 && sr.v[i - 1] === null))) g.appendChild(s('circle', {cx:X(i), cy:Y(v), r:4, fill:sr.cor, stroke:'#fff', 'stroke-width':2})); });
    });
    var guia = s('line', {x1:0, x2:0, y1:m.t, y2:m.t + ih, stroke:'#3B1E19', 'stroke-width':1, opacity:0}); g.appendChild(guia);
    var hit = s('rect', {x:m.l - 10, y:m.t, width:iw + 20, height:ih, fill:'transparent'});
    hit.addEventListener('pointermove', function(ev){
      var b = g.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width * W, i = Math.round((px - m.l) / (iw / Math.max(n - 1, 1))); i = Math.max(0, Math.min(n - 1, i));
      guia.setAttribute('x1', X(i)); guia.setAttribute('x2', X(i)); guia.setAttribute('opacity', .3);
      tipShow(ev, opt.titulos ? opt.titulos[i] : rot[i], series.map(function(sr){ return {k:sr.nome, v:fmt(sr.v[i], opt.tipo), cor:sr.cor}; }));
    });
    hit.addEventListener('pointerleave', function(){ guia.setAttribute('opacity', 0); tipHide(); });
    g.appendChild(hit);
    wrap.appendChild(g);
  }
  draw(); observa(wrap, draw);
}
var OBS = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function(es){ es.forEach(function(e){ var f = e.target.__draw; if (f && Math.abs((e.target.__w || 0) - e.contentRect.width) > 8){ e.target.__w = e.contentRect.width; f(); } }); }) : null;
function observa(el, f){ el.__draw = f; el.__w = el.clientWidth; if (OBS) OBS.observe(el); }

/* barra segmentada de status (partes de um todo) */
function barraStatus(host, st, rotuloTotal){
  var tot = totSt(st);
  if (!tot){ host.appendChild(h('p', {class:'vazio', text:'Nenhuma consulta neste período.'})); return; }
  var bar = h('div', {class:'segbar', role:'img', 'aria-label':ST.map(function(x){ return x[1] + ' ' + st[x[0]]; }).join(', ')});
  ST.forEach(function(x){
    var v = st[x[0]]; if (!v) return;
    var p = v / tot * 100, claro = x[0] === 'fut';
    var part = h('div', {class:claro ? 'claro' : '', style:'flex:' + v + ' 1 0;background:' + x[2], text:p >= 11 ? nf0.format(p) + '%' : ''});
    part.addEventListener('pointermove', function(ev){ tipShow(ev, x[1], [{k:'Consultas', v:fmt(v)}, {k:'Participação', v:nf1.format(p) + '%'}]); });
    part.addEventListener('pointerleave', tipHide);
    bar.appendChild(part);
  });
  host.appendChild(bar);
  host.appendChild(h('ul', {class:'leg'}, ST.map(function(x){
    var v = st[x[0]];
    return h('li', null, [h('i', {style:'background:' + x[2]}), x[1], h('b', {text:fmt(v)}), h('small', {text:tot ? nf0.format(v / tot * 100) + '%' : ''})]);
  })));
}

/* barras horizontais */
function barrasH(host, itens, mx){
  if (!mx) mx = Math.max.apply(null, itens.map(function(i){ return i.v || 0; }).concat([1]));
  itens.forEach(function(it){
    var row = h('div', {class:'hb'});
    row.appendChild(h('div', {class:'hb-l'}, [it.l, it.sub ? h('small', {text:it.sub}) : null]));
    var t = h('div', {class:'hb-t'});
    t.appendChild(h('div', {class:'hb-f' + (it.cls ? ' ' + it.cls : ''), style:'width:' + Math.min(100, (it.v || 0) / mx * 100) + '%'}));
    row.appendChild(t);
    row.appendChild(h('div', {class:'hb-v'}, [it.v === null || it.v === undefined ? '—' : fmt(it.v, it.tipo), it.b !== undefined ? h('small', {text:it.bRot + ': ' + fmt(it.b, it.tipo)}) : null]));
    if (it.conv) row.appendChild(h('div', {class:'conv'}, it.conv));
    if (it.tip) { row.addEventListener('pointermove', function(ev){ tipShow(ev, it.l, it.tip); }); row.addEventListener('pointerleave', tipHide); }
    host.appendChild(row);
  });
}

function card(titulo, sub, kids, extra){
  return h('section', {class:'card' + (extra ? ' ' + extra : '')}, [h('div', {class:'card-h'}, [h('h2', {text:titulo}), sub ? h('p', {text:sub}) : null])].concat(kids || []));
}
function tabela(cols, linhas, rodape, opts){
  opts = opts || {};
  var t = h('table');
  t.appendChild(h('thead', null, [h('tr', null, cols.map(function(c, i){ return h('th', {scope:'col', class:(opts.esq || []).indexOf(i) >= 0 ? 'esq' : null, text:c}); }))]));
  t.appendChild(h('tbody', null, linhas.map(function(l){
    return h('tr', {class:l.cls || ''}, l.cel.map(function(c, i){ return h('td', {class:(opts.esq || []).indexOf(i) >= 0 ? 'esq' : null}, [c === null || c === undefined ? '—' : c]); }));
  })));
  if (rodape) t.appendChild(h('tfoot', null, [h('tr', null, rodape.map(function(c){ return h('td', null, [c === null || c === undefined ? '' : String(c)]); }))]));
  return h('div', {class:'tw'}, [t]);
}
function alerta(txt){ return h('div', {class:'alerta'}, [icone('alerta'), h('span', {text:txt})]); }

/* =========================================================
   Cabeçalho de página
   ========================================================= */
function cabecalho(titulo, A, B, extras){
  var per = h('p', {class:'per'});
  per.appendChild(h('b', {text:A.rot}));
  if (A.parcial) per.appendChild(document.createTextNode(' · mês em andamento, dados até ' + dm(A.ate || A.fim)));
  if (B) per.appendChild(document.createTextNode(' · comparado com ' + B.rot.toLowerCase().replace(/^(\d)/, '$1')));
  var tags = h('div', {class:'tags'});
  if (sel.esp !== 'todas') tags.appendChild(h('span', {class:'tag'}, [h('i'), 'Especialidade: ' + FILTRO_ESP.filter(function(x){ return x[0] === sel.esp; })[0][1]]));
  if (A.parcial && A.mes && B && B.fim === fimMes(mesDe(B.ini))) tags.appendChild(h('span', {class:'tag', title:'Comparação com um mês fechado'}, [h('i'), 'Mês em andamento: volumes ainda vão crescer']));
  (extras || []).forEach(function(t){ if (t) tags.appendChild(h('span', {class:'tag aviso', text:t})); });
  return h('div', {class:'phead'}, [h('div', null, [h('h1', {text:titulo}), per]), tags]);
}
function notaKommo(a){ return a.kommo !== 'nenhum' && a.r.fim > KOMMO_LIDO && a.r.ini <= KOMMO_LIDO && a.r.fim <= HOJE ? 'Agenda lida em ' + dm(KOMMO_LIDO) + '.' : null; }
function avisosKommo(a){
  var av = [];
  if (a.kommo === 'nenhum') av.push('Agenda no Kommo só a partir de jul/2026');
  else if (a.kommo === 'parcial') av.push('Agenda no Kommo só a partir de 01/07');
  if (a.r.fim > KOMMO_LIDO && a.kommo !== 'nenhum') av.push('Agenda lida em ' + dm(KOMMO_LIDO));
  return av;
}
function serieTile(pega){
  if (sel.modo === 'mes'){
    return mesesSerie().map(function(p){ var a = agg(p); return {v:pega(a), t:p.t, hl:p.mes === sel.mes ? 'a' : (p.mes === sel.cmp ? 'b' : '')}; });
  }
  var A = periodoA();
  return baldes(A).map(function(p, i, arr){ return {v:pega(agg(p)), t:p.t, hl:i === arr.length - 1 ? 'a' : ''}; });
}

/* =========================================================
   Páginas
   ========================================================= */
function pgGeral(){
  var A = periodoA(), B = periodoB(), a = agg(A), b = B ? agg(B) : null, bRot = B ? rotCurto(B) : null;
  var f = document.createDocumentFragment();
  f.appendChild(cabecalho('Visão geral', A, B, avisosKommo(a)));

  /* indicadores principais */
  var temLeads = sel.esp === 'todas';
  var g = h('div', {class:'grid g5'});
  if (temLeads) g.appendChild(tile({hero:true, rot:'Leads (Meta)', v:a.conversas, b:b && b.conversas, bRot:bRot, tipo:'n', nota:'Conversas iniciadas pelos anúncios', serie:serieTile(function(x){ return x.conversas; })}));

  else g.appendChild(tile({hero:true, rot:'Leads (Meta)', v:null, nota:'Os leads do Meta ainda não são separados por especialidade aqui; veja a página Mídia paga.'}));
  g.appendChild(tile({rot:'Agendamentos feitos', v:a.agend, b:b && b.agend, bRot:bRot, tipo:'n', nota:notaKommo(a), serie:serieTile(function(x){ return x.agend; })}));
  g.appendChild(tile({rot:'Consultas realizadas', v:a.realizadas, b:b && b.realizadas, bRot:bRot, tipo:'n', serie:serieTile(function(x){ return x.realizadas; })}));
  if (a.pres.v !== null && a.pres.valida) g.appendChild(tile({rot:'Comparecimento', v:a.pres.v, b:b && b.pres.valida ? b.pres.v : null, bRot:bRot, tipo:'pct', pp:true, serie:serieTile(function(x){ return x.pres.valida ? x.pres.v : null; })}));
  else g.appendChild(tile({rot:'Comparecimento', espera:true, txt:a.kommo === 'nenhum' ? 'Sem registro' : (a.cons.sem ? 'Em validação' : 'Sem consultas'), nota:a.kommo === 'nenhum' ? 'Agenda registrada a partir de julho/2026.' : (a.cons.sem ? a.cons.sem + ' consultas já passaram sem registro de presença.' : 'Ainda não há consultas concluídas no período.')}));
  if (sel.esp === 'todas') g.appendChild(tile({rot:'Investimento em anúncios', v:a.spend, b:b && b.spend, bRot:bRot, tipo:'brl0', sentido:'neutro', serie:serieTile(function(x){ return x.spend; })}));
  else g.appendChild(tile({rot:'Investimento em anúncios', v:null, nota:'Total da conta; ainda não separado por especialidade.'}));
  f.appendChild(g);

  /* funil + avaliações */
  var row = h('div', {class:'grid g-7-5 mt'});
  var cf = card('Do contato à consulta', 'Contagens do período');
  var itens = [], topo = null;
  if (temLeads){ topo = a.conversas; itens.push({l:'Leads (Meta)', sub:'conversas iniciadas pelos anúncios', v:a.conversas, b:b ? b.conversas : undefined, bRot:bRot}); }

  var convA = topo && a.agend !== null ? [h('b', {text:nf1.format(a.agend / topo * 100) + '%'}), ' em relação aos leads do Meta'] : null;
  itens.push({l:'Agendamentos feitos', sub:'pela data em que o paciente agendou', v:a.agend, b:b ? b.agend : undefined, bRot:bRot, conv:convA});
  itens.push({l:'Consultas no período', sub:'pela data da consulta', v:a.consTot, b:b ? b.consTot : undefined, bRot:bRot, cls:'b'});
  var base = a.cons.comp + a.cons.falta;
  itens.push({l:'Compareceram', sub:'consultas realizadas', v:a.realizadas, b:b ? b.realizadas : undefined, bRot:bRot,
    conv:base ? (a.pres.valida ? [h('b', {text:nf1.format(a.cons.comp / base * 100) + '%'}), ' das consultas que já aconteceram'] : ['Comparecimento em validação: ', h('b', {text:String(a.cons.sem)}), ' consultas passadas sem registro']) : null});
  if (a.kommo === 'nenhum') cf.appendChild(h('p', {class:'vazio', text:'A agenda começou a ser registrada no Kommo em julho de 2026.'}));
  else { barrasH(cf, itens); cf.appendChild(h('p', {class:'nota', text:NOTA_PRES})); }
  row.appendChild(cf);
  if (avalVisivel(A)) row.appendChild(cardAvaliacoes(a, b, bRot)); else row.className = 'mt';
  f.appendChild(row);

  /* especialidades */
  f.appendChild(h('div', {class:'mt'}, [cardEspecialidades(a, b, bRot)]));

  /* origem + mídia */
  var row2 = h('div', {class:'grid g-7-5 mt'});
  row2.appendChild(cardOrigem(a, b, bRot));
  row2.appendChild(cardMidiaResumo(a, b, bRot));
  f.appendChild(row2);
  f.appendChild(notas());
  return f;
}
function rotCurto(B){ return B.mes ? nomeMes(B.mes) : 'anterior'; }

function cardAvaliacoes(a, b, bRot){
  var c = card('Avaliações cortesia · dermatologia', 'Pela data da avaliação');
  c.appendChild(h('div', {class:'alerta', style:'margin:0 0 14px'}, [icone('alerta'), h('span', {text:avalNota()})]));
  if (!espOk('derm')){ c.appendChild(h('p', {class:'vazio', text:'O filtro de especialidade atual não inclui dermatologia.'})); return c; }
  if (a.kommo === 'nenhum'){ c.appendChild(h('p', {class:'vazio', text:'A agenda começou a ser registrada no Kommo em julho de 2026.'})); return c; }
  var st = a.avalDerm, tot = a.avalDermTot, bt = b ? b.avalDermTot : null;
  var big = h('div', {class:'big'}, [h('strong', {text:fmt(tot)}), h('span', {text:tot === 1 ? 'avaliação marcada para o período' : 'avaliações marcadas para o período'})]);
  if (b && b.kommo !== 'nenhum'){ var ch = chipDelta(tot, bt, 'maior', false, 'n'); if (ch) big.appendChild(ch); }
  c.appendChild(big);
  barraStatus(c, st);
  var pr = presenca(st), prb = b ? presenca(b.avalDerm) : null;
  c.appendChild(h('div', {class:'mini'}, [
    h('div', null, ['Novas marcações', h('b', {text:fmt(a.avalDermA)})]),
    h('div', null, ['Comparecimento', h('b', {text:pr.v === null ? '—' : (pr.valida ? fmt(pr.v, 'pct') : 'em validação')})]),
    h('div', null, [bRot && bRot !== 'anterior' ? 'Comparec. em ' + bRot : 'Período anterior', h('b', {text:prb && prb.v !== null && prb.valida ? fmt(prb.v, 'pct') : '—'})])
  ]));
  if (st.sem) c.appendChild(alerta(st.sem + (st.sem === 1 ? ' avaliação já passou da data e está' : ' avaliações já passaram da data e estão') + ' sem registro de presença na aba Agendamentos Kommo da planilha (coluna Comparecimento). Vale pedir a atualização ao atendimento.'));
  c.appendChild(h('p', {class:'nota', text:'Serviço “Avaliação cortesia” de dermatologia, na aba Agendamentos Kommo da planilha. Novas marcações: avaliações agendadas dentro do período, para qualquer data. Cancelaram e remarcaram aparecem separados na legenda.'}));
  return c;
}

function cardEspecialidades(a, b, bRot){
  var c = card('Por especialidade', 'Marcações pela data do agendamento; consultas pela data da consulta');
  if (a.kommo === 'nenhum'){ c.appendChild(h('p', {class:'vazio', text:'A divisão por especialidade existe a partir de julho de 2026.'})); return c; }
  var lista = ESP_ORDEM.filter(function(e){ return espOk(e); });
  var mx = Math.max.apply(null, lista.map(function(e){ return a.espA[e]; }).concat([1]));
  var ativos = lista.filter(function(e){ return a.espA[e] || totSt(a.espC[e]); }).sort(function(x, y){ return (a.espA[y] + totSt(a.espC[y])) - (a.espA[x] + totSt(a.espC[x])); });
  var parados = lista.filter(function(e){ return ativos.indexOf(e) < 0; });
  var linhas = ativos.map(function(e){
    var cs = a.espC[e], pr = presenca(cs), mb = b ? b.espA[e] : null;
    var marc = h('span', null, [h('span', {class:'ib', style:'width:' + Math.round(a.espA[e] / mx * 60) + 'px'}), fmt(a.espA[e])]);
    return {cel:[ESP_NOME[e], marc, mb === null ? '—' : fmt(mb), fmt(totSt(cs)), fmt(cs.comp), fmt(cs.falta), fmt(cs.canc + cs.remarc), fmt(cs.fut + cs.sem),
      h('span', {class:'pres', text:pr.v === null ? '—' : (pr.valida ? fmt(pr.v, 'pct') : 'em validação')})]};
  });
  var T = a.cons;
  c.appendChild(tabela(['Especialidade', 'Marcações', bRot ? (bRot === 'anterior' ? 'Período anterior' : 'Marcações em ' + bRot) : 'Anterior', 'Consultas', 'Compareceram', 'Faltas', 'Cancel. / remarc.', 'A acontecer / sem registro', 'Comparecimento'],
    linhas, ['Total', fmt(a.agend), b && b.agend !== null ? fmt(b.agend) : '—', fmt(a.consTot), fmt(T.comp), fmt(T.falta), fmt(T.canc + T.remarc), fmt(T.fut + T.sem), a.pres.v === null ? '—' : (a.pres.valida ? fmt(a.pres.v, 'pct') : 'em validação')]));
  if (parados.length) c.appendChild(h('p', {class:'nota', text:'Sem movimento no período: ' + parados.map(function(e){ return ESP_NOME[e]; }).join(', ') + '.'}));
  return c;
}

function cardOrigem(a, b, bRot){
  var c = card('De onde vieram os agendamentos', 'Origem registrada no Kommo');
  if (a.kommo === 'nenhum' || !a.agend){ c.appendChild(h('p', {class:'vazio', text:a.kommo === 'nenhum' ? 'Origem registrada a partir de julho de 2026.' : 'Nenhum agendamento no período.'})); return c; }
  var ks = Object.keys(ORI_NOME).filter(function(k){ return a.ori[k] || (b && b.ori[k]); }).sort(function(x, y){ return (a.ori[y] || 0) - (a.ori[x] || 0); });
  barrasH(c, ks.map(function(k){
    var v = a.ori[k] || 0, p = v / a.agend * 100;
    return {l:ORI_NOME[k], sub:nf0.format(p) + '% dos agendamentos', v:v, b:b && b.kommo !== 'nenhum' ? (b.ori[k] || 0) : undefined, bRot:bRot};
  }));
  return c;
}

function cardMidiaResumo(a, b, bRot){
  var c = card('Anúncios no Meta', 'Conta inteira, direto do Gerenciador');
  var g = h('div', {class:'grid g2 solo'});
  function mini(rot, v, bv, tipo, sentido){
    var el = h('div', {style:'padding:4px 0'});
    el.appendChild(h('div', {class:'st-l', text:rot}));
    el.appendChild(h('div', {class:'st-v', style:'font-size:24px', text:fmt(v, tipo)}));
    if (bRot){ var cc = h('div', {class:'st-c'}, [h('span', {text:bRot + ':'}), h('b', {text:fmt(bv, tipo)})]); var ch = chipDelta(v, bv, sentido, false, tipo); if (ch) cc.appendChild(ch); el.appendChild(cc); }
    return el;
  }
  g.appendChild(mini('Investimento', a.spend, b && b.spend, 'brl0', 'neutro'));
  g.appendChild(mini('Leads (Meta)', a.conversas, b && b.conversas, 'n', 'maior'));
  g.appendChild(mini('Custo por lead', a.cpc, b && b.cpc, 'brl2', 'menor'));
  g.appendChild(mini('Cliques no link', a.cliques, b && b.cliques, 'n', 'maior'));
  c.appendChild(g);
  c.appendChild(h('button', {type:'button', class:'tag', style:'margin-top:14px;cursor:pointer', onclick:function(){ irPara('midia'); }, text:'Ver mídia paga em detalhe →'}));
  return c;
}

function pgAgenda(){
  var A = periodoA(), B = periodoB(), a = agg(A), b = B ? agg(B) : null, bRot = B ? rotCurto(B) : null;
  var f = document.createDocumentFragment();
  f.appendChild(cabecalho('Agenda e consultas', A, B, avisosKommo(a)));
  if (a.kommo === 'nenhum'){ f.appendChild(card('Sem agenda neste período', null, [h('p', {class:'vazio', text:'A agenda começou a ser registrada no Kommo em julho de 2026. Escolha um período a partir de julho.'})])); return f; }
  var g = h('div', {class:'grid g4'});
  g.appendChild(tile({rot:'Agendamentos feitos', v:a.agend, b:b && b.agend, bRot:bRot, tipo:'n', hero:true}));
  g.appendChild(tile({rot:'Consultas no período', v:a.consTot, b:b && b.consTot, bRot:bRot, tipo:'n'}));
  if (a.pres.valida) g.appendChild(tile({rot:'Comparecimento', v:a.pres.v, b:b && b.pres.valida ? b.pres.v : null, bRot:bRot, tipo:'pct', pp:true}));
  else g.appendChild(tile({rot:'Comparecimento', espera:true, txt:a.cons.sem ? 'Em validação' : 'Sem consultas', nota:a.cons.sem ? a.cons.sem + ' consultas já passaram sem registro.' : 'Sem consultas concluídas ainda.'}));
  g.appendChild(tile({rot:'Tempo até a consulta', v:a.mediana, b:b && b.mediana, bRot:bRot, tipo:'dias', sentido:'menor', nota:'Mediana entre o agendamento e a consulta, de quem compareceu.'}));
  f.appendChild(g);

  var bk = baldes(A), rotB = bk.length && bk[0].ini === bk[0].fim ? 'por dia' : (bk.length > 1 && bk[1].l.length > 3 ? 'por mês' : 'por semana');
  var cA = card('Agendamentos feitos ' + rotB, B ? 'No período anterior: ' + fmt(b.agend) + ' agendamentos' : null);
  colunas(cA, bk.map(function(p){ return {l:p.l, t:p.t, v:p.ini > KOMMO_LIDO ? null : agg(p).agend, sub:p.ini > KOMMO_LIDO ? 'Agenda lida em ' + dm(KOMMO_LIDO) : null}; }), {nome:'Agendamentos', tipo:'n', rotulos:bk.length <= 14, aria:'Agendamentos feitos ' + rotB});
  f.appendChild(h('div', {class:'mt'}, [cA]));

  var row = h('div', {class:'grid g-5-7 mt'});
  var cs = card('Situação das consultas do período', fmt(a.consTot) + ' consultas');
  barraStatus(cs, a.cons);
  if (a.cons.sem) cs.appendChild(alerta(a.cons.sem + ' consultas já passaram da data e continuam como “aguardando” na planilha. Até serem atualizadas, o comparecimento fica em validação.'));
  cs.appendChild(h('p', {class:'nota', text:NOTA_PRES}));
  row.appendChild(cs);

  var cav = card('Avaliações cortesia · dermatologia', 'Até ' + nomeMes(AVAL_ULTIMO_MES) + ' de 2026');
  var ls = ['derm'].filter(function(e){ return espOk(e) && (totSt(a.aval[e]) || a.avalA[e]); }).map(function(e){
    var x = a.aval[e], pr = presenca(x);
    return {cel:[fmt(a.avalA[e]), fmt(totSt(x)), fmt(x.comp), fmt(x.falta), fmt(x.canc), fmt(x.remarc), pr.v === null ? '—' : (pr.valida ? fmt(pr.v, 'pct') : 'em validação')]};
  });
  if (ls.length) cav.appendChild(tabela(['Novas marcações', 'No período', 'Vieram', 'Faltaram', 'Cancelaram', 'Remarcaram', 'Comparec.'], ls));
  else cav.appendChild(h('p', {class:'vazio', text:espOk('derm') ? 'Nenhuma avaliação de dermatologia no período.' : 'O filtro de especialidade atual não inclui dermatologia.'}));
  if (avalVisivel(A)){ cav.appendChild(h('p', {class:'nota', text:avalNota()})); row.appendChild(cav); } else row.className = 'mt';
  f.appendChild(row);

  var row2 = h('div', {class:'grid g2 mt'});
  var cp = card('Próximas consultas', 'Marcadas a partir de ' + dm(KOMMO_LIDO) + ', por especialidade');
  var prox = {}, totp = 0;
  D.diario.cons.forEach(function(x){ if (x[3] === 'aguard' && x[0] >= KOMMO_LIDO && espOk(x[1])){ prox[x[1]] = (prox[x[1]] || 0) + x[4]; totp += x[4]; } });
  if (totp) barrasH(cp, Object.keys(prox).sort(function(x, y){ return prox[y] - prox[x]; }).map(function(e){ return {l:ESP_NOME[e], v:prox[e]}; }));
  else cp.appendChild(h('p', {class:'vazio', text:'Nenhuma consulta futura registrada.'}));
  cp.appendChild(h('p', {class:'nota', text:'Independe do período escolhido: mostra o que já está na agenda.'}));
  row2.appendChild(cp);

  var cad = card('Anúncios que mais geraram agendamentos', 'Origem “Anúncio Mondän”');
  var ks = Object.keys(a.ads).sort(function(x, y){ return a.ads[y] - a.ads[x]; }).slice(0, 6);
  if (ks.length) cad.appendChild(h('ol', {class:'rank'}, ks.map(function(k, i){
    var p = k.split('|');
    return h('li', null, [h('div', {class:'n', text:String(i + 1)}), h('div', null, [h('div', {class:'t', text:nomeAnuncio(p[1])}), h('div', {class:'m', text:ESP_NOME[p[0]]})]), h('div', {class:'v', text:fmt(a.ads[k])})]);
  })));
  else cad.appendChild(h('p', {class:'vazio', text:'Nenhum agendamento com anúncio identificado no período.'}));
  row2.appendChild(cad);
  f.appendChild(row2);
  f.appendChild(notas());
  return f;
}
function nomeAnuncio(n){
  return n.replace(/_?\[POST ID\]_?/gi, '_').replace(/_\d{2}\/\d{2}\/\d{4}$/, '').replace(/\s+_/g, '_').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^AD#(\d+) V[ÍI]DEO /i, 'AD#$1 · ').toLowerCase().replace(/^ad#/, 'AD#').replace(/(^|· )(\S)/g, function(m0, p1, p2){ return p1 + p2.toUpperCase(); });
}

function pgMidia(){
  var A = periodoA(), B = periodoB(), a = agg(A), b = B ? agg(B) : null, bRot = B ? rotCurto(B) : null;
  var f = document.createDocumentFragment();
  var av = []; if (A.fim > HOJE || (A.parcial)) av.push('Meta atualizado até ' + dm(HOJE));
  if (sel.esp !== 'todas') av.push('Mídia não separada por especialidade');
  f.appendChild(cabecalho('Mídia paga', A, B, av));
  var g = h('div', {class:'grid g5'});
  g.appendChild(tile({hero:true, rot:'Investimento', v:a.spend, b:b && b.spend, bRot:bRot, tipo:'brl0', sentido:'neutro', serie:serieTile(function(x){ return x.spend; })}));
  g.appendChild(tile({rot:'Leads (Meta)', v:a.conversas, b:b && b.conversas, bRot:bRot, tipo:'n', serie:serieTile(function(x){ return x.conversas; })}));
  g.appendChild(tile({rot:'Custo por lead', nota:'Só campanhas de lead de pacientes', v:a.cpc, b:b && b.cpc, bRot:bRot, tipo:'brl2', sentido:'menor', serie:serieTile(function(x){ return x.cpc; })}));
  g.appendChild(tile({rot:'Cliques no link', v:a.cliques, b:b && b.cliques, bRot:bRot, tipo:'n', serie:serieTile(function(x){ return x.cliques; })}));
  g.appendChild(tile({rot:'Captação de médicos', v:a.medicos, b:b && b.medicos, bRot:bRot, tipo:'n', nota:a.medicos === null ? 'Disponível por mês fechado.' : 'Leads do formulário para médicos parceiros.'}));
  f.appendChild(g);

  var bk = baldes(A), rotB = bk.length && bk[0].ini === bk[0].fim ? 'por dia' : (bk.length > 1 && bk[1].l.length > 3 ? 'por mês' : 'por semana');
  var row = h('div', {class:'grid g2 mt'});
  var c1 = card('Investimento ' + rotB, null);
  colunas(c1, bk.map(function(p){ var x = agg(p); return {l:p.l, t:p.t, v:p.ini > HOJE ? null : x.spend}; }), {nome:'Investimento', tipo:'brl0', altura:180});
  var c2 = card('Leads (Meta) ' + rotB, null);
  colunas(c2, bk.map(function(p){ var x = agg(p); return {l:p.l, t:p.t, v:p.ini > HOJE ? null : x.conversas, sub:x.conversas ? 'Custo por lead: ' + fmt(x.cpc, 'brl2') : null}; }), {nome:'Leads', tipo:'n', altura:180});
  row.appendChild(c1); row.appendChild(c2); f.appendChild(row);

  /* frentes, semana a semana (planilha de tráfego) */
  var sem = D.midia.semanal, CORF = {'Dermatologia · Vencedores':'var(--s1)', 'Dermatologia · Teste criativo':'var(--s2)', 'Blefaroplastia':'var(--s3)', 'Capilar · São Paulo':'var(--s4)', 'Capilar · Outros estados':'var(--s5)'};
  var frentes = Object.keys(CORF);
  var c3 = card('Custo por lead de cada frente, semana a semana', 'Direto do Meta · semanas de segunda a domingo');
  c3.appendChild(h('div', {class:'legenda'}, frentes.map(function(fr){ return h('span', null, [h('i', {style:'background:' + CORF[fr]}), fr]); })));
  linhas(c3, sem.map(function(w){ return w.semana.split(' a ')[0]; }), frentes.map(function(fr){
    return {nome:fr, cor:CORF[fr], v:sem.map(function(w){ var l = w.linhas.filter(function(x){ return x.frente === fr; })[0]; return l && l.cpl ? l.cpl : null; })};
  }), {tipo:'brl2', titulos:sem.map(function(w){ return 'Semana de ' + w.semana + (w.parcial ? ' (em andamento)' : ''); }), aria:'Custo por lead por frente e semana'});
  var c4 = card('Cada frente, em detalhe', null);
  var tabs = h('div', {class:'tabs', role:'tablist'}), corpo = h('div');
  var pad = 0; sem.forEach(function(w, i){ if (!w.parcial) pad = i; });
  function mostra(i){
    Array.prototype.forEach.call(tabs.children, function(bt, j){ bt.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
    var w = sem[i], tl = 0, tg = 0;
    var ls = w.linhas.map(function(l){ tl += l.leads || 0; tg += l.gasto || 0; return {cel:[l.frente, fmt(l.leads), fmt(l.cpl, 'brl2'), fmt(l.gasto, 'brl2'), l.ctr === null ? '—' : nf1.format(l.ctr) + '%']}; });
    corpo.textContent = '';
    corpo.appendChild(tabela(['Frente', 'Leads', 'Custo por lead', 'Investimento', 'Cliques no link ÷ impressões'], ls, ['Total', fmt(tl), fmt(tl ? tg / tl : null, 'brl2'), fmt(tg, 'brl2'), '']));
  }
  sem.forEach(function(w, i){ tabs.appendChild(h('button', {type:'button', role:'tab', text:w.semana.replace(' a ', '–') + (w.parcial ? ' *' : ''), onclick:function(){ mostra(i); }})); });
  mostra(pad); c4.appendChild(tabs); c4.appendChild(corpo);
  f.appendChild(h('div', {class:'mt'}, [c3])); f.appendChild(h('div', {class:'mt'}, [c4]));
  f.appendChild(h('div', {class:'callout mt'}, [h('b', {text:dmy(D.midia.marco.data)}), h('span', {text:D.midia.marco.texto})]));
  f.appendChild(notas());
  return f;
}

var IG_CAMPOS = ['alcance','visualizacoes','visitas','novos_seguidores','interacoes','cliques_link'];
function temIg(m){ var x = D.meses[m] && D.meses[m].instagram; return x && IG_CAMPOS.some(function(k){ return x[k] !== null && x[k] !== undefined; }); }
function mesInstagram(){
  var m = sel.modo === 'mes' ? sel.mes : mesDe(periodoA().fim), pedido = m;
  while (!temIg(m) && m > MESES_DISP[0]) m = mesAnt(m);
  return {m:m, pedido:pedido};
}
function MES_DE_ROTULO(r){
  var NM = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var p = String(r).toLowerCase().split(' '), i = NM.indexOf(p[0]);
  return i < 0 || !p[1] ? null : p[1] + '-' + String(i + 1).padStart(2, '0');
}
function pgInstagram(){
  var A = periodoA(), mi = mesInstagram(), m = mi.m, mb = (sel.modo === 'mes' && mi.m === mi.pedido) ? sel.cmp : mesAnt(m);
  var x = D.meses[m].instagram, y = D.meses[mb] ? D.meses[mb].instagram : {};
  var f = document.createDocumentFragment();
  var Ap = {rot:cap(nomeMes(m)) + ' ' + m.slice(0, 4)}, Bp = {rot:cap(nomeMes(mb)) + ' ' + mb.slice(0, 4), mes:mb};
  f.appendChild(cabecalho('Instagram @clinicamondan', Ap, Bp, [mi.m !== mi.pedido ? cap(nomeMes(mi.pedido)) + ' ainda não fechou: mostrando ' + nomeMes(m) : null, D.meses[m].parcial ? 'Mês em andamento: soma dos dias até ' + dm(HOJE) : null, sel.modo === 'periodo' ? 'Métricas do Instagram são mensais' : null]));
  var bRot = nomeMes(mb);
  var defs = [['alcance','Contas alcançadas'],['visualizacoes','Visualizações'],['visitas','Visitas ao perfil'],['novos_seguidores','Novos seguidores'],['interacoes','Interações'],['cliques_link','Cliques no link']];
  var faltam = defs.every(function(d){ return x[d[0]] === null || x[d[0]] === undefined; });
  var g = h('div', {class:'grid g4 ig'});
  g.appendChild(tile({hero:true, rot:'Seguidores', v:x.seguidores, b:y.seguidores, bRot:bRot, tipo:'n', serie:MESES_DISP.map(function(k){ return {v:D.meses[k].instagram.seguidores, t:cap(nomeMes(k)), hl:k === m ? 'a' : (k === mb ? 'b' : '')}; })}));
  defs.forEach(function(d){
    if (faltam) return;
    g.appendChild(tile({rot:d[1], v:x[d[0]], b:y[d[0]], bRot:D.meses[m].parcial ? bRot + ' inteiro' : bRot, semDelta:D.meses[m].parcial, tipo:'n', serie:MESES_DISP.map(function(k){ return {v:D.meses[k].instagram[d[0]], t:cap(nomeMes(k)), hl:k === m ? 'a' : (k === mb ? 'b' : '')}; })}));
  });
  f.appendChild(g);
  if (faltam) f.appendChild(h('div', {class:'mt'}, [card('Métricas de ' + nomeMes(m) + ' ainda não fechadas', null, [h('p', {class:'vazio', text:'O Instagram libera os números do mês no fechamento. Até lá, aparece só o total de seguidores.'})])]));

  var c = D.conteudo, ref = c.referencia, nm = nomeMes(m);
  var refMes = c.referencia ? MES_DE_ROTULO(c.referencia) : null;
  var topMes = (c.tops_mes && c.tops_mes[m]) || (m === refMes ? c.top_mes : null) || [];
  var formatos = (c.formatos_mes && c.formatos_mes[m]) || (m === refMes ? c.formatos : null) || [];
  function lista(itens){
    if (!itens.length) return h('p', {class:'vazio', text:'Nenhuma publicação com dados neste mês.'});
    return h('ol', {class:'rank'}, itens.map(function(i, n){
      var meta = [dm(i.data), i.especialidade, i.formato].filter(Boolean).join(' · ');
      var tit = i.link ? h('a', {class:'t lk', href:i.link, target:'_blank', rel:'noopener noreferrer', title:'Abrir no Instagram'}, [i.titulo, h('span', {class:'ext', 'aria-hidden':'true', text:' ↗'})]) : h('div', {class:'t', text:i.titulo});
      return h('li', null, [h('div', {class:'n', text:String(n + 1)}), h('div', null, [tit, h('div', {class:'m', text:meta})]),
        h('div', {class:'v', title:'interações + seguidores gerados', text:fmt((i.interacoes || 0) + (i.seguidores || 0))})]);
    }));
  }
  var row = h('div', {class:'grid g2 mt'});
  row.appendChild(card('Melhores conteúdos de ' + nm, 'Interações + seguidores gerados · toque no título para abrir no Instagram', [lista(topMes)]));
  row.appendChild(card('Melhores do ano até agora', 'Mesmo critério', [lista(c.top_ano || [])]));
  f.appendChild(row);
  if (formatos.length) f.appendChild(h('div', {class:'mt'}, [card('Publicações por formato · ' + nm + ' ' + m.slice(0, 4), null, [tabela(['Formato', 'Publicações', 'Interações', 'Seguidores novos', 'Visualizações'],
    formatos.map(function(x){ return {cel:[x.formato, fmt(x.publicacoes), fmt(x.interacoes), fmt(x.seguidores), fmt(x.visualizacoes)]}; }))])]));
  if (c.aprendizado && m === refMes) f.appendChild(h('div', {class:'callout mt'}, [h('b', {text:'O que o mês ensina'}), h('span', {text:c.aprendizado})]));
  return f;
}

/* =========================================================
   Remarketing: disparos cadastrados pela equipe (db do artifact)
   ========================================================= */
var RMK = {db:null, docs:null, estado:'carregando', pode:null, form:null, msg:null, pendente:false};
var RMK_ESP = ['Dermatologia', 'Capilar', 'Blefaroplastia', 'Ginecologia', 'Endocrinologia', 'Urologia', 'Vascular', 'Proctologia', 'Outras'];
function hojeIso(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function somaDias(iso, n){ var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function rmkRender(){ if (sel.pag !== 'remarketing' && !(sel.pag === 'kommo' && sel.kaba === 'remarketing')) return; if (RMK.form){ RMK.pendente = true; return; } render(); }
function rmkInit(){
  if (!window.claude || !window.claude.use){ RMK.estado = 'sem'; return; }
  window.claude.use('user').then(function(u){
    if (u && u.can) Promise.resolve(u.can('data.write')).then(function(v){ RMK.pode = v; rmkRender(); if (sel.pag === 'evolucao') render(); }).catch(function(){});
  }).catch(function(){});
  window.claude.use('db').then(function(db){
    if (!db){ RMK.estado = 'sem'; rmkRender(); return; }
    RMK.db = db;
    var t = setTimeout(function(){ if (RMK.estado === 'carregando'){ RMK.estado = 'lento'; rmkRender(); } }, 10000);
    db.collection('remarketing').onSnapshot(function(snap){
      RMK.docs = snap.docs.map(function(d){ var x = d.data() || {}; return {id:d.id, data:String(x.data || ''), especialidade:String(x.especialidade || ''), nome:x.nome ? String(x.nome) : '', contatos:num(x.contatos), respostas:num(x.respostas), agend:num(x.agend)}; })
        .filter(function(x){ return /^\d{4}-\d{2}-\d{2}$/.test(x.data); });
      if (!snap.metadata.fromCache){ clearTimeout(t); RMK.estado = 'ok'; }
      rmkRender();
    }, function(){ clearTimeout(t); RMK.estado = 'erro'; rmkRender(); });
  }).catch(function(){ RMK.estado = 'sem'; rmkRender(); });
}
function num(v){ return v === null || v === undefined || v === '' || isNaN(+v) ? null : +v; }
function rmkLista(){
  var base = RMK.docs ? RMK.docs : (D.remarketing.disparos && D.remarketing.disparos.length) ? D.remarketing.disparos : D.remarketing.recentes.map(function(x, i){ return {id:'p' + i, data:x.data, especialidade:x.especialidade, contatos:x.contatos, respostas:x.em_andamento ? null : x.respostas, agend:x.em_andamento ? null : x.agend}; });
  var hoje = hojeIso(), PL = D.remarketing.planilha || [];
  var out = base.map(function(x){ var y = Object.assign({}, x); y.status = x.data > hoje ? 'prog' : (x.respostas === null ? 'and' : 'ok');
    var p = rmkPlanilha(y, PL); if (p){ if (!y.tema) y.tema = p.tema; if (!y.criativo) y.criativo = p.criativo; if (!y.criativo_obs) y.criativo_obs = p.criativo_obs; }
    return y; });
  /* histórico anterior ao primeiro disparo cadastrado: vem da aba Campanhas_RMKT */
  var ini = out.reduce(function(m, x){ return !m || x.data < m ? x.data : m; }, null);
  PL.forEach(function(p, i){ if (ini && p.data < ini) out.push(Object.assign({id:'pl' + i, hist:true, status:'ok'}, p)); });
  return out.sort(function(a, b){ return a.data < b.data ? 1 : a.data > b.data ? -1 : 0; });
}
/* liga o disparo à linha da planilha do mesmo dia e especialidade; se houver mais de uma, usa o nome do disparo */
function rmkNorm(t){ return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function rmkPlanilha(x, PL){
  var c = PL.filter(function(p){ return p.data === x.data && p.especialidade === x.especialidade; });
  if (c.length < 2) return c[0] || null;
  var n = rmkNorm(x.nome) + ' ' + rmkNorm(x.tema), melhor = null, pts = 0;
  c.forEach(function(p){ var k = rmkNorm(p.tema).split(/[^a-z0-9]+/).filter(function(w){ return w.length > 3 && n.indexOf(w) >= 0; }).length; if (k > pts){ pts = k; melhor = p; } else if (k === pts) melhor = null; });
  return melhor;
}
function rmkLinkCriativo(x){
  if (x.criativo){
    var u = x.criativo, tipo = /trello\.com/.test(u) ? 'Trello' : (/drive\/(u\/\d\/)?folders/.test(u) ? 'pasta do Drive' : (/instagram\.com/.test(u) ? 'Instagram' : 'Drive'));
    return h('a', {class:'lk rmk-cr', href:u, target:'_blank', rel:'noopener noreferrer', title:'Abrir o criativo enviado (' + tipo + ')'}, ['Ver ', h('span', {class:'ext', text:'↗'}), tipo !== 'Drive' ? h('small', {text:' ' + tipo}) : null]);
  }
  if (x.criativo_obs) return h('span', {class:'rmk-sem', title:'Anotado na planilha, sem link', text:x.criativo_obs});
  return h('span', {class:'rmk-sem', text:x.status === 'prog' ? 'falta link' : 'sem link'});
}
/* agendamentos com origem “Remarketing” no Kommo nos 14 dias após o disparo */
function rmkKommo(x, lista){
  var e = Object.keys(ESP_NOME).filter(function(k){ return ESP_NOME[k] === x.especialidade; })[0];
  if (!e || x.data > KOMMO_LIDO) return null;
  var n = 0;
  D.diario.agend.forEach(function(r){
    if (r[3] !== 'remarketing' || r[1] !== e) return;
    /* cada agendamento vai para o disparo mais recente da especialidade até 14 dias antes; empate: o de mais contatos */
    var cand = lista.filter(function(y){ return y.especialidade === x.especialidade && y.data <= r[0] && somaDias(y.data, 13) >= r[0]; })
      .sort(function(a, b){ return a.data !== b.data ? (a.data < b.data ? 1 : -1) : ((b.contatos || 0) - (a.contatos || 0)); });
    if (cand[0] && cand[0].id === x.id) n += r[4];
  });
  return n;
}
function rmkForm(x){
  var novo = !x.id, f = h('form', {class:'rmk-form'});
  function campo(rot, el){ return h('label', null, [h('span', {text:rot}), el]); }
  var iData = h('input', {type:'date', required:'required', value:x.data || somaDias(hojeIso(), 1)});
  var iEsp = h('select', {required:'required'}, RMK_ESP.map(function(e){ var o = h('option', {value:e, text:e}); if (e === (x.especialidade || 'Dermatologia')) o.selected = true; return o; }));
  function nIn(v, ph){ return h('input', {type:'number', min:'0', step:'1', inputmode:'numeric', placeholder:ph || '', value:v === null || v === undefined ? '' : String(v)}); }
  var iCont = nIn(x.contatos), iResp = nIn(x.respostas, 'depois do disparo'), iAg = nIn(x.agend, 'depois do disparo');
  var iTema = h('input', {type:'text', maxlength:'80', placeholder:'Ex.: Black Friday capilar', value:x.tema || ''});
  var iCr = h('input', {type:'url', placeholder:'https://drive.google.com/...', value:x.criativo || ''});
  f.appendChild(h('div', {class:'rmk-campos'}, [campo('Data', iData), campo('Especialidade', iEsp), campo('Contatos', iCont), campo('Respostas', iResp), campo('Agendamentos', iAg)]));
  f.appendChild(h('div', {class:'rmk-campos rmk-campos2'}, [campo('Tema', iTema), campo('Link do criativo (Drive)', iCr)]));
  var erro = h('p', {class:'rmk-erro', hidden:'hidden'});
  var bSal = h('button', {type:'submit', class:'btn pri', text:novo ? 'Cadastrar disparo' : 'Salvar'});
  var bCan = h('button', {type:'button', class:'btn', text:'Cancelar'});
  var acoes = h('div', {class:'rmk-acoes'}, [bSal, bCan]);
  if (!novo){ var bDel = h('button', {type:'button', class:'btn del', text:'Excluir'}); acoes.appendChild(bDel);
    bDel.addEventListener('click', function(){ if (!confirm('Excluir este disparo?')) return; bDel.disabled = true;
      RMK.db.collection('remarketing').doc(x.id).delete().then(fechar).catch(falha); }); }
  f.appendChild(acoes); f.appendChild(erro);
  function fechar(){ RMK.form = null; RMK.pendente = false; render(); }
  function falha(e){ bSal.disabled = false; erro.hidden = false;
    erro.textContent = e && e.code === 'invalid_argument' ? 'Você não tem permissão para editar este painel. Peça à AGE acesso de editor.' : 'Não foi possível salvar agora. Tente de novo em instantes.';
    if (e && e.code === 'invalid_argument') RMK.pode = false; }
  bCan.addEventListener('click', fechar);
  f.addEventListener('submit', function(ev){
    ev.preventDefault();
    var corpo = {data:iData.value, especialidade:iEsp.value, contatos:num(iCont.value), respostas:num(iResp.value), agend:num(iAg.value), atualizado_em:new Date().toISOString(), editado_manual:true};
    if (x.nome) corpo.nome = x.nome;
    if (x.origem) corpo.origem = x.origem;
    var tema = iTema.value.trim(), cr = iCr.value.trim();
    if (tema) corpo.tema = tema;
    if (cr){ if (!/^https:\/\//.test(cr)){ erro.hidden = false; erro.textContent = 'O link do criativo precisa começar com https://'; return; } corpo.criativo = cr; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(corpo.data)){ erro.hidden = false; erro.textContent = 'Informe a data.'; return; }
    bSal.disabled = true;
    var col = RMK.db.collection('remarketing');
    (novo ? col.doc() : col.doc(x.id)).set(corpo).then(fechar).catch(falha);
  });
  return f;
}
function pgRemarketing(){
  var A = periodoA(), r = D.remarketing, f = document.createDocumentFragment();
  f.appendChild(cabecalho('Remarketing', A, null, []));
  var lista = rmkLista();
  var dentro = lista.filter(function(x){ return x.data >= A.ini && x.data <= A.fim && x.status !== 'prog'; });
  var conc = dentro.filter(function(x){ return x.status === 'ok'; }), and = dentro.length - conc.length;
  var soma = function(arr, k){ return arr.reduce(function(t, x){ return t + (x[k] || 0); }, 0); };
  var prog = lista.filter(function(x){ return x.status === 'prog'; }).sort(function(a, b){ return a.data < b.data ? -1 : 1; });
  var g = h('div', {class:'grid g4'});
  g.appendChild(tile({hero:true, rot:'Disparos no período', v:dentro.length, tipo:'n', nota:and ? and + ' aguardando resultado' : null}));
  g.appendChild(tile({rot:'Contatos impactados', v:soma(dentro, 'contatos'), tipo:'n'}));
  g.appendChild(tile({rot:'Responderam', v:conc.length ? soma(conc, 'respostas') : null, tipo:'n', nota:conc.length ? 'Taxa de ' + nf1.format(soma(conc, 'respostas') / Math.max(1, soma(conc, 'contatos')) * 100) + '%' : null}));
  g.appendChild(tile({rot:'Agendamentos gerados', v:conc.length ? soma(conc, 'agend') : null, tipo:'n'}));
  f.appendChild(g);

  /* mês a mês: planilha até o último mês dela; depois, os disparos cadastrados */
  var ult = r.mensal[r.mensal.length - 1].mes, mens = r.mensal.slice(), extra = {};
  lista.forEach(function(x){ var m = x.data.slice(0, 7); if (m > ult && x.status === 'ok'){ extra[m] = extra[m] || {mes:m, contatos:0, respostas:0, agend:0}; extra[m].contatos += x.contatos || 0; extra[m].respostas += x.respostas || 0; extra[m].agend += x.agend || 0; } });
  Object.keys(extra).sort().forEach(function(m){ mens.push(extra[m]); });
  var row = h('div', {class:'grid g-5-7 mt'});
  var c1 = card('Quem respondeu, mês a mês', 'Respostas ÷ contatos dos disparos');
  colunas(c1, mens.map(function(x){ var mm = x.mes; return {l:nomeMes(mm, true), t:cap(nomeMes(mm)) + ' · ' + fmt(x.contatos) + ' contatos, ' + fmt(x.agend) + ' agendamentos', v:x.contatos ? x.respostas / x.contatos * 100 : null, hl:(sel.modo === 'mes' && mm === sel.mes) ? 'a' : ''}; }),
    {nome:'Taxa de resposta', tipo:'pct', rotulos:true, altura:200, cor:'#D8C3A3'});
  c1.appendChild(h('p', {class:'nota', text:'Meses fechados até ' + nomeMes(ult) + ' vêm da planilha; os seguintes, dos disparos cadastrados aqui.'}));

  var proxTxt = prog.length ? 'Próximo: ' + dm(prog[0].data) + ' · ' + prog[0].especialidade : 'Ciclo de ' + r.ciclo_dias + ' dias';
  var c2 = card('Disparos', proxTxt);
  var podeEditar = RMK.db && RMK.pode !== false && RMK.estado !== 'erro';
  if (podeEditar && !RMK.form){
    var bNovo = h('button', {class:'btn pri', type:'button', text:'+ Cadastrar disparo'});
    bNovo.addEventListener('click', function(){ RMK.form = {}; render(); });
    c2.appendChild(h('div', {class:'rmk-topo'}, [bNovo, h('span', {class:'nota', text:'Cadastre ao planejar, com o link do criativo: ele aparece como Programado. Depois do envio, volte para lançar respostas e agendamentos.'})]));
  }
  if (RMK.form) c2.appendChild(rmkForm(RMK.form));
  if (RMK.estado === 'lento') c2.appendChild(alerta('Os disparos cadastrados ainda não carregaram. Os números podem estar desatualizados.'));
  if ((RMK.estado === 'sem' || RMK.estado === 'erro') && window.claude && window.claude.use) c2.appendChild(alerta('Cadastro indisponível nesta visualização. Mostrando os disparos da planilha.'));
  var ST = {prog:['Programado', 'rst-prog'], and:['Aguardando resultado', 'rst-and'], ok:['Concluído', 'rst-ok']};
  var vis = RMK.todos ? lista : lista.slice(0, 14);
  c2.appendChild(tabela(['Data', 'Especialidade', 'Criativo', 'Contatos', 'Respostas', 'Agend.', ''], vis.map(function(x){
    var ed = null;
    if (podeEditar && RMK.docs && !RMK.form && !x.hist){ ed = h('button', {class:'lnk', type:'button', text:'Editar'}); ed.addEventListener('click', function(){ RMK.form = x; render(); }); }
    var sub = x.tema || x.nome;
    return {cls:x.status === 'ok' ? '' : 'mut', cel:[h('span', null, [x.data.slice(0, 4) < hojeIso().slice(0, 4) ? dmy(x.data) : dm(x.data), h('span', {class:'rst ' + ST[x.status][1], text:ST[x.status][0]})]), sub ? h('span', null, [x.especialidade, h('small', {class:'rmk-nome', text:sub})]) : x.especialidade, rmkLinkCriativo(x), x.contatos === null || x.contatos === undefined ? '—' : fmt(x.contatos),
      x.respostas === null || x.respostas === undefined ? '—' : fmt(x.respostas), x.agend === null || x.agend === undefined ? '—' : fmt(x.agend), ed || '']};
  }), null, {esq:[0, 1, 2]}));
  if (lista.length > 14){ var bT = h('button', {class:'lnk rmk-todos', type:'button', text:RMK.todos ? 'Mostrar só os 14 mais recentes' : 'Mostrar todos os ' + lista.length + ' disparos (histórico da planilha)'}); bT.addEventListener('click', function(){ RMK.todos = !RMK.todos; render(); }); c2.appendChild(bT); }
  row.className = 'mt'; row.appendChild(c2); f.appendChild(row);
  var row1 = h('div', {class:'mt'}); row1.appendChild(c1); f.appendChild(row1);
  return f;
}


/* =========================================================
   Kommo: atendimento, leads no CRM, WhatsApp e custos, remarketing
   ========================================================= */
var KSUB = [['atendimento','Atendimento'],['leads','Leads no CRM'],['whatsapp','WhatsApp e custos'],['remarketing','Remarketing']];
var usd2 = new Intl.NumberFormat('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
function usd(v){ return v === null || v === undefined ? '—' : 'US$ ' + usd2.format(v); }
function kIni(){ var K = D.kommo; if (!K || !K.meses) return null; var ms = Object.keys(K.meses).sort(); return ms.length ? ms[0] + '-01' : null; }
function kFim(){ var K = D.kommo, f = null; if (!K || !K.meses) return null; Object.keys(K.meses).forEach(function(m){ Object.keys(K.meses[m].dias || {}).forEach(function(d){ if (!f || d > f) f = d; }); }); return f; }
function kAgg(ini, fim){
  var a = {dias:0, novos:0, anuncio:0, fora:0, b2b:0, agendou:0, perdido:0, aberto:0, esp:{}, perdas:{}, resp:[], resp_c:[], sem_resp:0, so_robo:0,
    recebidas:0, equipe:0, automaticas:0, wa_env:0, wa_ent:0, wa_custo:0, wa_dias:0, serie:[],
    bot_s:[], hum:[], hum_c:[], hum_dentro:[], sumiu:0, sem_hum:0, conversou:0, vigia_dias:0, nao_seguiu:0, novos_a:0, fora_a:0, agendou_a:0, alvo_dias:0};
  var K = D.kommo; if (!K || !K.meses) return a;
  for (var d = ini; d <= fim; d = addD(d, 1)){
    var m = K.meses[d.slice(0, 7)], x = m && m.dias && m.dias[d]; if (!x) continue;
    a.dias++;
    ['novos','anuncio','fora','b2b','agendou','perdido','aberto','sem_resp','so_robo','recebidas','equipe','automaticas'].forEach(function(k){ a[k] += x[k] || 0; });
    Object.keys(x.esp || {}).forEach(function(e){ var v = x.esp[e], t = a.esp[e] = a.esp[e] || [0, 0, 0]; if (typeof v === 'number') t[0] += v; else { t[0] += v[0]; t[1] += v[1]; t[2] += v[2]; } });
    Object.keys(x.perdas || {}).forEach(function(e){ a.perdas[e] = (a.perdas[e] || 0) + x.perdas[e]; });
    a.resp = a.resp.concat(x.resp || []); a.resp_c = a.resp_c.concat(x.resp_c || []);
    if (x.hum){ a.vigia_dias++; ['bot_s','hum','hum_c','hum_dentro'].forEach(function(k){ a[k] = a[k].concat(x[k] || []); }); ['sumiu','sem_hum','conversou','nao_seguiu','novos_a','fora_a','agendou_a'].forEach(function(k){ a[k] += x[k] || 0; }); if (x.novos_a !== undefined) a.alvo_dias++; }
    if (x.wa){ a.wa_env += x.wa[0]; a.wa_ent += x.wa[1]; a.wa_custo += x.wa[2]; a.wa_dias++; }
  }
  return a;
}
function kModelos(ini, fim){
  var K = D.kommo, por = {}, ms = [];
  if (!K || !K.meses) return {lista:[], meses:[]};
  meses(ini, fim).forEach(function(m){
    var x = K.meses[m]; if (!x || !x.modelos) return; ms.push(m);
    x.modelos.forEach(function(t){ var o = por[t.modelo] = por[t.modelo] || {modelo:t.modelo, familia:t.familia, enviados:0, entregues:0, lidos:0, respostas:0, custo:0};
      o.enviados += t.enviados; o.entregues += t.entregues; o.lidos += t.lidos; o.respostas += t.respostas; o.custo += t.custo; });
  });
  return {lista:Object.keys(por).map(function(k){ return por[k]; }).sort(function(x, y){ return y.custo - x.custo || y.enviados - x.enviados; }), meses:ms};
}
function mediana(arr){ if (!arr.length) return null; var b = arr.slice().sort(function(x, y){ return x - y; }), i = Math.floor(b.length / 2); return b.length % 2 ? b[i] : Math.round((b[i - 1] + b[i]) / 2); }
function pctAte(arr, lim){ return arr.length ? arr.filter(function(v){ return v <= lim; }).length / arr.length * 100 : null; }
function fmtMin(m){ if (m === null || m === undefined) return '—'; if (m < 60) return nf0.format(m) + ' min'; if (m < 1440) return nf1.format(m / 60) + ' h'; return nf1.format(m / 1440) + (m < 2880 ? ' dia' : ' dias'); }
function pctTxt(v, t){ return t ? nf0.format(v / t * 100) + '%' : '—'; }

function pgKommo(){
  var A = periodoA(), B = periodoB(), f = document.createDocumentFragment();
  if (!sel.kaba) sel.kaba = 'atendimento';
  var ini0 = kIni(), fimK = kFim();
  var aIni = A.ini, aFim = A.ate || A.fim;
  var avisos = [];
  if (sel.kaba !== 'remarketing'){
    if (!ini0) avisos.push('Dados do Kommo ainda não carregados');
    else {
      if (aIni < ini0) avisos.push('Kommo no painel a partir de ' + dm(ini0) + '/' + ini0.slice(0, 4));
      if (fimK && aFim > fimK) avisos.push('Kommo lido até ' + dm(fimK));
    }
  }
  f.appendChild(cabecalho('Kommo', A, sel.kaba === 'remarketing' ? null : B, avisos));
  var tabs = h('div', {class:'tabs ksub', role:'tablist'});
  KSUB.forEach(function(t){
    var b = h('button', {type:'button', role:'tab', 'aria-selected':sel.kaba === t[0] ? 'true' : 'false', text:t[1]});
    b.addEventListener('click', function(){ sel.kaba = t[0]; render(); });
    tabs.appendChild(b);
  });
  f.appendChild(tabs);
  if (sel.kaba === 'remarketing'){ var r = pgRemarketing(); var ph = r.querySelector && r.querySelector('.phead'); if (ph) ph.remove(); f.appendChild(r); return f; }
  var a = kAgg(aIni, aFim), b = B ? kAgg(B.ini, B.fim) : null, bRot = B ? (sel.modo === 'mes' ? nomeMes(B.mes || sel.cmp) : 'período anterior') : null;
  if (b && !b.dias) b = null;
  if (!a.dias){ f.appendChild(card('Sem dados do Kommo neste período', null, [h('p', {class:'vazio', text:'A leitura do Kommo começa em ' + (ini0 ? dmy(ini0) : 'breve') + '. Escolha um período a partir daí.'})])); return f; }
  if (sel.kaba === 'atendimento') kAtendimento(f, a, b, bRot, A);
  else if (sel.kaba === 'leads') kLeads(f, a, b, bRot);
  else kWhatsapp(f, a, b, bRot, aIni, aFim);
  return f;
}

var EXPED = 'seg a sex, das 8h às 18h';
function fmtUtil(m){ if (m === null || m === undefined) return '—'; if (m < 60) return nf0.format(m) + ' min'; return nf1.format(m / 60) + ' h'; }
function kAtendimento(f, a, b, bRot, A){
  var temV = a.vigia_dias > 0, bV = b && b.vigia_dias > 0 ? b : null;
  // 0) Resumo rápido
  kResumo(f, a, A);
  // 1) Como medimos
  var c0 = card('Como o painel mede o tempo de resposta', 'O robô responde na hora. O que importa é quanto a equipe leva depois que o lead pede atendimento.');
  var passos = [
    ['1', 'O lead escreve', 'Pelo anúncio, pelo Instagram ou direto no WhatsApp.', ''],
    ['2', 'O robô responde', 'Em segundos: boas-vindas e a pergunta sobre o que a pessoa procura. Isso deixa a primeira resposta do Kommo quase zerada, mas ainda não é atendimento.', 'vig-auto'],
    ['3', 'O lead responde ao robô', 'É aqui que ele pede uma pessoa. O relógio da equipe começa a contar.', 'vig-inicio'],
    ['4', 'Uma pessoa da equipe responde', 'O tempo entre o passo 3 e o passo 4 é o tempo de resposta da equipe, contado em horário de atendimento.', 'vig-fim']
  ];
  var tl = h('div', {class:'vig-linha'});
  passos.forEach(function(p, i){
    tl.appendChild(h('div', {class:'vig-passo ' + p[3]}, [h('span', {class:'vig-num', text:p[0]}), h('b', {text:p[1]}), h('p', {text:p[2]})]));
    if (i < passos.length - 1) tl.appendChild(h('span', {class:'vig-seta', 'aria-hidden':'true', text:'→'}));
  });
  c0.appendChild(tl);
  c0.appendChild(h('ul', {class:'vig-regras'}, [
    h('li', {text:'Se uma pessoa da equipe entra antes de o lead responder ao robô, o tempo conta desde a primeira mensagem do lead.'}),
    h('li', {text:'Se o lead não responde ao robô em 24 horas, ele não entra na conta da equipe: aparece como “não respondeu ao robô” e entra na estratégia de recontato.'}),
    h('li', {text:'Entram só dermatologia, capilar e blefaroplastia, as especialidades com anúncio. Fornecedores e contatos que ainda estão no Funil Geral ficam de fora.'}),
    h('li', {text:'Se o lead respondeu ao robô, recebeu os follow-ups e não respondeu mais, ele não seguiu: não conta como “sem resposta”.'}),
    h('li', {text:'Horário de atendimento: ' + EXPED + '. Noites, fins de semana e feriados não contam no tempo da equipe. Mensagens automáticas e modelos não contam como resposta.'})
  ]));
  f.appendChild(h('div', {class:'mt'}, [c0]));

  // 2) Indicadores
  var g = h('div', {class:'grid g4 mt'});
  if (temV){
    g.appendChild(tile({hero:true, rot:'Equipe responde em', v:mediana(a.hum), b:bV ? mediana(bV.hum) : undefined, bRot:bRot, tipo:'min', sentido:'menor', nota:'mediana, do passo 3 ao passo 4, em horário de atendimento'}));
    var bs = mediana(a.bot_s);
    g.appendChild(tile({rot:'Robô responde em', txt:bs === null ? '—' : (bs < 60 ? nf0.format(bs) + ' s' : fmtMin(Math.round(bs / 60))), nota:'mediana do passo 1 ao passo 2'}));
    g.appendChild(tile({rot:'Equipe respondeu em até 15 min', v:pctAte(a.hum, 15), b:bV ? pctAte(bV.hum, 15) : undefined, bRot:bRot, tipo:'pct', pp:true, nota:'dos leads que conversaram e foram respondidos'}));
    g.appendChild(tile({rot:'Pediram atendimento e ficaram sem resposta', v:a.sem_hum, b:bV ? bV.sem_hum : undefined, bRot:bRot, tipo:'n', sentido:'menor', nota:a.alvo_dias ? 'a última mensagem do lead ficou sem resposta de ninguém por mais de um dia útil (pode incluir fornecedores que caem no funil da especialidade)' : pctTxt(a.sem_hum, a.conversou) + ' de quem respondeu ao robô · após um dia útil. Conta antiga: ainda inclui fornecedores e quem não seguiu depois do follow-up.'}));
  } else {
    g.appendChild(tile({hero:true, rot:'Primeira resposta da equipe', v:mediana(a.resp), b:b ? mediana(b.resp) : undefined, bRot:bRot, tipo:'min', sentido:'menor', nota:'medida antiga: desde a primeira mensagem do lead'}));
    g.appendChild(tile({rot:'Respondidos em até 15 min', v:pctAte(a.resp, 15), b:b ? pctAte(b.resp, 15) : undefined, bRot:bRot, tipo:'pct', pp:true}));
    g.appendChild(tile({rot:'Sem resposta da equipe', v:a.sem_resp, b:b ? b.sem_resp : undefined, bRot:bRot, tipo:'n', sentido:'menor', nota:'após um dia útil'}));
    g.appendChild(tile({rot:'Chegaram fora do horário', v:a.fora, tipo:'n', sentido:'neutro', nota:pctTxt(a.fora, a.novos) + ' dos leads novos'}));
  }
  f.appendChild(g);

  // 3) Funil da conversa e diagnóstico
  if (temV){
    var row0 = h('div', {class:'grid g2 mt'});
    var escreveram = a.conversou + a.sumiu;
    var cf = card('Onde a conversa para', a.alvo_dias ? 'Leads novos de dermatologia, capilar e blefaroplastia que escreveram no período' : 'Leads novos que escreveram para a clínica no período');
    barrasH(cf, [
      {l:'Escreveram', v:escreveram},
      {l:'Responderam ao robô', sub:pctTxt(a.conversou, escreveram) + ' de quem escreveu', v:a.conversou},
      {l:'Foram respondidos pela equipe', sub:pctTxt(a.hum.length, a.conversou) + ' de quem respondeu ao robô', v:a.hum.length},
      {l:'Agendaram', sub:pctTxt(a.alvo_dias ? a.agendou_a : a.agendou, escreveram) + ' de quem escreveu, pela etapa no Kommo', v:a.alvo_dias ? a.agendou_a : a.agendou, cls:'cl'}
    ]);
    cf.appendChild(h('p', {class:'nota', text:'Leads de hoje e de ontem ainda podem avançar. Agendaram inclui leads que escreveram e os que a clínica chamou primeiro.'}));
    var LEAD_RX = /pre[cç]o|valor|localiza|dist[aâ]ncia|n[aã]o [eé] lead|sem interesse|desist|outr[ao] (cl[ií]nica|lugar)|n[aã]o responde|parou de responder|curios|fora do perfil|conv[eê]nio|plano de sa[uú]de/i;
    var pl = 0, po = 0; Object.keys(a.perdas).forEach(function(k){ if (LEAD_RX.test(k)) pl += a.perdas[k]; else po += a.perdas[k]; });
    var lentos = a.hum.filter(function(v){ return v > 60; }).length;
    var cd = card('Onde estão as oportunidades', 'Antes e durante a conversa, no mesmo período');
    cd.appendChild(h('div', {class:'vig-lados'}, [
      h('div', {class:'vig-lado'}, [h('h4', {text:'Antes da conversa'}),
        h('div', {class:'linha'}, [h('span', {text:'Não responderam à primeira mensagem do robô'}), h('b', {text:fmt(a.sumiu) + ' · ' + pctTxt(a.sumiu, escreveram)})]),
        a.alvo_dias ? h('div', {class:'linha'}, [h('span', {text:'Responderam ao robô e não seguiram depois do follow-up'}), h('b', {text:fmt(a.nao_seguiu) + ' · ' + pctTxt(a.nao_seguiu, a.conversou)})]) : null,
        h('div', {class:'linha'}, [h('span', {text:'Perdidos por preço, distância, sem interesse ou fora do perfil'}), h('b', {text:fmt(pl)})])]),
      h('div', {class:'vig-lado'}, [h('h4', {text:'Durante o atendimento'}),
        h('div', {class:'linha'}, [h('span', {text:'Pediram atendimento e ficaram sem resposta'}), h('b', {text:fmt(a.sem_hum) + ' · ' + pctTxt(a.sem_hum, a.conversou)})]),
        h('div', {class:'linha'}, [h('span', {text:'Respondidos depois de 1 hora útil'}), h('b', {text:fmt(lentos) + ' · ' + pctTxt(lentos, a.hum.length)})]),
        h('div', {class:'linha'}, [h('span', {text:'Perdidos sem motivo registrado ou por outro motivo'}), h('b', {text:fmt(po)})])])
    ]));
    cd.appendChild(h('p', {class:'nota', text:'Os números de tempo e de resposta vêm de todas as conversas. A leitura de cada conversa, com qualidade das respostas e oportunidades perdidas, está na auditoria logo abaixo.'}));
    row0.appendChild(cf); row0.appendChild(cd); f.appendChild(row0);
  }

  // 4) Auditoria qualitativa
  kAuditoria(f, A);

  // 5) Distribuição, mensagens e evolução
  var serieT = temV ? a.hum : a.resp;
  var row = h('div', {class:'grid g2 mt'});
  var c1 = card('Quanto a equipe levou para responder', temV ? 'Do passo 3 ao passo 4, em horário de atendimento' : 'Tempo em horário de atendimento até a primeira mensagem de uma pessoa da equipe');
  var FX = [[5, 'Até 5 min'], [15, '5 a 15 min'], [60, '15 min a 1 h'], [240, '1 a 4 h'], [600, '4 h a 1 dia útil'], [1e9, 'Mais de 1 dia útil']];
  var ant = -1;
  barrasH(c1, FX.map(function(x){ var lo = ant; ant = x[0]; var n = serieT.filter(function(v){ return v > lo && v <= x[0]; }).length;
    return {l:x[1], sub:pctTxt(n, serieT.length) + ' dos respondidos', v:n}; }));
  c1.appendChild(h('p', {class:'nota', text:nf0.format(serieT.length) + ' leads respondidos pela equipe. ' + (temV ? 'Só os pedidos feitos dentro do horário: mediana de ' + fmtMin(mediana(a.hum_dentro)) + '. Em tempo corrido, com noites e fins de semana: ' + fmtMin(mediana(a.hum_c)) + '.' : 'Em tempo corrido, a mediana foi de ' + fmtMin(mediana(a.resp_c)) + '.')}));
  var c2 = card('Mensagens no período', 'Conversas de leads no WhatsApp e no Instagram');
  barrasH(c2, [
    {l:'Recebidas dos leads', v:a.recebidas, b:b ? b.recebidas : undefined, bRot:bRot},
    {l:'Enviadas pela equipe', v:a.equipe, b:b ? b.equipe : undefined, bRot:bRot},
    {l:'Automáticas', sub:'robôs, follow-up e modelos', v:a.automaticas, b:b ? b.automaticas : undefined, bRot:bRot, cls:'cl'}
  ]);
  row.appendChild(c1); row.appendChild(c2); f.appendChild(row);

  var porDia = ndias(A.ini, A.ate || A.fim) <= 45;
  var c3 = card('Equipe respondeu em até 15 minutos', 'Por ' + (porDia ? 'dia de chegada do lead' : 'semana') + ', em horário de atendimento');
  var pts = baldes({ini:A.ini, fim:A.ate || A.fim}).map(function(p){ var x = kAgg(p.ini, p.fim), s2 = x.vigia_dias ? x.hum : x.resp; return {l:p.l, t:p.t + ' · ' + s2.length + ' leads respondidos · mediana ' + fmtUtil(mediana(s2)), v:s2.length >= 3 ? pctAte(s2, 15) : null}; });
  colunas(c3, pts, {nome:'Respondidos em até 15 min', tipo:'pct', rotulos:pts.length <= 16, altura:190, cor:'#D8C3A3'});
  c3.appendChild(h('p', {class:'nota', text:'Dias com menos de 3 leads respondidos ficam sem barra. Feriados e dias sem atividade da equipe não contam.'}));
  f.appendChild(h('div', {class:'mt'}, [c3]));
}

// Auditoria qualitativa: leitura de uma amostra de conversas, só com resultados agregados
function kAudPeriodo(A){
  var AU = (D.kommo && D.kommo.auditorias) || {}, ini = A.ini, fim = A.ate || A.fim;
  var ids = Object.keys(AU).sort().reverse();
  var x = null; ids.some(function(k){ var y = AU[k]; if (y.de <= fim && y.ate >= ini){ x = y; return true; } return false; });
  return {x:x, ultima:ids.length ? AU[ids[0]] : null, ids:ids, AU:AU};
}

function kResumo(f, a, A){
  var temV = a.vigia_dias > 0, P = kAudPeriodo(A), x = P.x, au = x || P.ultima;
  var c = card('Resumo em 1 minuto', 'O essencial do atendimento no período e o que fazer a seguir');
  if (au && au.sintese && au.sintese.veredito) c.appendChild(h('p', {class:'rs-veredito', text:au.sintese.veredito}));
  var term = h('div', {class:'rs-term'});
  function bloco(rot, status, cls, numero, texto){
    term.appendChild(h('div', {class:'rs-t rs-' + cls}, [h('span', {class:'rs-rot', text:rot}), h('span', {class:'rs-st', text:status}),
      h('b', {class:'rs-num', text:numero}), h('p', {text:texto})]));
  }
  // 1) velocidade: vem dos números do período
  if (temV && a.hum.length){
    var md = mediana(a.hum), p15 = pctAte(a.hum, 15);
    var stV = md <= 20 ? ['Boa', 'ok'] : md <= 60 ? ['Atenção', 'at'] : ['Ponto fraco', 'ruim'];
    bloco('Velocidade da equipe', stV[0], stV[1], fmtMin(md), 'de mediana depois que o lead pede uma pessoa. ' + nf0.format(p15) + '% respondidos em até 15 min; ' + fmt(a.sem_hum) + ' ficaram sem resposta.');
  } else {
    var mr = mediana(a.resp);
    bloco('Velocidade da equipe', 'Medida antiga', 'at', mr === null ? '—' : fmtMin(mr), 'desde a primeira mensagem do lead. A medida nova aparece quando o mês tiver os dados novos do atendimento.');
  }
  // 2) condução: vem da auditoria
  if (x && x.diagnostico){
    var dg = x.diagnostico, conv = (dg.lead_bom_atend_bom || 0) + (dg.lead_bom_atend_falhou || 0), pb = conv ? dg.lead_bom_atend_falhou / conv : 0;
    var stC = pb < .2 ? ['Boa', 'ok'] : pb < .4 ? ['Atenção', 'at'] : ['Ponto de melhoria', 'ruim'];
    bloco('Condução até o agendamento', stC[0], stC[1], fmt(dg.lead_bom_atend_falhou) + ' de ' + fmt(conv), (x.sintese && x.sintese.conducao) || 'conversas com lead interessado tiveram alguma brecha.');
  } else bloco('Condução até o agendamento', 'Sem auditoria', 'neu', '—', 'Ainda não há leitura de conversas para este período.');
  // 3) quem ainda não respondeu: números do período + auditoria
  var tot = a.sumiu + a.conversou;
  if (temV && tot){
    var ps = a.sumiu / tot;
    bloco('Quem ainda não respondeu', 'Oportunidade', 'at', nf0.format(ps * 100) + '%',
      'dos leads não responderam à primeira mensagem do robô. ' + ((x && x.sintese && x.sintese.lead) || ''));
  } else if (x && x.diagnostico){
    bloco('Quem ainda não respondeu', 'Oportunidade', 'at', pctTxt(x.diagnostico.lead_fraco, x.amostra), (x.sintese && x.sintese.lead) || 'das conversas lidas: o lead não chegou a conversar.');
  }
  c.appendChild(term);
  if (au && au.sugestoes && au.sugestoes.length){
    c.appendChild(h('h4', {class:'vig-sub', text:'O que fazer agora' + (x ? '' : ' (da auditoria de ' + dm(au.de) + ' a ' + dm(au.ate) + ')')}));
    var ol = h('ol', {class:'rs-sug'});
    au.sugestoes.forEach(function(sg){
      ol.appendChild(h('li', null, [h('div', {class:'rs-sug-top'}, [h('b', {text:sg[0]}), h('span', {class:'rs-tag', text:sg[2]})]), h('p', {text:sg[1]})]));
    });
    c.appendChild(ol);
  }
  c.appendChild(h('p', {class:'nota', text:'Velocidade e quem ainda não respondeu usam todas as conversas do período. Condução e sugestões vêm da leitura de uma amostra de conversas, detalhada mais abaixo.'}));
  f.appendChild(c);
}

function kAuditoria(f, A){
  var P = kAudPeriodo(A), AU = P.AU, ids = P.ids, x = P.x;
  var c = card('Qualidade das conversas', x ? 'Auditoria de ' + x.amostra + ' conversas de ' + dm(x.de) + ' a ' + dm(x.ate) + ', lidas uma a uma' : 'Leitura de uma amostra de conversas, uma a uma');
  if (!x){
    c.appendChild(h('p', {class:'vazio', text:ids.length ? 'Não há auditoria para este período. A mais recente cobre ' + dm(AU[ids[0]].de) + ' a ' + dm(AU[ids[0]].ate) + '.' : 'A primeira auditoria ainda não foi feita.'}));
    f.appendChild(h('div', {class:'mt'}, [c])); return;
  }
  if (x.resumo && x.resumo.length) c.appendChild(h('div', {class:'vig-resumo'}, x.resumo.map(function(t){ return h('p', {text:t}); })));
  var dg = x.diagnostico || {};
  var tot = (dg.lead_bom_atend_bom || 0) + (dg.lead_bom_atend_falhou || 0) + (dg.lead_fraco || 0) + (dg.sem_dados || 0);
  c.appendChild(h('h4', {class:'vig-sub', text:'O que decidiu cada conversa'}));
  var quad = h('div', {class:'vig-quad'});
  [['lead_bom_atend_bom', 'Lead conversou e o atendimento conduziu bem', 'Respondeu, entendeu o caso e convidou para a consulta', 'ok'],
   ['lead_bom_atend_falhou', 'Lead conversou e o atendimento deixou brecha', 'Demora, pergunta sem resposta ou falta de convite', 'ruim'],
   ['lead_fraco', 'Lead não chegou a conversar', 'Oportunidade de recontato', 'neutro'],
   ['sem_dados', 'Não se aplica', 'Não era lead novo', 'neutro']].forEach(function(q){
    var n = dg[q[0]] || 0;
    quad.appendChild(h('div', {class:'vig-q vig-' + q[3]}, [h('span', {class:'vig-qn', text:fmt(n)}), h('b', {text:q[1]}), h('small', {text:q[2] + ' · ' + pctTxt(n, tot)})]));
  });
  c.appendChild(quad);
  var row = h('div', {class:'grid g2'});
  var c1 = h('div', null, [h('h4', {class:'vig-sub', text:'Qualidade das respostas'})]);
  c1.appendChild(tabela(['Critério', 'Cumpriu', 'Conversas'], (x.criterios || []).map(function(k){ return {cel:[k[0], pctTxt(k[1], k[2]), fmt(k[2])]}; }), null, {esq:[0]}));
  var c2 = h('div', null, [h('h4', {class:'vig-sub', text:'Brechas que deixaram passar'})]);
  barrasH(c2, (x.brechas || []).map(function(k){ return {l:k[0], sub:pctTxt(k[1], x.amostra) + ' das conversas', v:k[1], cls:'cl'}; }));
  row.appendChild(c1); row.appendChild(c2); c.appendChild(row);
  if ((x.por_esp && x.por_esp.length) || (x.lead_motivos && x.lead_motivos.length)){
    var row2 = h('div', {class:'grid g2'});
    var c3 = h('div', null, [h('h4', {class:'vig-sub', text:'Por especialidade'})]);
    c3.appendChild(tabela(['Especialidade', 'Lidas', 'Conduziu bem', 'Deixou brecha', 'Não chegou a conversar'], (x.por_esp || []).map(function(k){
      return {cel:[k[0], fmt(k[1]), fmt(k[2]), fmt(k[3]), fmt(k[4])]}; }), null, {esq:[0]}));
    c3.appendChild(h('p', {class:'nota', text:'Poucas conversas por especialidade: serve para ver o padrão, não para comparar percentuais.'}));
    var c4 = h('div', null, [h('h4', {class:'vig-sub', text:'Por que o lead não chegou a conversar'})]);
    var tl = 0; (x.lead_motivos || []).forEach(function(k){ tl += k[1]; });
    barrasH(c4, (x.lead_motivos || []).map(function(k){ return {l:k[0], sub:pctTxt(k[1], tl) + ' destes leads', v:k[1]}; }));
    row2.appendChild(c3); row2.appendChild(c4); c.appendChild(row2);
  }
  if (x.conferir && x.conferir.length){
    c.appendChild(h('h4', {class:'vig-sub', text:'Para conferir com a clínica'}));
    c.appendChild(h('ul', {class:'vig-regras'}, x.conferir.map(function(t){ return h('li', {text:t}); })));
  }
  if (x.exemplos && x.exemplos.length){
    c.appendChild(h('h4', {class:'vig-sub', text:'Exemplos (resumidos, sem dados dos pacientes)'}));
    c.appendChild(h('div', {class:'vig-ex'}, x.exemplos.map(function(e){ return h('div', {class:'vig-exc'}, [h('b', {text:e[0]}), h('p', {text:e[1]})]); })));
  }
  c.appendChild(h('p', {class:'nota', text:(x.metodo || 'Amostra sorteada por especialidade.') + ' Nenhuma mensagem, nome ou telefone é guardado no painel.'}));
  f.appendChild(h('div', {class:'mt'}, [c]));
}

function kLeads(f, a, b, bRot){
  var g = h('div', {class:'grid g4'});
  g.appendChild(tile({hero:true, rot:'Leads novos no Kommo', v:a.novos, b:b ? b.novos : undefined, bRot:bRot, tipo:'n', sentido:'neutro', nota:'Inclui orgânicos. Leads de anúncio e custo por lead oficiais estão em Mídia paga.'}));
  var ANUNCIO_DESDE = '2026-11-01', iniP = sel.modo === 'mes' ? sel.mes + '-01' : sel.ini;
  var fimP = sel.modo === 'mes' ? (periodoA().ate || periodoA().fim) : sel.fim, metaLeads = 0;
  Object.keys((D.diario && D.diario.meta) || {}).forEach(function(d){ if (d >= iniP && d <= fimP) metaLeads += D.diario.meta[d][2] || 0; });
  if (iniP >= ANUNCIO_DESDE) g.appendChild(tile({rot:'Leads de anúncio no Kommo', v:a.anuncio, b:b && b.anuncio ? b.anuncio : undefined, bRot:bRot, tipo:'n', nota:pctTxt(a.anuncio, a.novos) + ' dos leads novos · o Meta contou ' + fmt(metaLeads) + ' conversas no período (quem já era lead não vira lead novo)'}));
  else g.appendChild(tile({rot:'Leads de anúncio no Kommo', v:null, nota:'O Kommo só identifica o anúncio de origem a partir de novembro de 2026. Antes disso, use os leads do Meta (' + fmt(metaLeads) + ' conversas no período), em Mídia paga.'}));
  g.appendChild(tile({rot:'Novos leads já agendados', v:a.agendou, b:b ? b.agendou : undefined, bRot:bRot, tipo:'n', nota:pctTxt(a.agendou, a.novos) + ', pela etapa no Kommo. O total de agendamentos está em Agenda e consultas.'}));
  g.appendChild(tile({rot:'Perdidos', v:a.perdido, b:b ? b.perdido : undefined, bRot:bRot, tipo:'n', sentido:'menor', nota:pctTxt(a.perdido, a.novos) + ' dos leads novos'}));
  f.appendChild(g);
  var row = h('div', {class:'grid g-7-5 mt'});
  var es = Object.keys(a.esp).sort(function(x, y){ return a.esp[y][0] - a.esp[x][0]; });
  var c1 = card('Leads por especialidade', 'Funil em que o lead está hoje no Kommo');
  c1.appendChild(tabela(['Especialidade', 'Novos', 'Agendaram', '% agend.', 'Perdidos'], es.map(function(e){ var x = a.esp[e];
    return {cel:[e === 'Funil Geral' ? 'Ainda no Funil Geral' : e, fmt(x[0]), fmt(x[1]), pctTxt(x[1], x[0]), fmt(x[2])]}; }),
    ['Total', fmt(a.novos), fmt(a.agendou), pctTxt(a.agendou, a.novos), fmt(a.perdido)], {esq:[0]}));
  c1.appendChild(h('p', {class:'nota', text:'Agendaram = leads que hoje estão em consulta agendada, paciente ou não compareceu. A situação muda com o tempo: períodos recentes ainda vão crescer. Importações em lote, médicos e parceiros ficam de fora.'}));
  var c2 = card('Motivos de perda', 'Leads novos do período marcados como perdidos');
  var ps = Object.keys(a.perdas).sort(function(x, y){ return a.perdas[y] - a.perdas[x]; });
  if (!ps.length) c2.appendChild(h('p', {class:'vazio', text:'Nenhum lead perdido no período.'}));
  else barrasH(c2, ps.slice(0, 8).map(function(k){ return {l:k, sub:pctTxt(a.perdas[k], a.perdido) + ' das perdas', v:a.perdas[k]}; }));
  row.appendChild(c1); row.appendChild(c2); f.appendChild(row);
}

function kWhatsapp(f, a, b, bRot, ini, fim){
  var g = h('div', {class:'grid g4'});
  g.appendChild(tile({hero:true, rot:'Custo do WhatsApp', txt:usd(a.wa_custo), nota:(b ? bRot + ': ' + usd(b.wa_custo) + ' · ' : '') + 'cobrado pela Meta, em dólar'}));
  g.appendChild(tile({rot:'Mensagens enviadas', v:a.wa_env, b:b ? b.wa_env : undefined, bRot:bRot, tipo:'n', sentido:'neutro'}));
  g.appendChild(tile({rot:'Entregues', v:a.wa_ent, b:b ? b.wa_ent : undefined, bRot:bRot, tipo:'n', sentido:'neutro', nota:pctTxt(a.wa_ent, a.wa_env) + ' das enviadas'}));
  g.appendChild(tile({rot:'Custo por mensagem entregue', txt:a.wa_ent ? usd(a.wa_custo / a.wa_ent) : '—', nota:b && b.wa_ent ? bRot + ': ' + usd(b.wa_custo / b.wa_ent) : null}));
  f.appendChild(g);

  var M = kModelos(ini, fim), por = {};
  M.lista.forEach(function(t){ var o = por[t.familia] = por[t.familia] || {enviados:0, lidos:0, respostas:0, custo:0, entregues:0}; o.enviados += t.enviados; o.entregues += t.entregues; o.lidos += t.lidos; o.respostas += t.respostas; o.custo += t.custo; });
  var fams = Object.keys(por).sort(function(x, y){ return por[y].custo - por[x].custo; });
  var mesesTxt = M.meses.map(function(m){ return nomeMes(m); }).join(', ');
  var parcial = sel.modo === 'periodo' && M.meses.length && (M.meses[0] + '-01' < ini || fimMes(M.meses[M.meses.length - 1]) > fim);
  var row = h('div', {class:'grid g-5-7 mt'});
  var c1 = card('Para onde vai o custo', 'Mensagens com modelo da Meta, por tipo' + (parcial ? ' · meses inteiros: ' + mesesTxt : ''));
  if (!fams.length) c1.appendChild(h('p', {class:'vazio', text:'Nenhum modelo enviado no período.'}));
  else {
    var tot = fams.reduce(function(t, k){ return t + por[k].custo; }, 0);
    barrasH(c1, fams.map(function(k){ return {l:k, sub:fmt(por[k].enviados) + ' envios · ' + pctTxt(por[k].custo, tot) + ' do custo', v:Math.round(por[k].custo), tip:usd(por[k].custo)}; }));
    c1.appendChild(h('p', {class:'nota', text:'Valores arredondados em dólar. A Meta cobra pelas mensagens com modelo; as respostas dentro da conversa aberta pelo lead não têm custo.'}));
  }
  var c2 = card('Desempenho dos modelos', 'Taxa de leitura e de resposta' + (parcial ? ' · meses inteiros: ' + mesesTxt : ''));
  c2.appendChild(tabela(['Modelo', 'Envios', 'Leram', 'Responderam', 'Custo'], M.lista.slice(0, 14).map(function(t){
    return {cel:[h('span', null, [t.modelo.replace(/_/g, ' '), h('small', {class:'rmk-nome', text:t.familia})]), fmt(t.enviados), pctTxt(t.lidos, t.entregues), pctTxt(t.respostas, t.entregues), usd(t.custo)]}; }), null, {esq:[0]}));
  row.appendChild(c1); row.appendChild(c2); f.appendChild(row);

  var c3 = card('Custo do WhatsApp por dia', 'Em dólar');
  var pts = baldes({ini:ini, fim:fim}).map(function(p){ var x = kAgg(p.ini, p.fim); return {l:p.l, t:p.t + ' · ' + fmt(x.wa_env) + ' mensagens', v:x.wa_dias ? Math.round(x.wa_custo * 100) / 100 : null}; });
  c3.querySelector('h2').textContent = 'Custo do WhatsApp por ' + (ndias(ini, fim) <= 45 ? 'dia' : (ndias(ini, fim) <= 200 ? 'semana' : 'mês'));
  colunas(c3, pts, {nome:'Custo (US$)', tipo:'n1', rotulos:pts.length <= 16, altura:190, cor:'#D8C3A3'});
  f.appendChild(h('div', {class:'mt'}, [c3]));
}


/* =========================================================
   Análise de conteúdo: criativos dos anúncios e publicações orgânicas
   ========================================================= */
var CSUB = [['anuncios','Criativos dos anúncios'],['organico','Publicações orgânicas']];
var CORD = {anuncios:'invest', organico:'eng'};
function crMeses(ini, fim){ var C = D.criativos; if (!C || !C.meses) return []; return meses(ini, fim).filter(function(m){ return C.meses[m]; }); }
// Mesmo criativo reenviado em outro conjunto ganha outro creative_id na Meta: agrupa pelo nome do anúncio
function crChave(ad){
  var n = String(ad.nome_meta || '').replace(/\s*[—–-]\s*c[óo]pia\s*$/i, '').replace(/[_\s-]*\d{1,2}\/\d{1,2}(\/\d{2,4})?\s*$/, '');
  n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9#]+/g, '');
  return n ? (ad.frente || '') + '|' + n : (ad.criativo || null);
}
// Nome curto do conjunto: [SÃO PAULO]_[CAPILAR HOMEM]_[25-55] → São Paulo · Capilar homem · 25-55
function nomeConj(c){
  var p = String(c || '').replace(/\s*[—–-]\s*c[óo]pia\s*$/i, '').match(/\[([^\]]+)\]/g);
  if (!p) return String(c || '');
  return p.map(function(x){ x = x.slice(1, -1).trim().toLowerCase(); return x.charAt(0).toUpperCase() + x.slice(1); }).filter(function(x){ return !/^(instagram|whatsapp)$/i.test(x); }).join(' · ');
}
function crAgg(ini, fim){
  var C = D.criativos, por = {}, ms = crMeses(ini, fim);
  ms.forEach(function(m){
    Object.keys(C.meses[m]).forEach(function(id){
      var v = C.meses[m][id], ad = C.ads[id] || {}, k = crChave(ad) || id;
      var LK = (C.links || {})[ad.criativo] || {};
      var o = por[k] = por[k] || {k:k, nome:ad.titulo_ig || ad.nome, link:null, drive:null, ad1:id, tipo:ad.tipo, frentes:{}, ads:{}, lead:false, inv:0, imp:0, cli:0, ini:0, v3:0, thru:0, p25:0, p50:0, p75:0, p100:0, conv:0, tempo:0, rk:null, rkInv:-1};
      if (!o.link && !o.drive){ if (LK.f === 'drive') o.drive = LK; else if (ad.link || LK.ig) o.link = ad.link || LK.ig; }
      var cj = ad.conjunto || 'Sem conjunto';
      o.conj = o.conj || {};
      var sb = o.conj[cj] = o.conj[cj] || {k:k + '|' + cj, nome:nomeConj(cj), sub:true, tipo:ad.tipo, frentes:{}, ads:{}, lead:false, inv:0, imp:0, cli:0, ini:0, v3:0, thru:0, p25:0, p50:0, p75:0, p100:0, conv:0, tempo:0, rk:null, rkInv:-1};
      [o, sb].forEach(function(x){
        x.frentes[ad.frente || 'Outras'] = 1; x.ads[id] = 1; if (/\[LEAD\]_\[WHATSAPP\]/i.test(ad.campanha || '')) x.lead = true;
        x.inv += v[0]; x.imp += v[1]; x.cli += v[3]; x.ini += v[4]; x.v3 += v[5]; x.thru += v[6]; x.p25 += v[7]; x.p50 += v[8]; x.p75 += v[9]; x.p100 += v[10]; x.conv += v[12]; x.tempo += (v[11] || 0) * v[4];
        if ((v[13] || v[14] || v[15]) && v[0] > x.rkInv){ x.rk = [v[13], v[14], v[15]]; x.rkInv = v[0]; }
      });
    });
  });
  function deriva(o){
    o.video = o.ini > 0; o.ctr = o.imp ? o.cli / o.imp * 100 : null;
    o.hook = o.video && o.imp && o.v3 ? o.v3 / o.imp * 100 : null;
    o.hold = o.video && o.v3 ? o.thru / o.v3 * 100 : null;
    o.ret75 = o.video && o.ini ? o.p75 / o.ini * 100 : null;
    o.cpc = o.lead && o.conv ? o.inv / o.conv : null; o.cpm = o.imp ? o.inv / o.imp * 1000 : null; o.tm = o.ini ? o.tempo / o.ini : null;
    return o; }
  var L = Object.keys(por).map(function(k){ var o = deriva(por[k]);
    o.subs = Object.keys(o.conj || {}).map(function(c){ return deriva(o.conj[c]); }).sort(function(a, b){ return b.inv - a.inv; });
    return o; });
  return {lista:L, meses:ms};
}
function somaCr(L){ var t = {inv:0, imp:0, cli:0, v3:0, thru:0, conv:0, impV:0, invL:0, convL:0}; L.forEach(function(o){ t.inv += o.inv; t.imp += o.imp; t.cli += o.cli; t.conv += o.conv; if (o.lead){ t.invL += o.inv; t.convL += o.conv; } if (o.video){ t.v3 += o.v3; t.thru += o.thru; t.impV += o.imp; } });
  t.ctr = t.imp ? t.cli / t.imp * 100 : null; t.hook = t.impV ? t.v3 / t.impV * 100 : null; t.hold = t.v3 ? t.thru / t.v3 * 100 : null; t.cpc = t.convL ? t.invL / t.convL : null; return t; }
function pct1(v){ return v === null || v === undefined ? '—' : nf1.format(v) + '%'; }
function selo(v, ref, maiorMelhor){ if (v === null || ref === null || !ref) return null; var r = v / ref; var bom = maiorMelhor ? r >= 1.15 : r <= 0.85, ruim = maiorMelhor ? r <= 0.85 : r >= 1.15; return bom ? 'cbom' : (ruim ? 'cruim' : null); }
var RK_TXT = {acima:'Acima da média', media:'Na média', abaixo:'Abaixo da média'};

function pgConteudo(){
  var A = periodoA(), f = document.createDocumentFragment();
  if (!sel.caba) sel.caba = 'anuncios';
  var ini = A.ini, fim = A.ate || A.fim;
  var av = [];
  var M = sel.caba === 'anuncios' ? crAgg(ini, fim) : null;
  if (M && M.meses.length && (M.meses[0] + '-01' < ini || fimMes(M.meses[M.meses.length - 1]) > fim)) av.push('Anúncios somados por mês: ' + M.meses.map(function(m){ return nomeMes(m); }).join(', '));
  if (M && ini < '2026-04-01') av.push('Criativos dos anúncios a partir de abril de 2026');
  f.appendChild(cabecalho('Análise de conteúdo', A, null, av));
  var tabs = h('div', {class:'tabs ksub', role:'tablist'});
  CSUB.forEach(function(t){ var b = h('button', {type:'button', role:'tab', 'aria-selected':sel.caba === t[0] ? 'true' : 'false', text:t[1]}); b.addEventListener('click', function(){ sel.caba = t[0]; render(); }); tabs.appendChild(b); });
  f.appendChild(tabs);
  if (sel.caba === 'anuncios') cAnuncios(f, M); else cOrganico(f, ini, fim);
  return f;
}

function ordenador(host, opcoes, chave, aoMudar){
  var s = h('select', {class:'ord', 'aria-label':'Ordenar por'});
  opcoes.forEach(function(o){ s.appendChild(h('option', {value:o[0], text:'Ordenar por ' + o[1].toLowerCase()})); });
  s.value = CORD[chave]; s.addEventListener('change', function(){ CORD[chave] = s.value; aoMudar(); });
  host.appendChild(s);
}

function cAnuncios(f, M){
  var frs = {}; M.lista.forEach(function(o){ Object.keys(o.frentes).forEach(function(x){ frs[x] = (frs[x] || 0) + o.inv; }); });
  if (sel.cfr && !frs[sel.cfr]) sel.cfr = null;
  var todos = M.lista.filter(function(o){ return !sel.cfr || o.frentes[sel.cfr]; }), L = todos.filter(function(o){ return o.inv >= 30; }), T = somaCr(todos);
  if (!todos.length){ f.appendChild(card('Nenhum anúncio com investimento neste período', null, [h('p', {class:'vazio', text:'Escolha um período a partir de abril de 2026.'})])); return; }
  var g = h('div', {class:'grid g5'});
  g.appendChild(tile({hero:true, rot:'Criativos no ar', v:todos.length, tipo:'n', nota:fmt(T.inv, 'brl0') + ' investidos no período'}));
  g.appendChild(tile({rot:'CTR do link', v:T.ctr, tipo:'pct', nota:'cliques no link ÷ impressões'}));
  g.appendChild(tile({rot:'Hook rate', v:T.hook, tipo:'pct', nota:'pararam 3 s no vídeo ÷ impressões'}));
  g.appendChild(tile({rot:'Hold rate', v:T.hold, tipo:'pct', nota:'assistiram 15 s ou até o fim ÷ pararam 3 s'}));
  g.appendChild(tile({rot:'Custo por conversa', v:T.cpc, tipo:'brl2', nota:fmt(T.convL) + ' conversas nas campanhas de conversa'}));
  var chips = h('div', {class:'tabs crfr', role:'tablist', 'aria-label':'Frente'});
  [[null, 'Todas as frentes']].concat(Object.keys(frs).sort(function(x, y){ return frs[y] - frs[x]; }).map(function(x){ return [x, x]; })).forEach(function(fr){
    var b = h('button', {type:'button', role:'tab', 'aria-selected':(sel.cfr || null) === fr[0] ? 'true' : 'false', text:fr[1]});
    b.addEventListener('click', function(){ sel.cfr = fr[0]; render(); }); chips.appendChild(b); });
  f.appendChild(chips);
  f.appendChild(g);

  var c = card('Criativos', 'Criativo que rodou em mais de um conjunto: total na primeira linha e cada conjunto logo abaixo · verde e vermelho comparam com a média do período');
  var OPC = [['invest','Investimento'],['ctr','CTR'],['hook','Hook rate'],['hold','Hold rate'],['cpc','Custo por conversa'],['conv','Conversas']];
  var corpo = h('div');
  function desenha(){
    corpo.textContent = '';
    var k = CORD.anuncios, val = function(o){ return k === 'invest' ? o.inv : k === 'conv' ? o.conv : o[k]; };
    var lst = L.slice().sort(function(a, b){ var x = val(a), y = val(b); if (x === null || x === undefined) return 1; if (y === null || y === undefined) return -1; return k === 'cpc' ? x - y : y - x; });
    var linhas = [];
    lst.forEach(function(o){ linhas.push(o); if (o.subs && o.subs.length > 1) o.subs.forEach(function(sb){ linhas.push(sb); }); });
    corpo.appendChild(tabela(['Criativo', 'Investimento', 'CTR', 'Hook', 'Hold', 'Retenção 75%', 'Conversas', 'Custo/conversa', 'Qualidade (Meta)'], linhas.map(function(o){
      var fr = Object.keys(o.frentes).join(', ');
      var nome = o.link ? h('a', {class:'lk', href:o.link, target:'_blank', rel:'noopener noreferrer', title:'Abrir a publicação no Instagram'}, [o.nome, h('span', {class:'ext', text:' ↗'})])
        : o.drive ? h('a', {class:'lk', href:o.drive.u, target:'_blank', rel:'noopener noreferrer', title:'Abrir o arquivo no Drive: ' + o.drive.n + (o.drive.prov ? ' (associado pela numeração do arquivo)' : '')}, [o.nome, h('span', {class:'ext', text:' ↗ Drive'})])
        : h('a', {class:'lk', href:'https://www.facebook.com/adsmanager/manage/ads/edit?act=1158205365932274&selected_ad_ids=' + o.ad1, target:'_blank', rel:'noopener noreferrer', title:'Arquivo não localizado no Drive: abre a prévia no Gerenciador de Anúncios (precisa de acesso à conta)'}, [o.nome, h('span', {class:'ext', text:' ↗ Meta'})]);
      var chip = function(v, ref, maior, txt){ var cl = selo(v, ref, maior); return cl ? h('span', {class:'cchip ' + cl, text:txt}) : txt; };
      var rk = o.rk && o.rk[0] ? h('span', {class:'rk rk-' + o.rk[0], text:RK_TXT[o.rk[0]]}) : '—';
      if (o.sub) nome = h('span', {class:'crsubn', title:'Conjunto de anúncios'}, [h('span', {class:'crseta', 'aria-hidden':'true', text:'↳ '}), o.nome]);
      return {cls:o.sub ? 'crsub' : ((o.subs || []).length > 1 ? 'crpai' : ''), cel:[h('span', {class:'crn'}, [nome, o.sub ? null : h('small', {text:fr + (o.video ? ' · vídeo' : (o.tipo === 'SHARE' ? ' · carrossel ou imagem' : '')) + ((o.subs || []).length > 1 ? ' · total de ' + o.subs.length + ' conjuntos, detalhe abaixo' : '')})]),
        fmt(o.inv, 'brl0'), chip(o.ctr, T.ctr, true, pct1(o.ctr)), o.video ? chip(o.hook, T.hook, true, pct1(o.hook)) : '—', o.video ? chip(o.hold, T.hold, true, pct1(o.hold)) : '—',
        o.video ? pct1(o.ret75) : '—', fmt(o.conv), o.cpc ? chip(o.cpc, T.cpc, false, fmt(o.cpc, 'brl2')) : h('span', {class:'mut', title:o.lead ? 'Sem conversas no período' : 'Campanha sem objetivo de conversa', text:'—'}), rk]};
    }), null, {esq:[0]}));
    if (todos.length > L.length) corpo.appendChild(h('p', {class:'nota', text:(todos.length - L.length) + ' criativos com menos de R$ 30 investidos no período ficaram fora da lista (pouco dado para comparar).'}));
  }
  var topo = h('div', {class:'crtopo'}); ordenador(topo, OPC, 'anuncios', desenha); c.appendChild(topo);
  c.appendChild(corpo); desenha();
  f.appendChild(h('div', {class:'mt'}, [c]));

  var ex = card('Como ler', null, [h('ul', {class:'crlegenda'}, [
    h('li', null, [h('b', {text:'Ver o criativo: '}), 'clique no nome. ↗ abre a publicação no Instagram; ↗ Drive abre o arquivo final na pasta da Mondän; ↗ Meta abre a prévia no Gerenciador de Anúncios (quando o arquivo não foi localizado no Drive).']),
    h('li', null, [h('b', {text:'CTR do link: '}), 'de cada 100 vezes que o anúncio apareceu, quantas viraram clique para conversar.']),
    h('li', null, [h('b', {text:'Hook rate: '}), 'quanto o começo do vídeo segura a atenção: pessoas que pararam pelo menos 3 segundos. Abaixo de 20% costuma indicar abertura fraca.']),
    h('li', null, [h('b', {text:'Hold rate: '}), 'de quem parou, quantos ficaram até 15 segundos ou até o fim. Mostra se o conteúdo sustenta o interesse.']),
    h('li', null, [h('b', {text:'Retenção 75%: '}), 'quantos inícios de vídeo chegaram a três quartos da duração.']),
    h('li', null, [h('b', {text:'Custo por conversa: '}), 'só nas campanhas de conversa no WhatsApp. Reconhecimento de marca e captação de médicos têm outro objetivo e ficam sem esse custo.']),
    h('li', null, [h('b', {text:'Qualidade (Meta): '}), 'avaliação da própria Meta comparando o anúncio com outros que disputam o mesmo público.']),
    h('li', null, [h('b', {text:'Cores: '}), 'verde quando o criativo está pelo menos 15% melhor que a média do período; vermelho quando está 15% pior.'])
  ]), h('p', {class:'nota', text:'As visualizações de 3 segundos são calculadas pelo custo por visualização informado pela Meta (variação de até 2%). Campanhas da agência anterior ficam de fora.'})]);
  f.appendChild(h('div', {class:'mt'}, [ex]));
}

function cOrganico(f, ini, fim){
  var P = ((D.conteudo || {}).posts || []).filter(function(p){ return p.data >= ini && p.data <= fim; });
  if (!P.length){ f.appendChild(card('Nenhuma publicação neste período', null, [h('p', {class:'vazio', text:'Escolha outro período.'})])); return; }
  P.forEach(function(p){ p.eng = p.alcance ? p.interacoes / p.alcance * 100 : null; p.salv = p.alcance ? p.salvos / p.alcance * 100 : null; p.comp = p.alcance ? p.compart / p.alcance * 100 : null; });
  var soma = function(k){ return P.reduce(function(t, p){ return t + (p[k] || 0); }, 0); };
  var alc = soma('alcance'), eng = alc ? soma('interacoes') / alc * 100 : null;
  var g = h('div', {class:'grid g4'});
  g.appendChild(tile({hero:true, rot:'Publicações', v:P.length, tipo:'n', nota:'publicadas no período'}));
  g.appendChild(tile({rot:'Alcance médio', v:Math.round(alc / P.length), tipo:'n', nota:'contas por publicação'}));
  g.appendChild(tile({rot:'Taxa de engajamento', v:eng, tipo:'pct', nota:'interações ÷ alcance'}));
  g.appendChild(tile({rot:'Salvos e compartilhamentos', v:soma('salvos') + soma('compart'), tipo:'n', nota:'sinal de conteúdo útil para o público'}));
  f.appendChild(g);
  var c = card('Publicações', 'Números acumulados de cada publicação até a última leitura · verde e vermelho comparam com a média do período');
  var OPC = [['eng','Engajamento'],['alcance','Alcance'],['views','Visualizações'],['salvos','Salvamentos'],['compart','Compartilhamentos'],['seguidores','Seguidores gerados'],['data','Data']];
  var corpo = h('div');
  var mEng = eng, mAlc = alc / P.length, IMP = {};
  Object.keys(((D.criativos || {}).mapa) || {}).forEach(function(c){ var src = D.criativos.mapa[c][1]; if (src) IMP[src] = 1; });
  function desenha(){
    corpo.textContent = '';
    var k = CORD.organico;
    var lst = P.slice().sort(function(a, b){ if (k === 'data') return a.data < b.data ? 1 : -1; return (b[k] || 0) - (a[k] || 0); });
    corpo.appendChild(tabela(['Publicação', 'Formato', 'Alcance', 'Visualizações', 'Engajamento', 'Salvos', 'Compart.', 'Seguidores'], lst.map(function(p){
      var chip = function(v, ref, txt){ var cl = selo(v, ref, true); return cl ? h('span', {class:'cchip ' + cl, text:txt}) : txt; };
      return {cel:[h('span', {class:'crn'}, [h('a', {class:'lk', href:p.link, target:'_blank', rel:'noopener noreferrer', title:'Abrir no Instagram'}, [p.titulo, h('span', {class:'ext', text:' ↗'})]), h('small', null, [dm(p.data) + (p.especialidade ? ' · ' + p.especialidade : ''), IMP[p.id] ? h('span', {class:'rk rk-media', style:'margin-left:6px', text:'também foi anúncio'}) : null])]),
        p.formato, chip(p.alcance, mAlc, fmt(p.alcance)), fmt(p.views), chip(p.eng, mEng, pct1(p.eng)), fmt(p.salvos), fmt(p.compart), fmt(p.seguidores)]};
    }), null, {esq:[0]}));
  }
  var topo = h('div', {class:'crtopo'}); ordenador(topo, OPC, 'organico', desenha); c.appendChild(topo);
  c.appendChild(corpo); desenha();
  f.appendChild(h('div', {class:'mt'}, [c]));
}

/* =========================================================
   Google Ads (rascunho: campanha ainda não começou)
   ========================================================= */
function pgGoogle(){
  var G = D.google, f = document.createDocumentFragment(), plan = G.status === 'planejamento';
  f.appendChild(cabecalho('Google Ads', {rot:'Campanha de pesquisa institucional'}, null, [plan ? 'Em planejamento: ainda sem dados' : null]));
  var ob = h('section', {class:'gobj'}, [
    h('p', {class:'gobj-k', text:'Objetivo da campanha'}),
    h('h2', {text:G.objetivo.titulo}),
    h('p', {class:'gobj-t', text:G.objetivo.texto}),
    h('div', {class:'gobj-p'}, G.objetivo.pilares.map(function(p, i){ return h('div', null, [h('span', {class:'gobj-n', text:String(i + 1)}), h('b', {text:p[0]}), h('p', {text:p[1]})]); }))
  ]);
  f.appendChild(ob);
  if (G.seo) f.appendChild(h('div', {class:'callout mt gseo'}, [h('b', {text:'Orgânico (SEO)'}), h('span', {text:G.seo})]));
  function vazio(rot, explica){ return h('div', {class:'st espera'}, [h('div', {class:'st-l'}, [h('span', {text:rot})]), h('div', {class:'st-v peq', text:'—'}), h('div', {class:'st-n', text:explica})]); }
  f.appendChild(h('h3', {class:'gsec', text:'Métricas principais'}));
  var g1 = h('div', {class:'grid g3'});
  [['Investimento', 'Quanto foi gasto no Google no período.'], ['Cliques', 'Pessoas que clicaram no anúncio.'], ['Taxa de cliques (CTR)', 'Cliques ÷ vezes em que o anúncio apareceu. Em busca de marca costuma ser alta.'],
   ['Custo por clique', 'Valor médio pago por clique.'], ['Conversões', 'Cliques no WhatsApp, ligações e formulários vindos do Google.'], ['Custo por conversão', 'Investimento ÷ conversões.']].forEach(function(x){ g1.appendChild(vazio(x[0], x[1])); });
  f.appendChild(g1);
  f.appendChild(h('h3', {class:'gsec', text:'Proteção da marca'}));
  var g2 = h('div', {class:'grid g3'});
  [['Parcela de impressões na marca', 'De todas as buscas pela Mondän, em quantas o anúncio da clínica apareceu. O ideal é ficar perto do total.'],
   ['Anúncio no topo da página', 'Em quantas dessas buscas o anúncio apareceu em primeiro lugar.'],
   ['Outras empresas na busca da marca', 'Quem mais disputou as pesquisas pelo nome da Mondän (relatório de leilão do Google).']].forEach(function(x){ g2.appendChild(vazio(x[0], x[1])); });
  f.appendChild(g2);
  var c1 = card('Grupos de anúncios propostos', 'Palavras de exemplo, a validar');
  c1.appendChild(tabela(['Grupo', 'Exemplos de pesquisa', 'Para quê'], G.grupos.map(function(x){ return {cel:[h('b', {text:x[0]}), x[1], x[2]]}; }), null, {esq:[0, 1, 2]}));
  c1.appendChild(h('p', {class:'nota', text:'Cada grupo terá seus números separados aqui (cliques, conversões e custo), para ver quanto vem da marca e quanto vem dos tratamentos.'}));
  c1.classList.add('mt'); f.appendChild(c1);
  if (G.historico){
    var hc = card('Histórico da conta no Google Ads', 'Lido em ' + dmy(G.conta.lido_em) + ' · conta ativa desde ' + G.conta.desde);
    /* avisos internos: só na versão da AGE dentro do Claude */
    if (G.alertas && window.claude && window.claude.use) G.alertas.forEach(function(t){ hc.appendChild(alerta(t)); });
    var tot = G.historico.reduce(function(t, x){ return t + x[5]; }, 0), age = G.historico.filter(function(x){ return x[1] === 'AGE'; });
    var gh = h('div', {class:'grid g3 mt'});
    gh.appendChild(tile({rot:'Investido na conta desde ' + G.conta.desde, v:tot, tipo:'brl0', nota:'Todas as agências'}));
    gh.appendChild(tile({hero:true, rot:'Investido pela AGE', v:age.reduce(function(t, x){ return t + x[5]; }, 0), tipo:'brl0', nota:age.length + ' campanhas Performance Max em maio/2026'}));
    gh.appendChild(tile({rot:'Cliques das campanhas da AGE', v:age.reduce(function(t, x){ return t + x[6]; }, 0), tipo:'n', nota:fmt(age.reduce(function(t, x){ return t + x[7]; }, 0)) + ' impressões'}));
    hc.appendChild(gh);
    hc.appendChild(h('div', {class:'mt'}, [tabela(['Campanha', 'Quem fez', 'Período', 'Tipo', 'Status', 'Investimento', 'Cliques', 'Conversões'], G.historico.map(function(x){
      return {cls:x[1] === 'AGE' ? 'gage' : '', cel:[x[0], x[1], x[2], x[3], x[4], fmt(x[5], 'brl0'), fmt(x[6]), fmt(x[8])]};
    }), null, {esq:[0, 1, 2, 3, 4]})]));
    hc.appendChild(h('p', {class:'nota', text:'Conversões como o Google registrou em cada campanha. As ações de conversão mudaram ao longo do tempo (algumas contam visualização de página), então elas não são comparáveis entre campanhas nem com os leads do Meta.'}));
    hc.classList.add('mt'); f.appendChild(hc);
  }
  return f;
}

var MARCOS = [
  ['jan–jun', 'Agenda ainda não era registrada no Kommo: agendamentos, consultas e comparecimento começam em julho.'],
  ['mai–ago', 'Campanhas de capilar geridas pela agência anterior. Ficam fora dos números de mídia deste painel.'],
  ['jun', 'Começa a campanha de captação de médicos parceiros (formulário).'],
  ['20/10', 'A AGE passa a gerir diretamente as campanhas de capilar (São Paulo e outros estados).'],
  ['18/11', 'A avaliação de dermatologia deixa de ser cortesia e passa a exigir sinal.']
];
function nomeM(m){ return nomeMes(m) + (D.meses[m] && D.meses[m].parcial ? ' (parcial)' : ''); }
function top2(obj, nomes){
  var ks = Object.keys(obj).filter(function(k){ return obj[k] > 0; }).sort(function(x, y){ return obj[y] - obj[x]; }).slice(0, 2);
  return ks.map(function(k){ return fmt(obj[k]) + ' de ' + (nomes[k] || k).toLowerCase(); }).join(' e ');
}
/* leitura automática: só fatos dos números, sem supor causa */
function leitura(ser, vals, tipo, opt){
  opt = opt || {};
  var idx = [];
  vals.forEach(function(v, i){ if (v !== null && v !== undefined && !(opt.volume && D.meses[ser[i].mes].parcial)) idx.push(i); });
  if (idx.length < 2) return null;
  var melhor = opt.menorMelhor ? 'menor' : 'maior';
  var iMax = idx.reduce(function(a, i){ return vals[i] > vals[a] ? i : a; }, idx[0]);
  var iMin = idx.reduce(function(a, i){ return vals[i] < vals[a] ? i : a; }, idx[0]);
  var media = idx.reduce(function(t, i){ return t + vals[i]; }, 0) / idx.length;
  var ul = h('ul', {class:'leit'});
  var iTop = opt.menorMelhor ? iMin : iMax, iBot = opt.menorMelhor ? iMax : iMin;
  ul.appendChild(h('li', null, [h('b', {text:(opt.menorMelhor ? 'Melhor mês: ' : 'Pico: ') + nomeMes(ser[iTop].mes)}), ' (' + fmt(vals[iTop], tipo) + ')', opt.detalhe ? '. ' + (opt.detalhe(ser[iTop]) || '') : '']));
  ul.appendChild(h('li', null, [h('b', {text:(opt.menorMelhor ? 'Pior mês: ' : 'Mais baixo: ') + nomeMes(ser[iBot].mes)}), ' (' + fmt(vals[iBot], tipo) + ')', opt.detalhe && opt.detalheBaixo ? '. ' + (opt.detalhe(ser[iBot]) || '') : '']));
  var m = sel.modo === 'mes' ? sel.mes : mesDe(periodoA().fim), k = MESES_DISP.indexOf(m), v = vals[k];
  if (v !== null && v !== undefined){
    var comp;
    if (tipo === 'pct') comp = (v - media >= 0 ? '+' : '−') + nf1.format(Math.abs(v - media)) + ' p.p. em relação à média (' + fmt(media, tipo) + ')';
    else { var d = (v - media) / media * 100; comp = nf0.format(Math.abs(d)) + '% ' + (d >= 0 ? 'acima' : 'abaixo') + ' da média dos meses (' + fmt(media, tipo) + ')'; }
    var txt = cap(nomeM(m)) + ': ' + fmt(v, tipo) + ', ' + comp + '.';
    if (opt.volume && D.meses[m].parcial) txt += ' Mês ainda em andamento.';
    ul.appendChild(h('li', null, [h('b', {text:'Mês escolhido. '}), txt]));
  }
  return ul;
}
function cardAnaliseMes(A){
  var AN0 = D.analise || {meses:{}}, AN = {nota:AN0.nota, meses:{}};
  /* rascunhos automáticos só aparecem para quem edita o painel (equipe AGE) */
  Object.keys(AN0.meses).forEach(function(k){ if (!AN0.meses[k].rascunho || RMK.pode === true) AN.meses[k] = AN0.meses[k]; });
  var m = sel.modo === 'mes' ? sel.mes : mesDe(A.fim);
  if (!AN.meses[m]){ var ks = Object.keys(AN.meses).filter(function(k){ return k <= m; }).sort(); m = ks[ks.length - 1]; }
  if (!m) return document.createDocumentFragment();
  var x = AN.meses[m], c = card('O que aconteceu em ' + nomeM(m), 'Análise da AGE');
  var tabs = h('div', {class:'mtabs'});
  MESES_DISP.forEach(function(k){
    if (!AN.meses[k]) return;
    var b = h('button', {class:'mtab' + (k === m ? ' on' : ''), text:nomeMes(k).slice(0, 3)});
    b.addEventListener('click', function(){ usaMes(k); render(); });
    tabs.appendChild(b);
  });
  c.appendChild(tabs);
  if (x.rascunho) c.appendChild(h('span', {class:'tag', style:'margin-bottom:10px;display:inline-flex'}, [h('i'), 'Rascunho automático, em revisão pela AGE']));
  c.appendChild(h('p', {class:'an-resumo', text:x.resumo}));
  var grupos = [['+', 'Ajudou'], ['-', 'Pesou'], ['i', 'Contexto']], wrap = h('div', {class:'an-cols'});
  grupos.forEach(function(gx){
    var it = x.itens.filter(function(i){ return i[0] === gx[0]; });
    if (!it.length) return;
    wrap.appendChild(h('div', {class:'an-col an-' + (gx[0] === '+' ? 'pos' : gx[0] === '-' ? 'neg' : 'ctx')}, [h('div', {class:'an-tit', text:gx[1]}),
      h('ul', null, it.map(function(i){ return h('li', null, [i[1], i[2] === 'equipe' ? h('span', {class:'an-fonte', text:'informado pela clínica'}) : '']); }))]));
  });
  c.appendChild(wrap);
  c.appendChild(h('p', {class:'nota', text:AN.nota}));
  return c;
}
function pgEvolucao(){
  var A = periodoA(), f = document.createDocumentFragment();
  f.appendChild(cabecalho('Evolução em 2026', {rot:'Janeiro a ' + nomeMes(MESES_DISP[MESES_DISP.length - 1]) + ' de 2026'}, null, ['Novembro em andamento']));
  var mc = card('O que mudou ao longo do ano', 'Marcos que ajudam a ler as curvas');
  mc.appendChild(h('ul', {class:'marcos'}, MARCOS.map(function(x){ return h('li', null, [h('span', {class:'mq', text:x[0]}), h('span', {text:x[1]})]); })));
  f.appendChild(cardAnaliseMes(A));
  mc.classList.add('mt'); f.appendChild(mc);
  var leg = h('div', {class:'legenda mt'});
  if (sel.modo === 'mes'){
    leg.appendChild(h('span', null, [h('i', {class:'box', style:'background:var(--madeira)'}), 'Mês analisado: ' + nomeMes(sel.mes)]));
    leg.appendChild(h('span', null, [h('i', {class:'box', style:'background:var(--dourado)'}), 'Comparação: ' + nomeMes(sel.cmp)]));
  } else leg.appendChild(h('span', null, [h('i', {class:'box', style:'background:var(--madeira)'}), 'Meses dentro do período escolhido']));
  leg.appendChild(h('span', null, [h('i', {class:'box', style:'background:#E1D3BC'}), 'Demais meses']));
  leg.appendChild(h('span', {style:'color:var(--ink-3)'}, ['Clique num mês para analisá-lo']));
  f.appendChild(leg);
  var ser = mesesSerie();
  function hl(p){ if (sel.modo === 'mes') return p.mes === sel.mes ? 'a' : (p.mes === sel.cmp ? 'b' : ''); return (p.fim >= A.ini && p.ini <= A.fim) ? 'a' : ''; }
  function ag(p){ return agg(p); }
  var defs = [
    {k:'leads', t:'Leads (Meta)', v:function(a){ return a.conversas; }, tipo:'n', nota:'Conversas iniciadas pelos anúncios de lead.', volume:true,
      det:function(p){ var a = ag(p); return 'Investimento em campanhas de lead: ' + fmt(a.spendLead, 'brl0') + '; custo por lead: ' + fmt(a.cpc, 'brl2'); }, detB:true},
    {k:'agend', t:'Agendamentos feitos', v:function(a){ return a.agend; }, tipo:'n', nota:'Registro no Kommo desde julho.', volume:true,
      det:function(p){ var a = ag(p); if (!a.agend) return ''; return 'Vieram principalmente ' + top2(a.espA, ESP_NOME) + '; ' + nf0.format((a.ori.anuncio || 0) / a.agend * 100) + '% pela origem “Anúncio Mondän”'; }, detB:true},
    {k:'cons', t:'Consultas realizadas', v:function(a){ return a.realizadas; }, tipo:'n', volume:true,
      det:function(p){ var a = ag(p), o = {}; ESP_ORDEM.forEach(function(e){ o[e] = a.espC[e].comp; }); return a.realizadas ? 'Principalmente ' + top2(o, ESP_NOME) : ''; }},
    {k:'pres', t:'Comparecimento', v:function(a){ return a.pres.valida ? a.pres.v : null; }, tipo:'pct', nota:'Meses com muitas consultas sem registro ficam em branco.',
      det:function(p){ var a = ag(p); return fmt(a.cons.comp) + ' compareceram e ' + fmt(a.cons.falta) + ' faltaram'; }, detB:true},
    {k:'aval', t:'Avaliações cortesia · dermatologia', v:function(a, p){ return a.kommo === 'nenhum' || !espOk('derm') || p.mes > AVAL_ULTIMO_MES ? null : a.avalDermTot; }, tipo:'n', nota:'Marcadas para o mês. Depois de novembro, a avaliação passou a exigir sinal.',
      det:function(p){ var x = ag(p).avalDerm; return fmt(x.comp) + ' compareceram, ' + fmt(x.falta) + ' faltaram, ' + fmt(x.canc) + ' cancelaram e ' + fmt(x.remarc) + ' remarcaram'; }, detB:true},
    {k:'spend', t:'Investimento no Meta', v:function(a){ return a.spend; }, tipo:'brl0', volume:true,
      det:function(p){ var a = ag(p); return 'Desse total, ' + fmt(a.spendLead, 'brl0') + ' em campanhas de lead, que geraram ' + fmt(a.conversas) + ' leads'; }},
    {k:'cpl', t:'Custo por lead (Meta)', v:function(a){ return a.cpc; }, tipo:'brl2', nota:'Só campanhas de lead de pacientes.', menor:true,
      det:function(p){ var a = ag(p); return fmt(a.conversas) + ' leads com ' + fmt(a.spendLead, 'brl0') + ' investidos'; }, detB:true},
    {k:'ig', t:'Seguidores no Instagram', v:function(a, p){ return D.meses[p.mes].instagram.seguidores; }, tipo:'n'}
  ];
  var g = h('div', {class:'grid g2 mt'});
  defs.forEach(function(d){
    var c = card(d.t, null), vals = ser.map(function(p){ return d.v(ag(p), p); });
    colunas(c, ser.map(function(p, i){ return {l:p.l, t:p.t, v:vals[i], hl:hl(p), mes:p.mes}; }), {nome:d.t, tipo:d.tipo, rotulos:true, seletivo:true, semEixo:true, altura:150, marcaVazio:true,
      clique:function(pt){ usaMes(pt.mes); render(); }});
    var l = d.t === 'Seguidores no Instagram' ? null : leitura(ser, vals, d.tipo, {volume:d.volume, menorMelhor:d.menor});
    if (d.t === 'Seguidores no Instagram'){
      var ok = vals.filter(function(v){ return v; }); if (ok.length > 1){ l = h('ul', {class:'leit'}, [h('li', null, [h('b', {text:'No ano: '}), '+' + fmt(ok[ok.length - 1] - ok[0]) + ' seguidores (de ' + fmt(ok[0]) + ' para ' + fmt(ok[ok.length - 1]) + '), média de ' + fmt((ok[ok.length - 1] - ok[0]) / (ok.length - 1)) + ' por mês.'])]); }
    }
    if (l) c.appendChild(l);
    if (d.nota) c.appendChild(h('p', {class:'nota', text:d.nota}));
    g.appendChild(c);
  });
  f.appendChild(g);
  f.appendChild(h('p', {class:'nota mt', text:'As leituras descrevem só o que os números mostram (picos, quedas e composição). Contexto que não está nos dados, como mudanças de verba, criativos novos ou feriados, entra nos marcos acima quando a equipe registrar.'}));
  return f;
}

function notas(){
  return h('details', {class:'notas'}, [h('summary', {text:'Como ler estes números'}), h('ul', null, [
    h('li', {text:'Leads e custo por lead vêm 100% do Meta: são as conversas iniciadas pelos anúncios. Quem chega por outros caminhos (orgânico, indicação) não entra nessa conta. O custo por lead considera só as campanhas de lead de pacientes (as de nome LEAD_WHATSAPP); ficam de fora reconhecimento de marca (awareness) e captação de médicos, que aparecem no investimento total.'}),
    h('li', {text:'Agendamentos contam pela data em que o paciente agendou; consultas e comparecimento, pela data da consulta. Por isso os dois números não se somam.'}),
    h('li', {text:'Comparecimento = compareceram ÷ (compareceram + faltaram). Quando mais de 20% das consultas que já passaram estão sem registro, o percentual fica em validação. Esses dados dependem do registro feito pelo atendimento da clínica na planilha de agendamentos.'}),
    h('li', {text:'Investimento, leads e cliques vêm direto do Gerenciador de Anúncios do Meta. Não incluem as campanhas de capilar geridas pela agência anterior (maio a agosto de 2026).'}),
    h('li', {text:'Agendamentos, consultas, avaliações e origem: aba Agendamentos Kommo da planilha, registrada desde julho de 2026.'})
  ])]);
}


/* =========================================================
   Reuniões: reporte, pontos a melhorar, oportunidades, estratégias e combinados
   ========================================================= */
var RST = {feito:['Feito','ok'], andamento:['Em andamento','at'], pendente:['Pendente','at'], definir:['A definir','neu'], previsto:['Previsto','neu'],
  proposta:['Para decidir','at'], aprovada:['Aprovada','ok'], planejamento:['Em planejamento','neu'], adiada:['Adiada','neu'], nao:['Não aprovada','ruim'],
  pauta:['Pauta preparada','at'], realizada:['Reunião realizada','ok']};
var RLINK = {kommo:['kommo', 'atendimento', 'Atendimento'], remarketing:['kommo', 'remarketing', 'Remarketing'], conteudo:['conteudo', null, 'Análise de conteúdo'],
  agenda:['agenda', null, 'Agenda e consultas'], instagram:['instagram', null, 'Instagram'], midia:['midia', null, 'Mídia paga'], google:['google', null, 'Google Ads'], geral:['geral', null, 'Visão geral']};
function rStatus(k){ var x = RST[k] || [k || '—', 'neu']; return h('span', {class:'rn-st rn-' + x[1], text:x[0]}); }
function rLink(k){
  var l = RLINK[k]; if (!l) return null;
  return h('button', {type:'button', class:'rn-link', text:'Ver em ' + l[2] + ' →', onclick:function(){
    var R = sel.reuniaoR; if (R){ sel.preset = 'custom'; sel.ini = R.de; sel.fim = R.ate; sel.cmpOn = true; }
    if (l[1]){ if (l[0] === 'kommo') sel.kaba = l[1]; }
    document.body.classList.remove('apresentar'); irPara(l[0]);
  }});
}
function rDdm(a, b){ return a.slice(5, 7) === b.slice(5, 7) ? (+a.slice(8)) + ' a ' + dm(b) : dm(a) + ' a ' + dm(b); }
function rPauta(p, num){
  var c = card(num + p.titulo, p.subtitulo || '', null, 'rn-sec rn-pautaesp');
  if (p.abertura) c.appendChild(h('p', {class:'rn-abertura', text:p.abertura}));
  if (p.mapa && p.mapa.length){
    c.appendChild(h('h4', {class:'vig-sub', text:p.mapa_titulo || 'O que os dados mostram e o que muda'}));
    c.appendChild(h('div', {class:'rn-mapa'}, [h('div', {class:'rn-mh'}, [h('span', {text:'Ponto'}), h('span', {text:'Hoje'}), h('span', {text:p.mapa_col || 'Com a IA'})])].concat(p.mapa.map(function(m){
      var linha = h('div', {class:'rn-mr'}, [h('b', {text:m[0]}), h('span', {class:'rn-hoje', text:m[1]}), h('span', {class:'rn-com', text:m[2]})]);
      if (!m[3] || !m[3].length) return linha;
      var det = h('details', {class:'rn-exs'}, [h('summary', {text:'Ver ' + m[3].length + ' exemplos reais'}),
        h('div', {class:'rn-exl'}, m[3].map(function(e){
          if (Array.isArray(e)) e = {t:e[0], passos:e[1]};
          var kids = [h('b', {text:e.t}), h('ol', null, e.passos.map(function(p){ return h('li', null, [h('span', {class:'rn-exq rn-exq-' + p[0], text:{L:'Lead', R:'Robô', E:'Equipe', X:'—'}[p[0]] || p[0]}), h('span', {text:p[1]})]); }))];
          if (e.conversa && e.conversa.length){
            kids.push(h('details', {class:'rn-chat'}, [h('summary', {text:'Ver a conversa'}), h('div', {class:'wa'}, e.conversa.map(function(c){
              return h('div', {class:'wa-m wa-' + c[0]}, [h('span', {class:'wa-q', text:{L:'Lead', R:'Robô (automática)', E:'Equipe'}[c[0]]}), h('p', {text:c[2]}), h('small', {text:c[1]})]);
            }))]));
          }
          if (e.id) kids.push(h('a', {class:'rn-kommo', href:'https://viniciusbcunha.kommo.com/leads/detail/' + e.id, target:'_blank', rel:'noopener', text:'Abrir no Kommo (lead ' + e.id + ') ↗'}));
          return h('div', {class:'rn-ex'}, kids);
        })),
        h('p', {class:'nota', text:'Conversas reais de novembro, com nome, telefone e dados de cadastro ocultados. Uso interno: não compartilhar fora da clínica e da AGE.'})]);
      return h('div', {class:'rn-mrw'}, [linha, det]);
    }))));
  }
  var cols = [];
  if (p.equipe && p.equipe.length) cols.push(h('div', null, [h('h4', {class:'vig-sub', text:'Continua com a equipe'}), h('ul', {class:'rn-lista'}, p.equipe.map(function(t){ return h('li', {text:t}); }))]));
  if (p.nao_resolve && p.nao_resolve.length) cols.push(h('div', null, [h('h4', {class:'vig-sub', text:'O que a IA não resolve sozinha'}), h('ul', {class:'rn-lista'}, p.nao_resolve.map(function(t){ return h('li', {text:t}); }))]));
  if (p.cuidados && p.cuidados.length) cols.push(h('div', null, [h('h4', {class:'vig-sub', text:'Cuidados'}), h('ul', {class:'rn-lista'}, p.cuidados.map(function(t){ return h('li', {text:t}); }))]));
  if (cols.length) c.appendChild(h('div', {class:'grid g3 rn-cols'}, cols));
  var row = h('div', {class:'grid g2 rn-cols'});
  if (p.conta && p.conta.linhas){
    var cc = h('div', null, [h('h4', {class:'vig-sub', text:p.conta.titulo || 'Conta de referência'})]);
    cc.appendChild(h('div', {class:'rn-conta'}, p.conta.linhas.map(function(l){ return h('div', {class:'rn-cl' + (l[2] ? ' rn-cl-' + l[2] : '')}, [h('span', {text:l[0]}), h('b', {text:l[1]})]); })));
    if (p.conta.nota) cc.appendChild(h('p', {class:'nota', text:p.conta.nota}));
    row.appendChild(cc);
  }
  if (p.medir && p.medir.length){
    var cm = h('div', null, [h('h4', {class:'vig-sub', text:'Como vamos medir no painel'})]);
    cm.appendChild(tabela(['Indicador', 'Hoje', 'Onde ver'], p.medir.map(function(m){ return {cel:[m[0], m[1], m[2]]}; }), null, {esq:[0, 2]}));
    row.appendChild(cm);
  }
  if (row.childNodes.length) c.appendChild(row);
  if (p.condicoes && p.condicoes.length){
    c.appendChild(h('h4', {class:'vig-sub', text:'Condições do teste'}));
    c.appendChild(h('div', {class:'rn-cond'}, p.condicoes.map(function(x){ return h('div', {class:'rn-cd'}, [h('b', {text:x[0]}), h('span', {text:x[1]})]); })));
  }
  if (p.decidir && p.decidir.length){
    c.appendChild(h('h4', {class:'vig-sub', text:'Para decidir hoje'}));
    c.appendChild(h('ol', {class:'rn-decidir'}, p.decidir.map(function(t){ return h('li', {text:t}); })));
  }
  return c;
}
function pgReunioes(){
  var f = document.createDocumentFragment(), RR = D.reunioes || {}, ids = Object.keys(RR).sort().reverse();
  var topo = h('div', {class:'phead'}, [h('div', null, [h('h1', {text:'Reuniões'}), h('p', {class:'per', text:'Reporte, pontos a melhorar, oportunidades, próximas estratégias e o que foi combinado em cada reunião com os sócios'})])]);
  f.appendChild(topo);
  if (!ids.length){ f.appendChild(card('Nenhuma reunião registrada', null, [h('p', {class:'vazio', text:'A primeira pauta aparece aqui antes da próxima reunião.'})])); return f; }
  if (!sel.reuniao || !RR[sel.reuniao]) sel.reuniao = ids[0];
  var R = RR[sel.reuniao]; sel.reuniaoR = R;
  var chips = h('div', {class:'tabs rn-chips', role:'tablist', 'aria-label':'Reuniões'});
  ids.forEach(function(k){
    var b = h('button', {type:'button', role:'tab', 'aria-selected':k === sel.reuniao ? 'true' : 'false', text:dmy(k) + (RR[k].status === 'pauta' ? ' · pauta' : '')});
    b.addEventListener('click', function(){ sel.reuniao = k; render(); });
    chips.appendChild(b);
  });
  var bAp = h('button', {type:'button', class:'rn-apr', text:document.body.classList.contains('apresentar') ? 'Sair da apresentação' : 'Modo apresentação'});
  bAp.addEventListener('click', function(){ document.body.classList.toggle('apresentar'); render(); window.scrollTo({top:0}); });
  f.appendChild(h('div', {class:'rn-barra'}, [chips, bAp]));

  /* cabeçalho da reunião */
  var hd = card('Reunião de ' + dmy(R.data), R.titulo || 'Reunião quinzenal com os sócios', null, 'rn-head');
  var meta = h('div', {class:'rn-meta'});
  meta.appendChild(rStatus(R.status));
  meta.appendChild(h('span', {text:'Período analisado: ' + rDdm(R.de, R.ate) + (R.cmp_de ? ' · comparado com ' + rDdm(R.cmp_de, R.cmp_ate) : '')}));
  if (R.participantes && R.participantes.length) meta.appendChild(h('span', {text:'Participantes: ' + R.participantes.join(', ')}));
  hd.appendChild(meta);
  if (R.manchete) hd.appendChild(h('p', {class:'rn-manchete', text:R.manchete}));
  var PT = R.pautas || [];
  var pauta = [['rn-1','Reporte'],['rn-2','Pendências'],['rn-3','Pontos a melhorar'],['rn-4','Oportunidades']];
  PT.forEach(function(p, i){ pauta.push(['rn-p' + i, p.curto || p.titulo]); });
  pauta.push(['rn-5','Próximas estratégias'], ['rn-6','Combinados e próximos passos']);
  var NUM = {}; pauta.forEach(function(p, i){ NUM[p[0]] = (i + 1) + '. '; });
  hd.appendChild(h('ol', {class:'rn-pauta'}, pauta.map(function(p){ return h('li', null, [h('a', {href:'#' + p[0], text:p[1], onclick:function(e){ e.preventDefault(); var el = document.getElementById(p[0]); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); }})]); })));
  f.appendChild(h('div', {class:'mt'}, [hd]));

  /* 1) reporte */
  var c1 = card(NUM['rn-1'] + 'Reporte', 'O que aconteceu de ' + rDdm(R.de, R.ate) + ', com os números do painel', null, 'rn-sec'); c1.id = 'rn-1';
  var espAnt = sel.esp; sel.esp = 'todas';
  var A = {ini:R.de, fim:R.ate}, B = R.cmp_de ? {ini:R.cmp_de, fim:R.cmp_ate} : null, a = agg(A), b = B ? agg(B) : null, bRot = B ? rDdm(R.cmp_de, R.cmp_ate) : null;
  var ka = kAgg(R.de, R.ate), kb = B ? kAgg(B.ini, B.fim) : null;
  sel.esp = espAnt;
  var g = h('div', {class:'grid g3 rn-tiles'});
  g.appendChild(tile({rot:'Investimento em anúncios', v:a.spend, b:b && b.spend, bRot:bRot, tipo:'brl0', sentido:'neutro', nota:'Meta Ads, sem a campanha AZA'}));
  g.appendChild(tile({rot:'Leads (Meta)', v:a.conversas, b:b && b.conversas, bRot:bRot, tipo:'n', nota:'conversas iniciadas pelos anúncios'}));
  g.appendChild(tile({rot:'Custo por lead', v:a.cpc, b:b && b.cpc, bRot:bRot, tipo:'brl2', sentido:'menor', nota:'só campanhas de lead'}));
  g.appendChild(tile({rot:'Agendamentos feitos', v:a.agend, b:b && b.agend, bRot:bRot, tipo:'n', nota:'pela data em que o paciente agendou'}));
  g.appendChild(tile({rot:'Consultas realizadas', v:a.realizadas, b:b && b.realizadas, bRot:bRot, tipo:'n', nota:a.pres.valida ? 'comparecimento de ' + nf0.format(a.pres.v) + '%' : 'comparecimento em validação (registro na planilha)'}));
  if (ka.vigia_dias) g.appendChild(tile({rot:'Equipe responde em', v:mediana(ka.hum), b:kb && kb.vigia_dias ? mediana(kb.hum) : undefined, bRot:bRot, tipo:'min', sentido:'menor', nota:'mediana, depois que o lead pede uma pessoa'}));
  else g.appendChild(tile({rot:'Primeira resposta da equipe', v:mediana(ka.resp), b:kb && kb.dias ? mediana(kb.resp) : undefined, bRot:bRot, tipo:'min', sentido:'menor', nota:'mediana em horário de atendimento'}));
  c1.appendChild(g);
  if (R.reporte && R.reporte.length){
    c1.appendChild(h('h4', {class:'vig-sub', text:'Destaques'}));
    c1.appendChild(h('ul', {class:'rn-lista'}, R.reporte.map(function(t){ return h('li', {text:t}); })));
  }
  f.appendChild(h('div', {class:'mt'}, [c1]));

  /* 2) pendências */
  var c2 = card(NUM['rn-2'] + 'Pendências da reunião anterior', R.pendencias_nota || 'Como estão os próximos passos combinados antes', null, 'rn-sec'); c2.id = 'rn-2';
  if (R.pendencias && R.pendencias.length) c2.appendChild(tabela(['Ação', 'Responsável', 'Situação', 'Observação'], R.pendencias.map(function(p){ return {cel:[p[0], p[1], rStatus(p[2]), p[3] || '']}; }), null, {esq:[0, 1, 3]}));
  else c2.appendChild(h('p', {class:'vazio', text:'Sem pendências anteriores.'}));
  f.appendChild(h('div', {class:'mt'}, [c2]));

  /* 3 e 4) pontos a melhorar e oportunidades */
  function itens(lista, cls){
    return h('div', {class:'rn-itens'}, (lista || []).map(function(x){
      return h('div', {class:'rn-item ' + cls}, [h('b', {text:x[0]}), h('p', {text:x[1]}), x[2] ? rLink(x[2]) : null]);
    }));
  }
  var row = h('div', {class:'grid g2 mt'});
  var c3 = card(NUM['rn-3'] + 'Pontos a melhorar', 'O que segurou o resultado no período', [itens(R.melhorar, 'rn-m')], 'rn-sec'); c3.id = 'rn-3';
  var c4 = card(NUM['rn-4'] + 'Oportunidades', 'O que os dados mostram que dá para aproveitar', [itens(R.oportunidades, 'rn-o')], 'rn-sec'); c4.id = 'rn-4';
  row.appendChild(c3); row.appendChild(c4); f.appendChild(row);

  /* pautas especiais (ex.: proposta de IA) */
  PT.forEach(function(p, i){ var cp = rPauta(p, NUM['rn-p' + i]); cp.id = 'rn-p' + i; f.appendChild(h('div', {class:'mt'}, [cp])); });

  /* 5) estratégias */
  var c5 = card(NUM['rn-5'] + 'Próximas estratégias', 'Propostas para os próximos 15 dias e para o próximo mês', null, 'rn-sec'); c5.id = 'rn-5';
  c5.appendChild(h('div', {class:'rn-estr'}, (R.estrategias || []).map(function(x, i){
    return h('div', {class:'rn-e'}, [h('span', {class:'rn-en', text:String(i + 1)}), h('div', null, [
      h('div', {class:'rn-et'}, [h('b', {text:x[0]}), rStatus(x[3])]), h('p', {text:x[1]}),
      h('div', {class:'rn-eq'}, [x[2] ? h('span', {text:'Quem: ' + x[2]}) : null, x[4] ? rLink(x[4]) : null])])]);
  })));
  f.appendChild(h('div', {class:'mt'}, [c5]));

  /* 6) combinados */
  var c6 = card(NUM['rn-6'] + 'Combinados e próximos passos', R.aprovacao || 'O que ficou decidido na reunião, com responsável e prazo', null, 'rn-sec'); c6.id = 'rn-6';
  if (R.combinados && R.combinados.length) c6.appendChild(h('ul', {class:'rn-lista rn-comb'}, R.combinados.map(function(t){ return h('li', {text:t}); })));
  if (R.passos && R.passos.length) c6.appendChild(tabela(['Próximo passo', 'Responsável', 'Prazo', 'Situação'], R.passos.map(function(p){ return {cel:[p[0], p[1], p[2] ? dm(p[2]) : '—', rStatus(p[3])]}; }), null, {esq:[0, 1]}));
  if (!(R.combinados && R.combinados.length) && !(R.passos && R.passos.length))
    c6.appendChild(h('div', {class:'rn-vazio'}, [h('b', {text:'A preencher na reunião'}), h('p', {text:'Para cada estratégia acima: aprovada, adiada ou não aprovada, com responsável e prazo. Os combinados entram aqui logo depois da reunião e viram as pendências da próxima.'})]));
  f.appendChild(h('div', {class:'mt'}, [c6]));
  return f;
}

/* =========================================================
   Filtros, navegação e URL
   ========================================================= */
var PAGF = {geral:pgGeral, reunioes:pgReunioes, agenda:pgAgenda, midia:pgMidia, instagram:pgInstagram, remarketing:pgRemarketing, kommo:pgKommo, conteudo:pgConteudo, google:pgGoogle, evolucao:pgEvolucao};
function render(){
  CACHE = {};
  var v = document.getElementById('view');
  v.textContent = '';
  try { v.appendChild(PAGF[sel.pag]()); }
  catch (e){ try { console.error(e); } catch (x){} v.appendChild(h('div', {class:'erro', text:'Algo não carregou nesta página. Atualize; se continuar, avise a equipe da AGE.'})); }
  document.querySelectorAll('[data-pag]').forEach(function(b){ if (b.dataset.pag === sel.pag) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  document.getElementById('filtros').hidden = sel.pag === 'reunioes';
  if (sel.pag !== 'reunioes') document.body.classList.remove('apresentar');
  syncFiltros(); salvaUrl();
}
function irPara(p){ sel.pag = p; render(); window.scrollTo({top:0}); }
function syncFiltros(){
  document.getElementById('dt-ini').value = sel.ini || ''; document.getElementById('dt-fim').value = sel.fim || '';
  document.getElementById('chk-cmp').checked = sel.cmpOn;
  document.getElementById('sel-esp').value = sel.esp;
  document.querySelectorAll('#per-seg button').forEach(function(b){ b.setAttribute('aria-selected', b.dataset.p === sel.preset ? 'true' : 'false'); });
  var semEsp = sel.pag === 'instagram' || sel.pag === 'remarketing' || sel.pag === 'kommo' || sel.pag === 'conteudo';
  document.getElementById('sel-esp').disabled = semEsp;
}
function salvaUrl(){
  try {
    var u = new URL(location.href), q = u.searchParams;
    ['modo','mes','cmp','p','ini','fim','cmpOn','esp','aba','r'].forEach(function(k){ q.delete(k); });
    if (sel.pag === 'reunioes' && sel.reuniao) q.set('r', sel.reuniao);
    q.set('modo', sel.modo);
    if (sel.modo === 'mes'){ q.set('mes', sel.mes); q.set('cmp', sel.cmp); }
    else { q.set('p', sel.preset); if (sel.preset === 'custom'){ q.set('ini', sel.ini); q.set('fim', sel.fim); } if (!sel.cmpOn) q.set('cmpOn', '0'); }
    if (sel.esp !== 'todas') q.set('esp', sel.esp);
    if (sel.pag === 'kommo' && sel.kaba && sel.kaba !== 'atendimento') q.set('aba', sel.kaba);
    if (sel.pag === 'conteudo' && sel.caba === 'organico') q.set('aba', 'organico');
    u.hash = sel.pag; history.replaceState(null, '', u);
  } catch (e) {}
}
function lerUrl(){
  try {
    var q = new URLSearchParams(location.search), hs = location.hash.slice(1);
    if (PAGF[hs]) sel.pag = hs;
    if (hs === 'remarketing'){ sel.pag = 'kommo'; sel.kaba = 'remarketing'; }
    if (KSUB.some(function(t){ return t[0] === q.get('aba'); })) sel.kaba = q.get('aba');
    if (q.get('aba') === 'organico') sel.caba = 'organico';
    if (/^\d{4}-\d\d-\d\d$/.test(q.get('r') || '')) sel.reuniao = q.get('r');
    if (q.get('modo') === 'periodo'){
      sel.modo = 'periodo'; var p = q.get('p') || 'semana_passada';
      if (p === 'custom' && /^\d{4}-\d\d-\d\d$/.test(q.get('ini') || '') && /^\d{4}-\d\d-\d\d$/.test(q.get('fim') || '')){ sel.preset = 'custom'; sel.ini = q.get('ini'); sel.fim = q.get('fim'); }
      else if (intervaloPreset(p)){ sel.preset = p; var r = intervaloPreset(p); sel.ini = r[0]; sel.fim = r[1]; }
      sel.cmpOn = q.get('cmpOn') !== '0';
    }
    if (q.get('modo') === 'mes' && D.meses[q.get('mes')]) usaMes(q.get('mes'));  // links antigos
    if (FILTRO_LISTA.hasOwnProperty(q.get('esp'))) sel.esp = q.get('esp');
  } catch (e) {}
}
function montar(){
  var nav = document.getElementById('nav'), mnav = document.getElementById('mnav');
  PAGS.forEach(function(p){
    [nav, mnav].forEach(function(host){
      var b = h('button', {type:'button', 'data-pag':p[0], onclick:function(){ irPara(p[0]); }}, [icone(p[0]), p[1]]);
      host.appendChild(b);
    });
  });
  var pr = document.getElementById('per-seg');
  PRESETS.forEach(function(p){
    var b = h('button', {type:'button', role:'tab', 'data-p':p[0], text:p[1]});
    b.addEventListener('click', function(){ var r = intervaloPreset(p[0]); sel.preset = p[0]; sel.ini = r[0]; sel.fim = r[1]; render(); });
    pr.appendChild(b);
  });
  var di = document.getElementById('dt-ini'), df = document.getElementById('dt-fim');
  [di, df].forEach(function(inp){ inp.min = '2026-01-01'; inp.max = HOJE; });
  function datas(){
    var a = di.value, b = df.value; if (!a || !b) return;
    if (a > b){ var t = a; a = b; b = t; }
    if (a < '2026-01-01') a = '2026-01-01'; if (b > HOJE) b = HOJE;
    sel.preset = 'custom'; sel.ini = a; sel.fim = b; render();
  }
  di.addEventListener('change', datas); df.addEventListener('change', datas);
  document.getElementById('chk-cmp').addEventListener('change', function(e){ sel.cmpOn = e.target.checked; render(); });
  var se = document.getElementById('sel-esp');
  FILTRO_ESP.forEach(function(x){ se.appendChild(h('option', {value:x[0], text:x[1]})); });
  se.addEventListener('change', function(){ sel.esp = se.value; render(); });

  var fo = document.getElementById('fontes');
  [['Agenda (planilha)', dm(KOMMO_LIDO)], ['Anúncios (Meta)', dm(HOJE)], ['Instagram', D.instagram_ate ? dm(D.instagram_ate) : 'out/2026'], ['Kommo', D.kommo && D.kommo.lido_em ? dm(kFim() || D.kommo.lido_em) : '—'], ['Remarketing', dm((function(){ var l = rmkLista().filter(function(x){ return x.status !== 'prog'; }); return l.length ? l[0].data : D.remarketing.recentes[D.remarketing.recentes.length - 1].data; })())]]
    .forEach(function(x){ fo.appendChild(h('li', null, [h('span', {text:x[0]}), h('b', {text:x[1]})])); });
  document.getElementById('rodape-txt').textContent = 'Agenda lida em ' + dmy(KOMMO_LIDO) + ' · anúncios do Meta até ' + dmy(HOJE) + ' · Instagram e remarketing da planilha de acompanhamento.';
}

fetch('data.json', {cache:'no-store'}).then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){
  D = d; TIP = document.getElementById('tip');
  HOJE = d.diario.meta_ate; KOMMO_LIDO = d.diario.kommo_lido_em;
  rmkInit();
  MESES_DISP = Object.keys(d.meses).sort();
  sel.mes = MESES_DISP[MESES_DISP.length - 1]; sel.cmp = mesAnt(sel.mes);
  var r0 = intervaloPreset(sel.preset); sel.ini = r0[0]; sel.fim = r0[1];
  lerUrl();
  document.getElementById('carregando').remove();
  montar(); render();
  window.addEventListener('scroll', tipHide, {passive:true});
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && document.body.classList.contains('apresentar')){ document.body.classList.remove('apresentar'); render(); } });
}).catch(function(e){
  try { console.error(e); } catch (x){}
  var v = document.getElementById('view'); v.textContent = '';
  v.appendChild(h('div', {class:'erro', text:'Não foi possível carregar os números. Atualize a página; se continuar, avise a equipe da AGE.'}));
});
})();
