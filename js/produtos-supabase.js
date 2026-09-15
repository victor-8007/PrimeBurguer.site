/* ============================================
   PRIME BURGUER — produtos-supabase.js
   Produtos extras cadastrados pelo admin
============================================ */

var produtosBase = Array.isArray(produtos) ? produtos.map(p => ({ ...p })) : [];
var produtosSupabaseAdmin = [];
var precosAdmin = [];
var promocoesAdmin = [];
var lojaConfig = { controle_manual: false, aberta: true, mensagem: '', chave_pix: 'CNPJ — 64.309.414/0001-80' };
var esgotadosSync = []; // [{produto_id, sabor}]
var itensRemovidos = []; // ids dos itens do cardapio tirados pelo admin (nao aparecem mais no site)
var adicionaisBase = [
  { id: 'ovo', nome: 'Ovo', preco: 2.00, ativo: true, ordem: 1 },
  { id: 'picles', nome: 'Picles', preco: 2.00, ativo: true, ordem: 2 },
  { id: 'cebola-caramelizada', nome: 'Cebola Caramelizada', preco: 3.00, ativo: true, ordem: 3 },
  { id: 'bacon', nome: 'Bacon', preco: 3.00, ativo: true, ordem: 4 },
  { id: 'queijo-cheddar', nome: 'Queijo Cheddar', preco: 3.00, ativo: true, ordem: 5 },
  { id: 'calabresa', nome: 'Calabresa', preco: 3.00, ativo: true, ordem: 6 },
  { id: 'queijo-mussarela', nome: 'Queijo Mussarela', preco: 3.00, ativo: true, ordem: 7 },
  { id: 'abacaxi', nome: 'Abacaxi', preco: 3.00, ativo: true, ordem: 8 },
  { id: 'aneis-de-cebola', nome: 'Anéis de Cebola', preco: 4.00, ativo: true, ordem: 9 },
  { id: 'queijo-do-reino', nome: 'Queijo do Reino', preco: 7.00, ativo: true, ordem: 10 },
  { id: 'queijo-coalho', nome: 'Queijo Coalho', preco: 7.00, ativo: true, ordem: 11 },
  { id: 'blend-150g', nome: 'Blend 150g', preco: 8.00, ativo: true, ordem: 12 },
  { id: 'costela-desfiada', nome: 'Costela Desfiada', preco: 8.00, ativo: true, ordem: 13 },
  { id: 'carne-de-sol-requeijao', nome: 'Carne de Sol c/ Requeijão', preco: 10.00, ativo: true, ordem: 14 },
  { id: 'camarao', nome: 'Camarão', preco: 10.00, ativo: true, ordem: 15 }
];
var adicionaisAdmin = [...adicionaisBase];

