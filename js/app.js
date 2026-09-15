/* ============================================
   PRIME BURGUER — app.js
   Inicialização e lógica geral da aplicação
============================================ */

const DIAS_ABERTOS = [0, 1, 2, 4, 5, 6]; // dom, seg, ter, qui, sex, sab
const ABRE_H  = 18, ABRE_M  = 30;
const FECHA_H = 23, FECHA_M = 0;

/* ── HORÁRIO ── */
function verificarHorario() {
  const agora   = new Date();
  const dia     = agora.getDay();
  const totalM  = agora.getHours() * 60 + agora.getMinutes();
  const abreM   = ABRE_H  * 60 + ABRE_M;
  const fechaM  = FECHA_H * 60 + FECHA_M;
  const diaOk   = DIAS_ABERTOS.includes(dia);
  const horaOk  = totalM >= abreM && totalM < fechaM;
  let aberto  = diaOk && horaOk;
  const controleManual = window.lojaConfig && lojaConfig.controle_manual;
  if (controleManual) aberto = !!lojaConfig.aberta;

  const badge = document.getElementById('status-badge');
  const horarioTexto = document.getElementById('horario-texto');
  if (horarioTexto) horarioTexto.textContent = 'Seg, Ter, Qui, Sex, Sáb e Dom: 18:30 — 23:00';

  if (aberto) {
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:20px;font-size:0.9rem;font-weight:800;margin-top:0.8rem;background:#1a3a1a;border:1.5px solid #4caf50;color:#4caf50';
    badge.innerHTML = controleManual ? '🟢 ABERTO — Loja aberta pelo admin' : '🟢 ABERTO — Até 23:00';
  } else {
    badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:20px;font-size:0.9rem;font-weight:800;margin-top:0.8rem;background:#3a1a1a;border:1.5px solid #e53935;color:#e53935';
    const msg = controleManual ? 'Fechada pelo admin' : !diaOk ? 'Quarta não abrimos' : totalM < abreM ? 'Abre às 18:30' : 'Abrimos amanhã às 18:30';
    badge.innerHTML = `🔴 FECHADO — ${msg}`;
  }

  const btn = document.getElementById('pedido-btn');
  if (btn) {
    if (aberto) {
      btn.disabled = false;
      btn.textContent = 'FINALIZAR PEDIDO';
      btn.style.background = 'var(--laranja)';
    } else {
      btn.disabled = true;
      btn.textContent = controleManual ? '🔴 LOJA FECHADA' : !diaOk ? '🔴 FECHADO HOJE' : '⏰ FORA DO HORÁRIO';
      btn.style.background = '#333';
    }
  }
}

/* ── BOAS VINDAS ── */
function abrirBoasVindas() {
  const popup = document.getElementById('boas-vindas');
  popup.style.display = 'flex';

  const agora  = new Date();
  const totalM = agora.getHours() * 60 + agora.getMinutes();
  let aberto = DIAS_ABERTOS.includes(agora.getDay())
    && totalM >= ABRE_H * 60 + ABRE_M
    && totalM <  FECHA_H * 60 + FECHA_M;
  const controleManual = window.lojaConfig && lojaConfig.controle_manual;
  if (controleManual) aberto = !!lojaConfig.aberta;

  const bvH = document.getElementById('bv-horario');
  if (aberto) {
    bvH.style.cssText = 'font-size:0.85rem;font-weight:800;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:1.2rem;background:#1a3a1a;border:1.5px solid #4caf50;color:#4caf50';
    bvH.textContent = '🟢 Estamos abertos agora!';
  } else {
    bvH.style.cssText = 'font-size:0.85rem;font-weight:800;padding:6px 14px;border-radius:20px;display:inline-block;margin-bottom:1.2rem;background:#3a1a1a;border:1.5px solid #e53935;color:#e53935';
    bvH.textContent = controleManual ? '🔴 Loja fechada no momento' : '🔴 Abrimos às 18:30';
  }
}

function fecharBoasVindas() {
  document.getElementById('boas-vindas').style.display = 'none';
}

/* ── VOLTAR AO TOPO ── */
window.addEventListener('scroll', () => {
  const btn = document.getElementById('btn-topo');
  btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

/* ── INICIALIZAÇÃO ── */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof carregarLojaConfig === 'function') {
    await carregarLojaConfig();
  }
  if (typeof atualizarChavePixTela === 'function') {
    atualizarChavePixTela();
  }
  if (typeof carregarProdutosSupabase === 'function') {
    await carregarProdutosSupabase();
  }
  if (typeof carregarAdicionaisSupabase === 'function') {
    await carregarAdicionaisSupabase();
  }
  if (typeof carregarEsgotados === 'function') {
    await carregarEsgotados();
  }
  renderMenu();
  verificarHorario();
  setInterval(verificarHorario, 60000);
  setTimeout(abrirBoasVindas, 1000);
});
