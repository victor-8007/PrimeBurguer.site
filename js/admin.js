/* ============================================
   PRIME BURGUER — admin.js
   Painel administrativo
============================================ */

var ADMIN_SENHA = '1994';
var footerClicks = 0;
var footerTimer  = null;
var altaDemandaAtiva = false;
var produtosEsgotados = []; // preenchido via Supabase (carregarEsgotados em app.js)

/* ── ACESSO ── */
function abrirAdmin() {
  document.getElementById('admin-overlay').style.display = 'block';
  document.getElementById('admin-login').style.display   = 'flex';
  document.getElementById('admin-painel').style.display  = 'none';
  document.getElementById('admin-senha').value = '';
  document.getElementById('admin-erro').style.display = 'none';
}

function fecharAdmin() {
  document.getElementById('admin-overlay').style.display = 'none';
}

function adminLogin() {
  const s = document.getElementById('admin-senha').value;
  if (s === ADMIN_SENHA) {
    document.getElementById('admin-login').style.display  = 'none';
    document.getElementById('admin-painel').style.display = 'block';
    carregarEsgotados().then(renderAdminProdutos);
    renderAdminRemoverItens();
    renderAdminSelectPrecos();
    carregarPrecosAdmin();
    carregarLojaAdmin();
    carregarChavePixAdmin();
    carregarAdicionaisAdmin();
    renderAdminSelectPromos();
    carregarPromocoesAdmin();
    carregarProdutosSupabaseAdmin();
    atualizarBtnDemanda();
  } else {
    document.getElementById('admin-erro').style.display = 'block';
    document.getElementById('admin-senha').value = '';
    setTimeout(() => document.getElementById('admin-erro').style.display = 'none', 2000);
  }
}

function clickFooter() {
  footerClicks++;
  clearTimeout(footerTimer);
  footerTimer = setTimeout(() => footerClicks = 0, 2000);
  if (footerClicks >= 5) { footerClicks = 0; abrirAdmin(); }
}

/* ── ALTA DEMANDA ── */
function toggleAltaDemanda() {
  altaDemandaAtiva = !altaDemandaAtiva;
  const banner = document.getElementById('banner-demanda');
  banner.style.display = altaDemandaAtiva ? 'block' : 'none';
  atualizarBtnDemanda();
}

function atualizarBtnDemanda() {
  const btn = document.getElementById('btn-demanda');
  const status = document.getElementById('status-demanda');
  if (!btn) return;
  if (altaDemandaAtiva) {
    btn.textContent = '🔥 DESATIVAR ALTA DEMANDA';
    btn.className = 'btn-demanda-off';
    status.textContent = '🔴 Banner ativo — clientes estão vendo o aviso';
    status.style.color = '#e53935';
  } else {
    btn.textContent = '🔥 ATIVAR ALTA DEMANDA';
    btn.className = 'btn-demanda-on';
    status.textContent = 'Inativo — clientes não estão vendo nenhum aviso';
    status.style.color = '#888';
  }
}

/* ── PRODUTOS ESGOTADOS ── */
async function toggleEsgotado(id, sabor = '') {
  id = parseInt(id);
  try {
    await toggleEsgotadoSupabase(id, sabor);
  } catch (erro) {
    alert('Nao consegui atualizar o esgotado: ' + erro.message);
  }
  renderAdminProdutos();
  renderMenu();
}