function slugProduto(txt) {
  return String(txt || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function htmlSeguro(txt) {
  return String(txt ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function adicionaisMesclados(extras = []) {
  const mapa = new Map(adicionaisBase.map(a => [a.id, { ...a }]));
  extras.forEach(a => mapa.set(a.id, { ...mapa.get(a.id), ...a, preco: Number(a.preco) || 0 }));
  return [...mapa.values()].sort((a, b) => (a.ordem || 999) - (b.ordem || 999) || a.nome.localeCompare(b.nome));
}

function renderAdicionaisSite() {
  const grid = document.getElementById('adicionais-grid');
  if (!grid) return;
  const ativos = adicionaisAdmin.filter(a => a.ativo !== false);
  grid.innerHTML = ativos.map(a => `
    <div class="adic-card" data-adicional-id="${htmlSeguro(a.id)}">
      <strong>${htmlSeguro(a.nome)}</strong>
      <span>${fmt(a.preco)}</span>
      <button type="button">+</button>
    </div>
  `).join('');
  grid.querySelectorAll('.adic-card').forEach(card => {
    card.addEventListener('click', () => {
      const adicional = ativos.find(a => a.id === card.dataset.adicionalId);
      if (adicional) addAdicional(adicional.nome, adicional.preco);
    });
  });
}

function produtoDbParaSite(p) {
  return {
    id: 100000 + Number(p.id),
    nome: p.nome,
    desc: p.descricao || '',
    preco: Number(p.preco) || 0,
    cat: p.categoria || 'burgers',
    img: p.imagem_url || '',
    emoji: p.emoji || '',
    num: p.numero || '',
    novo: !!p.novo,
    limitado: !!p.limitado,
    produtoSupabaseId: p.id
  };
}

function produtoSiteParaDb(p) {
  return {
    id: p.id,
    nome: p.nome || '',
    descricao: p.descricao || '',
    preco: Number(p.preco) || 0,
    categoria: p.categoria || 'burgers',
    imagem_url: p.imagem_url || '',
    emoji: p.emoji || '',
    numero: p.numero || '',
    novo: !!p.novo,
    limitado: !!p.limitado,
    ativo: p.ativo !== false,
    ordem: Number(p.ordem) || 999
  };
}

function supabaseHeaders() {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) {
    throw new Error('Supabase nao configurado em js/supabase-config.js');
  }
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    'Content-Type': 'application/json'
  };
}

async function carregarProdutosSupabase() {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return;

  try {
    const [resp, respPrecos, respPromos, respRemovidos] = await Promise.all([
      fetch(`${cfg.url}/rest/v1/cardapio_produtos?select=*&ativo=eq.true&order=ordem.asc,nome.asc`, {
        headers: supabaseHeaders()
      }),
      fetch(`${cfg.url}/rest/v1/cardapio_precos?select=produto_id,preco`, {
        headers: supabaseHeaders()
      }),
      fetch(`${cfg.url}/rest/v1/cardapio_promocoes?select=*&ativo=eq.true&order=criado_em.desc`, {
        headers: supabaseHeaders()
      }),
      fetch(`${cfg.url}/rest/v1/cardapio_itens_removidos?select=produto_id`, {
        headers: supabaseHeaders()
      })
    ]);
    const extras = resp.ok ? await resp.json() : [];
    const precos = respPrecos.ok ? await respPrecos.json() : [];
    const promocoes = respPromos.ok ? await respPromos.json() : [];
    const removidos = respRemovidos.ok ? await respRemovidos.json() : [];
    itensRemovidos = removidos.map(r => Number(r.produto_id));
    const mapaPrecos = new Map(precos.map(p => [String(p.produto_id), Number(p.preco)]));
    const mapaPromos = new Map(promocoes.map(p => [String(p.produto_id), p]));

    produtos = [...produtosBase, ...extras.map(produtoDbParaSite)]
      .filter(p => !itensRemovidos.includes(Number(p.id)))
      .map(p => ({
        ...p,
        preco_original: p.preco,
        preco: mapaPromos.has(String(p.id))
          ? Number(mapaPromos.get(String(p.id)).preco_promocional)
          : mapaPrecos.has(String(p.id))
            ? mapaPrecos.get(String(p.id))
            : p.preco,
        promocao: mapaPromos.has(String(p.id)),
        titulo_promocao: mapaPromos.get(String(p.id))?.titulo || 'Promoção'
      }));
  } catch (erro) {
    console.warn('Cardapio do Supabase nao carregou. Usando produtos fixos.', erro);
    produtos = [...produtosBase];
  }
}

// Um item do cardapio fixo esta removido se o id dele estiver na lista sincronizada.
function itemCardapioRemovido(id) {
  return itensRemovidos.includes(Number(id));
}

async function removerItemCardapioSupabase(id) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/remover_item_cardapio`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto_id: Number(id) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao remover item do cardápio');
  }
  return retorno;
}

async function restaurarItemCardapioSupabase(id) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/restaurar_item_cardapio`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto_id: Number(id) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao restaurar item do cardápio');
  }
  return retorno;
}

