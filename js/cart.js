/* ============================================
   PRIME BURGUER — cart.js
   Lógica completa do carrinho
============================================ */

var cart = [];
var tipoEntrega  = 'retirada';
var tipoPagamento = 'pix';
var precisaTroco  = false;

/* ── CARRINHO ── */
function updateCartCount() {
  document.getElementById('cart-count').textContent = cart.reduce((s, x) => s + x.qty, 0);
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
}

function overlayClose(e) {
  if (e.target.id === 'cart-overlay') closeCart();
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  if (!cart.length) {
    list.innerHTML = '<div class="empty-cart">🍔 Carrinho vazio!<br>Adicione itens do cardápio.</div>';
    document.getElementById('total-val').textContent = 'R$ 0,00';
    document.getElementById('frete-linha').innerHTML = '';
    return;
  }

  list.innerHTML = cart.map(x => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${x.nome}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty('${x.cartId}',-1)">−</button>
          <span class="qty-val">${x.qty}</span>
          <button class="qty-btn" onclick="changeQty('${x.cartId}',1)">+</button>
        </div>
      </div>
      <div class="cart-item-price">${fmt(x.preco * x.qty)}</div>
    </div>`).join('');

  const subtotal = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const frete = tipoEntrega === 'entrega' ? 3 : 0;

  document.getElementById('frete-linha').innerHTML = frete > 0
    ? `<div style="display:flex;justify-content:space-between;color:#aaa;font-size:0.9rem;margin-top:0.5rem">
        <span>🛵 Taxa de entrega:</span><span>R$ 3,00</span>
       </div>` : '';

  document.getElementById('total-val').textContent = fmt(subtotal + frete);
}

function changeQty(cartId, delta) {
  const idx = cart.findIndex(x => x.cartId === cartId);
  if (idx < 0) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartCount();
  renderCart();
}

/* ── ADICIONAR ── */
function addToCart(id, sabor) {
  const p = produtos.find(x => x.id === id);
  if (p.opcoes && !sabor) { abrirModalSabor(p); return; }

  const nome   = sabor ? `${p.nome} (${sabor})` : p.nome;
  const cartId = sabor ? `${id}_${sabor}` : `${id}`;
  const ex     = cart.find(x => x.cartId === cartId);
  if (ex) ex.qty++;
  else cart.push({ ...p, nome, cartId, qty: 1 });
  updateCartCount();
  openCart();
}

function addAdicional(nome, preco) {
  const cartId = `adicional_${nome}`;
  const ex = cart.find(x => x.cartId === cartId);
  if (ex) ex.qty++;
  else cart.push({ id: cartId, nome: `Adicional: ${nome}`, preco, cat: 'adicionais', cartId, qty: 1 });
  updateCartCount();
  openCart();
}

/* ── MODAL SABOR ── */
function abrirModalSabor(p) {
  document.getElementById('modal-titulo').textContent = p.nome;
  document.getElementById('modal-opcoes').innerHTML = p.opcoes.map(op => {
    const esgotado = typeof saborEsgotado === 'function' && saborEsgotado(p.id, op);
    if (esgotado) {
      return `<button disabled style="
        width:100%;background:#111;border:2px solid #333;color:#666;
        padding:12px;border-radius:8px;font-family:'Nunito',sans-serif;
        font-size:0.95rem;font-weight:700;cursor:not-allowed;text-align:left;
        margin-bottom:6px;">
        🥤 ${op} <span style="color:#e53935;font-size:.75rem">(esgotado)</span>
      </button>`;
    }
    return `<button onclick="escolherSabor(${p.id},'${op}')" style="
      width:100%;background:#1a1a1a;border:2px solid #333;color:#fff;
      padding:12px;border-radius:8px;font-family:'Nunito',sans-serif;
      font-size:0.95rem;font-weight:700;cursor:pointer;text-align:left;
      margin-bottom:6px;transition:border-color 0.2s;"
      onmouseover="this.style.borderColor='#FF6B00'"
      onmouseout="this.style.borderColor='#333'">
      🥤 ${op}
    </button>`;
  }).join('');
  document.getElementById('sabor-modal').style.display = 'flex';
}

function escolherSabor(id, sabor) {
  document.getElementById('sabor-modal').style.display = 'none';
  addToCart(id, sabor);
}

function fecharModal() {
  document.getElementById('sabor-modal').style.display = 'none';
}

/* ── TIPO ENTREGA / PAGAMENTO ── */
function setTipo(tipo) {
  tipoEntrega = tipo;
  document.getElementById('opt-retirada').classList.toggle('active', tipo === 'retirada');
  document.getElementById('opt-entrega').classList.toggle('active', tipo === 'entrega');
  document.getElementById('address-fields').classList.toggle('show', tipo === 'entrega');
  document.getElementById('retirada-info').style.display = tipo === 'retirada' ? 'block' : 'none';
  renderCart();
}

function setPagamento(tipo) {
  tipoPagamento = tipo;
  document.getElementById('opt-pix').classList.toggle('active', tipo === 'pix');
  document.getElementById('opt-dinheiro').classList.toggle('active', tipo === 'dinheiro');
  document.getElementById('opt-cartao').classList.toggle('active', tipo === 'cartao');
  document.getElementById('pix-info').style.display = tipo === 'pix' ? 'block' : 'none';
  document.getElementById('dinheiro-info').style.display = tipo === 'dinheiro' ? 'block' : 'none';
  document.getElementById('cartao-info').style.display = tipo === 'cartao' ? 'block' : 'none';
}

/* ── CHAVE PIX (vem do painel admin / Supabase) ── */
function atualizarChavePixTela() {
  const chave = (window.lojaConfig && lojaConfig.chave_pix) || 'CNPJ — 64.309.414/0001-80';
  const elPagamento = document.getElementById('pix-key-texto');
  if (elPagamento) elPagamento.textContent = chave;
  const elSucesso = document.getElementById('success-pix-chave');
  if (elSucesso) elSucesso.textContent = chave;
}

/** Copia a chave PIX pro clipboard, com fallback pra navegadores/in-app browsers sem Clipboard API. */
function copiarChavePix(btn, spanId) {
  const chave = document.getElementById(spanId)?.textContent?.trim();
  if (!chave) return;

  const mostrarSucesso = () => {
    if (!btn) return;
    const textoOriginal = btn.textContent;
    btn.textContent = '✅ Copiado!';
    btn.classList.add('copiado');
    setTimeout(() => {
      btn.textContent = textoOriginal;
      btn.classList.remove('copiado');
    }, 2000);
  };

  const copiarComFallback = () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = chave;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      mostrarSucesso();
    } catch {
      alert('Não consegui copiar automaticamente. Chave PIX: ' + chave);
    }
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(chave).then(mostrarSucesso).catch(copiarComFallback);
  } else {
    copiarComFallback();
  }
}

function setTroco(sim) {
  precisaTroco = sim;
  document.getElementById('opt-semtroco').classList.toggle('active', !sim);
  document.getElementById('opt-comtroco').classList.toggle('active', sim);
  document.getElementById('troco-campo').style.display = sim ? 'block' : 'none';
}