function renderAdminProdutos() {
  const lista = document.getElementById('admin-lista-produtos');
  if (!lista) return;
  const itens = produtos.filter(p => p.cat === 'burgers' || p.cat === 'combos' || p.cat === 'petiscos' || p.cat === 'bebidas');

  lista.innerHTML = itens.map(p => {
    // Produto com sabores (ex: Refrigerante 2L: Coca-Cola, Guarana Antarctica):
    // um toggle por sabor, pra esgotar um sem afetar o outro.
    if (Array.isArray(p.opcoes) && p.opcoes.length) {
      const linhasSabor = p.opcoes.map(op => `
        <div class="produto-toggle" style="padding-left:16px">
          <span>${p.nome} — ${op}</span>
          <label class="toggle-switch">
            <input type="checkbox" ${saborEsgotado(p.id, op) ? 'checked' : ''} onchange="toggleEsgotado(${p.id}, '${op.replace(/'/g, "\\'")}')">
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('');
      return `<div style="font-weight:700;margin-top:8px;color:#aaa;font-size:.8rem">${p.nome}</div>${linhasSabor}`;
    }

    // Produto sem variacao de sabor (ex: Agua Mineral, H2O Limoneto): um toggle so.
    return `
      <div class="produto-toggle">
        <span>${p.nome}</span>
        <label class="toggle-switch">
          <input type="checkbox" ${saborEsgotado(p.id, '') ? 'checked' : ''} onchange="toggleEsgotado(${p.id})">
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  }).join('');
}

/* ── REMOVER ITEM DO CARDÁPIO ── */
function setStatusRemoverAdmin(msg, erro = false) {
  const el = document.getElementById('remover-item-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

function renderAdminRemoverItens() {
  const lista = document.getElementById('admin-remover-itens-lista');
  if (!lista) return;
  const categorias = ['burgers', 'combos', 'petiscos', 'bebidas', 'sobremesas'];

  lista.innerHTML = categorias.map(cat => {
    const itens = produtosBase.filter(p => p.cat === cat);
    if (!itens.length) return '';
    const linhas = itens.map(p => {
      const removido = itemCardapioRemovido(p.id);
      return `
        <div class="produto-admin-card">
          <div>
            <strong>${escapeAdmin(p.nome)}</strong>
            <small>${fmt(p.preco)} · ${removido ? 'Removido do cardápio' : 'Ativo no cardápio'}</small>
          </div>
          <div class="produto-admin-actions">
            ${removido
              ? `<button class="admin-btn-secondary" onclick="restaurarItemAdmin(${p.id})">Restaurar</button>`
              : `<button class="admin-btn-danger" onclick="removerItemAdmin(${p.id})">Remover</button>`}
          </div>
        </div>`;
    }).join('');
    return `<div style="font-weight:700;margin:10px 0 6px;color:#aaa;font-size:.8rem">${categoriaLabel(cat)}</div>${linhas}`;
  }).join('');
}

async function removerItemAdmin(id) {
  const p = produtosBase.find(x => Number(x.id) === Number(id));
  const nome = p ? p.nome : `#${id}`;
  if (!confirm(`Remover "${nome}" do cardápio? Ele para de aparecer para os clientes até você restaurar.`)) return;
  try {
    setStatusRemoverAdmin('Removendo...');
    await removerItemCardapioSupabase(id);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminRemoverItens();
    renderAdminProdutos();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    setStatusRemoverAdmin(`"${nome}" removido do cardápio.`);
  } catch (erro) {
    setStatusRemoverAdmin(erro.message || 'Erro ao remover item.', true);
  }
}

async function restaurarItemAdmin(id) {
  const p = produtosBase.find(x => Number(x.id) === Number(id));
  const nome = p ? p.nome : `#${id}`;
  try {
    setStatusRemoverAdmin('Restaurando...');
    await restaurarItemCardapioSupabase(id);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminRemoverItens();
    renderAdminProdutos();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    setStatusRemoverAdmin(`"${nome}" voltou para o cardápio.`);
  } catch (erro) {
    setStatusRemoverAdmin(erro.message || 'Erro ao restaurar item.', true);
  }
}

/* ── LOJA ABERTA / FECHADA ── */
function setStatusLojaAdmin(msg, erro = false) {
  const el = document.getElementById('loja-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

async function carregarLojaAdmin() {
  await carregarLojaConfig();
  if (lojaConfig.controle_manual) {
    setStatusLojaAdmin(lojaConfig.aberta ? 'Loja aberta manualmente.' : 'Loja fechada manualmente.', !lojaConfig.aberta);
  } else {
    setStatusLojaAdmin('Usando horário normal da loja.');
  }
}

async function salvarStatusLojaAdmin(aberta) {
  try {
    setStatusLojaAdmin('Salvando status...');
    await salvarLojaConfigSupabase(true, aberta);
    verificarHorario();
    setStatusLojaAdmin(aberta ? 'Loja aberta manualmente.' : 'Loja fechada manualmente.', !aberta);
  } catch (erro) {
    setStatusLojaAdmin(erro.message || 'Erro ao salvar status da loja.', true);
  }
}

async function usarHorarioNormalAdmin() {
  try {
    setStatusLojaAdmin('Voltando para horário normal...');
    await salvarLojaConfigSupabase(false, true);
    verificarHorario();
    setStatusLojaAdmin('Usando horário normal da loja.');
  } catch (erro) {
    setStatusLojaAdmin(erro.message || 'Erro ao restaurar horário normal.', true);
  }
}

/* ── CHAVE PIX ── */
function setStatusPixAdmin(msg, erro = false) {
  const el = document.getElementById('pix-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

async function carregarChavePixAdmin() {
  await carregarLojaConfig();
  const input = document.getElementById('pix-admin-chave');
  if (input) input.value = lojaConfig.chave_pix || '';
  setStatusPixAdmin('');
}

async function salvarChavePixAdmin() {
  const input = document.getElementById('pix-admin-chave');
  const chave = input ? input.value.trim() : '';
  if (!chave) { setStatusPixAdmin('Digite a chave PIX.', true); return; }
  try {
    setStatusPixAdmin('Salvando...');
    await salvarChavePixSupabase(chave);
    if (typeof atualizarChavePixTela === 'function') atualizarChavePixTela();
    setStatusPixAdmin('Chave PIX atualizada!');
  } catch (erro) {
    setStatusPixAdmin(erro.message || 'Erro ao salvar chave PIX.', true);
  }
}

/* ── ADICIONAIS NO SUPABASE ── */
function setStatusAdicionalAdmin(msg, erro = false) {
  const el = document.getElementById('adicional-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

function limparFormAdicionalAdmin() {
  document.getElementById('adicional-admin-id').value = '';
  document.getElementById('adicional-admin-nome').value = '';
  document.getElementById('adicional-admin-preco').value = '';
  document.getElementById('adicional-admin-ativo').checked = true;
  setStatusAdicionalAdmin('');
}

function renderAdminAdicionais() {
  const lista = document.getElementById('admin-adicionais-lista');
  if (!lista) return;
  lista.innerHTML = adicionaisAdmin.map(a => `
    <div class="produto-admin-card">
      <div>
        <strong>${escapeAdmin(a.nome)}</strong>
        <small>${fmt(Number(a.preco) || 0)} · ${a.ativo === false ? 'Inativo' : 'Ativo'}</small>
      </div>
      <div class="produto-admin-actions">
        <button class="admin-btn-secondary" onclick="editarAdicionalAdmin('${escapeAdmin(a.id)}')">Editar</button>
        <button class="admin-btn-secondary" onclick="alternarAdicionalAdmin('${escapeAdmin(a.id)}')">${a.ativo === false ? 'Ativar' : 'Desativar'}</button>
      </div>
    </div>
  `).join('');
}

function editarAdicionalAdmin(id) {
  const a = adicionaisAdmin.find(x => x.id === id);
  if (!a) return;
  document.getElementById('adicional-admin-id').value = a.id;
  document.getElementById('adicional-admin-nome').value = a.nome;
  document.getElementById('adicional-admin-preco').value = Number(a.preco || 0).toFixed(2);
  document.getElementById('adicional-admin-ativo').checked = a.ativo !== false;
  setStatusAdicionalAdmin('Editando adicional. Clique em salvar para confirmar.');
}

async function salvarAdicionalAdmin() {
  const idAtual = document.getElementById('adicional-admin-id').value;
  const nome = document.getElementById('adicional-admin-nome').value.trim();
  const preco = parseFloat(document.getElementById('adicional-admin-preco').value);
  const ativo = document.getElementById('adicional-admin-ativo').checked;
  if (!nome) return setStatusAdicionalAdmin('Informe o nome do adicional.', true);
  if (Number.isNaN(preco) || preco < 0) return setStatusAdicionalAdmin('Informe um preço válido.', true);

  try {
    setStatusAdicionalAdmin('Salvando adicional...');
    const ordemAtual = adicionaisAdmin.find(a => a.id === idAtual)?.ordem || adicionaisAdmin.length + 1;
    await salvarAdicionalSupabase({ id: idAtual || slugProduto(nome), nome, preco, ativo, ordem: ordemAtual });
    await carregarAdicionaisAdmin();
    limparFormAdicionalAdmin();
    setStatusAdicionalAdmin('Adicional salvo com sucesso.');
  } catch (erro) {
    setStatusAdicionalAdmin(erro.message || 'Erro ao salvar adicional.', true);
  }
}

async function alternarAdicionalAdmin(id) {
  const a = adicionaisAdmin.find(x => x.id === id);
  if (!a) return;
  try {
    setStatusAdicionalAdmin('Atualizando adicional...');
    await salvarAdicionalSupabase({ ...a, ativo: a.ativo === false });
    await carregarAdicionaisAdmin();
    setStatusAdicionalAdmin('Adicional atualizado.');
  } catch (erro) {
    setStatusAdicionalAdmin(erro.message || 'Erro ao atualizar adicional.', true);
  }
}

/* ── PROMOÇÃO RÁPIDA ── */
function setStatusPromoAdmin(msg, erro = false) {
  const el = document.getElementById('promo-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

function renderAdminSelectPromos() {
  const select = document.getElementById('promo-admin-produto');
  if (!select) return;
  select.innerHTML = produtos
    .map(p => `<option value="${p.id}">${categoriaLabel(p.cat)} - ${escapeAdmin(p.nome)} (${fmt(p.preco)})</option>`)
    .join('');
}

function renderAdminPromocoes() {
  const lista = document.getElementById('admin-promocoes-lista');
  if (!lista) return;
  if (!promocoesAdmin.length) {
    lista.innerHTML = '<div style="color:#888;font-size:.85rem">Nenhuma promoção ativa.</div>';
    return;
  }
  lista.innerHTML = promocoesAdmin.map(pr => {
    const p = produtos.find(prod => String(prod.id) === String(pr.produto_id));
    return `
      <div class="produto-admin-card">
        <div>
          <strong>${escapeAdmin(pr.titulo || 'Promoção')}</strong>
          <small>${escapeAdmin(p?.nome || 'Produto ' + pr.produto_id)} · ${fmt(Number(pr.preco_promocional) || 0)}</small>
        </div>
        <div class="produto-admin-actions">
          <button class="admin-btn-danger" onclick="encerrarPromocaoAdmin(${pr.id})">Encerrar</button>
        </div>
      </div>
    `;
  }).join('');
}

async function salvarPromocaoAdmin() {
  const produtoId = document.getElementById('promo-admin-produto').value;
  const preco = parseFloat(document.getElementById('promo-admin-preco').value);
  const titulo = document.getElementById('promo-admin-titulo').value.trim() || 'Promoção rápida';
  if (!produtoId) return setStatusPromoAdmin('Escolha um produto.', true);
  if (Number.isNaN(preco) || preco < 0) return setStatusPromoAdmin('Informe um preço promocional válido.', true);
  try {
    setStatusPromoAdmin('Salvando promoção...');
    await salvarPromocaoSupabase({ produto_id: String(produtoId), preco_promocional: preco, titulo });
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    await carregarPromocoesAdmin();
    setStatusPromoAdmin('Promoção ativada.');
  } catch (erro) {
    setStatusPromoAdmin(erro.message || 'Erro ao salvar promoção.', true);
  }
}

async function encerrarPromocaoAdmin(id) {
  try {
    setStatusPromoAdmin('Encerrando promoção...');
    await encerrarPromocaoSupabase(id);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    await carregarPromocoesAdmin();
    setStatusPromoAdmin('Promoção encerrada.');
  } catch (erro) {
    setStatusPromoAdmin(erro.message || 'Erro ao encerrar promoção.', true);
  }
}

/* ── ALTERAR PREÇOS NO SUPABASE ── */
function setStatusPrecoAdmin(msg, erro = false) {
  const el = document.getElementById('preco-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

function renderAdminSelectPrecos() {
  const select = document.getElementById('preco-admin-produto');
  if (!select) return;
  select.innerHTML = produtos
    .map(p => `<option value="${p.id}" data-preco="${p.preco}">${categoriaLabel(p.cat)} - ${escapeAdmin(p.nome)} (${fmt(p.preco)})</option>`)
    .join('');
  preencherPrecoAtualAdmin();
  select.onchange = preencherPrecoAtualAdmin;
}

function preencherPrecoAtualAdmin() {
  const select = document.getElementById('preco-admin-produto');
  const input = document.getElementById('preco-admin-valor');
  if (!select || !input) return;
  const opt = select.options[select.selectedIndex];
  input.value = opt ? Number(opt.dataset.preco || 0).toFixed(2) : '';
}

function renderAdminPrecos() {
  const lista = document.getElementById('admin-precos-lista');
  if (!lista) return;
  if (!precosAdmin.length) {
    lista.innerHTML = '<div style="color:#888;font-size:.85rem">Nenhum preço alterado ainda.</div>';
    return;
  }

  lista.innerHTML = precosAdmin.map(item => {
    const p = produtos.find(prod => String(prod.id) === String(item.produto_id))
      || produtosBase.find(prod => String(prod.id) === String(item.produto_id));
    return `
      <div class="produto-admin-card">
        <div>
          <strong>${escapeAdmin(p?.nome || 'Produto ' + item.produto_id)}</strong>
          <small>Novo preço: ${fmt(Number(item.preco) || 0)}</small>
        </div>
        <div class="produto-admin-actions">
          <button class="admin-btn-secondary" onclick="selecionarPrecoAdmin('${item.produto_id}', ${Number(item.preco) || 0})">Editar</button>
          <button class="admin-btn-danger" onclick="restaurarPrecoAdmin('${item.produto_id}')">Restaurar</button>
        </div>
      </div>
    `;
  }).join('');
}

function selecionarPrecoAdmin(produtoId, preco) {
  const select = document.getElementById('preco-admin-produto');
  const input = document.getElementById('preco-admin-valor');
  if (select) select.value = String(produtoId);
  if (input) input.value = Number(preco || 0).toFixed(2);
  setStatusPrecoAdmin('Editando preço. Clique em salvar para confirmar.');
}

async function salvarPrecoAdmin() {
  const select = document.getElementById('preco-admin-produto');
  const input = document.getElementById('preco-admin-valor');
  const produtoId = select?.value;
  const preco = parseFloat(input?.value || '');
  if (!produtoId) return setStatusPrecoAdmin('Escolha um produto.', true);
  if (Number.isNaN(preco) || preco < 0) return setStatusPrecoAdmin('Informe um preço válido.', true);

  try {
    setStatusPrecoAdmin('Salvando preço...');
    await salvarPrecoSupabase(produtoId, preco);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    await carregarPrecosAdmin();
    setStatusPrecoAdmin('Preço salvo com sucesso.');
  } catch (erro) {
    setStatusPrecoAdmin(erro.message || 'Erro ao salvar preço.', true);
  }
}

async function restaurarPrecoAdmin(produtoId) {
  const select = document.getElementById('preco-admin-produto');
  const id = produtoId || select?.value;
  if (!id) return setStatusPrecoAdmin('Escolha um produto.', true);

  try {
    setStatusPrecoAdmin('Restaurando preço original...');
    await removerPrecoSupabase(id);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    await carregarPrecosAdmin();
    setStatusPrecoAdmin('Preço original restaurado.');
  } catch (erro) {
    setStatusPrecoAdmin(erro.message || 'Erro ao restaurar preço.', true);
  }
}

/* ── CADASTRO DE PRODUTOS NO SUPABASE ── */
function categoriaLabel(cat) {
  return {
    burgers: 'Hambúrgueres',
    combos: 'Combos',
    petiscos: 'Petiscos',
    bebidas: 'Bebidas',
    sobremesas: 'Sobremesas'
  }[cat] || cat || 'Produto';
}

function setStatusProdutoAdmin(msg, erro = false) {
  const el = document.getElementById('produto-admin-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = erro ? '#e53935' : '#4caf50';
}

function limparFormProdutoAdmin() {
  ['id','nome','preco','numero','desc','img','emoji'].forEach(campo => {
    const el = document.getElementById(`produto-admin-${campo}`);
    if (el) el.value = '';
  });
  const cat = document.getElementById('produto-admin-categoria');
  if (cat) cat.value = 'burgers';
  const ativo = document.getElementById('produto-admin-ativo');
  if (ativo) ativo.checked = true;
  setStatusProdutoAdmin('');
}

function lerFormProdutoAdmin() {
  const id = document.getElementById('produto-admin-id').value;
  const nome = document.getElementById('produto-admin-nome').value.trim();
  const preco = parseFloat(document.getElementById('produto-admin-preco').value);
  if (!nome) throw new Error('Informe o nome do produto.');
  if (Number.isNaN(preco) || preco < 0) throw new Error('Informe um preço válido.');

  return {
    id: id ? Number(id) : null,
    nome,
    preco,
    categoria: document.getElementById('produto-admin-categoria').value,
    numero: document.getElementById('produto-admin-numero').value.trim(),
    descricao: document.getElementById('produto-admin-desc').value.trim(),
    imagem_url: document.getElementById('produto-admin-img').value.trim(),
    emoji: document.getElementById('produto-admin-emoji').value.trim(),
    ativo: document.getElementById('produto-admin-ativo').checked
  };
}

function preencherFormProdutoAdmin(id) {
  const p = produtosSupabaseAdmin.find(x => Number(x.id) === Number(id));
  if (!p) return;
  document.getElementById('produto-admin-id').value = p.id;
  document.getElementById('produto-admin-nome').value = p.nome || '';
  document.getElementById('produto-admin-preco').value = p.preco || '';
  document.getElementById('produto-admin-categoria').value = p.categoria || 'burgers';
  document.getElementById('produto-admin-numero').value = p.numero || '';
  document.getElementById('produto-admin-desc').value = p.descricao || '';
  document.getElementById('produto-admin-img').value = p.imagem_url || '';
  document.getElementById('produto-admin-emoji').value = p.emoji || '';
  document.getElementById('produto-admin-ativo').checked = p.ativo !== false;
  setStatusProdutoAdmin('Editando produto. Altere os campos e clique em salvar.');
  document.getElementById('produto-admin-nome').focus();
}

function escapeAdmin(txt) {
  return String(txt || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderAdminProdutosSupabase() {
  const lista = document.getElementById('admin-produtos-supabase-lista');
  if (!lista) return;
  if (!produtosSupabaseAdmin.length) {
    lista.innerHTML = '<div style="color:#888;font-size:.85rem">Nenhum produto cadastrado no Supabase ainda.</div>';
    return;
  }

  lista.innerHTML = produtosSupabaseAdmin.map(p => `
    <div class="produto-admin-card">
      <div>
        <strong>${escapeAdmin(p.nome)}</strong>
        <small>${categoriaLabel(p.categoria)} · ${fmt(Number(p.preco) || 0)} · ${p.ativo === false ? 'Inativo' : 'Ativo'}</small>
        ${p.descricao ? `<small>${escapeAdmin(p.descricao)}</small>` : ''}
      </div>
      <div class="produto-admin-actions">
        <button class="admin-btn-secondary" onclick="preencherFormProdutoAdmin(${p.id})">Editar</button>
        <button class="admin-btn-secondary" onclick="alternarAtivoProdutoAdmin(${p.id})">${p.ativo === false ? 'Ativar' : 'Desativar'}</button>
        <button class="admin-btn-danger" onclick="removerProdutoAdmin(${p.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

async function salvarProdutoAdmin() {
  try {
    setStatusProdutoAdmin('Salvando produto...');
    const produto = lerFormProdutoAdmin();
    await salvarProdutoSupabase(produto);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    await carregarProdutosSupabaseAdmin();
    limparFormProdutoAdmin();
    setStatusProdutoAdmin('Produto salvo com sucesso.');
  } catch (erro) {
    setStatusProdutoAdmin(erro.message || 'Erro ao salvar produto.', true);
  }
}

async function alternarAtivoProdutoAdmin(id) {
  const p = produtosSupabaseAdmin.find(x => Number(x.id) === Number(id));
  if (!p) return;
  try {
    setStatusProdutoAdmin('Atualizando produto...');
    await salvarProdutoSupabase({ ...p, ativo: p.ativo === false });
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    await carregarProdutosSupabaseAdmin();
    setStatusProdutoAdmin('Produto atualizado.');
  } catch (erro) {
    setStatusProdutoAdmin(erro.message || 'Erro ao atualizar produto.', true);
  }
}

async function removerProdutoAdmin(id) {
  if (!confirm('Excluir este produto do Supabase?')) return;
  try {
    setStatusProdutoAdmin('Excluindo produto...');
    await excluirProdutoSupabase(id);
    await carregarProdutosSupabase();
    renderMenu();
    renderAdminSelectPrecos();
    renderAdminSelectPromos();
    await carregarProdutosSupabaseAdmin();
    limparFormProdutoAdmin();
    setStatusProdutoAdmin('Produto excluído.');
  } catch (erro) {
    setStatusProdutoAdmin(erro.message || 'Erro ao excluir produto.', true);
  }
}

/* ── MENSAGENS RÁPIDAS ── */
function normalizarNumeroWpp(tel) {
  let num = String(tel || '').replace(/\D/g, '');
  if (num.startsWith('00')) num = num.slice(2);
  if (num.startsWith('0')) num = num.slice(1);
  if (!num.startsWith('55')) num = '55' + num;
  return num;
}

function montarLinkWpp(tel, msg) {
  const num = normalizarNumeroWpp(tel);
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

function msgRapida(tipo) {
  const abaWpp = window.open('about:blank', '_blank');
  const tel  = prompt('Número do WhatsApp do cliente (com DDD):\nEx: 83 99999-9999');
  if (!tel) {
    if (abaWpp) abaWpp.close();
    return;
  }
  const nome = prompt('Nome do cliente:') || 'cliente';

  const msgs = {
    confirmado: `✅ Olá ${nome}! Recebemos seu pedido na *Prime Burguer* e já estamos preparando! 🍔🔥`,
    pronto:     `🍔 Olá ${nome}! Seu pedido na *Prime Burguer* está *PRONTO*! Pode vir buscar 😊\n📍 ${ENDERECO}`,
    saiu:       `🛵 Olá ${nome}! Seu pedido da *Prime Burguer* *SAIU PARA ENTREGA*! Chegará em breve 🍔❤️`,
    atraso:     `⏰ Olá ${nome}! Pedimos desculpas, seu pedido na *Prime Burguer* terá um pequeno atraso. Logo estará com você! 🙏`,
    retirada:   `🏪 Olá ${nome}! Seu pedido na *Prime Burguer* está *PRONTO* para retirada! Pode vir buscar 😊\n📍 ${ENDERECO}`,
  };

  const num = normalizarNumeroWpp(tel);
  if (num.length < 12 || num.length > 13) {
    if (abaWpp) abaWpp.close();
    alert('Confira o número do cliente. Use DDD + número. Ex: 83 99999-9999');
    return;
  }

  const link = montarLinkWpp(tel, msgs[tipo] || msgs['confirmado']);
  if (abaWpp) {
    abaWpp.location.href = link;
    abaWpp.focus();
  } else {
    window.location.href = link;
  }
}

/* ── EVENTOS ── */
// Versao mais confiavel: usa um modal e abre o WhatsApp a partir do clique no botao final.
function textoMsgRapida(tipo, nome) {
  const msgs = {
    confirmado: `âœ… OlÃ¡ ${nome}! Recebemos seu pedido na *Prime Burguer* e jÃ¡ estamos preparando! ðŸ”ðŸ”¥`,
    pronto:     `ðŸ” OlÃ¡ ${nome}! Seu pedido na *Prime Burguer* estÃ¡ *PRONTO*! Pode vir buscar ðŸ˜Š\nðŸ“ ${ENDERECO}`,
    saiu:       `ðŸ›µ OlÃ¡ ${nome}! Seu pedido da *Prime Burguer* *SAIU PARA ENTREGA*! ChegarÃ¡ em breve ðŸ”â¤ï¸`,
    atraso:     `â° OlÃ¡ ${nome}! Pedimos desculpas, seu pedido na *Prime Burguer* terÃ¡ um pequeno atraso. Logo estarÃ¡ com vocÃª! ðŸ™`,
    retirada:   `ðŸª OlÃ¡ ${nome}! Seu pedido na *Prime Burguer* estÃ¡ *PRONTO* para retirada! Pode vir buscar ðŸ˜Š\nðŸ“ ${ENDERECO}`,
  };
  return msgs[tipo] || msgs.confirmado;
}

function garantirModalMsgRapida() {
  if (document.getElementById('msg-rapida-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'msg-rapida-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:999999;align-items:center;justify-content:center;padding:18px';
  modal.innerHTML = `
    <div style="background:#1a1a1a;border:2px solid var(--laranja);border-radius:16px;padding:1.4rem;width:100%;max-width:360px;box-shadow:0 20px 60px rgba(0,0,0,.45)">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.7rem;color:var(--laranja);margin-bottom:.3rem">MENSAGEM RAPIDA</div>
      <p style="color:#888;font-size:.85rem;margin-bottom:1rem">Informe os dados e clique em abrir WhatsApp.</p>
      <input type="hidden" id="msg-rapida-tipo">
      <label style="display:block;color:#aaa;font-size:.8rem;font-weight:800;margin-bottom:4px">Numero do cliente</label>
      <input id="msg-rapida-tel" type="tel" placeholder="83 99999-9999" style="width:100%;background:#111;border:1.5px solid #333;color:#fff;padding:12px;border-radius:8px;font-family:'Nunito',sans-serif;margin-bottom:.8rem;outline:none">
      <label style="display:block;color:#aaa;font-size:.8rem;font-weight:800;margin-bottom:4px">Nome do cliente</label>
      <input id="msg-rapida-nome" type="text" placeholder="Nome do cliente" style="width:100%;background:#111;border:1.5px solid #333;color:#fff;padding:12px;border-radius:8px;font-family:'Nunito',sans-serif;margin-bottom:1rem;outline:none">
      <button onclick="enviarMsgRapida()" style="width:100%;background:var(--laranja);color:#fff;border:none;padding:13px;border-radius:10px;font-family:'Bebas Neue',sans-serif;font-size:1.25rem;letter-spacing:1px;cursor:pointer">ABRIR WHATSAPP</button>
      <button onclick="fecharModalMsgRapida()" style="width:100%;margin-top:.7rem;background:transparent;border:1px solid #333;color:#aaa;padding:10px;border-radius:9px;font-family:'Nunito',sans-serif;cursor:pointer">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function msgRapida(tipo) {
  garantirModalMsgRapida();
  document.getElementById('msg-rapida-tipo').value = tipo;
  document.getElementById('msg-rapida-tel').value = '';
  document.getElementById('msg-rapida-nome').value = '';
  document.getElementById('msg-rapida-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('msg-rapida-tel').focus(), 50);
}

function fecharModalMsgRapida() {
  const modal = document.getElementById('msg-rapida-modal');
  if (modal) modal.style.display = 'none';
}

function enviarMsgRapida() {
  const tipo = document.getElementById('msg-rapida-tipo').value;
  const tel = document.getElementById('msg-rapida-tel').value;
  const nome = document.getElementById('msg-rapida-nome').value.trim() || 'cliente';
  const num = normalizarNumeroWpp(tel);
  if (num.length < 12 || num.length > 13) {
    alert('Confira o nÃºmero do cliente. Use DDD + nÃºmero. Ex: 83 99999-9999');
    document.getElementById('msg-rapida-tel').focus();
    return;
  }

  const link = montarLinkWpp(tel, textoMsgRapida(tipo, nome));
  const aba = window.open(link, '_blank');
  if (!aba) window.location.href = link;
  fecharModalMsgRapida();
}

document.addEventListener('DOMContentLoaded', () => {
  const senhaInput = document.getElementById('admin-senha');
  if (senhaInput) {
    senhaInput.addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });
  }
  // Restaurar estado da alta demanda
  altaDemandaAtiva = localStorage.getItem('altaDemanda') === 'true';
  if (altaDemandaAtiva) {
    document.getElementById('banner-demanda').style.display = 'block';
  }
});