async function carregarPrecosAdmin() {
  const cfg = window.PRIME_SUPABASE || {};
  const lista = document.getElementById('admin-precos-lista');
  if (!lista || !cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return;

  lista.innerHTML = '<div style="color:#888;font-size:.85rem">Carregando preços...</div>';
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/cardapio_precos?select=produto_id,preco&order=produto_id.asc`, {
      headers: supabaseHeaders()
    });
    if (!resp.ok) throw new Error('Rode o SQL de preços no Supabase primeiro.');
    precosAdmin = await resp.json();
    renderAdminPrecos();
  } catch (erro) {
    lista.innerHTML = `<div style="color:#e53935;font-size:.85rem">Nao consegui carregar os preços. ${erro.message}</div>`;
  }
}

async function carregarLojaConfig() {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return lojaConfig;
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/loja_config?select=*&id=eq.true&limit=1`, {
      headers: supabaseHeaders()
    });
    if (resp.ok) {
      const rows = await resp.json();
      if (rows[0]) lojaConfig = rows[0];
    }
  } catch (erro) {
    console.warn('Config da loja nao carregou. Usando horario normal.', erro);
  }
  return lojaConfig;
}

async function salvarLojaConfigSupabase(controleManual, aberta) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_loja_config`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_controle_manual: !!controleManual, p_aberta: !!aberta })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao salvar status da loja');
  await carregarLojaConfig();
  return retorno;
}

async function salvarChavePixSupabase(chavePix) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_chave_pix`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_chave_pix: chavePix })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao salvar chave PIX');
  await carregarLojaConfig();
  return retorno;
}

async function carregarEsgotados() {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return esgotadosSync;
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/cardapio_esgotados?select=produto_id,sabor`, {
      headers: supabaseHeaders()
    });
    if (resp.ok) {
      esgotadosSync = await resp.json();
    }
  } catch (erro) {
    console.warn('Esgotados nao carregaram.', erro);
  }
  atualizarProdutosEsgotados();
  return esgotadosSync;
}

// Um sabor esta esgotado se existir uma linha exata produto_id+sabor.
function saborEsgotado(produtoId, sabor = '') {
  return esgotadosSync.some(e => Number(e.produto_id) === Number(produtoId) && (e.sabor || '') === (sabor || ''));
}

// Um produto conta como "esgotado" (pro card ficar cinza/indisponivel) quando:
// - nao tem opcoes de sabor e a linha com sabor vazio existe; ou
// - tem opcoes e TODAS as opcoes estao esgotadas.
function produtoTotalmenteEsgotado(p) {
  if (Array.isArray(p.opcoes) && p.opcoes.length) {
    return p.opcoes.every(op => saborEsgotado(p.id, op));
  }
  return saborEsgotado(p.id, '');
}

// Mantem produtosEsgotados (array de ids) como compatibilidade com menu.js/cart.js.
function atualizarProdutosEsgotados() {
  if (typeof produtosEsgotados === 'undefined') return;
  produtosEsgotados.length = 0;
  const todos = Array.isArray(produtos) ? produtos : [];
  todos.forEach(p => {
    if (produtoTotalmenteEsgotado(p)) produtosEsgotados.push(Number(p.id));
  });
}

async function toggleEsgotadoSupabase(produtoId, sabor = '') {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/toggle_cardapio_esgotado`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto_id: produtoId, p_sabor: sabor || '' })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao atualizar esgotado');
  await carregarEsgotados();
  return retorno;
}

