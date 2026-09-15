/* ============================================
   PRIME BURGUER — menu.js
   Renderização do cardápio e filtros
============================================ */

function renderizarCard(p) {
  let imgHtml;
  if (p.img) {
    imgHtml = `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="${p.nome}" loading="lazy">`;
  } else if (p.svg) {
    imgHtml = SVGS[p.svg] || '';
  } else {
    imgHtml = p.emoji || '🍔';
  }

  const esgotado = produtosEsgotados.includes(p.id);

  return `
    <div class="card${esgotado ? ' esgotado' : ''}">
      <div class="card-img">${imgHtml}</div>
      <div class="card-body">
        ${p.num ? `<div class="card-num">#${p.num}</div>` : ''}
        <div class="card-name">
          ${p.nome}
          ${p.promocao ? '<span class="badge-novo">promo</span>' : ''}
          ${p.novo ? '<span class="badge-novo">novo</span>' : ''}
          ${esgotado ? '<span class="badge-esgotado">esgotado</span>' : ''}
        </div>
        <div class="card-desc">${p.desc}</div>
        <div class="card-footer">
          <span class="price">${p.promocao && p.preco_original ? `<small style="color:#777;text-decoration:line-through;font-family:'Nunito',sans-serif;font-size:.75rem;margin-right:4px">${fmt(p.preco_original)}</small>` : ''}${fmt(p.preco)}</span>
          ${esgotado
            ? '<span style="color:#e53935;font-size:0.8rem;font-weight:700">Indisponível</span>'
            : `<button class="add-btn" onclick="addToCart(${p.id})">+</button>`
          }
        </div>
      </div>
    </div>`;
}

function renderMenu(cat = 'todos') {
  const grid = document.getElementById('menu-grid');
  const items = cat === 'todos' ? produtos : produtos.filter(p => p.cat === cat);
  grid.innerHTML = items.map(renderizarCard).join('');
}

function filterCat(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMenu(cat);
}