async function carregarAdicionaisSupabase() {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) {
    adicionaisAdmin = [...adicionaisBase];
    renderAdicionaisSite();
    return;
  }
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/cardapio_adicionais?select=*&order=ordem.asc,nome.asc`, {
      headers: supabaseHeaders()
    });
    const extras = resp.ok ? await resp.json() : [];
    adicionaisAdmin = adicionaisMesclados(extras);
  } catch (erro) {
    console.warn('Adicionais do Supabase nao carregaram. Usando base fixa.', erro);
    adicionaisAdmin = [...adicionaisBase];
  }
  renderAdicionaisSite();
}

async function carregarAdicionaisAdmin() {
  await carregarAdicionaisSupabase();
  if (typeof renderAdminAdicionais === 'function') renderAdminAdicionais();
}

async function salvarAdicionalSupabase(adicional) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_cardapio_adicional`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({
      p_senha: ADMIN_SENHA,
      p_adicional: {
        id: adicional.id || slugProduto(adicional.nome),
        nome: adicional.nome,
        preco: Number(adicional.preco) || 0,
        ativo: adicional.ativo !== false,
        ordem: Number(adicional.ordem) || 999
      }
    })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao salvar adicional');
  return retorno;
}

async function carregarPromocoesAdmin() {
  const cfg = window.PRIME_SUPABASE || {};
  const lista = document.getElementById('admin-promocoes-lista');
  if (!lista || !cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return;
  lista.innerHTML = '<div style="color:#888;font-size:.85rem">Carregando promoções...</div>';
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/cardapio_promocoes?select=*&ativo=eq.true&order=criado_em.desc`, {
      headers: supabaseHeaders()
    });
    if (!resp.ok) throw new Error('Rode o SQL atualizado no Supabase primeiro.');
    promocoesAdmin = await resp.json();
    if (typeof renderAdminPromocoes === 'function') renderAdminPromocoes();
  } catch (erro) {
    lista.innerHTML = `<div style="color:#e53935;font-size:.85rem">Nao consegui carregar promoções. ${erro.message}</div>`;
  }
}

async function salvarPromocaoSupabase(promocao) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_cardapio_promocao`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_promocao: promocao })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao salvar promoção');
  return retorno;
}

async function encerrarPromocaoSupabase(id) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/encerrar_cardapio_promocao`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_id: Number(id) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) throw new Error(retorno?.erro || 'Erro ao encerrar promoção');
  return retorno;
}

async function carregarProdutosSupabaseAdmin() {
  const cfg = window.PRIME_SUPABASE || {};
  const lista = document.getElementById('admin-produtos-supabase-lista');
  if (!lista || !cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) return;

  lista.innerHTML = '<div style="color:#888;font-size:.85rem">Carregando produtos cadastrados...</div>';
  try {
    const resp = await fetch(`${cfg.url}/rest/v1/cardapio_produtos?select=*&order=ordem.asc,nome.asc`, {
      headers: supabaseHeaders()
    });
    if (!resp.ok) throw new Error('Rode o SQL de produtos no Supabase primeiro.');
    produtosSupabaseAdmin = await resp.json();
    renderAdminProdutosSupabase();
  } catch (erro) {
    lista.innerHTML = `<div style="color:#e53935;font-size:.85rem">Nao consegui carregar os produtos do Supabase. ${erro.message}</div>`;
  }
}

async function salvarProdutoSupabase(produto) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_cardapio_produto`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto: produtoSiteParaDb(produto) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao salvar produto');
  }
  return retorno;
}

async function excluirProdutoSupabase(id) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/excluir_cardapio_produto`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_id: Number(id) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao excluir produto');
  }
  return retorno;
}

async function salvarPrecoSupabase(produtoId, preco) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/salvar_cardapio_preco`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto_id: String(produtoId), p_preco: Number(preco) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao salvar preço');
  }
  return retorno;
}

async function removerPrecoSupabase(produtoId) {
  const cfg = window.PRIME_SUPABASE || {};
  const resp = await fetch(`${cfg.url}/rest/v1/rpc/remover_cardapio_preco`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ p_senha: ADMIN_SENHA, p_produto_id: String(produtoId) })
  });
  const retorno = await resp.json().catch(() => null);
  if (!resp.ok || !retorno?.sucesso) {
    throw new Error(retorno?.erro || 'Erro ao restaurar preço');
  }
  return retorno;
}
